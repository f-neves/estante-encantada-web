import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useLayoutMode } from './LayoutModeContext';
import styles from './ScreenHeader.module.css';

interface Props {
  title: string;
  /** Mostra o botão voltar. Passe uma rota para forçar o destino. */
  back?: boolean | string;
  actions?: ReactNode;
  /** Texto de apoio, exibido só na versão desktop. */
  subtitle?: string;
}

// Faz o papel do cabeçalho do stack nativo. Na versão App é uma barra fina
// grudada no topo; na versão desktop vira o título da página.
export default function ScreenHeader({ title, back, actions, subtitle }: Props) {
  const navigate = useNavigate();
  const { mode } = useLayoutMode();

  function goBack() {
    if (typeof back === 'string') {
      navigate(back);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  return (
    <header className={mode === 'app' ? styles.appBar : styles.pageHead}>
      {back ? (
        <button type="button" className={styles.back} onClick={goBack} aria-label="Voltar">
          <Icon name="chevron-back" size="var(--icon-md)" color="var(--c-primary)" />
          {mode === 'web' ? <span className={styles.backText}>Voltar</span> : null}
        </button>
      ) : null}
      <div className={styles.titleWrap}>
        <h1 className={['display', styles.title].join(' ')}>{title}</h1>
        {subtitle && mode === 'web' ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
