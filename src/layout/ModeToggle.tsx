import Icon from '../components/Icon';
import { useLayoutMode } from './LayoutModeContext';
import styles from './ModeToggle.module.css';

interface Props {
  /** `pill` flutua sobre o conteúdo; `row` entra numa lista de ajustes. */
  variant?: 'pill' | 'row';
}

// O botão que troca entre a versão App (igual ao aplicativo) e a versão Web
// (adaptada ao mouse e à tela grande).
export default function ModeToggle({ variant = 'pill' }: Props) {
  const { mode, toggle } = useLayoutMode();
  const goingToWeb = mode === 'app';
  const label = goingToWeb ? 'Versão desktop' : 'Versão app';
  const hint = goingToWeb
    ? 'Layout maior, feito para mouse e telas largas.'
    : 'Layout igual ao aplicativo de celular.';

  if (variant === 'row') {
    return (
      <button type="button" className={styles.row} onClick={toggle}>
        <span className={styles.rowIcon}>
          <Icon name={goingToWeb ? 'desktop' : 'phone'} size="var(--icon-md)" color="var(--c-primary)" />
        </span>
        <span className={styles.rowText}>
          <span className={styles.rowLabel}>Mudar para a {label.toLowerCase()}</span>
          <span className={styles.rowHint}>{hint}</span>
        </span>
        <Icon name="swap-horizontal" size="var(--icon-md)" color="var(--c-text-soft)" />
      </button>
    );
  }

  return (
    <button type="button" className={styles.pill} onClick={toggle} title={hint}>
      <Icon name={goingToWeb ? 'desktop' : 'phone'} size="var(--icon-sm)" />
      {label}
    </button>
  );
}
