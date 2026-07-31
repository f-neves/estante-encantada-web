// Estante de demonstração.
//
// Quem abre o site pela primeira vez cai numa Home sem histórico: Favoritos e
// Recompensas ficam com a tela de "ainda não há nada aqui", que não mostra o
// que o aplicativo faz. Para a apresentação, a primeira visita já vem com três
// livros lidos e dois favoritos.
//
// Passa pelas mesmas funções que o botão de favoritar e o fim de capítulo usam,
// então as medalhas, o marco de 3 livros e o dia de leitura saem das regras
// normais, não de um estado inventado à mão. Funciona nos dois modos de dados.

import * as api from '../api';

const SEED_KEY = 'estante_demo_seeded';

const DRAGAO = '76c35d2f-b507-4c60-a0ce-a5dd9cbc851f';
const VITORIA_REGIA = 'dca3b51b-e51f-4d85-bd83-88b53a78c11c';
const PATINHO_FEIO = '9934fe7c-4990-42ba-9ce6-aaeec2d53f0b';

// Ordem de leitura: o último da lista é o mais recente e encabeça Recompensas.
const LIDOS = [PATINHO_FEIO, VITORIA_REGIA, DRAGAO];
const FAVORITOS = [VITORIA_REGIA, DRAGAO];

async function marcarComoLido(childId: string, bookId: string): Promise<void> {
  // O número de capítulos vem do catálogo: se um livro mudar de tamanho, o
  // progresso continua apontando para o fim dele.
  const book = await api.books.getBook(bookId);
  const ultimo = book.chapters.length - 1;
  if (ultimo < 0) {
    return;
  }
  await api.progress.saveProgress(childId, bookId, {
    lastChapterIndex: ultimo,
    positionPercent: 100,
    completed: true,
  });
}

/**
 * Preenche a estante do personagem na primeira visita. Retorna true se semeou.
 *
 * Só age numa estante intocada: qualquer leitura ou favorito já existente
 * cancela a semeadura, para nunca mexer no histórico real de uma criança.
 */
export async function seedDemoContent(childId: string): Promise<boolean> {
  if (window.localStorage.getItem(SEED_KEY) === '1') {
    return false;
  }
  try {
    const [progresso, favoritos] = await Promise.all([
      api.progress.listProgress(childId),
      api.favorites.listFavorites(childId),
    ]);
    if (progresso.length > 0 || favoritos.length > 0) {
      // Estante em uso: marca como semeada para não voltar a perguntar.
      window.localStorage.setItem(SEED_KEY, '1');
      return false;
    }

    for (const bookId of LIDOS) {
      await marcarComoLido(childId, bookId);
    }
    for (const bookId of FAVORITOS) {
      await api.favorites.addFavorite(childId, bookId);
    }

    window.localStorage.setItem(SEED_KEY, '1');
    return true;
  } catch {
    // Semear é enfeite: se falhar (catálogo diferente, backend fora do ar), o
    // site abre normalmente com a estante vazia e tenta de novo depois.
    return false;
  }
}
