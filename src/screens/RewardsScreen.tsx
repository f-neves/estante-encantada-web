import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';
import { useChild } from '../profiles/ChildContext';
import ScreenHeader from '../layout/ScreenHeader';
import FadeInUp from '../components/FadeInUp';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import { Reward } from '../types';
import styles from './RewardsScreen.module.css';

const BADGE_COLORS = [
  'var(--c-yellow)',
  'var(--c-coral)',
  'var(--c-mint)',
  'var(--c-sky)',
  'var(--c-pink)',
  'var(--c-primary)',
];

export default function RewardsScreen() {
  const { activeProfile } = useChild();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeProfile) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRewards(await api.rewards.listRewards(activeProfile.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar recompensas');
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <ScreenHeader
        title="Recompensas"
        back="/"
        subtitle="Cada livro concluído vira uma medalha no baú."
      />
      <div className={styles.container}>
        {loading ? (
          <Loading label="Abrindo o baú de conquistas..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rewards.length === 0 ? (
          <div className="empty-box">
            <Icon name="trophy" size="var(--icon-xl)" color="var(--c-yellow)" />
            <p>Conclua um livro para ganhar sua primeira medalha!</p>
          </div>
        ) : (
          <ul className={styles.grid}>
            {rewards.map((reward, index) => (
              <li key={reward.id}>
                <FadeInUp delay={Math.min(index, 8) * 60}>
                  <div className={styles.badge}>
                    <span
                      className={styles.medal}
                      style={{ background: BADGE_COLORS[index % BADGE_COLORS.length] }}
                    >
                      <Icon name="trophy" size="var(--icon-lg)" color="var(--c-white)" />
                    </span>
                    <span className={styles.label}>{reward.label}</span>
                    <span className={styles.date}>
                      {new Date(reward.earnedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </FadeInUp>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
