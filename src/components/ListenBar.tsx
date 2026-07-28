import AudioBar from './AudioBar';
import Icon from './Icon';
import styles from './ListenBar.module.css';

interface Props {
  playing: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  onToggle: () => void;
  onSeek: (fraction: number) => void;
}

// Ouvir a história é a ação principal de quem ainda não lê, então ela vira um
// botão grande e permanente, com rótulo. Os ajustes (voz, velocidade, tema,
// tamanho da letra) saíram daqui para a folha de ajustes.
export default function ListenBar({
  playing,
  currentTime,
  duration,
  rate,
  onToggle,
  onSeek,
}: Props) {
  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={[styles.play, playing ? styles.playing : ''].join(' ')}
        onClick={onToggle}
      >
        <Icon name={playing ? 'pause' : 'play'} size={38} color="var(--c-white)" />
        <span className={styles.label}>{playing ? 'Pausar' : 'Ouvir a história'}</span>
      </button>

      <div className={styles.progress}>
        <AudioBar
          currentTime={currentTime}
          duration={duration}
          rate={rate}
          onSeek={onSeek}
          onChangeRate={() => {}}
        />
      </div>
    </div>
  );
}
