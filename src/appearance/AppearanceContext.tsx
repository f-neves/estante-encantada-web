import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useChild } from '../profiles/ChildContext';
import {
  getAppearanceMap,
  setAppearanceFor,
  clearAppearanceFor,
  type AppearanceSettings,
} from '../session';

export type { AppearanceSettings };

export const PALETTES = [
  { id: 'roxo', label: 'Roxo Mágico', color: '#7c5cfc' },
  { id: 'coral', label: 'Coral', color: '#ff7a4d' },
  { id: 'menta', label: 'Menta', color: '#16b493' },
  { id: 'ceu', label: 'Céu', color: '#3d8ee8' },
  { id: 'rosa', label: 'Rosa', color: '#f0559a' },
  { id: 'sol', label: 'Sol', color: '#e8a51c' },
] as const;

export const BACKGROUNDS = [
  { id: 'liso', label: 'Liso' },
  { id: 'gradiente', label: 'Gradiente' },
  { id: 'estrelas', label: 'Estrelinhas' },
  { id: 'nuvens', label: 'Nuvens' },
] as const;

export const DEFAULTS: AppearanceSettings = {
  palette: 'roxo',
  scheme: 'auto',
  background: 'liso',
  textScale: 1,
  displayFont: 'fredoka',
  corners: 'round',
};

interface AppearanceValue {
  settings: AppearanceSettings;
  /** Esquema realmente aplicado depois de resolver o "automático". */
  resolvedScheme: 'light' | 'dark';
  update: (patch: Partial<AppearanceSettings>) => void;
  reset: () => void;
  /** Aplica um conjunto sem salvar, para pré-visualizar. Passe null para sair. */
  preview: (settings: AppearanceSettings | null) => void;
}

const AppearanceContext = createContext<AppearanceValue | undefined>(undefined);

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// A personalização é por personagem: trocar de perfil muda a cara do site.
// Sem perfil ativo (primeiros instantes), vale a chave 'default'.
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useChild();
  const key = activeProfile?.id ?? 'default';

  const [stored, setStored] = useState<Partial<AppearanceSettings>>(() => getAppearanceMap()[key] ?? {});
  const [previewed, setPreviewed] = useState<AppearanceSettings | null>(null);
  const [systemDark, setSystemDark] = useState(() => systemPrefersDark());

  useEffect(() => {
    setStored(getAppearanceMap()[key] ?? {});
    setPreviewed(null);
  }, [key]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  const settings = useMemo<AppearanceSettings>(
    () => previewed ?? { ...DEFAULTS, ...stored },
    [previewed, stored],
  );

  const resolvedScheme: 'light' | 'dark' =
    settings.scheme === 'auto' ? (systemDark ? 'dark' : 'light') : settings.scheme;

  // Escreve tudo em atributos e variáveis do elemento raiz; o CSS faz o resto.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset['palette'] = settings.palette;
    root.dataset['scheme'] = resolvedScheme;
    root.dataset['background'] = settings.background;
    root.dataset['displayFont'] = settings.displayFont;
    root.style.setProperty('--text-scale', String(settings.textScale));
    root.style.setProperty('--corner-factor', settings.corners === 'square' ? '0.34' : '1');
    // Cor do ladrilho do avatar (Home, Configurações e lateral do desktop).
    root.style.setProperty('--tile-color', settings.tileColor ?? 'var(--c-primary)');

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute(
        'content',
        getComputedStyle(root).getPropertyValue('--c-primary').trim() || '#7C5CFC',
      );
    }
  }, [settings, resolvedScheme]);

  const update = useCallback(
    (patch: Partial<AppearanceSettings>) => {
      setPreviewed(null);
      setStored((prev) => {
        const next = { ...prev, ...patch };
        setAppearanceFor(key, next);
        return next;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    setPreviewed(null);
    clearAppearanceFor(key);
    setStored({});
  }, [key]);

  return (
    <AppearanceContext.Provider
      value={{ settings, resolvedScheme, update, reset, preview: setPreviewed }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error('useAppearance deve ser usado dentro de AppearanceProvider');
  }
  return ctx;
}
