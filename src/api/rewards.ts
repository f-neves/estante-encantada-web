import { apiRequest } from './client';
import { OFFLINE } from '../config';
import * as offline from '../offline';
import { Reward } from '../types';

export async function listRewards(childId: string): Promise<Reward[]> {
  if (OFFLINE) {
    return offline.listRewards(childId);
  }
  const { rewards } = await apiRequest<{ rewards: Reward[] }>(`/children/${childId}/rewards`);
  return rewards;
}
