import { useId } from 'react';
import styles from './Switch.module.css';

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}

// Linha de ajuste com interruptor, no mesmo formato das Configurações do app:
// título, explicação curta e o controle à direita.
export default function Switch({ checked, onChange, label, hint }: Props) {
  const id = useId();
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className={styles.track} htmlFor={id} aria-hidden="true">
        <span className={styles.thumb} />
      </label>
    </div>
  );
}
