import { apiRequest } from './client';
import { AdminStats, AdminUser, AdminBook, Plan, Role } from '../types';

// O painel de administração só existe no modo online: no modo local não há
// contas nem catálogo editável. A tela de Configurações esconde o botão.

export async function getStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>('/admin/stats');
}

export async function listUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>('/admin/users');
}

export async function updateUser(
  id: string,
  data: { plan?: Plan; role?: Role },
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: data });
}

export async function listBooks(): Promise<AdminBook[]> {
  return apiRequest<AdminBook[]>('/admin/books');
}

export async function updateBook(id: string, isPremium: boolean): Promise<AdminBook> {
  return apiRequest<AdminBook>(`/admin/books/${id}`, { method: 'PATCH', body: { isPremium } });
}
