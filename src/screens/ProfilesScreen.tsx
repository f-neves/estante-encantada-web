import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../profiles/ChildContext';
import Icon from '../components/Icon';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import PressBounce from '../components/PressBounce';
import ConfirmDialog from '../components/ConfirmDialog';
import { AVATAR_PACKS, DEFAULT_AVATAR, tileColorFor } from '../data/avatars';
import { ChildProfile } from '../types';
import styles from './ProfilesScreen.module.css';

export default function ProfilesScreen() {
  const navigate = useNavigate();
  const {
    profiles,
    activeProfile,
    loading,
    error,
    refresh,
    selectProfile,
    addProfile,
    updateProfile,
    removeProfile,
  } = useChild();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ChildProfile | null>(null);

  function selectAndReturn(profile: ChildProfile) {
    selectProfile(profile);
    navigate('/');
  }

  function startEdit(profile: ChildProfile) {
    setEditingId(profile.id);
    setName(profile.name);
    setBirthYear(String(profile.birthYear));
    setAvatar(profile.avatarUrl || DEFAULT_AVATAR);
    setFormError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setBirthYear('');
    setAvatar(DEFAULT_AVATAR);
    setFormError(null);
  }

  async function handleSubmit() {
    setFormError(null);
    const year = Number(birthYear);
    if (name.trim().length === 0) {
      setFormError('Qual é o nome da criança? 🙂');
      return;
    }
    if (!Number.isInteger(year) || birthYear.length !== 4) {
      setFormError('Informe o ano de nascimento (ex.: 2018)');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateProfile(editingId, { name: name.trim(), birthYear: year, avatarUrl: avatar });
        cancelEdit();
      } else {
        const created = await addProfile({ name: name.trim(), birthYear: year, avatarUrl: avatar });
        cancelEdit();
        selectAndReturn(created);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Não foi possível salvar o perfil');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) {
      return;
    }
    if (editingId === target.id) {
      cancelEdit();
    }
    try {
      await removeProfile(target.id);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Não foi possível excluir');
    }
  }

  return (
    <div className={styles.container}>
      {activeProfile ? (
        <button type="button" className={styles.back} onClick={() => navigate('/')}>
          <Icon name="chevron-back" size="var(--icon-sm)" />
          Início
        </button>
      ) : null}

      <h1 className={['display', styles.title].join(' ')}>Quem vai ler hoje?</h1>
      <p className={styles.subtitle}>Toque no seu personagem para começar a aventura ✨</p>

      {loading ? (
        <Loading label="Procurando os personagens..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <ul className={styles.grid}>
          {profiles.map((profile, i) => (
            <li key={profile.id} className={styles.profile}>
              <button
                type="button"
                className={styles.profileMain}
                onClick={() => selectAndReturn(profile)}
              >
                <span className={styles.avatarCircle} style={{ background: tileColorFor(i) }}>
                  {profile.avatarUrl || DEFAULT_AVATAR}
                </span>
                <span className={styles.profileText}>
                  <span className={styles.profileName}>{profile.name}</span>
                  <span className={styles.profileMeta}>
                    {new Date().getFullYear() - profile.birthYear} anos · {profile.birthYear}
                  </span>
                </span>
                {activeProfile?.id === profile.id ? (
                  <span className={styles.activeTag}>atual</span>
                ) : null}
              </button>
              <div className={styles.actions}>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => startEdit(profile)}
                  aria-label={`Editar ${profile.name}`}
                >
                  <Icon name="create-outline" size="var(--icon-md)" />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setPendingDelete(profile)}
                  aria-label={`Excluir ${profile.name}`}
                >
                  <Icon name="trash-outline" size="var(--icon-md)" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className={['card', styles.formCard].join(' ')}>
        <h2 className="section-title">
          <Icon name={editingId ? 'create' : 'add-circle'} size="var(--icon-md)" />
          {editingId ? 'Editar personagem' : 'Novo personagem'}
        </h2>

        <div className={styles.packs}>
          {AVATAR_PACKS.map((pack) => (
            <div key={pack.id}>
              <p className={styles.packLabel}>{pack.label}</p>
              <div className={styles.avatarRow}>
                {pack.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={[styles.avatarOption, avatar === emoji ? styles.avatarSelected : ''].join(
                      ' ',
                    )}
                    onClick={() => setAvatar(emoji)}
                    aria-label={`Escolher ${emoji}`}
                    aria-pressed={avatar === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            className="input"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
          <input
            className="input"
            placeholder="Ano de nascimento (ex.: 2018)"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            maxLength={4}
          />
          {formError ? <p className="form-error">{formError}</p> : null}
          <PressBounce className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar e começar! 🎉'}
          </PressBounce>
          {editingId ? (
            <button type="button" className={styles.cancel} onClick={cancelEdit}>
              Cancelar
            </button>
          ) : null}
        </form>
      </section>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Excluir personagem"
        message={
          pendingDelete
            ? `Excluir o perfil de ${pendingDelete.name}? O progresso, as medalhas e os favoritos dele serão apagados.`
            : ''
        }
        confirmLabel="Segure para excluir"
        destructive
        hold
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
