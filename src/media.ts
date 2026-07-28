import { OFFLINE, fileUrl } from './config';

// Na web, capa e áudio são sempre URLs: no modo local apontam para /uploads do
// próprio site, no modo online para o backend. O app mobile precisa distinguir
// URL de módulo embutido (`require`), aqui não.

export function coverSource(relPath: string): string {
  return relPath.startsWith('/') ? fileUrl(relPath) : relPath;
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
  return fileUrl(`/uploads/covers/thumbs/${base}.webp`);
}
