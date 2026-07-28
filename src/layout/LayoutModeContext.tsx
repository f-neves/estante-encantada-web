import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getStoredLayoutMode, setStoredLayoutMode, type LayoutMode } from '../session';

// Largura a partir da qual o modo Web faz sentido por padrão (tablet deitado
// para cima). Abaixo disso, a versão App é a experiência natural.
const WEB_BREAKPOINT = 900;

interface LayoutModeValue {
  mode: LayoutMode;
  /** true enquanto ninguém escolheu: o modo acompanha a largura da janela. */
  automatic: boolean;
  setMode: (mode: LayoutMode) => void;
  toggle: () => void;
  /** Volta a decidir pelo tamanho da tela. */
  reset: () => void;
}

const LayoutModeContext = createContext<LayoutModeValue | undefined>(undefined);

function detect(): LayoutMode {
  return window.innerWidth >= WEB_BREAKPOINT ? 'web' : 'app';
}

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<LayoutMode | null>(() => getStoredLayoutMode());
  const [detected, setDetected] = useState<LayoutMode>(() => detect());

  // Sem escolha explícita, o modo segue o redimensionamento da janela.
  useEffect(() => {
    if (stored !== null) {
      return;
    }
    function onResize() {
      setDetected(detect());
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [stored]);

  const mode = stored ?? detected;

  useEffect(() => {
    document.documentElement.dataset['mode'] = mode;
  }, [mode]);

  const value = useMemo<LayoutModeValue>(
    () => ({
      mode,
      automatic: stored === null,
      setMode: (next) => {
        setStored(next);
        setStoredLayoutMode(next);
      },
      toggle: () => {
        const next: LayoutMode = mode === 'app' ? 'web' : 'app';
        setStored(next);
        setStoredLayoutMode(next);
      },
      reset: () => {
        setStored(null);
        setDetected(detect());
        try {
          window.localStorage.removeItem('estante_layout_mode');
        } catch {
          // sem persistência: segue só nesta sessão
        }
      },
    }),
    [mode, stored],
  );

  return <LayoutModeContext.Provider value={value}>{children}</LayoutModeContext.Provider>;
}

export function useLayoutMode(): LayoutModeValue {
  const ctx = useContext(LayoutModeContext);
  if (!ctx) {
    throw new Error('useLayoutMode deve ser usado dentro de LayoutModeProvider');
  }
  return ctx;
}
