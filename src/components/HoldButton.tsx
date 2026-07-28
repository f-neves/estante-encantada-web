import { useEffect, useRef, useState } from 'react';
import styles from './HoldButton.module.css';

interface Props {
  label: string;
  holdingLabel?: string;
  onComplete: () => void;
  /** Tempo de pressão, em milissegundos. */
  duration?: number;
  className?: string | undefined;
}

// Portão parental simples: a ação só acontece se o dedo ficar pressionado.
// Uma criança pequena toca e solta; segurar por três segundos é gesto de
// adulto decidido. Mais leve que pedir PIN para cada ação destrutiva.
export default function HoldButton({
  label,
  holdingLabel = 'Segure para confirmar...',
  onComplete,
  duration = 3000,
  className,
}: Props) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const inicio = useRef(0);

  useEffect(() => {
    if (!holding) {
      cancelAnimationFrame(frame.current);
      setProgress(0);
      return;
    }
    inicio.current = performance.now();
    const passo = () => {
      const decorrido = performance.now() - inicio.current;
      const p = Math.min(1, decorrido / duration);
      setProgress(p);
      if (p >= 1) {
        setHolding(false);
        onComplete();
        return;
      }
      frame.current = requestAnimationFrame(passo);
    };
    frame.current = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame.current);
  }, [holding, duration, onComplete]);

  return (
    <button
      type="button"
      className={[styles.botao, holding ? styles.segurando : '', className ?? ''].filter(Boolean).join(' ')}
      onPointerDown={() => setHolding(true)}
      onPointerUp={() => setHolding(false)}
      onPointerLeave={() => setHolding(false)}
      onPointerCancel={() => setHolding(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className={styles.preenchimento} style={{ width: `${progress * 100}%` }} aria-hidden="true" />
      <span className={styles.texto}>{holding ? holdingLabel : label}</span>
    </button>
  );
}
