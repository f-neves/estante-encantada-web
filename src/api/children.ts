import { apiRequest } from './client';
import { OFFLINE } from '../config';
import * as offline from '../offline';
import { ChildProfile } from '../types';

export interface ChildInput {
  name: string;
  birthYear: number;
  avatarUrl?: string | null;
}

export async function listChildren(): Promise<ChildProfile[]> {
  if (OFFLINE) {
    return offline.listChildren();
  }
  const { children } = await apiRequest<{ children: ChildProfile[] }>('/children');
  return children;
}

export async function getChild(id: string): Promise<ChildProfile> {
  if (OFFLINE) {
    return offline.getChild(id);
  }
  const { child } = await apiRequest<{ child: ChildProfile }>(`/children/${id}`);
  return child;
}

export async function createChild(input: ChildInput): Promise<ChildProfile> {
  if (OFFLINE) {
    return offline.createChild(input);
  }
  const { child } = await apiRequest<{ child: ChildProfile }>('/children', {
    method: 'POST',
    body: input,
  });
  return child;
}

export async function updateChild(id: string, input: Partial<ChildInput>): Promise<ChildProfile> {
  if (OFFLINE) {
    return offline.updateChild(id, input);
  }
  const { child } = await apiRequest<{ child: ChildProfile }>(`/children/${id}`, {
    method: 'PATCH',
    body: input,
  });
  return child;
}

export async function deleteChild(id: string): Promise<void> {
  if (OFFLINE) {
    return offline.deleteChild(id);
  }
  await apiRequest<null>(`/children/${id}`, { method: 'DELETE' });
}
