import { useMemo } from 'react';
import { readWordCount } from '../utils/reading';
import styles from './KaraokeText.module.css';

interface Props {
  text: string;
  currentTime: number;
  duration: number;
  wordTimings: number[];
  className?: string | undefined;
  /** Tocar numa palavra leva a narração até ela (segundos). */
  onSeekToWord?: ((seconds: number) => void) | undefined;
}

interface Token {
  text: string;
  /** Índice da palavra no capítulo; -1 para espaços e quebras. */
  wordIndex: number;
  /** Nos espaços, qual palavra vem imediatamente antes. */
  afterWord: number;
}

// Quebra o texto preservando espaços e quebras de linha, numerando as palavras.
function tokenize(text: string): Token[] {
  const parts = text.split(/(\s+)/);
  let word = 0;
  return parts
    .filter((p) => p.length > 0)
    .map((part) => {
      if (part.trim().length === 0) {
        return { text: part, wordIndex: -1, afterWord: word - 1 };
      }
      return { text: part, wordIndex: word++, afterWord: word - 2 };
    });
}

// Destaca o trecho já narrado e, com força, a palavra que está sendo lida
// agora. Marcar a palavra corrente é o que sustenta o acompanhamento de quem
// está aprendendo a ler; o fundo suave no que passou serve de rastro.
//
// Os espaços entre palavras lidas também recebem o fundo: assim a marcação é
// uma faixa contínua, como no aplicativo, e não uma fileira de retângulos
// soltos com buracos no meio.
export default function KaraokeText({
  text,
  currentTime,
  duration,
  wordTimings,
  className,
  onSeekToWord,
}: Props) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const totalWords = tokens.filter((t) => t.wordIndex >= 0).length;
  const readWords = readWordCount(currentTime, duration, wordTimings, totalWords);
  // A palavra corrente é a última já iniciada.
  const currentWord = readWords - 1;

  return (
    <p className={className}>
      {tokens.map((token, i) => {
        if (token.wordIndex < 0) {
          // Emenda a faixa: o espaço só é marcado depois que a palavra à
          // esquerda dele terminou, nunca antes da palavra que está tocando.
          const emenda = token.afterWord >= 0 && token.afterWord < currentWord;
          return (
            <span key={i} className={emenda ? styles.read : undefined}>
              {token.text}
            </span>
          );
        }

        const lida = token.wordIndex < currentWord;
        const atual = token.wordIndex === currentWord;
        const inicio = wordTimings[token.wordIndex];
        const clicavel = onSeekToWord !== undefined && inicio !== undefined;

        return (
          <span
            key={i}
            data-word={atual ? 'current' : lida ? 'read' : 'pending'}
            className={[
              styles.word,
              lida ? styles.read : '',
              atual ? styles.current : '',
              clicavel ? styles.clickable : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {...(clicavel
              ? {
                  role: 'button',
                  tabIndex: -1,
                  onClick: () => onSeekToWord?.(Math.max(0, (inicio as number) - 0.05)),
                }
              : {})}
          >
            {token.text}
          </span>
        );
      })}
    </p>
  );
}
