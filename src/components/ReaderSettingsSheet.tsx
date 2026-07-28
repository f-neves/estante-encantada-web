import Modal from './Modal';
import Icon from './Icon';
import Switch from './Switch';
import styles from './ReaderSettingsSheet.module.css';

export type ReaderThemeName = 'light' | 'sepia' | 'dark';

const TEMAS: { id: ReaderThemeName; label: string; bg: string; fg: string }[] = [
  { id: 'light', label: 'Claro', bg: '#ffffff', fg: '#333333' },
  { id: 'sepia', label: 'Sépia', bg: '#f4ecd8', fg: '#5b4636' },
  { id: 'dark', label: 'Escuro', bg: '#1c1c24', fg: '#e4e4ea' },
];

const VELOCIDADES = [
  { valor: 1, label: 'Normal' },
  { valor: 1.5, label: 'Rápida' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  fontScale: number;
  onChangeFont: (delta: number) => void;
  theme: ReaderThemeName;
  onChangeTheme: (theme: ReaderThemeName) => void;
  voice: string;
  voices: { id: string; label: string }[];
  onChangeVoice: (voice: string) => void;
  rate: number;
  onChangeRate: (rate: number) => void;
  continuous: boolean;
  onToggleContinuous: (value: boolean) => void;
  listen: boolean;
  onToggleListen: (value: boolean) => void;
  hasAudio: boolean;
}

// Tudo que é ajuste saiu da tela de leitura e vive aqui, em linhas largas e
// alvos grandes. A tela de ler fica com o texto e o botão de ouvir.
export default function ReaderSettingsSheet({
  visible,
  onClose,
  fontScale,
  onChangeFont,
  theme,
  onChangeTheme,
  voice,
  voices,
  onChangeVoice,
  rate,
  onChangeRate,
  continuous,
  onToggleContinuous,
  listen,
  onToggleListen,
  hasAudio,
}: Props) {
  return (
    <Modal visible={visible} onClose={onClose} variant="sheet" label="Ajustes da leitura">
      <div className={styles.sheet}>
        <div className={styles.handle} aria-hidden="true" />
        <h2 className={['display', styles.title].join(' ')}>Ajustes da leitura</h2>

        {hasAudio ? (
          <section className={styles.bloco}>
            <Switch
              checked={listen}
              onChange={onToggleListen}
              label="Modo Ouvir"
              hint="Uma frase por vez, em letra grande, para quem ainda não lê."
            />
          </section>
        ) : null}

        <section className={styles.bloco}>
          <p className={styles.rotulo}>Tamanho da letra</p>
          <div className={styles.fonteRow}>
            <button
              type="button"
              className={styles.fonteBtn}
              onClick={() => onChangeFont(-0.15)}
              aria-label="Diminuir a letra"
            >
              A
            </button>
            <span className={styles.fonteValor}>{Math.round(fontScale * 100)}%</span>
            <button
              type="button"
              className={[styles.fonteBtn, styles.fonteBtnGrande].join(' ')}
              onClick={() => onChangeFont(0.15)}
              aria-label="Aumentar a letra"
            >
              A
            </button>
          </div>
        </section>

        <section className={styles.bloco}>
          <p className={styles.rotulo}>Cor da página</p>
          <div className={styles.opcoes}>
            {TEMAS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={[styles.tema, theme === t.id ? styles.ativo : ''].join(' ')}
                style={{ background: t.bg, color: t.fg }}
                onClick={() => onChangeTheme(t.id)}
                aria-pressed={theme === t.id}
              >
                <span className={styles.temaAa}>Aa</span>
                <span className={styles.temaLabel}>{t.label}</span>
                {theme === t.id ? (
                  <span className={styles.check}>
                    <Icon name="checkmark" size="var(--icon-sm)" color="var(--c-white)" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        {hasAudio ? (
          <>
            <section className={styles.bloco}>
              <p className={styles.rotulo}>Quem conta a história</p>
              <div className={styles.opcoes}>
                {voices.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={[styles.chipao, voice === v.id ? styles.chipaoAtivo : ''].join(' ')}
                    onClick={() => onChangeVoice(v.id)}
                    aria-pressed={voice === v.id}
                  >
                    <Icon
                      name="mic"
                      size="var(--icon-md)"
                      color={voice === v.id ? 'var(--c-white)' : 'var(--c-primary)'}
                    />
                    {v.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.bloco}>
              <p className={styles.rotulo}>Velocidade da voz</p>
              <div className={styles.opcoes}>
                {VELOCIDADES.map((v) => (
                  <button
                    key={v.valor}
                    type="button"
                    className={[styles.chipao, rate === v.valor ? styles.chipaoAtivo : ''].join(' ')}
                    onClick={() => onChangeRate(v.valor)}
                    aria-pressed={rate === v.valor}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.bloco}>
              <Switch
                checked={continuous}
                onChange={onToggleContinuous}
                label="Continuar sozinho"
                hint="Ao acabar o capítulo, começa o próximo."
              />
            </section>
          </>
        ) : null}

        <button type="button" className={['btn', 'btn-primary', 'btn-block'].join(' ')} onClick={onClose}>
          Pronto
        </button>
      </div>
    </Modal>
  );
}
