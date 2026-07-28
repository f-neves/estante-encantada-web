import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../api';
import { ApiError } from '../api';
import { fileUrl } from '../config';
import { useChild } from '../profiles/ChildContext';
import ScreenHeader from '../layout/ScreenHeader';
import BookCover from '../components/BookCover';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import PressBounce from '../components/PressBounce';
import { hapticLight } from '../utils/haptics';
import { BookDetail, ReadingProgress } from '../types';
import styles from './BookDetailScreen.module.css';

export default function BookDetailScreen() {
  const { bookId = '' } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useChild();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favBurst, setFavBurst] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  const fetchData = useCallback(async () => {
    setPremiumBlocked(false);
    try {
      setBook(await api.books.getBook(bookId));
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setBook(null);
        setPremiumBlocked(true);
        return;
      }
      throw e;
    }
    if (activeProfile) {
      try {
        setProgress(await api.progress.getProgress(activeProfile.id, bookId));
      } catch {
        setProgress(null);
      }
      try {
        const favs = await api.favorites.listFavorites(activeProfile.id);
        setIsFavorite(favs.some((b) => b.id === bookId));
      } catch {
        setIsFavorite(false);
      }
    }
  }, [bookId, activeProfile]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar o livro');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleFavorite() {
    if (!activeProfile) {
      return;
    }
    const next = !isFavorite;
    setIsFavorite(next);
    if (next) {
      // "Pop", brilho e vibração comemoram só ao favoritar.
      hapticLight();
      setFavBurst((n) => n + 1);
    }
    try {
      if (next) {
        await api.favorites.addFavorite(activeProfile.id, bookId);
      } else {
        await api.favorites.removeFavorite(activeProfile.id, bookId);
      }
    } catch {
      setIsFavorite(!next);
    }
  }

  if (loading) {
    return <Loading label="Carregando livro..." />;
  }

  if (premiumBlocked) {
    return (
      <>
        <ScreenHeader title="Livro premium" back />
        <div className={styles.premium}>
          <Icon name="lock-closed" size="var(--icon-xl)" color="var(--c-primary)" />
          <h2 className={['display', styles.premiumTitle].join(' ')}>Livro premium</h2>
          <p className={styles.premiumText}>Este livro é exclusivo para assinantes premium.</p>
        </div>
      </>
    );
  }

  if (error || !book) {
    return (
      <>
        <ScreenHeader title="Livro" back />
        <ErrorState message={error ?? 'Livro não encontrado'} onRetry={load} />
      </>
    );
  }

  const isCompleted = progress?.completedAt != null;
  const resumeIndex = progress?.lastChapterIndex ?? 0;
  const actionLabel = isCompleted
    ? 'Ler de novo'
    : progress
      ? `Continuar (cap. ${resumeIndex + 1})`
      : 'Começar a ler';

  const readerHref = `/ler/${bookId}?cap=${isCompleted ? 0 : resumeIndex}&pos=${
    isCompleted ? 0 : (progress?.positionPercent ?? 0)
  }`;

  return (
    <>
      <ScreenHeader title={book.title} back />

      <div className={styles.container}>
        <div className={styles.hero}>
          <BookCover uri={book.coverUrl} title={book.title} large />
        </div>

        <div className={styles.info}>
          {/* O título já aparece no cabeçalho (barra na versão App, título da
              página na versão desktop), como no aplicativo. */}
          <div className={styles.pillsRow}>
            <span className="pill">
              {book.ageMin}–{book.ageMax} anos
            </span>
            {book.isPremium ? (
              <span className="pill pill-premium">
                <Icon name="star" size="var(--icon-sm)" />
                Premium
              </span>
            ) : null}
            {isCompleted ? (
              <span className="pill pill-done">
                <Icon name="checkmark-circle" size="var(--icon-sm)" />
                Concluído
              </span>
            ) : null}
          </div>

          <div className={styles.actionRow}>
            {book.chapters.length > 0 ? (
              <PressBounce
                className={['btn', 'btn-primary', styles.action].join(' ')}
                onClick={() => navigate(readerHref)}
              >
                <Icon name={isCompleted ? 'refresh' : 'play'} size="var(--icon-md)" />
                {actionLabel}
              </PressBounce>
            ) : book.pdfUrl ? (
              <a
                className={['btn', 'btn-primary', styles.action].join(' ')}
                href={fileUrl(book.pdfUrl)}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="document-text" size="var(--icon-md)" />
                Abrir PDF
              </a>
            ) : null}

            <button
              type="button"
              className={styles.starBtn}
              onClick={toggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {favBurst > 0 ? (
                <span key={favBurst} className={styles.shine} aria-hidden="true">
                  <Icon name="sparkles" size="var(--icon-md)" color="var(--c-yellow)" />
                </span>
              ) : null}
              <span className={isFavorite ? styles.starPop : ''}>
                <Icon
                  name={isFavorite ? 'star' : 'star-outline'}
                  size="var(--icon-lg)"
                  color={isFavorite ? 'var(--c-yellow)' : 'var(--c-text-soft)'}
                />
              </span>
            </button>
          </div>

          <p className={styles.description}>{book.description}</p>

          {book.chapters.length > 0 ? (
            <>
              <h3 className={['section-title', styles.chaptersTitle].join(' ')}>
                <Icon name="book" size="var(--icon-md)" />
                Capítulos
              </h3>
              <ul className={styles.chapters}>
                {book.chapters.map((chapter, index) => {
                  const read = !!progress && (isCompleted || index <= progress.lastChapterIndex);
                  return (
                    <li key={chapter.id}>
                      <Link className={styles.chapter} to={`/ler/${bookId}?cap=${index}&pos=0`}>
                        <span
                          className={[styles.chapterCircle, read ? styles.chapterRead : ''].join(' ')}
                        >
                          {read ? (
                            <Icon name="checkmark" size="var(--icon-sm)" color="var(--c-white)" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span className={['clamp-1', styles.chapterTitle].join(' ')}>
                          {chapter.title}
                        </span>
                        <Icon name="chevron-forward" size="var(--icon-md)" color="var(--c-primary)" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
