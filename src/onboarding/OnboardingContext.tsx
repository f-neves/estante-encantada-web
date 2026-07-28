import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getOnboardingDone, setOnboardingDone, clearOnboardingDone } from '../session';

interface OnboardingContextValue {
  /** null enquanto lê a preferência guardada. */
  done: boolean | null;
  complete: () => void;
  replay: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    getOnboardingDone().then(setDone);
  }, []);

  function complete() {
    setDone(true);
    setOnboardingDone().catch(() => {});
  }

  function replay() {
    setDone(false);
    clearOnboardingDone().catch(() => {});
  }

  return (
    <OnboardingContext.Provider value={{ done, complete, replay }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding deve ser usado dentro de OnboardingProvider');
  }
  return ctx;
}
