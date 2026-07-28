import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { useChild } from '../profiles/ChildContext';
import { useLayoutMode } from '../layout/LayoutModeContext';
import ScreenHeader from '../layout/ScreenHeader';
import BookCover from '../components/BookCover';
import FadeInUp from '../components/FadeInUp';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import { FavoriteBook } from '../types';
import styles from './FavoritesScreen.module.css';

export default function FavoritesScreen() {
  const { activeProfile } = useChild();
  const { mode } = useLayoutMode();
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeProfile) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setFavorites(await api.favorites.listFavorites(activeProfile.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <ScreenHeader title="Favoritos" back="/" subtitle="Os livros que você guardou com a estrelinha." />
      <div className={styles.container}>
        {loading ? (
          <Loading label="Buscando seus preferidos..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : favorites.length === 0 ? (
          <div className="empty-box">
            <Icon name="star" size="var(--icon-xl)" color="var(--c-yellow)" />
            <p>Toque na estrela de um livro para guardar aqui!</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {favorites.map((book, index) => (
              <li key={book.id}>
                <FadeInUp delay={Math.min(index, 6) * 60}>
                  <Link className={styles.card} to={`/livro/${book.id}`}>
                    <BookCover uri={book.coverUrl} title={book.title} tile={mode === 'web'} />
                    <div className={styles.cardText}>
                      <span className={['clamp-2', styles.title].join(' ')}>{book.title}</span>
                      <span className={styles.meta}>
                        {book.ageMin}–{book.ageMax} anos
                      </span>
                    </div>
                    <Icon name="star" size="var(--icon-md)" color="var(--c-yellow)" />
                  </Link>
                </FadeInUp>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
