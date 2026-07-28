import { apiRequest } from './client';
import { OFFLINE } from '../config';
import * as offline from '../offline';

export async function getStreak(childId: string): Promise<number> {
  if (OFFLINE) {
    return offline.getStreak(childId);
  }
  const { streak } = await apiRequest<{ streak: number }>(`/children/${childId}/streak`);
  return streak;
}
