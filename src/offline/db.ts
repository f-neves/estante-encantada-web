import booksData from '../data/books.json';
import { BookDetail, BookListItem } from '../types';

// Catálogo embutido, gerado por `npm run sync:assets` a partir do
// `books.json` do app mobile (que por sua vez sai de `npm run export:offline`).
const BOOKS = booksData as unknown as BookDetail[];

export function allBooks(): BookDetail[] {
  return BOOKS;
}

export function findBook(id: string): BookDetail | undefined {
  return BOOKS.find((b) => b.id === id);
}

// Converte um BookDetail no formato de lista (sem capítulos, com contagem).
export function toListItem(book: BookDetail): BookListItem {
  return {
    id: book.id,
    title: book.title,
    description: book.description,
    coverUrl: book.coverUrl,
    ageMin: book.ageMin,
    ageMax: book.ageMax,
    isPremium: book.isPremium,
    pdfUrl: book.pdfUrl,
    createdAt: book.createdAt,
    chapterCount: book.chapters.length,
  };
}
