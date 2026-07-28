// Espelha `mobile/src/types.ts`. Manter os dois em sincronia: a API e o
// catálogo offline são exatamente os mesmos do aplicativo.

export type Plan = 'FREE' | 'PREMIUM';
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  role: Role;
  /** Ícone do usuário (emoji). Existe só na web, onde não há login. */
  avatar?: string;
}

export interface AdminStats {
  users: number;
  premium: number;
  admins: number;
  books: number;
  profiles: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  role: Role;
  createdAt: string;
  childrenCount: number;
}

export interface AdminBook {
  id: string;
  title: string;
  isPremium: boolean;
  ageMin: number;
  ageMax: number;
  chapterCount: number;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface VoiceAudio {
  audioUrl: string;
  wordTimings: number[];
}

export interface Chapter {
  id: string;
  bookId: string;
  order: number;
  title: string;
  content: string;
  imageUrl: string | null;
  audioUrl: string | null;
  wordTimings: number[];
  audios: Record<string, VoiceAudio>;
  createdAt: string;
}

export interface BookListItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  ageMin: number;
  ageMax: number;
  isPremium: boolean;
  pdfUrl: string | null;
  createdAt: string;
  chapterCount: number;
}

export interface BookDetail {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  ageMin: number;
  ageMax: number;
  isPremium: boolean;
  pdfUrl: string | null;
  createdAt: string;
  chapters: Chapter[];
}

export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  birthYear: number;
  createdAt: string;
}

export interface ReadingProgress {
  id: string;
  childProfileId: string;
  bookId: string;
  lastChapterIndex: number;
  positionPercent: number;
  completedAt: string | null;
  updatedAt: string;
}

export interface ProgressWithBook extends ReadingProgress {
  book: { id: string; title: string; coverUrl: string };
}

export interface Reward {
  id: string;
  childProfileId: string;
  type: string;
  label: string;
  earnedAt: string;
}

export interface FavoriteBook {
  id: string;
  title: string;
  coverUrl: string;
  ageMin: number;
  ageMax: number;
  isPremium: boolean;
}
