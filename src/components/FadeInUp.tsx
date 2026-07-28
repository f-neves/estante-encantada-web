import type { CSSProperties, ReactNode } from 'react';
import styles from './FadeInUp.module.css';

interface Props {
  children: ReactNode;
  /** Atraso em milissegundos, para escalonar listas. */
  delay?: number;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

// Entrada suave: surge subindo levemente, como o FadeInUp do app.
export default function FadeInUp({ children, delay = 0, className, style }: Props) {
  return (
    <div
      className={[styles.fade, className ?? ''].filter(Boolean).join(' ')}
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
