import { apiRequest } from './client';
import { OFFLINE } from '../config';
import * as offline from '../offline';
import { setToken, clearToken, getDevEmail } from '../session';
import { AuthResult, User } from '../types';

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  if (OFFLINE) {
    return offline.register(input);
  }
  const result = await apiRequest<AuthResult>('/auth/register', {
    method: 'POST',
    body: input,
    auth: false,
  });
  await setToken(result.token);
  return result;
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  if (OFFLINE) {
    return offline.login(input);
  }
  const result = await apiRequest<AuthResult>('/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  });
  await setToken(result.token);
  return result;
}

export async function devLogin(email?: string, name?: string): Promise<AuthResult> {
  if (OFFLINE) {
    return offline.devLogin(email, name);
  }
  const result = await apiRequest<AuthResult>('/auth/dev', {
    method: 'POST',
    body: { email, name },
    auth: false,
  });
  await setToken(result.token);
  return result;
}

export async function getMe(): Promise<User> {
  if (OFFLINE) {
    return offline.getMe();
  }
  const { user } = await apiRequest<{ user: User }>('/auth/me');
  return user;
}

/**
 * Identificação sem tela de login. No modo local só devolve o usuário guardado
 * no navegador; no modo online usa a rota /auth/dev com o e-mail salvo, que
 * cria ou reaproveita a conta correspondente no backend.
 */
export async function signInAutomatically(): Promise<User> {
  if (OFFLINE) {
    return offline.getMe();
  }
  const email = await getDevEmail();
  const result = await devLogin(email);
  return result.user;
}

/** Atualiza nome, e-mail e ícone da identidade local (tela de Configurações). */
export async function updateMe(patch: Partial<User>): Promise<User> {
  return offline.updateMe(patch);
}

export async function logout(): Promise<void> {
  await clearToken();
}
