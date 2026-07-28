// Ícones dos personagens. O app tem uma grade única de 15 emojis; aqui eles
// vêm agrupados em pacotes, para a tela Personalizar e o formulário de perfil
// mostrarem a mesma coleção organizada.

export interface AvatarPack {
  id: string;
  label: string;
  emojis: string[];
}

export const AVATAR_PACKS: AvatarPack[] = [
  { id: 'pessoas', label: 'Pessoas', emojis: ['🧒', '👦', '👧', '🧑', '👶', '🧓'] },
  { id: 'animais', label: 'Animais', emojis: ['🦊', '🐱', '🐶', '🐼', '🐰', '🦁', '🐨', '🐵', '🦉', '🐢'] },
  {
    id: 'fantasia',
    label: 'Fantasia',
    emojis: ['🦄', '🧝', '🧙', '🧚', '🧜', '🐉', '🧞', '🦸', '🥷', '👑'],
  },
  { id: 'espaco', label: 'Espaço', emojis: ['🧑‍🚀', '🚀', '🪐', '🌟', '🌙', '☄️', '👽', '🛸'] },
];

export const ALL_AVATARS: string[] = AVATAR_PACKS.flatMap((pack) => pack.emojis);

export const DEFAULT_AVATAR = '🧒';

// Cores dos ladrilhos de avatar, na mesma ordem do app.
export const TILE_COLORS = [
  'var(--c-primary)',
  'var(--c-coral)',
  'var(--c-mint)',
  'var(--c-sky)',
  'var(--c-pink)',
  'var(--c-yellow)',
];

export function tileColorFor(index: number): string {
  return TILE_COLORS[index % TILE_COLORS.length] as string;
}
