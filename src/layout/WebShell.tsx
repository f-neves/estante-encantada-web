import { NavLink, Outlet } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../profiles/ChildContext';
import { NAV_ITEMS } from './navItems';
import ModeToggle from './ModeToggle';
import styles from './WebShell.module.css';

// Versão desktop: navegação sempre visível na lateral, conteúdo largo e
// estados de mouse/teclado explícitos. Em telas estreitas a lateral vira uma
// barra de ícones no rodapé.
export default function WebShell() {
  const { user } = useAuth();
  const { activeProfile } = useChild();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <Icon name="book" size="var(--icon-md)" color="var(--c-white)" />
          </span>
          <span className={['display', styles.brandText].join(' ')}>Estante Encantada</span>
        </div>

        <NavLink to="/perfis" className={() => styles.profileCard ?? ''}>
          <span className={styles.profileAvatar}>{activeProfile?.avatarUrl || '🧒'}</span>
          <span className={styles.profileInfo}>
            <span className={styles.profileName}>{activeProfile?.name ?? 'Escolher personagem'}</span>
            <span className={styles.profileHint}>Trocar de personagem</span>
          </span>
          <Icon name="swap-horizontal" size="var(--icon-sm)" color="var(--c-text-soft)" />
        </NavLink>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => [styles.navItem, isActive ? styles.navActive : ''].join(' ')}
            >
              <Icon name={item.icon} size="var(--icon-md)" />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <ModeToggle />
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
