import AudioBar from './AudioBar';
import Icon from './Icon';
import styles from './NarrationPanel.module.css';

// Uma cor por narrador (mesma ordem de api.books.VOICES: Masculina, Feminina 1,
// Feminina 2). O ícone é sempre um microfone; a cor diferencia a voz. Evita o
// roxo dos controles para não confundir "tocar" com "quem narra".
const VOICE_COLORS = ['var(--c-coral)', 'var(--c-sky)', 'var(--c-mint)'];

interface Props {
  playing: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  voice: string;
  voices: { id: string; label: string }[];
  onToggle: () => void;
  onSeek: (fraction: number) => void;
  onChangeRate: (rate: number) => void;
  onChangeVoice: (voice: string) => void;
  continuous: boolean;
  onToggleContinuous: () => void;
}

export default function NarrationPanel({
  playing,
  currentTime,
  duration,
  rate,
  voice,
  voices,
  onToggle,
  onSeek,
  onChangeRate,
  onChangeVoice,
  continuous,
  onToggleContinuous,
}: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.iconRow}>
        <button
          type="button"
          className={[styles.circle, styles.filled].join(' ')}
          onClick={onToggle}
          aria-label={playing ? 'Pausar narração' : 'Ouvir narração'}
          title={playing ? 'Pausar' : 'Ouvir'}
        >
          <Icon name={playing ? 'pause' : 'play'} size="var(--icon-md)" color="var(--c-white)" />
        </button>

        <button
          type="button"
          className={[styles.circle, styles.outline, continuous ? styles.filled : ''].join(' ')}
          onClick={onToggleContinuous}
          aria-pressed={continuous}
          aria-label="Narração contínua"
          title="Ao terminar, toca o próximo capítulo sozinho"
        >
          <Icon
            name="return-down-forward"
            size="var(--icon-sm)"
            color={continuous ? 'var(--c-white)' : 'var(--c-primary)'}
          />
        </button>

        {voices.map((v, i) => {
          const active = voice === v.id;
          return (
            <button
              key={v.id}
              type="button"
              className={[styles.circle, styles.outline, active ? styles.filled : ''].join(' ')}
              onClick={() => onChangeVoice(v.id)}
              aria-pressed={active}
              aria-label={`Voz ${v.label}`}
              title={`Voz ${v.label}`}
            >
              <Icon
                name="mic"
                size="var(--icon-sm)"
                color={active ? 'var(--c-white)' : (VOICE_COLORS[i] ?? 'var(--c-primary)')}
              />
            </button>
          );
        })}
      </div>

      <AudioBar
        currentTime={currentTime}
        duration={duration}
        rate={rate}
        onSeek={onSeek}
        onChangeRate={onChangeRate}
      />
    </div>
  );
}
