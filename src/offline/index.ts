// Implementações locais da API: mesma assinatura dos módulos em `src/api`,
// lendo do catálogo embutido (db.ts) e gravando no navegador (store.ts).
// Reproduzem as regras do backend: recompensa por livro, marcos 3/5/10 e streak.
// Espelha `mobile/src/offline/index.ts`.

import { ApiError } from '../api/client';
import type { ChildInput } from '../api/children';
import type { ProgressInput } from '../api/progress';
import {
  AuthResult,
  BookListItem,
  BookDetail,
  ChildProfile,
  FavoriteBook,
  ProgressWithBook,
  ReadingProgress,
  Reward,
  User,
} from '../types';
import { allBooks, findBook, toListItem } from './db';
import * as store from './store';
import { genId } from './store';

// --- Identidade local ----------------------------------------------------
export async function getMe(): Promise<User> {
  return store.getUser();
}

export async function updateMe(patch: Partial<User>): Promise<User> {
  return store.setUser(patch);
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const user = await store.setUser({ email: input.email });
  return { token: 'local', user };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const user = await store.setUser({ name: input.name, email: input.email });
  return { token: 'local', user };
}

export async function devLogin(email?: string, name?: string): Promise<AuthResult> {
  const user = await store.setUser({
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
  });
  return { token: 'local', user };
}

export async function logout(): Promise<void> {
  // Não há sessão de servidor no modo local; nada a limpar.
}

// --- Livros --------------------------------------------------------------
export interface BookFilters {
  age?: number;
  premium?: boolean;
}

export async function listBooks(filters: BookFilters = {}): Promise<BookListItem[]> {
  return allBooks()
    .filter((b) => {
      if (filters.age !== undefined && !(b.ageMin <= filters.age && b.ageMax >= filters.age)) {
        return false;
      }
      if (filters.premium !== undefined && b.isPremium !== filters.premium) {
        return false;
      }
      return true;
    })
    .map(toListItem);
}

export async function getBook(id: string): Promise<BookDetail> {
  const book = findBook(id);
  if (!book) {
    throw new ApiError(404, 'Livro não encontrado');
  }
  return book;
}

// --- Perfis --------------------------------------------------------------
export async function listChildren(): Promise<ChildProfile[]> {
  return store.getProfiles();
}

export async function getChild(id: string): Promise<ChildProfile> {
  const child = (await store.getProfiles()).find((p) => p.id === id);
  if (!child) {
    throw new ApiError(404, 'Perfil não encontrado');
  }
  return child;
}

export async function createChild(input: ChildInput): Promise<ChildProfile> {
  const user = await store.getUser();
  const profiles = await store.getProfiles();
  const child: ChildProfile = {
    id: genId(),
    userId: user.id,
    name: input.name,
    avatarUrl: input.avatarUrl ?? null,
    birthYear: input.birthYear,
    createdAt: new Date().toISOString(),
  };
  await store.setProfiles([...profiles, child]);
  return child;
}

export async function updateChild(id: string, input: Partial<ChildInput>): Promise<ChildProfile> {
  const profiles = await store.getProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  const current = profiles[idx];
  if (idx < 0 || !current) {
    throw new ApiError(404, 'Perfil não encontrado');
  }
  const updated: ChildProfile = {
    ...current,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.birthYear !== undefined ? { birthYear: input.birthYear } : {}),
    ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
  };
  profiles[idx] = updated;
  await store.setProfiles(profiles);
  return updated;
}

export async function deleteChild(id: string): Promise<void> {
  await store.setProfiles((await store.getProfiles()).filter((p) => p.id !== id));
  // Equivale ao onDelete: Cascade do banco.
  await store.setProgress((await store.getProgress()).filter((r) => r.childProfileId !== id));
  await store.setRewards((await store.getRewards()).filter((r) => r.childProfileId !== id));
  await store.setDays((await store.getDays()).filter((r) => r.childProfileId !== id));
  await store.setFavorites((await store.getFavorites()).filter((r) => r.childProfileId !== id));
}

// --- Progresso, recompensas e streak (regras espelhadas do backend) ------
const REWARD_BOOK_COMPLETED = 'BOOK_COMPLETED';
const REWARD_MILESTONE = 'MILESTONE';
const MILESTONES: { count: number; label: string }[] = [
  { count: 3, label: 'Leu 3 livros! 🥉' },
  { count: 5, label: 'Leu 5 livros! 🥈' },
  { count: 10, label: 'Leu 10 livros! 🥇' },
];

function dayString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function recordReadingDay(childId: string): Promise<void> {
  const today = dayString(new Date());
  const days = await store.getDays();
  if (!days.some((r) => r.childProfileId === childId && r.date === today)) {
    await store.setDays([...days, { childProfileId: childId, date: today }]);
  }
}

async function grantMilestones(childId: string, completedCount: number): Promise<void> {
  const rewards = await store.getRewards();
  let changed = false;
  for (const milestone of MILESTONES) {
    if (completedCount < milestone.count) {
      continue;
    }
    const exists = rewards.some(
      (r) => r.childProfileId === childId && r.type === REWARD_MILESTONE && r.label === milestone.label,
    );
    if (!exists) {
      rewards.push({
        id: genId(),
        childProfileId: childId,
        type: REWARD_MILESTONE,
        label: milestone.label,
        earnedAt: new Date().toISOString(),
      });
      changed = true;
    }
  }
  if (changed) {
    await store.setRewards(rewards);
  }
}

export async function listProgress(childId: string): Promise<ProgressWithBook[]> {
  const rows = (await store.getProgress())
    .filter((r) => r.childProfileId === childId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return rows.flatMap((r) => {
    const book = findBook(r.bookId);
    if (!book) {
      return [];
    }
    return [{ ...r, book: { id: book.id, title: book.title, coverUrl: book.coverUrl } }];
  });
}

export async function getProgress(childId: string, bookId: string): Promise<ReadingProgress> {
  const row = (await store.getProgress()).find(
    (r) => r.childProfileId === childId && r.bookId === bookId,
  );
  if (!row) {
    throw new ApiError(404, 'Progresso não encontrado');
  }
  return row;
}

export async function saveProgress(
  childId: string,
  bookId: string,
  input: ProgressInput,
): Promise<{ progress: ReadingProgress; reward: Reward | null }> {
  const book = findBook(bookId);
  if (!book) {
    throw new ApiError(404, 'Livro não encontrado');
  }
  if (input.lastChapterIndex >= book.chapters.length) {
    throw new ApiError(400, `lastChapterIndex deve estar entre 0 e ${book.chapters.length - 1}`);
  }

  const rows = await store.getProgress();
  const idx = rows.findIndex((r) => r.childProfileId === childId && r.bookId === bookId);
  const existing = idx >= 0 ? rows[idx] : null;
  const grantReward = input.completed === true && existing?.completedAt == null;

  const position = input.positionPercent ?? 0;
  const now = new Date().toISOString();
  let completedAt: string | null = existing?.completedAt ?? null;
  if (input.completed === true) {
    completedAt = now;
  } else if (input.completed === false) {
    completedAt = null;
  }

  const progress: ReadingProgress = {
    id: existing?.id ?? genId(),
    childProfileId: childId,
    bookId,
    lastChapterIndex: input.lastChapterIndex,
    positionPercent: position,
    completedAt,
    updatedAt: now,
  };
  if (idx >= 0) {
    rows[idx] = progress;
  } else {
    rows.push(progress);
  }
  await store.setProgress(rows);

  await recordReadingDay(childId);

  let reward: Reward | null = null;
  if (grantReward) {
    reward = {
      id: genId(),
      childProfileId: childId,
      type: REWARD_BOOK_COMPLETED,
      label: `Concluiu "${book.title}"`,
      earnedAt: now,
    };
    await store.setRewards([...(await store.getRewards()), reward]);
    const completedCount = rows.filter(
      (r) => r.childProfileId === childId && r.completedAt != null,
    ).length;
    await grantMilestones(childId, completedCount);
  }

  return { progress, reward };
}

export async function listRewards(childId: string): Promise<Reward[]> {
  return (await store.getRewards())
    .filter((r) => r.childProfileId === childId)
    .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
}

export async function getStreak(childId: string): Promise<number> {
  const days = await store.getDays();
  const set = new Set(days.filter((r) => r.childProfileId === childId).map((r) => r.date));

  const cursor = new Date();
  // Se ainda não leu hoje, a sequência pode terminar ontem.
  if (!set.has(dayString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (set.has(dayString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// --- Favoritos -----------------------------------------------------------
export async function listFavorites(childId: string): Promise<FavoriteBook[]> {
  const favs = (await store.getFavorites()).filter((r) => r.childProfileId === childId);
  return favs.flatMap((f) => {
    const book = findBook(f.bookId);
    if (!book) {
      return [];
    }
    return [
      {
        id: book.id,
        title: book.title,
        coverUrl: book.coverUrl,
        ageMin: book.ageMin,
        ageMax: book.ageMax,
        isPremium: book.isPremium,
      },
    ];
  });
}

export async function addFavorite(childId: string, bookId: string): Promise<void> {
  const favs = await store.getFavorites();
  if (!favs.some((r) => r.childProfileId === childId && r.bookId === bookId)) {
    await store.setFavorites([...favs, { childProfileId: childId, bookId }]);
  }
}

export async function removeFavorite(childId: string, bookId: string): Promise<void> {
  await store.setFavorites(
    (await store.getFavorites()).filter(
      (r) => !(r.childProfileId === childId && r.bookId === bookId),
    ),
  );
}
