import { useEffect, useState } from 'react';
import Icon from './Icon';
import styles from './PinPad.module.css';

interface Props {
  title: string;
  subtitle?: string;
  /** Disparado quando os 4 dígitos são inseridos; o campo é limpo em seguida. */
  onComplete: (pin: string) => void;
  /** Incremente para sinalizar erro: treme e limpa o campo. */
  errorSignal?: number;
  errorText?: string | null;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PinPad({ title, subtitle, onComplete, errorSignal, errorText }: Props) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (errorSignal === undefined || errorSignal === 0) {
      return;
    }
    setPin('');
    setShake((n) => n + 1);
  }, [errorSignal]);

  function press(key: string) {
    if (key === '') {
      return;
    }
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) {
      return;
    }
    const next = pin + key;
    setPin(next);
    if (next.length === 4) {
      onComplete(next);
      window.setTimeout(() => setPin(''), 150);
    }
  }

  // O teclado físico também digita o PIN (versão desktop).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (/^\d$/.test(e.key)) {
        press(e.key);
      } else if (e.key === 'Backspace') {
        press('⌫');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className={styles.wrap}>
      <Icon name="lock-closed" size="var(--icon-xl)" color="var(--c-primary)" />
      <h2 className={['display', styles.title].join(' ')}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

      <div key={shake} className={[styles.dots, shake > 0 ? styles.shake : ''].join(' ')}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={[styles.dot, i < pin.length ? styles.dotOn : ''].join(' ')} />
        ))}
      </div>

      {errorText ? <p className={styles.error}>{errorText}</p> : null}

      <div className={styles.keys}>
        {KEYS.map((key, i) => (
          <button
            key={i}
            type="button"
            className={[styles.key, key === '' ? styles.keyHidden : ''].join(' ')}
            onClick={() => press(key)}
            disabled={key === ''}
            aria-label={key === '⌫' ? 'Apagar' : key}
          >
            {key === '⌫' ? (
              <Icon name="backspace-outline" size="var(--icon-lg)" color="var(--c-text)" />
            ) : (
              key
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
