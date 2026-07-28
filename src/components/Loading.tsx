import styles from './Loading.module.css';

// Equivale ao <Loading> do app: roda no centro da área e explica o que carrega.
export default function Loading({ label }: { label?: string }) {
  return (
    <div className={styles.center} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      {label ? <p className={styles.label}>{label}</p> : null}
    </div>
  );
}
