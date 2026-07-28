import { useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import PressBounce from './PressBounce';
import { hapticSuccess } from '../utils/haptics';
import styles from './CelebrationModal.module.css';

interface Props {
  visible: boolean;
  message: string;
  onClose: () => void;
}

// Brilhos ao redor do medalhão (coordenadas do wrap de 168x168, iguais às do app).
const SPARKLES = [
  { e: '✨', top: 2, left: 74 },
  { e: '🌟', top: 18, left: 128 },
  { e: '⭐', top: 74, left: 144 },
  { e: '✨', top: 128, left: 124 },
  { e: '🌟', top: 130, left: 22 },
  { e: '⭐', top: 70, left: 2 },
  { e: '✨', top: 16, left: 18 },
];

export default function CelebrationModal({ visible, message, onClose }: Props) {
  useEffect(() => {
    if (visible) {
      hapticSuccess();
    }
  }, [visible]);

  return (
    <Modal visible={visible} onClose={onClose} label="Parabéns" dismissable={false}>
      <div className={styles.card}>
        <h2 className={['display', styles.title].join(' ')}>Parabéns! 🎉</h2>

        <div className={styles.medalWrap}>
          {SPARKLES.map((sparkle, i) => (
            <span
              key={i}
              className={styles.sparkle}
              style={{ top: sparkle.top, left: sparkle.left }}
              aria-hidden="true"
            >
              {sparkle.e}
            </span>
          ))}
          <span className={styles.medal}>
            <Icon name="trophy" size={56} color="var(--c-white)" />
          </span>
        </div>

        <p className={styles.reward}>{message}</p>

        <PressBounce className={['btn', 'btn-primary', styles.button].join(' ')} onClick={onClose}>
          Continuar
        </PressBounce>
      </div>
    </Modal>
  );
}
