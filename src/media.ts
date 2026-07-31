import { ASSET_VERSION, OFFLINE, fileUrl } from './config';

// Na web, capa e áudio são sempre URLs: no modo local apontam para /uploads do
// próprio site, no modo online para o backend. O app mobile precisa distinguir
// URL de módulo embutido (`require`), aqui não.

// As capas mantêm o nome do arquivo quando são redesenhadas, então o selo de
// versão é o que faz o navegador (e o service worker) buscarem a nova em vez
// de servir a guardada. Ver ASSET_VERSION em config.ts.
function comVersao(url: string): string {
  return `${url}?v=${ASSET_VERSION}`;
}

export function coverSource(relPath: string): string {
  return comVersao(relPath.startsWith('/') ? fileUrl(relPath) : relPath);
}

export function audioSource(relPath: string): string {
  return relPath.startsWith('/') ? fileUrl(relPath) : relPath;
}

// Miniatura da capa (webp de 360px), gerada por `npm run sync:assets`. Usada
// na lista e na grade; a capa grande continua vindo do arquivo original.
// Só existe no modo local: o backend serve apenas os originais.
export function coverThumbSource(relPath: string): string | null {
  if (!OFFLINE || !relPath.startsWith('/uploads/covers/')) {
    return null;
  }
  const file = relPath.split('/').pop();
  if (!file) {
    return null;
  }
  const base = file.replace(/\.[^.]+$/, '');
  return comVersao(fileUrl(`/uploads/covers/thumbs/${base}.webp`));
}
