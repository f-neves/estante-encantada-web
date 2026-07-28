import { BookDetail, BookListItem } from '../types';

// Catálogo embutido, gerado por `npm run sync:assets` a partir do `books.json`
// do app mobile (que por sua vez sai de `npm run export:offline`).
//
// Carregado sob demanda: são ~480 KB de JSON e, importado direto, ele entraria
// no bundle principal e atrasaria a primeira tela. Assim vira um pedaço à parte,
// buscado quando a estante precisa dele.
let cache: BookDetail[] | null = null;
let pending: Promise<BookDetail[]> | null = null;

export async function allBooks(): Promise<BookDetail[]> {
  if (cache) {
    return cache;
  }
  if (!pending) {
    pending = import('../data/books.json').then((mod) => {
      cache = mod.default as unknown as BookDetail[];
      return cache;
    });
  }
  return pending;
}

export async function findBook(id: string): Promise<BookDetail | undefined> {
  return (await allBooks()).find((b) => b.id === id);
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
