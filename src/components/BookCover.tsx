import { useState } from 'react';
import { coverSource } from '../media';
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
  /** Capa grande (tela de detalhe). */
  large?: boolean;
  /** Capa de grade (modo Web), que preenche a largura da célula. */
  tile?: boolean;
}

export default function BookCover({ uri, title, large, tile }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const sizeClass = large ? styles.large : tile ? styles.tile : styles.small;
  const src = uri ? coverSource(uri) : null;

  if (!src || failed) {
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
      onError={() => setFailed(true)}
    />
  );
}
