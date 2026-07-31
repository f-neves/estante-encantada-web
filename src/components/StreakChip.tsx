import Icon from './Icon';
import styles from './StreakChip.module.css';

// Chip da sequência de dias, com o mesmo pulso suave do app (aqui em CSS).
export default function StreakChip({ streak }: { streak: number }) {
  return (
    <span className={styles.chip}>
      <Icon name="flame" size="var(--icon-sm)" color="var(--c-flame)" />
      {streak === 1 ? '1 dia seguido!' : `${streak} dias seguidos!`}
    </span>
  );
}
