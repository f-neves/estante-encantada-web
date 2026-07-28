import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './PressBounce.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Botão "chunky" estilo brinquedo: borda inferior sólida mais escura. */
  chunky?: boolean;
}

// Toque com "mola": afunda ao pressionar e volta ao soltar. Equivale ao
// PressBounce do app (lá com Animated, aqui com transição CSS). O reset já
// desliga a animação para quem pediu menos movimento no sistema.
export default function PressBounce({ children, chunky, className, type, ...rest }: Props) {
  const classes = [styles.bounce, chunky ? styles.chunky : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type ?? 'button'} className={classes} {...rest}>
      {children}
    </button>
  );
}
