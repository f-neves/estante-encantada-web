import { useEffect, useState } from 'react';
import { coverSource, coverThumbSource } from '../media';
import Icon from './Icon';
import styles from './BookCover.module.css';

const COLORS = [
  'var(--c-primary)',
  'var(--c-mint)',
  'var(--c-coral)',
  'var(--c-sky)',
  'var(--c-pink)',
  'var(--c-yellow)',
];

// Cor estável por título, para o livro sem capa ter sempre a mesma aparência.
function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length] as string;
}

interface Props {
  uri: string | null;
  title: string;
  /** Capa grande (tela de detalhe): usa sempre o arquivo original. */
  large?: boolean;
  /** Capa de grade (versão desktop), que preenche a largura da célula. */
  tile?: boolean;
}

export default function BookCover({ uri, title, large, tile }: Props) {
  // Tenta a miniatura primeiro e cai para o original; só depois desiste e
  // mostra a capa ilustrada de reserva.
  const candidates = uri
    ? large
      ? [coverSource(uri)]
      : [coverThumbSource(uri), coverSource(uri)].filter((s): s is string => s !== null)
    : [];

  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
  }, [uri]);

  const src = candidates[attempt];
  const sizeClass = large ? styles.large : tile ? styles.tile : styles.small;

  if (!src) {
    return (
      <div
        className={[sizeClass, styles.fallback].join(' ')}
        style={{ background: colorFor(title) }}
        aria-hidden="true"
      >
        <Icon name="book" size={large ? 'var(--icon-xl)' : 'var(--icon-md)'} color="var(--c-white)" />
        <span className={styles.fallbackText}>{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={[sizeClass, styles.image, loaded ? styles.loaded : ''].join(' ')}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setAttempt((n) => n + 1)}
    />
  );
}
