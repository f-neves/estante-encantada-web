import { useEffect, useMemo, useRef, useState } from 'react';

// Reproduz a mesma forma do `expo-audio` usada no app (`useAudioPlayer` +
// `useAudioPlayerStatus`), para o leitor ser portado quase sem mudanças.
// O tempo é lido por requestAnimationFrame: o evento `timeupdate` do navegador
// dispara umas 4 vezes por segundo, pouco para o karaokê acompanhar palavra a
// palavra.

export interface AudioStatus {
  playing: boolean;
  currentTime: number;
  duration: number;
  /** Vira true quando a faixa termina; volta a false ao tocar de novo. */
  didJustFinish: boolean;
  /** Erro ao carregar o arquivo (rede, caminho errado). */
  failed: boolean;
}

export interface AudioPlayerHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
}

const EMPTY_STATUS: AudioStatus = {
  playing: false,
  currentTime: 0,
  duration: 0,
  didJustFinish: false,
  failed: false,
};

export function useAudioPlayer(src: string | null): {
  player: AudioPlayerHandle;
  status: AudioStatus;
} {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rateRef = useRef(1);
  const [status, setStatus] = useState<AudioStatus>(EMPTY_STATUS);

  useEffect(() => {
    if (!src) {
      audioRef.current = null;
      setStatus(EMPTY_STATUS);
      return;
    }

    const audio = new Audio(src);
    audio.preload = 'metadata';
    audio.playbackRate = rateRef.current;
    // Mantém o tom natural ao acelerar (senão a narração fica esganiçada).
    audio.preservesPitch = true;
    audioRef.current = audio;
    setStatus(EMPTY_STATUS);

    let frame = 0;

    function tick() {
      setStatus((prev) =>
        prev.currentTime === audio.currentTime ? prev : { ...prev, currentTime: audio.currentTime },
      );
      frame = requestAnimationFrame(tick);
    }

    function onPlay() {
      setStatus((prev) => ({ ...prev, playing: true, didJustFinish: false }));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    }

    function onPause() {
      setStatus((prev) => ({ ...prev, playing: false, currentTime: audio.currentTime }));
      cancelAnimationFrame(frame);
    }

    function onEnded() {
      setStatus((prev) => ({ ...prev, playing: false, didJustFinish: true }));
      cancelAnimationFrame(frame);
    }

    function onLoaded() {
      setStatus((prev) => ({
        ...prev,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      }));
    }

    function onError() {
      setStatus((prev) => ({ ...prev, failed: true, playing: false }));
    }

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('durationchange', onLoaded);
    audio.addEventListener('error', onError);

    return () => {
      cancelAnimationFrame(frame);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('durationchange', onLoaded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [src]);

  const player = useMemo<AudioPlayerHandle>(
    () => ({
      play: () => {
        // O navegador rejeita tocar sem gesto do usuário; ignoramos em silêncio
        // (o botão de play continua lá para a criança tocar).
        audioRef.current?.play().catch(() => {});
      },
      pause: () => {
        audioRef.current?.pause();
      },
      toggle: () => {
        const audio = audioRef.current;
        if (!audio) {
          return;
        }
        if (audio.paused) {
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      },
      seekTo: (seconds: number) => {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(seconds)) {
          return;
        }
        audio.currentTime = Math.max(0, seconds);
        setStatus((prev) => ({ ...prev, currentTime: audio.currentTime, didJustFinish: false }));
      },
      setPlaybackRate: (rate: number) => {
        rateRef.current = rate;
        if (audioRef.current) {
          audioRef.current.playbackRate = rate;
          audioRef.current.preservesPitch = true;
        }
      },
    }),
    [],
  );

  return { player, status };
}
