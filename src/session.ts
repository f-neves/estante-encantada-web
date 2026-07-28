// Estado persistido no navegador. Espelha `mobile/src/session.ts`, trocando o
// SecureStore por localStorage. As funções continuam assíncronas para que as
// telas portadas do app não precisem mudar.
//
// Diferença consciente: a web não guarda senhas (não há login). O que sobra é
// preferência e identidade local, nada sigiloso, com uma exceção anotada no
// PIN parental (ver comentário lá embaixo).

import { DEV_EMAIL } from './config';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Modo privado de alguns navegadores bloqueia o localStorage.
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sem persistência: o app segue funcionando só na memória da sessão.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // idem
  }
}

function readJson<T>(key: string): T | null {
  const raw = read(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// --- Token (só usado no modo online) -------------------------------------
const TOKEN_KEY = 'estante_auth_token';

export async function getToken(): Promise<string | null> {
  return read(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  write(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  remove(TOKEN_KEY);
}

// --- E-mail da identificação automática (modo online, rota /auth/dev) -----
const DEV_EMAIL_KEY = 'estante_dev_email';

export async function getDevEmail(): Promise<string> {
  return read(DEV_EMAIL_KEY) ?? DEV_EMAIL;
}

export async function setDevEmail(email: string): Promise<void> {
  write(DEV_EMAIL_KEY, email);
}

// --- Perfil ativo ---------------------------------------------------------
const PROFILE_KEY = 'estante_active_profile';

export async function getStoredProfileId(): Promise<string | null> {
  return read(PROFILE_KEY);
}

export async function setStoredProfileId(id: string): Promise<void> {
  write(PROFILE_KEY, id);
}

export async function clearStoredProfileId(): Promise<void> {
  remove(PROFILE_KEY);
}

// --- PIN de controle parental --------------------------------------------
// Guardado em texto no navegador. É uma barreira contra a criança (mesmo papel
// que no app), não contra um adulto com acesso ao computador. Documentado no
// README para não virar falsa sensação de segurança.
const PARENTAL_PIN_KEY = 'estante_parental_pin';

export async function getParentalPin(): Promise<string | null> {
  return read(PARENTAL_PIN_KEY);
}

export async function setParentalPin(pin: string): Promise<void> {
  write(PARENTAL_PIN_KEY, pin);
}

export async function clearParentalPin(): Promise<void> {
  remove(PARENTAL_PIN_KEY);
}

// --- Onboarding -----------------------------------------------------------
const ONBOARDING_KEY = 'estante_onboarding_done';

export async function getOnboardingDone(): Promise<boolean> {
  return read(ONBOARDING_KEY) === '1';
}

export async function setOnboardingDone(): Promise<void> {
  write(ONBOARDING_KEY, '1');
}

export async function clearOnboardingDone(): Promise<void> {
  remove(ONBOARDING_KEY);
}

// --- Ajustes do leitor ----------------------------------------------------
const READER_KEY = 'estante_reader_settings';

export interface ReaderSettings {
  fontScale: number;
  theme: 'light' | 'sepia' | 'dark';
  voice?: string;
  /** Ao terminar o áudio, avança para o próximo capítulo. Padrão: ligado. */
  continuous?: boolean;
  /** O painel de narração já começa aberto no livro. Padrão: fechado. */
  narrationOpen?: boolean;
}

export async function getReaderSettings(): Promise<ReaderSettings | null> {
  return readJson<ReaderSettings>(READER_KEY);
}

export async function setReaderSettings(settings: ReaderSettings): Promise<void> {
  write(READER_KEY, JSON.stringify(settings));
}

// --- Modo de layout (App x Web) ------------------------------------------
const LAYOUT_KEY = 'estante_layout_mode';
export type LayoutMode = 'app' | 'web';

/** null = nunca escolhido, então vale a detecção automática por largura. */
export function getStoredLayoutMode(): LayoutMode | null {
  const value = read(LAYOUT_KEY);
  return value === 'app' || value === 'web' ? value : null;
}

export function setStoredLayoutMode(mode: LayoutMode): void {
  write(LAYOUT_KEY, mode);
}

// --- Personalização (por perfil de criança) ------------------------------
const APPEARANCE_KEY = 'estante_appearance';

export interface AppearanceSettings {
  palette: string;
  scheme: 'light' | 'dark' | 'auto';
  background: string;
  textScale: number;
  displayFont: 'fredoka' | 'system';
  corners: 'round' | 'square';
  tileColor?: string;
}

type AppearanceMap = Record<string, Partial<AppearanceSettings>>;

export function getAppearanceMap(): AppearanceMap {
  return readJson<AppearanceMap>(APPEARANCE_KEY) ?? {};
}

export function setAppearanceFor(profileId: string, settings: Partial<AppearanceSettings>): void {
  const map = getAppearanceMap();
  map[profileId] = settings;
  write(APPEARANCE_KEY, JSON.stringify(map));
}

export function clearAppearanceFor(profileId: string): void {
  const map = getAppearanceMap();
  delete map[profileId];
  write(APPEARANCE_KEY, JSON.stringify(map));
}
