import { useState } from 'react';
import { useAppearance, PALETTES, BACKGROUNDS } from '../appearance/AppearanceContext';
import { useChild } from '../profiles/ChildContext';
import ScreenHeader from '../layout/ScreenHeader';
import Icon, { type IconName } from '../components/Icon';
import PressBounce from '../components/PressBounce';
import { AVATAR_PACKS, DEFAULT_AVATAR, TILE_COLORS } from '../data/avatars';
import styles from './CustomizeScreen.module.css';

const SCHEMES: { id: 'light' | 'dark' | 'auto'; label: string; icon: IconName }[] = [
  { id: 'light', label: 'Claro', icon: 'sunny' },
  { id: 'dark', label: 'Escuro', icon: 'moon' },
  { id: 'auto', label: 'Automático', icon: 'contrast' },
];

const TEXT_SIZES = [
  { value: 0.9, label: 'Pequeno' },
  { value: 1, label: 'Médio' },
  { value: 1.15, label: 'Grande' },
  { value: 1.3, label: 'Enorme' },
];

const FONTS: { id: 'fredoka' | 'system'; label: string; hint: string }[] = [
  { id: 'fredoka', label: 'Arredondada', hint: 'A fonte lúdica do aplicativo.' },
  { id: 'system', label: 'Do sistema', hint: 'Mais sóbria e familiar para leitura.' },
];

const CORNERS: { id: 'round' | 'square'; label: string }[] = [
  { id: 'round', label: 'Arredondado' },
  { id: 'square', label: 'Reto' },
];

export default function CustomizeScreen() {
  const { settings, update, reset } = useAppearance();
  const { activeProfile, updateProfile } = useChild();
  const [savingAvatar, setSavingAvatar] = useState(false);

  const tile = settings.tileColor ?? TILE_COLORS[0];

  async function chooseAvatar(emoji: string) {
    if (!activeProfile) {
      return;
    }
    setSavingAvatar(true);
    try {
      await updateProfile(activeProfile.id, { avatarUrl: emoji });
    } finally {
      setSavingAvatar(false);
    }
  }

  return (
    <>
      <ScreenHeader
        title="Personalizar"
        back="/configuracoes"
        subtitle={
          activeProfile
            ? `As escolhas valem para o personagem ${activeProfile.name}.`
            : 'Escolha as cores e o jeito do seu cantinho de leitura.'
        }
      />

      <div className={styles.container}>
        {/* Prévia */}
        <section className={['card', styles.preview].join(' ')}>
          <span className={styles.previewAvatar} style={{ background: tile }}>
            {activeProfile?.avatarUrl || DEFAULT_AVATAR}
          </span>
          <div className={styles.previewText}>
            <p className={['display', styles.previewTitle].join(' ')}>
              Olá, {activeProfile?.name ?? 'leitor'}!
            </p>
            <p className={styles.previewHint}>Assim o site fica com as suas escolhas.</p>
          </div>
          <span className={styles.previewChip}>
            <Icon name="sparkles" size="var(--icon-sm)" color="var(--c-white)" />
          </span>
        </section>

        {/* Paleta */}
        <h2 className="section-label">Cor principal</h2>
        <div className={['card', styles.row].join(' ')}>
          {PALETTES.map((palette) => (
            <button
              key={palette.id}
              type="button"
              className={[
                styles.paletteBtn,
                settings.palette === palette.id ? styles.paletteActive : '',
              ].join(' ')}
              onClick={() => update({ palette: palette.id })}
              aria-pressed={settings.palette === palette.id}
              title={palette.label}
            >
              <span className={styles.paletteDot} style={{ background: palette.color }}>
                {settings.palette === palette.id ? (
                  <Icon name="checkmark" size="var(--icon-sm)" color="var(--c-white)" />
                ) : null}
              </span>
              <span className={styles.paletteLabel}>{palette.label}</span>
            </button>
          ))}
        </div>

        {/* Claro/escuro */}
        <h2 className="section-label">Claro ou escuro</h2>
        <div className={['card', styles.chipRow].join(' ')}>
          {SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              className={['chip', settings.scheme === scheme.id ? 'chip-active' : ''].join(' ')}
              onClick={() => update({ scheme: scheme.id })}
              aria-pressed={settings.scheme === scheme.id}
            >
              <Icon name={scheme.icon} size="var(--icon-sm)" />
              {scheme.label}
            </button>
          ))}
        </div>

        {/* Fundo */}
        <h2 className="section-label">Fundo</h2>
        <div className={['card', styles.backgrounds].join(' ')}>
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              type="button"
              className={[
                styles.bgOption,
                settings.background === bg.id ? styles.bgActive : '',
              ].join(' ')}
              onClick={() => update({ background: bg.id })}
              aria-pressed={settings.background === bg.id}
            >
              <span className={[styles.bgSwatch, styles[`bg_${bg.id}`] ?? ''].join(' ')} />
              {bg.label}
            </button>
          ))}
        </div>

        {/* Ícone do personagem */}
        <h2 className="section-label">Ícone do personagem</h2>
        <div className="card">
          <div className={styles.tileRow}>
            {TILE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={[styles.tileBtn, tile === color ? styles.tileActive : ''].join(' ')}
                style={{ background: color }}
                onClick={() => update({ tileColor: color })}
                aria-pressed={tile === color}
                aria-label={`Cor do ladrilho ${color}`}
              />
            ))}
          </div>

          {AVATAR_PACKS.map((pack) => (
            <div key={pack.id} className={styles.pack}>
              <p className={styles.packLabel}>{pack.label}</p>
              <div className={styles.avatarRow}>
                {pack.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={[
                      styles.avatarOption,
                      activeProfile?.avatarUrl === emoji ? styles.avatarSelected : '',
                    ].join(' ')}
                    onClick={() => chooseAvatar(emoji)}
                    disabled={savingAvatar}
                    aria-pressed={activeProfile?.avatarUrl === emoji}
                    aria-label={`Escolher ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Texto */}
        <h2 className="section-label">Texto</h2>
        <div className="card">
          <p className={styles.fieldLabel}>Tamanho</p>
          <div className={styles.chipRow}>
            {TEXT_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                className={['chip', settings.textScale === size.value ? 'chip-active' : ''].join(' ')}
                onClick={() => update({ textScale: size.value })}
                aria-pressed={settings.textScale === size.value}
              >
                {size.label}
              </button>
            ))}
          </div>

          <div className={styles.divider} />

          <p className={styles.fieldLabel}>Fonte dos títulos</p>
          <div className={styles.chipRow}>
            {FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                className={['chip', settings.displayFont === font.id ? 'chip-active' : ''].join(' ')}
                onClick={() => update({ displayFont: font.id })}
                aria-pressed={settings.displayFont === font.id}
                title={font.hint}
              >
                <Icon name="text" size="var(--icon-sm)" />
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cantos */}
        <h2 className="section-label">Cantos</h2>
        <div className={['card', styles.chipRow].join(' ')}>
          {CORNERS.map((corner) => (
            <button
              key={corner.id}
              type="button"
              className={['chip', settings.corners === corner.id ? 'chip-active' : ''].join(' ')}
              onClick={() => update({ corners: corner.id })}
              aria-pressed={settings.corners === corner.id}
            >
              <Icon name="brush" size="var(--icon-sm)" />
              {corner.label}
            </button>
          ))}
        </div>

        <PressBounce className={['btn', 'btn-outline', 'btn-block', styles.reset].join(' ')} onClick={reset}>
          <Icon name="refresh" size="var(--icon-md)" />
          Voltar ao padrão
        </PressBounce>
      </div>
    </>
  );
}
