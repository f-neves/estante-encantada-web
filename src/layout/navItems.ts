import type { IconName } from '../components/Icon';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** Só aparece para contas ADMIN (modo online). */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', icon: 'home' },
  { to: '/favoritos', label: 'Favoritos', icon: 'star' },
  { to: '/recompensas', label: 'Recompensas', icon: 'trophy' },
  { to: '/personalizar', label: 'Personalizar', icon: 'color-palette' },
  { to: '/configuracoes', label: 'Configurações', icon: 'settings' },
  { to: '/admin', label: 'Administração', icon: 'construct', adminOnly: true },
];
