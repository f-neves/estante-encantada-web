import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** `sheet` sobe de baixo (índice de capítulos); `center` aparece no meio. */
  variant?: 'center' | 'sheet' | 'full';
  /** Rótulo acessível do diálogo. */
  label?: string | undefined;
  /** Clique fora fecha? Ligado por padrão. */
  dismissable?: boolean;
  className?: string | undefined;
}

// Usa o <dialog> nativo: já entrega trava de foco, Esc para fechar e camada
// superior sem gambiarra de z-index. Equivale ao <Modal> do React Native.
export default function Modal({
  visible,
  onClose,
  children,
  variant = 'center',
  label,
  dismissable = true,
  className,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (visible && !dialog.open) {
      dialog.showModal();
    } else if (!visible && dialog.open) {
      dialog.close();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[variant], className ?? ''].filter(Boolean).join(' ')}
      aria-label={label ?? ''}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clique no próprio <dialog> (e não no conteúdo) significa clique no fundo.
        if (dismissable && e.target === ref.current) {
          onClose();
        }
      }}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
