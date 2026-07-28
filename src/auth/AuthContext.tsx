import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as api from '../api';
import { OFFLINE } from '../config';
import { setDevEmail } from '../session';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Erro da identificação automática (só acontece no modo online). */
  error: string | null;
  /** Edita nome, e-mail e ícone da identidade (tela de Configurações). */
  updateUser: (patch: Partial<User>) => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Não há tela de login: a identidade é resolvida sozinha ao abrir o site.
// No modo local vem do navegador; no modo online, da rota /auth/dev com o
// e-mail guardado nas Configurações.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.auth
      .signInAutomatically()
      .then((me) => {
        if (active) {
          setUser(me);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Não foi possível entrar');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const updateUser = useCallback(async (patch: Partial<User>) => {
    const next = await api.auth.updateMe(patch);
    setUser(next);
    // No modo online o e-mail é a chave da identidade: guardá-lo faz a próxima
    // visita reabrir a mesma conta.
    if (!OFFLINE && patch.email) {
      await setDevEmail(patch.email);
    }
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, updateUser, retry }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
