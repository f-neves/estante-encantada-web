import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';
import { OFFLINE } from '../config';
import { useAuth } from '../auth/AuthContext';
import ScreenHeader from '../layout/ScreenHeader';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import { AdminStats, AdminUser, AdminBook } from '../types';
import styles from './AdminScreen.module.css';

export default function AdminScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (OFFLINE) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [s, u, b] = await Promise.all([
        api.admin.getStats(),
        api.admin.listUsers(),
        api.admin.listBooks(),
      ]);
      setStats(s);
      setUsers(u);
      setBooks(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar o painel');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  }

  async function togglePlan(u: AdminUser) {
    const nextPlan = u.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM';
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, plan: nextPlan } : x)));
    try {
      await api.admin.updateUser(u.id, { plan: nextPlan });
    } catch {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, plan: u.plan } : x)));
      flash('Não foi possível atualizar o plano.');
    }
  }

  async function toggleRole(u: AdminUser) {
    if (u.id === user?.id) {
      flash('Você não pode alterar o seu próprio papel.');
      return;
    }
    const nextRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));
    try {
      await api.admin.updateUser(u.id, { role: nextRole });
    } catch {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: u.role } : x)));
      flash('Não foi possível atualizar o papel.');
    }
  }

  async function toggleBook(b: AdminBook) {
    const next = !b.isPremium;
    setBooks((prev) => prev.map((x) => (x.id === b.id ? { ...x, isPremium: next } : x)));
    try {
      await api.admin.updateBook(b.id, next);
    } catch {
      setBooks((prev) => prev.map((x) => (x.id === b.id ? { ...x, isPremium: b.isPremium } : x)));
      flash('Não foi possível atualizar o livro.');
    }
  }

  if (OFFLINE) {
    return (
      <>
        <ScreenHeader title="Administração" back="/configuracoes" />
        <div className="empty-box">
          <Icon name="construct" size="var(--icon-xl)" color="var(--c-primary)" />
          <p>
            O painel de administração trabalha sobre o servidor (contas, planos e catálogo). Neste
            modo o site funciona sozinho no navegador, então não há o que administrar.
          </p>
        </div>
      </>
    );
  }

  if (loading) {
    return <Loading label="Abrindo o painel..." />;
  }
  if (error) {
    return (
      <>
        <ScreenHeader title="Administração" back="/configuracoes" />
        <ErrorState message={error} onRetry={load} />
      </>
    );
  }

  const statItems = stats
    ? [
        { n: stats.users, label: 'Usuários', color: 'var(--c-primary)' },
        { n: stats.premium, label: 'Premium', color: 'var(--c-yellow)' },
        { n: stats.books, label: 'Livros', color: 'var(--c-mint)' },
        { n: stats.profiles, label: 'Perfis', color: 'var(--c-sky)' },
      ]
    : [];

  return (
    <>
      <ScreenHeader title="Administração" back="/configuracoes" />
      <div className={styles.container}>
        {notice ? <p className={styles.notice}>{notice}</p> : null}

        <div className={styles.statsRow}>
          {statItems.map((s) => (
            <div key={s.label} className="stat-box">
              <p className="stat-number" style={{ color: s.color }}>
                {s.n}
              </p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className={['section-title', styles.section].join(' ')}>
          <Icon name="people" size="var(--icon-md)" />
          Usuários
        </h2>
        <ul className={styles.list}>
          {users.map((u) => (
            <li key={u.id} className="card">
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <p className={['clamp-1', styles.name].join(' ')}>
                    {u.name}
                    {u.id === user?.id ? ' (você)' : ''}
                  </p>
                  <p className={['clamp-1', styles.email].join(' ')}>{u.email}</p>
                </div>
                <span className={styles.childCount}>
                  {u.childrenCount}
                  <Icon name="people" size="var(--icon-sm)" color="var(--c-text-soft)" />
                </span>
              </div>
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={[styles.toggle, u.plan === 'PREMIUM' ? styles.on : styles.off].join(' ')}
                  onClick={() => togglePlan(u)}
                >
                  {u.plan === 'PREMIUM' ? <Icon name="star" size="var(--icon-sm)" /> : null}
                  {u.plan === 'PREMIUM' ? 'Premium' : 'FREE'}
                </button>
                <button
                  type="button"
                  className={[styles.toggle, u.role === 'ADMIN' ? styles.admin : styles.off].join(' ')}
                  onClick={() => toggleRole(u)}
                >
                  {u.role === 'ADMIN' ? <Icon name="construct" size="var(--icon-sm)" /> : null}
                  {u.role === 'ADMIN' ? 'Admin' : 'Usuário'}
                </button>
              </div>
            </li>
          ))}
        </ul>

        <h2 className={['section-title', styles.section].join(' ')}>
          <Icon name="book" size="var(--icon-md)" />
          Livros
        </h2>
        <ul className={styles.list}>
          {books.map((b) => (
            <li key={b.id} className="card">
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <p className={['clamp-1', styles.name].join(' ')}>{b.title}</p>
                  <p className={styles.email}>
                    {b.ageMin}–{b.ageMax} anos · {b.chapterCount} cap.
                  </p>
                </div>
                <button
                  type="button"
                  className={[styles.toggle, b.isPremium ? styles.on : styles.off].join(' ')}
                  onClick={() => toggleBook(b)}
                >
                  {b.isPremium ? <Icon name="star" size="var(--icon-sm)" /> : null}
                  {b.isPremium ? 'Premium' : 'Grátis'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
