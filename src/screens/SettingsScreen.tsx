import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { OFFLINE } from '../config';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../profiles/ChildContext';
import { useOnboarding } from '../onboarding/OnboardingContext';
import ScreenHeader from '../layout/ScreenHeader';
import ModeToggle from '../layout/ModeToggle';
import Icon from '../components/Icon';
import Loading from '../components/Loading';
import Switch from '../components/Switch';
import PinPad from '../components/PinPad';
import PinSetupModal from '../components/PinSetupModal';
import PressBounce from '../components/PressBounce';
import ConfirmDialog from '../components/ConfirmDialog';
import { AVATAR_PACKS, DEFAULT_AVATAR } from '../data/avatars';
import {
  getReaderSettings,
  setReaderSettings,
  getParentalPin,
  setParentalPin,
  clearParentalPin,
  type ReaderSettings,
} from '../session';
import styles from './SettingsScreen.module.css';

const APP_VERSION = '1.0.0';
const DEFAULT_VOICE = 'pt-BR-Neural2-A';

type Pending = 'forgotPin' | 'removePin' | null;

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { activeProfile } = useChild();
  const { replay } = useOnboarding();

  const [stats, setStats] = useState({ completed: 0, inProgress: 0, rewards: 0 });
  const [settings, setSettings] = useState<ReaderSettings>({
    fontScale: 1,
    theme: 'light',
    voice: DEFAULT_VOICE,
  });

  // Controle parental: pinSet=null enquanto carrega; unlocked libera a tela.
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pinErrorSignal, setPinErrorSignal] = useState(0);
  const [pinErrorText, setPinErrorText] = useState<string | null>(null);
  const [pinModal, setPinModal] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [pinDone, setPinDone] = useState(false);

  // Identidade local (não há login: nome, e-mail e ícone moram aqui).
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [savedAccount, setSavedAccount] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  useEffect(() => {
    getReaderSettings().then((s) => {
      if (s) {
        setSettings({ ...s, voice: s.voice ?? DEFAULT_VOICE });
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || DEFAULT_AVATAR);
    }
  }, [user]);

  // Sempre que a tela abre, tranca de novo se houver PIN.
  useEffect(() => {
    let active = true;
    getParentalPin().then((pin) => {
      if (!active) {
        return;
      }
      setPinSet(!!pin);
      setUnlocked(!pin);
      setPinErrorText(null);
    });
    return () => {
      active = false;
    };
  }, []);

  const loadStats = useCallback(async () => {
    if (!activeProfile) {
      return;
    }
    try {
      const [progress, rewards] = await Promise.all([
        api.progress.listProgress(activeProfile.id),
        api.rewards.listRewards(activeProfile.id),
      ]);
      setStats({
        completed: progress.filter((p) => p.completedAt != null).length,
        inProgress: progress.filter((p) => p.completedAt == null).length,
        rewards: rewards.length,
      });
    } catch {
      // Estatísticas são secundárias; falha em silêncio.
    }
  }, [activeProfile]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function verifyPin(entered: string) {
    const pin = await getParentalPin();
    if (entered === pin) {
      setUnlocked(true);
      setPinErrorText(null);
    } else {
      setPinErrorText('PIN incorreto. Tente de novo.');
      setPinErrorSignal((n) => n + 1);
    }
  }

  async function handlePinDone(pin: string) {
    await setParentalPin(pin);
    setPinSet(true);
    setUnlocked(true);
    setPinModal(false);
    setPinDone(true);
    window.setTimeout(() => setPinDone(false), 3000);
  }

  async function confirmPending() {
    if (pending === 'forgotPin' || pending === 'removePin') {
      await clearParentalPin();
      setPinSet(false);
      setUnlocked(true);
    }
    setPending(null);
  }

  function updateReader(patch: Partial<ReaderSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setReaderSettings(next).catch(() => {});
  }

  async function saveAccount() {
    await updateUser({ name: name.trim() || 'Leitor', email: email.trim(), avatar });
    setSavedAccount(true);
    window.setTimeout(() => setSavedAccount(false), 2500);
  }

  if (pinSet === null) {
    return <Loading label="Abrindo configurações..." />;
  }

  if (pinSet && !unlocked) {
    return (
      <div className={styles.lockWrap}>
        <PinPad
          title="Área dos pais"
          subtitle="Digite o PIN para abrir as Configurações."
          onComplete={verifyPin}
          errorSignal={pinErrorSignal}
          errorText={pinErrorText}
        />
        <button type="button" className={styles.forgot} onClick={() => setPending('forgotPin')}>
          Esqueci o PIN
        </button>
        <ConfirmDialog
          visible={pending === 'forgotPin'}
          title="Esqueceu o PIN?"
          message="O controle parental será desativado e as Configurações voltam a abrir sem PIN."
          confirmLabel="Desativar PIN"
          destructive
          onConfirm={confirmPending}
          onCancel={() => setPending(null)}
        />
      </div>
    );
  }

  const statItems = [
    { n: stats.completed, label: 'Concluídos', color: 'var(--c-mint)' },
    { n: stats.inProgress, label: 'Em leitura', color: 'var(--c-sky)' },
    { n: stats.rewards, label: 'Medalhas', color: 'var(--c-yellow)' },
  ];

  return (
    <>
      <ScreenHeader title="Configurações" back="/" />
      <div className={styles.container}>
        <PinSetupModal visible={pinModal} onCancel={() => setPinModal(false)} onDone={handlePinDone} />

        {/* Personagem ativo */}
        <section className={['card', styles.profileCard].join(' ')}>
          <span className={styles.profileAvatar}>{activeProfile?.avatarUrl || DEFAULT_AVATAR}</span>
          <h2 className={['display', styles.profileName].join(' ')}>{activeProfile?.name}</h2>
          <PressBounce className="btn btn-outline" onClick={() => navigate('/perfis')}>
            <Icon name="swap-horizontal" size="var(--icon-md)" />
            Trocar de personagem
          </PressBounce>
        </section>

        {/* Progresso */}
        <h3 className="section-label">Progresso de {activeProfile?.name}</h3>
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

        {/* Aparência e modo de exibição */}
        <h3 className="section-label">Aparência</h3>
        <div className="card">
          <button type="button" className={styles.linkRow} onClick={() => navigate('/personalizar')}>
            <span className={styles.linkIcon}>
              <Icon name="color-palette" size="var(--icon-md)" color="var(--c-primary)" />
            </span>
            <span className={styles.linkText}>
              <span className={styles.linkLabel}>Personalizar</span>
              <span className={styles.linkHint}>Cores, fundo, ícones e tamanho da letra.</span>
            </span>
            <Icon name="chevron-forward" size="var(--icon-md)" color="var(--c-text-soft)" />
          </button>
          <div className={styles.divider} />
          <ModeToggle variant="row" />
        </div>

        {/* Narração */}
        <h3 className="section-label">Narração</h3>
        <div className="card">
          <Switch
            checked={settings.narrationOpen ?? false}
            onChange={(v) => updateReader({ narrationOpen: v })}
            label="Abrir narração ao entrar"
            hint="O painel já começa aberto no livro."
          />
          <div className={styles.divider} />
          <Switch
            checked={settings.continuous ?? true}
            onChange={(v) => updateReader({ continuous: v })}
            label="Narração contínua"
            hint="Ao terminar, toca o próximo capítulo sozinho."
          />
          <div className={styles.divider} />
          <p className={styles.voiceLabel}>Voz da narração</p>
          <div className={styles.voiceRow}>
            {api.books.VOICES.map((v) => (
              <button
                key={v.id}
                type="button"
                className={['chip', settings.voice === v.id ? 'chip-active' : ''].join(' ')}
                onClick={() => updateReader({ voice: v.id })}
                aria-pressed={settings.voice === v.id}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conta local */}
        <h3 className="section-label">Sua conta</h3>
        <div className="card">
          <p className={styles.accountHint}>
            {OFFLINE
              ? 'Não é preciso login: estes dados ficam só neste navegador.'
              : 'O e-mail identifica a conta usada no servidor.'}
          </p>
          <div className={styles.accountRow}>
            <button
              type="button"
              className={styles.accountAvatar}
              onClick={() => setAvatarPickerOpen((v) => !v)}
              aria-expanded={avatarPickerOpen}
              aria-label="Escolher ícone"
            >
              {avatar}
            </button>
            <div className={styles.accountFields}>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                aria-label="Seu nome"
              />
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail (opcional)"
                type="email"
                aria-label="E-mail"
              />
            </div>
          </div>

          {avatarPickerOpen ? (
            <div className={styles.avatarPicker}>
              {AVATAR_PACKS.flatMap((pack) => pack.emojis).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={[styles.avatarOption, avatar === emoji ? styles.avatarSelected : ''].join(
                    ' ',
                  )}
                  onClick={() => {
                    setAvatar(emoji);
                    setAvatarPickerOpen(false);
                  }}
                  aria-label={`Escolher ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : null}

          <PressBounce className="btn btn-primary btn-block" onClick={saveAccount}>
            {savedAccount ? 'Salvo!' : 'Salvar'}
          </PressBounce>
        </div>

        {user?.role === 'ADMIN' ? (
          <PressBounce
            className={['btn', 'btn-primary', 'btn-block', styles.adminButton].join(' ')}
            onClick={() => navigate('/admin')}
          >
            <Icon name="construct" size="var(--icon-md)" />
            Painel do administrador
          </PressBounce>
        ) : null}

        {/* Controle parental */}
        <h3 className="section-label">Controle parental</h3>
        <div className="card">
          {pinDone ? (
            <p className={styles.pinDone}>Controle parental ativado. As Configurações agora pedem o PIN.</p>
          ) : null}
          {pinSet ? (
            <div className={styles.stack}>
              <PressBounce className="btn btn-outline btn-block" onClick={() => setPinModal(true)}>
                <Icon name="lock-closed" size="var(--icon-md)" />
                Alterar PIN
              </PressBounce>
              <PressBounce
                className="btn btn-outline btn-block"
                onClick={() => setPending('removePin')}
              >
                Remover PIN
              </PressBounce>
            </div>
          ) : (
            <PressBounce className="btn btn-outline btn-block" onClick={() => setPinModal(true)}>
              <Icon name="lock-closed" size="var(--icon-md)" />
              Ativar controle parental
            </PressBounce>
          )}
        </div>

        <PressBounce className={['btn', 'btn-outline', 'btn-block', styles.replay].join(' ')} onClick={replay}>
          <Icon name="sparkles" size="var(--icon-md)" />
          Ver introdução novamente
        </PressBounce>

        <div className={styles.appRow}>
          <span className={styles.appName}>
            <Icon name="book" size="var(--icon-sm)" />
            Estante Encantada
          </span>
          <span className={styles.appVersion}>v{APP_VERSION}</span>
          <button type="button" className={styles.creditsLink} onClick={() => navigate('/creditos')}>
            Créditos das histórias e imagens
          </button>
        </div>

        <ConfirmDialog
          visible={pending === 'removePin'}
          title="Remover PIN"
          message="As Configurações ficarão abertas sem PIN. Continuar?"
          confirmLabel="Remover"
          destructive
          onConfirm={confirmPending}
          onCancel={() => setPending(null)}
        />
      </div>
    </>
  );
}
