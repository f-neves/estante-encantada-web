import Modal from './Modal';
import PressBounce from './PressBounce';
import styles from './ConfirmDialog.module.css';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Deixa o botão de confirmar vermelho (excluir, remover PIN). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Substitui o Alert.alert do React Native, mantendo o visual do app.
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} onClose={onCancel} label={title}>
      <div className={styles.card}>
        <h2 className={['display', styles.title].join(' ')}>{title}</h2>
        {message ? <p className={styles.message}>{message}</p> : null}
        <div className={styles.actions}>
          <PressBounce className={styles.cancel} onClick={onCancel}>
            {cancelLabel}
          </PressBounce>
          <PressBounce
            className={[styles.confirm, destructive ? styles.destructive : ''].join(' ')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </PressBounce>
        </div>
      </div>
    </Modal>
  );
}
