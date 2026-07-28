import { apiRequest } from './client';
import { OFFLINE } from '../config';
import * as offline from '../offline';
import { FavoriteBook } from '../types';

export async function listFavorites(childId: string): Promise<FavoriteBook[]> {
  if (OFFLINE) {
    return offline.listFavorites(childId);
  }
  const { favorites } = await apiRequest<{ favorites: FavoriteBook[] }>(
    `/children/${childId}/favorites`,
  );
  return favorites;
}

export async function addFavorite(childId: string, bookId: string): Promise<void> {
  if (OFFLINE) {
    return offline.addFavorite(childId, bookId);
  }
  await apiRequest(`/children/${childId}/favorites`, { method: 'POST', body: { bookId } });
}

export async function removeFavorite(childId: string, bookId: string): Promise<void> {
  if (OFFLINE) {
    return offline.removeFavorite(childId, bookId);
  }
  await apiRequest(`/children/${childId}/favorites/${bookId}`, { method: 'DELETE' });
}
