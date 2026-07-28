// Persistência local do estado no modo sem backend. Espelha
// `mobile/src/offline/store.ts`, trocando AsyncStorage por localStorage.
// Cada "tabela" é uma chave JSON.

import { ChildProfile, ReadingProgress, Reward, User } from '../types';

const KEYS = {
  user: 'offline_user',
  profiles: 'offline_profiles',
  progress: 'offline_progress',
  rewards: 'offline_rewards',
  days: 'offline_days',
  favorites: 'offline_favorites',
} as const;

export interface ReadingDayRow {
  childProfileId: string;
  date: string;
}

export interface FavoriteRow {
  childProfileId: string;
  bookId: string;
}

let counter = 0;
export function genId(): string {
  counter += 1;
  return `local-${Date.now().toString(36)}-${counter}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function save<T>(key: string, value: T): Promise<void> {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem espaço ou modo privado: o app segue com o estado em memória.
  }
}

// --- Usuário local -------------------------------------------------------
// Não há contas: um único usuário local com plano PREMIUM (tudo desbloqueado)
// e papel USER. Nome, e-mail e ícone são editáveis nas Configurações.
const DEFAULT_USER: User = {
  id: 'local-user',
  email: '',
  name: 'Leitor',
  plan: 'PREMIUM',
  role: 'USER',
  avatar: '🧒',
};

export async function getUser(): Promise<User> {
  return { ...DEFAULT_USER, ...(await load<Partial<User>>(KEYS.user, {})) };
}

export async function setUser(patch: Partial<User>): Promise<User> {
  const next = { ...(await getUser()), ...patch };
  await save(KEYS.user, next);
  return next;
}

// --- Perfis de criança ---------------------------------------------------
export async function getProfiles(): Promise<ChildProfile[]> {
  return load<ChildProfile[]>(KEYS.profiles, []);
}

export async function setProfiles(profiles: ChildProfile[]): Promise<void> {
  await save(KEYS.profiles, profiles);
}

// --- Progresso de leitura ------------------------------------------------
export async function getProgress(): Promise<ReadingProgress[]> {
  return load<ReadingProgress[]>(KEYS.progress, []);
}

export async function setProgress(rows: ReadingProgress[]): Promise<void> {
  await save(KEYS.progress, rows);
}

// --- Recompensas ---------------------------------------------------------
export async function getRewards(): Promise<Reward[]> {
  return load<Reward[]>(KEYS.rewards, []);
}

export async function setRewards(rows: Reward[]): Promise<void> {
  await save(KEYS.rewards, rows);
}

// --- Dias de leitura (streak) --------------------------------------------
export async function getDays(): Promise<ReadingDayRow[]> {
  return load<ReadingDayRow[]>(KEYS.days, []);
}

export async function setDays(rows: ReadingDayRow[]): Promise<void> {
  await save(KEYS.days, rows);
}

// --- Favoritos -----------------------------------------------------------
export async function getFavorites(): Promise<FavoriteRow[]> {
  return load<FavoriteRow[]>(KEYS.favorites, []);
}

export async function setFavorites(rows: FavoriteRow[]): Promise<void> {
  await save(KEYS.favorites, rows);
}
