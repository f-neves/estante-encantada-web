import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { playSound } from '../utils/sound';
import styles from './PressBounce.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Botão "chunky" estilo brinquedo: borda inferior sólida mais escura. */
  chunky?: boolean;
}

// Toque com "mola": afunda ao pressionar e volta ao soltar. Equivale ao
// PressBounce do app (lá com Animated, aqui com transição CSS). O reset já
// desliga a animação para quem pediu menos movimento no sistema.
export default function PressBounce({ children, chunky, className, type, onClick, ...rest }: Props) {
  const classes = [styles.bounce, chunky ? styles.chunky : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type ?? 'button'}
      className={classes}
      onClick={(e) => {
        // Som curto junto com a mola: confirma a ação para quem não lê o
        // texto do botão. Silenciável na área dos pais.
        playSound('tap');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
