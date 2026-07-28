import type { IconName } from '../components/Icon';

// Navegação por tema, para quem ainda não lê escolher pela cor e pelo desenho.
// O acervo não traz categoria, então o mapa vive aqui, por título. Livro novo
// sem mapa cai em "Aventuras", que é o grupo mais aberto.

export interface Categoria {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  edge: string;
}

export const CATEGORIAS: Categoria[] = [
  {
    id: 'classicos',
    label: 'Contos clássicos',
    icon: 'book',
    color: 'var(--c-sky)',
    edge: 'var(--edge-sky)',
  },
  {
    id: 'folclore',
    label: 'Folclore brasileiro',
    icon: 'sparkles',
    color: 'var(--c-mint)',
    edge: 'var(--edge-mint)',
  },
  {
    id: 'aventuras',
    label: 'Aventuras',
    icon: 'flame',
    color: 'var(--c-coral)',
    edge: 'var(--edge-coral)',
  },
];

const POR_TITULO: Record<string, string> = {
  'Chapeuzinho Vermelho': 'classicos',
  Cinderela: 'classicos',
  'Cachinhos Dourados e os Três Ursos': 'classicos',
  'João e o Pé de Feijão': 'classicos',
  'O Patinho Feio': 'classicos',
  'Os Três Porquinhos': 'classicos',
  'O Saci-Pererê': 'folclore',
  'O Curupira': 'folclore',
  'A Lenda da Vitória-Régia': 'folclore',
  'Sítio do Picapau Amarelo': 'folclore',
  'O Dragão que Não Sabia Voar': 'aventuras',
  'O Robô que Aprendeu a Sonhar': 'aventuras',
  'A Biblioteca Mágica da Vovó Rosa': 'aventuras',
};

export function categoriaDe(titulo: string): string {
  return POR_TITULO[titulo] ?? 'aventuras';
}
