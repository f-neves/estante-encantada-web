import { useCallback, useEffect, useState } from 'react';

// Narração de reserva com a voz do próprio navegador, para capítulos sem MP3
// gravado. Equivale ao expo-speech do app.
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (!supported) {
      return;
    }
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    },
    [supported],
  );

  // Falar continua tocando mesmo depois de sair da tela: para ao desmontar.
  useEffect(() => stop, [stop]);

  return { speaking, speak, stop, supported };
}
