// Configuração lida em tempo de build pelo Vite (prefixo VITE_).
// Espelha `mobile/src/config.ts`, com um detalhe a mais: na web o padrão é o
// modo local, porque o site publicado não tem backend.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Modo local: sem backend. Livros vêm de src/data/books.json, mídia de /uploads
// e o estado (perfis, progresso, recompensas, streak, favoritos) fica no
// navegador. Só sai do modo local quem definir VITE_OFFLINE=0 explicitamente.
export const OFFLINE = import.meta.env.VITE_OFFLINE !== '0';

// E-mail da identificação automática no modo online (rota /auth/dev do backend).
// Não existe tela de login na web: a identidade vem daqui ou das Configurações.
export const DEV_EMAIL = import.meta.env.VITE_DEV_EMAIL ?? 'web@estante.local';

// Base dos arquivos estáticos. No modo local eles são servidos pelo próprio
// site (public/uploads); no modo online, pelo backend (sem o sufixo /api).
export const STATIC_URL = OFFLINE ? '' : API_URL.replace(/\/api\/?$/, '');

// Monta a URL completa de um arquivo, encodando espaços e acentos.
export function fileUrl(path: string): string {
  return `${STATIC_URL}${encodeURI(path)}`;
}

// Versão das capas.
//
// Os arquivos têm nome fixo (`cinderela.jpg` continua `cinderela.jpg` depois de
// redesenhado), e tanto o cabeçalho de cache da Netlify quanto o service worker
// guardam imagem por semanas. Sem isso, quem já visitou o site continuaria
// vendo a capa antiga por até um mês.
//
// Trocou alguma capa? Mude o selo aqui no mesmo commit (data, com sufixo se
// houver mais de uma troca no dia). Só as capas o usam: a narração tem ~60 MB
// e não deve ser rebaixada por causa de arte.
export const ASSET_VERSION = '2026-07-31-3';
