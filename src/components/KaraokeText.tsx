import { readWordCount } from '../utils/reading';

interface Props {
  text: string;
  currentTime: number;
  duration: number;
  wordTimings: number[];
  className?: string | undefined;
}

// Destaca o trecho já narrado. O corte é feito por prefixo contínuo (inclui os
// espaços entre as palavras lidas), igual ao app, para não abrir buracos no
// meio da frase.
export default function KaraokeText({ text, currentTime, duration, wordTimings, className }: Props) {
  const tokens = text.split(/(\s+)/);
  const totalWords = tokens.reduce((n, tok) => n + (tok.trim().length > 0 ? 1 : 0), 0);
  const readWords = readWordCount(currentTime, duration, wordTimings, totalWords);

  let charsRead = 0;
  let words = 0;
  for (const tok of tokens) {
    if (words >= readWords) {
      break;
    }
    charsRead += tok.length;
    if (tok.trim().length > 0) {
      words += 1;
    }
  }

  return (
    <p className={className}>
      <mark data-karaoke="read">{text.slice(0, charsRead)}</mark>
      {text.slice(charsRead)}
    </p>
  );
}
