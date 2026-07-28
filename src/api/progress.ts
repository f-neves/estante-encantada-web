import { apiRequest } from './client';
import { OFFLINE } from '../config';
import * as offline from '../offline';
import { ReadingProgress, ProgressWithBook, Reward } from '../types';

export interface ProgressInput {
  lastChapterIndex: number;
  positionPercent?: number;
  completed?: boolean;
}

export async function listProgress(childId: string): Promise<ProgressWithBook[]> {
  if (OFFLINE) {
    return offline.listProgress(childId);
  }
  const { progress } = await apiRequest<{ progress: ProgressWithBook[] }>(
    `/children/${childId}/progress`,
  );
  return progress;
}

export async function getProgress(childId: string, bookId: string): Promise<ReadingProgress> {
  if (OFFLINE) {
    return offline.getProgress(childId, bookId);
  }
  const { progress } = await apiRequest<{ progress: ReadingProgress }>(
    `/children/${childId}/progress/${bookId}`,
  );
  return progress;
}

export async function saveProgress(
  childId: string,
  bookId: string,
  input: ProgressInput,
): Promise<{ progress: ReadingProgress; reward: Reward | null }> {
  if (OFFLINE) {
    return offline.saveProgress(childId, bookId, input);
  }
  return apiRequest<{ progress: ReadingProgress; reward: Reward | null }>(
    `/children/${childId}/progress/${bookId}`,
    { method: 'PUT', body: input },
  );
}
