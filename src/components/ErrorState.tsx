import Icon from './Icon';
import PressBounce from './PressBounce';
import styles from './ErrorState.module.css';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className={styles.center} role="alert">
      <Icon name="sad-outline" size="var(--icon-xl)" color="var(--c-text-soft)" />
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <PressBounce className={styles.retry} onClick={onRetry}>
          Tentar de novo
        </PressBounce>
      ) : null}
    </div>
  );
}
