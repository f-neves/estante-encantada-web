import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { useChild } from '../profiles/ChildContext';
import { useLayoutMode } from '../layout/LayoutModeContext';
import BookCover from '../components/BookCover';
import FadeInUp from '../components/FadeInUp';
import StreakChip from '../components/StreakChip';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import Icon, { type IconName } from '../components/Icon';
import PressBounce from '../components/PressBounce';
import { DEFAULT_AVATAR } from '../data/avatars';
import { BookListItem, ProgressWithBook } from '../types';
import styles from './HomeScreen.module.css';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  }
  if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  }
  return 'Boa noite';
}

const QUICK: {
  key: string;
  icon: IconName;
  color: string;
  edge: string;
  to: string;
  label: string;
}[] = [
  {
    key: 'rewards',
    icon: 'trophy',
    color: 'var(--c-yellow)',
    edge: 'var(--edge-yellow)',
    to: '/recompensas',
    label: 'Recompensas',
  },
  {
    key: 'favorites',
    icon: 'star',
    color: 'var(--c-pink)',
    edge: 'var(--edge-pink)',
    to: '/favoritos',
    label: 'Favoritos',
  },
  {
    key: 'settings',
    icon: 'settings',
    color: 'var(--c-sky)',
    edge: 'var(--edge-sky)',
    to: '/configuracoes',
    label: 'Configurações',
  },
];

// Busca sem acento: "joao" acha "João".
function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { activeProfile, isDefaultProfile } = useChild();
  const { mode } = useLayoutMode();

  const [books, setBooks] = useState<BookListItem[]>([]);
  const [continueItem, setContinueItem] = useState<ProgressWithBook | null>(null);
  const [streak, setStreak] = useState(0);
  // Personagem genérico ainda não tem idade escolhida pelo usuário: filtrar por
  // ela esconderia livros sem motivo. Começa em "Todos".
  const [byAge, setByAge] = useState(!isDefaultProfile);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const childAge = activeProfile ? new Date().getFullYear() - activeProfile.birthYear : undefined;

  const visibleBooks = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) {
      return books;
    }
    return books.filter((b) => normalize(b.title).includes(q));
  }, [books, query]);

  const fetchData = useCallback(async () => {
    setBooks(await api.books.listBooks(byAge && childAge !== undefined ? { age: childAge } : {}));
    if (activeProfile) {
      try {
        const progress = await api.progress.listProgress(activeProfile.id);
        setContinueItem(progress.find((p) => p.completedAt == null) ?? null);
      } catch {
        setContinueItem(null);
      }
      try {
        setStreak(await api.streak.getStreak(activeProfile.id));
      } catch {
        setStreak(0);
      }
    }
  }, [activeProfile, byAge, childAge]);

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        await fetchData();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar livros');
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [fetchData],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.topText}>
          <h1 className={['display', styles.greeting].join(' ')}>
            {greeting()}, {activeProfile?.name}!
          </h1>
          {streak > 0 ? (
            <StreakChip streak={streak} />
          ) : (
            <p className={styles.subtle}>Que história vamos ler hoje? ✨</p>
          )}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => load(true)}
          aria-label="Atualizar"
          title="Atualizar"
        >
          <Icon
            name="refresh"
            size="var(--icon-md)"
            color="var(--c-primary)"
            className={refreshing ? styles.spinning : ''}
          />
        </button>
        {mode === 'app' ? (
          <button
            type="button"
            className={styles.avatarBtn}
            onClick={() => navigate('/perfis')}
            aria-label="Trocar de personagem"
          >
            {activeProfile?.avatarUrl || DEFAULT_AVATAR}
          </button>
        ) : null}
      </div>

      <div className={styles.searchRow}>
        <Icon
          name="search"
          size="var(--icon-sm)"
          color="var(--c-text-soft)"
          className={styles.searchIcon}
        />
        <input
          className={styles.search}
          type="search"
          placeholder="Buscar livro..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar livro"
        />
      </div>

      {childAge !== undefined ? (
        <div className={styles.filterRow}>
          <button
            type="button"
            className={['chip', byAge ? 'chip-active' : ''].join(' ')}
            onClick={() => setByAge(true)}
            aria-pressed={byAge}
          >
            Para mim ({childAge} anos)
          </button>
          <button
            type="button"
            className={['chip', !byAge ? 'chip-active' : ''].join(' ')}
            onClick={() => setByAge(false)}
            aria-pressed={!byAge}
          >
            Todos
          </button>
        </div>
      ) : null}

      <div className={styles.quickBar}>
        {QUICK.map((quick, i) => (
          <FadeInUp key={quick.key} delay={i * 70} className={styles.quickWrap}>
            <PressBounce
              chunky
              className={styles.quickItem}
              style={{ background: quick.color, ['--edge' as string]: quick.edge }}
              onClick={() => navigate(quick.to)}
              aria-label={quick.label}
              title={quick.label}
            >
              <Icon name={quick.icon} size="var(--icon-lg)" color="var(--c-white)" />
            </PressBounce>
          </FadeInUp>
        ))}
      </div>

      {continueItem ? (
        <FadeInUp>
          <Link
            className={styles.continueCard}
            to={`/ler/${continueItem.bookId}?cap=${continueItem.lastChapterIndex}&pos=${continueItem.positionPercent}`}
          >
            <BookCover uri={continueItem.book.coverUrl} title={continueItem.book.title} />
            <div className={styles.continueText}>
              <span className={styles.continueLabel}>
                <Icon name="play" size="var(--icon-sm)" />
                CONTINUAR LENDO
              </span>
              <span className={['clamp-2', styles.continueTitle].join(' ')}>
                {continueItem.book.title}
              </span>
              <span className={styles.continueMeta}>Capítulo {continueItem.lastChapterIndex + 1}</span>
            </div>
          </Link>
        </FadeInUp>
      ) : null}

      {loading ? (
        <Loading label="Abrindo a estante..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(false)} />
      ) : visibleBooks.length === 0 ? (
        <div className="empty-box">
          <Icon name="search" size="var(--icon-xl)" color="var(--c-text-soft)" />
          <p>
            {query.trim()
              ? `Nada encontrado para "${query.trim()}".`
              : byAge
                ? 'Nenhuma história para esta idade. Toque em "Todos".'
                : 'Nenhuma história no catálogo.'}
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {visibleBooks.map((book, index) => (
            <li key={book.id}>
              <FadeInUp delay={Math.min(index, 6) * 60}>
                <Link className={styles.card} to={`/livro/${book.id}`}>
                  <BookCover uri={book.coverUrl} title={book.title} tile={mode === 'web'} />
                  <div className={styles.cardText}>
                    <div className={styles.cardRow}>
                      <span className={['clamp-2', styles.bookTitle].join(' ')}>{book.title}</span>
                      {book.isPremium ? (
                        <Icon name="star" size="var(--icon-sm)" color="var(--c-yellow)" />
                      ) : null}
                    </div>
                    <span className={styles.bookMeta}>
                      {book.ageMin}–{book.ageMax} anos ·{' '}
                      {book.pdfUrl
                        ? 'PDF'
                        : `${book.chapterCount} capítulo${book.chapterCount === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  <span className={styles.cardArrow} aria-hidden="true">
                    <Icon name="chevron-forward" size="var(--icon-md)" color="var(--c-primary)" />
                  </span>
                </Link>
              </FadeInUp>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
