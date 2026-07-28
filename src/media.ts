import { fileUrl } from './config';

// Na web, capa e áudio são sempre URLs: no modo local apontam para /uploads do
// próprio site, no modo online para o backend. O app mobile precisa distinguir
// URL de módulo embutido (`require`), aqui não.

export function coverSource(relPath: string): string {
  return relPath.startsWith('/') ? fileUrl(relPath) : relPath;
}

export function audioSource(relPath: string): string {
  return relPath.startsWith('/') ? fileUrl(relPath) : relPath;
}
