import type { MouseEvent } from 'react';
import styles from './AudioBar.module.css';

function formatTime(seconds: number): string {
  const total = !Number.isFinite(seconds) || seconds < 0 ? 0 : Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const RATES = [1, 1.5];

interface Props {
  currentTime: number;
  duration: number;
  rate: number;
  onSeek: (fraction: number) => void;
  onChangeRate: (rate: number) => void;
}

// Barra de tempo do áudio, com os tempos e a velocidade. Mesma linha 2 do
// painel de narração do app.
export default function AudioBar({ currentTime, duration, rate, onSeek, onChangeRate }: Props) {
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    onSeek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.barTouch}
        onClick={handleClick}
        role="slider"
        tabIndex={0}
        aria-label="Posição da narração"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            onSeek(Math.min(1, progress + 0.05));
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onSeek(Math.max(0, progress - 0.05));
          }
        }}
      >
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <div className={styles.times}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <div className={styles.speedRow}>
          {RATES.map((r) => (
            <button
              key={r}
              type="button"
              className={[styles.speedChip, rate === r ? styles.speedActive : ''].join(' ')}
              onClick={() => onChangeRate(r)}
              aria-pressed={rate === r}
            >
              {r}x
            </button>
          ))}
        </div>
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
