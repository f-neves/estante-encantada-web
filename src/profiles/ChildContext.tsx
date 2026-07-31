import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as api from '../api';
import { ChildInput } from '../api/children';
import { useAuth } from '../auth/AuthContext';
import { getStoredProfileId, setStoredProfileId, clearStoredProfileId } from '../session';
import { seedDemoContent } from './demoSeed';
import { ChildProfile } from '../types';

const SEEDED_KEY = 'estante_profile_seeded';
const DEFAULT_AGE = 7;

// Personagem criado sozinho na primeira visita, para quem abre o site cair
// direto na Home (não há login nem cadastro). Nome e ícone são editáveis.
function defaultProfileInput(): ChildInput {
  return {
    name: 'Leitor',
    birthYear: new Date().getFullYear() - DEFAULT_AGE,
    avatarUrl: '🧒',
  };
}

interface ChildContextValue {
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  loading: boolean;
  error: string | null;
  /** true enquanto o perfil ainda for o genérico criado automaticamente. */
  isDefaultProfile: boolean;
  refresh: () => Promise<void>;
  selectProfile: (profile: ChildProfile | null) => void;
  addProfile: (input: ChildInput) => Promise<ChildProfile>;
  updateProfile: (id: string, input: Partial<ChildInput>) => Promise<ChildProfile>;
  removeProfile: (id: string) => Promise<void>;
}

const ChildContext = createContext<ChildContextValue | undefined>(undefined);

export function ChildProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectProfile = useCallback((profile: ChildProfile | null) => {
    setActiveProfile(profile);
    if (profile) {
      setStoredProfileId(profile.id).catch(() => {});
    } else {
      clearStoredProfileId().catch(() => {});
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let list = await api.children.listChildren();

      // Primeira visita: cria o personagem genérico e já o deixa ativo.
      // Só uma vez: se depois o usuário apagar todos, ele escolhe o que fazer.
      const seeded = window.localStorage.getItem(SEEDED_KEY) === '1';
      if (list.length === 0 && !seeded) {
        const created = await api.children.createChild(defaultProfileInput());
        window.localStorage.setItem(SEEDED_KEY, '1');
        list = [created];
        selectProfile(created);
      }

      // Estante de demonstração na primeira visita. Antes de publicar os
      // perfis, para que Favoritos e Recompensas já apareçam preenchidos na
      // primeira renderização, sem piscar vazios.
      const unico = list.length === 1 ? list[0] : undefined;
      if (unico) {
        await seedDemoContent(unico.id);
      }

      setProfiles(list);

      const storedId = await getStoredProfileId();
      const stored = storedId ? list.find((p) => p.id === storedId) : undefined;
      if (stored) {
        setActiveProfile((prev) => prev ?? stored);
      } else if (list.length === 1) {
        // Um único personagem: entra direto, sem pedir escolha.
        const only = list[0] as ChildProfile;
        setActiveProfile((prev) => prev ?? only);
        setStoredProfileId(only.id).catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  }, [selectProfile]);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setProfiles([]);
      setActiveProfile(null);
    }
  }, [user, refresh]);

  const addProfile = useCallback(async (input: ChildInput) => {
    const created = await api.children.createChild(input);
    setProfiles((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProfile = useCallback(async (id: string, input: Partial<ChildInput>) => {
    const updated = await api.children.updateChild(id, input);
    setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setActiveProfile((prev) => (prev?.id === id ? updated : prev));
    return updated;
  }, []);

  const removeProfile = useCallback(async (id: string) => {
    await api.children.deleteChild(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setActiveProfile((prev) => {
      if (prev?.id === id) {
        clearStoredProfileId().catch(() => {});
        return null;
      }
      return prev;
    });
  }, []);

  const isDefaultProfile =
    activeProfile !== null &&
    activeProfile.name === 'Leitor' &&
    profiles.length === 1 &&
    activeProfile.birthYear === new Date().getFullYear() - DEFAULT_AGE;

  return (
    <ChildContext.Provider
      value={{
        profiles,
        activeProfile,
        loading,
        error,
        isDefaultProfile,
        refresh,
        selectProfile,
        addProfile,
        updateProfile,
        removeProfile,
      }}
    >
      {children}
    </ChildContext.Provider>
  );
}

export function useChild(): ChildContextValue {
  const ctx = useContext(ChildContext);
  if (!ctx) {
    throw new Error('useChild deve ser usado dentro de ChildProvider');
  }
  return ctx;
}
