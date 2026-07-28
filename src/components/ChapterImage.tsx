import { useEffect, useState } from 'react';
import styles from './ChapterImage.module.css';

// Ilustração do capítulo. Some sem alarde quando o livro não tem imagem ou o
// arquivo falha (mesmo comportamento do app).
export default function ChapterImage({ uri }: { uri: string | null }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return null;
  }

  return (
    <img
      src={uri}
      alt=""
      className={styles.image}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
