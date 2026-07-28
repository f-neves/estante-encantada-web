import { apiRequest } from './client';
import { OFFLINE } from '../config';
import * as offline from '../offline';
import { BookListItem, BookDetail } from '../types';

export interface BookFilters {
  age?: number;
  premium?: boolean;
}

export const VOICES: { id: string; label: string }[] = [
  { id: 'pt-BR-Neural2-B', label: 'Masculina' },
  { id: 'pt-BR-Neural2-A', label: 'Feminina 1' },
  { id: 'pt-BR-Neural2-C', label: 'Feminina 2' },
];

export async function regenerateAudio(bookId: string, voice: string): Promise<void> {
  // As 3 vozes já vêm gravadas; não há regeneração via TTS no modo local.
  if (OFFLINE) {
    return;
  }
  await apiRequest(`/books/${bookId}/audio`, { method: 'POST', body: { voice } });
}

export async function listBooks(filters: BookFilters = {}): Promise<BookListItem[]> {
  if (OFFLINE) {
    return offline.listBooks(filters);
  }
  const { books } = await apiRequest<{ books: BookListItem[] }>('/books', {
    query: { age: filters.age, premium: filters.premium },
  });
  return books;
}

export async function getBook(id: string): Promise<BookDetail> {
  if (OFFLINE) {
    return offline.getBook(id);
  }
  const { book } = await apiRequest<{ book: BookDetail }>(`/books/${id}`);
  return book;
}
