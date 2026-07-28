export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

// Quantas palavras já foram lidas no tempo atual do áudio. Usa as marcas por
// palavra do Google TTS quando existem; senão, distribui proporcionalmente.
export function readWordCount(
  currentTime: number,
  duration: number,
  wordTimings: number[],
  totalWords: number,
): number {
  if (wordTimings.length > 0) {
    let count = 0;
    for (const t of wordTimings) {
      if (t <= currentTime) {
        count += 1;
      } else {
        break;
      }
    }
    return Math.min(count, totalWords);
  }
  if (duration <= 0) {
    return 0;
  }
  return Math.round(Math.min(1, currentTime / duration) * totalWords);
}
