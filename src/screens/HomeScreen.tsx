import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { useChild } from '../profiles/ChildContext';
import { useLayoutMode } from '../layout/LayoutModeContext';
import { useDragScroll } from '../hooks/useDragScroll';
import BookCover from '../components/BookCover';
import FadeInUp from '../components/FadeInUp';
import StreakChip from '../components/StreakChip';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import Icon, { type IconName } from '../components/Icon';
import PressBounce from '../components/PressBounce';
import { DEFAULT_AVATAR } from '../data/avatars';
import { CATEGORIAS, categoriaDe } from '../data/categories';
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

// Só o que é da criança fica nos atalhos grandes e coloridos, e com rótulo:
// ícone sozinho não diz a um pré-leitor a diferença entre estrela e troféu.
// Configurações é território dos pais e saiu daqui (virou o ícone discreto do
// topo).
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
    label: 'Minhas medalhas',
  },
  {
    key: 'favorites',
    icon: 'star',
    color: 'var(--c-pink)',
    edge: 'var(--edge-pink)',
    to: '/favoritos',
    label: 'Meus preferidos',
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
  // Busca e filtro de idade são ferramentas de adulto: ficam atrás de um toque.
  const [toolsOpen, setToolsOpen] = useState(false);
  const [categoria, setCategoria] = useState<string | null>(null);

  // A faixa de temas passa da largura da coluna: arrastar com o mouse é o
  // gesto que a pessoa espera, e sem isso ela só rolaria com shift + roda.
  const arrastarTemas = useDragScroll({ axis: 'x' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const childAge = activeProfile ? new Date().getFullYear() - activeProfile.birthYear : undefined;

  const visibleBooks = useMemo(() => {
    const q = normalize(query.trim());
    return books.filter((b) => {
      if (categoria && categoriaDe(b.title) !== categoria) {
        return false;
      }
      if (q && !normalize(b.title).includes(q)) {
        return false;
      }
      return true;
    });
  }, [books, query, categoria]);

  const contagemPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const book of books) {
      const id = categoriaDe(book.title);
      mapa[id] = (mapa[id] ?? 0) + 1;
    }
    return mapa;
  }, [books]);

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
          className={styles.adultBtn}
          onClick={() => setToolsOpen((v) => !v)}
          aria-expanded={toolsOpen}
          aria-label="Buscar e filtrar"
          title="Buscar e filtrar"
        >
          <Icon name="search" size="var(--icon-md)" />
        </button>
        {/* Na coluna estreita o espaço é da saudação e do personagem; o
            atualizar fica só na versão desktop, onde sobra largura. */}
        {mode === 'web' ? (
          <button
            type="button"
            className={styles.adultBtn}
            onClick={() => load(true)}
            aria-label="Atualizar"
            title="Atualizar"
          >
            <Icon name="refresh" size="var(--icon-md)" className={refreshing ? styles.spinning : ''} />
          </button>
        ) : null}
        {mode === 'app' ? (
          <button
            type="button"
            className={styles.adultBtn}
            onClick={() => navigate('/configuracoes')}
            aria-label="Configurações (área dos pais)"
            title="Configurações (área dos pais)"
          >
            <Icon name="settings" size="var(--icon-md)" />
          </button>
        ) : null}
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

      {/* Ferramentas do adulto: aparecem só quando pedidas. */}
      {toolsOpen ? (
        <div className={styles.tools}>
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
              autoFocus
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
                Para {activeProfile?.name} ({childAge} anos)
              </button>
              <button
                type="button"
                className={['chip', !byAge ? 'chip-active' : ''].join(' ')}
                onClick={() => setByAge(false)}
                aria-pressed={!byAge}
              >
                Todas as idades
              </button>
            </div>
          ) : null}
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
            >
              <Icon name={quick.icon} size="var(--icon-lg)" color="var(--c-white)" />
              <span className={styles.quickLabel}>{quick.label}</span>
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

      {/* Prateleiras por tema: a criança escolhe pela cor e pelo desenho. */}
      {!loading && !error && books.length > 0 ? (
        <div className={styles.temas} ref={arrastarTemas}>
          <button
            type="button"
            className={[styles.tema, categoria === null ? styles.temaAtivo : ''].join(' ')}
            style={{ ['--tema' as string]: 'var(--c-primary)' }}
            onClick={() => setCategoria(null)}
            aria-pressed={categoria === null}
          >
            <Icon name="home" size="var(--icon-md)" />
            <span className={styles.temaLabel}>Tudo</span>
            <span className={styles.temaCount}>{books.length}</span>
          </button>
          {CATEGORIAS.filter((c) => (contagemPorCategoria[c.id] ?? 0) > 0).map((c) => (
            <button
              key={c.id}
              type="button"
              className={[styles.tema, categoria === c.id ? styles.temaAtivo : ''].join(' ')}
              style={{ ['--tema' as string]: c.color }}
              onClick={() => setCategoria(categoria === c.id ? null : c.id)}
              aria-pressed={categoria === c.id}
            >
              <Icon name={c.icon} size="var(--icon-md)" />
              <span className={styles.temaLabel}>{c.label}</span>
              <span className={styles.temaCount}>{contagemPorCategoria[c.id]}</span>
            </button>
          ))}
        </div>
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
                  {/* A capa é o nome do livro para quem não lê: ela é o alvo,
                      grande, e o texto vem embaixo. */}
                  <BookCover uri={book.coverUrl} title={book.title} tile />
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
                </Link>
              </FadeInUp>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
