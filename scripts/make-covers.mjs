// Capas próprias, desenhadas em SVG e rasterizadas. Substituem imagens de
// terceiros por arte original do projeto, na mesma linguagem visual do app:
// formas arredondadas, cores da paleta, sombra leve, clima de conto ilustrado.
//
// Uso: node scripts/make-covers.mjs [pasta-de-saida]

import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] ?? path.join(here, '..', 'public', 'uploads', 'covers'));

const W = 768;
const H = 1152;

// Paleta do design system (src/styles/tokens.css).
const C = {
  purple: '#7C5CFC',
  purpleDark: '#5B3FD6',
  night: '#3A2E5C',
  cream: '#FFF7F0',
  coral: '#FF8A5B',
  yellow: '#FFC93C',
  mint: '#22C9A8',
  sky: '#4DA8FF',
  pink: '#FF6FA5',
  red: '#E0483B',
  brown: '#8A5A3B',
  wood: '#6B4630',
  leaf: '#1E9E7E',
  leafDark: '#12705A',
  grass: '#66C46A',
  grassDark: '#3E9B55',
};

// Estrelinhas espalhadas de forma estável (sem aleatoriedade a cada execução).
function stars(n, seed = 7) {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * W);
    const y = Math.round(rnd() * H * 0.55);
    const r = 1.5 + rnd() * 3;
    out += `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#FFF" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`;
  }
  return out;
}

function titulo(linhas, cor = '#FFFFFF', sombra = 'rgba(0,0,0,0.35)') {
  return linhas
    .map(
      (linha, i) => `
      <text x="${W / 2}" y="${120 + i * 74}" text-anchor="middle"
            font-family="Segoe UI, Trebuchet MS, Verdana, sans-serif" font-size="62" font-weight="700"
            fill="${cor}" stroke="${sombra}" stroke-width="8" paint-order="stroke" letter-spacing="1">${linha}</text>`,
    )
    .join('');
}

// --- O Saci-Pererê: noite no mato, redemoinho, gorro e cachimbo ------------
const saci = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.night}"/>
      <stop offset="60%" stop-color="${C.purpleDark}"/>
      <stop offset="100%" stop-color="${C.purple}"/>
    </linearGradient>
    <radialGradient id="brilhoLua" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="${C.yellow}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${C.yellow}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ceu)"/>
  ${stars(46, 11)}

  <circle cx="618" cy="268" r="150" fill="url(#brilhoLua)"/>
  <circle cx="618" cy="268" r="72" fill="${C.yellow}"/>
  <!-- a "mordida" da lua usa a cor do céu naquele ponto do gradiente -->
  <circle cx="580" cy="248" r="62" fill="#463A80"/>

  <!-- redemoinho: um cone que sobe do mato e vai afinando -->
  <g>
    <path d="M262 1010 Q356 760 380 596 L452 596 Q476 760 570 1010 Z" fill="#FFFFFF" opacity="0.16"/>
    <g fill="none" stroke="#FFFFFF" stroke-linecap="round">
      <path d="M286 946 q126 -58 252 0" stroke-width="16" opacity="0.30"/>
      <path d="M302 866 q112 -54 224 0" stroke-width="15" opacity="0.36"/>
      <path d="M320 792 q98 -50 194 0" stroke-width="14" opacity="0.42"/>
      <path d="M340 722 q84 -46 164 0" stroke-width="13" opacity="0.48"/>
      <path d="M358 662 q68 -40 132 0" stroke-width="12" opacity="0.55"/>
      <path d="M374 612 q52 -34 100 0" stroke-width="11" opacity="0.62"/>
    </g>
    <!-- folhas levantadas pelo vento -->
    <g fill="${C.leaf}">
      <ellipse cx="250" cy="880" rx="20" ry="9" transform="rotate(-28 250 880)"/>
      <ellipse cx="592" cy="806" rx="18" ry="8" transform="rotate(24 592 806)"/>
      <ellipse cx="238" cy="720" rx="16" ry="7" transform="rotate(-16 238 720)"/>
      <ellipse cx="606" cy="668" rx="15" ry="7" transform="rotate(32 606 668)"/>
    </g>
  </g>

  <!-- gorro vermelho girando no alto do redemoinho -->
  <g transform="translate(416 520) rotate(-12)">
    <ellipse cx="0" cy="26" rx="92" ry="22" fill="#C43A2F"/>
    <path d="M-74 28 q10 -110 74 -110 q64 0 74 110 z" fill="${C.red}"/>
    <path d="M-74 28 q10 -110 74 -110 q20 0 34 18 q-48 28 -64 92 z" fill="#FFFFFF" opacity="0.18"/>
    <circle cx="0" cy="-88" r="17" fill="${C.coral}"/>
  </g>

  <!-- cachimbo espiando de dentro do redemoinho, logo abaixo do gorro -->
  <g transform="translate(432 588) rotate(-14)">
    <rect x="0" y="0" width="78" height="14" rx="7" fill="${C.wood}"/>
    <path d="M78 6 q23 0 23 23 v15 q0 14 -16 14 h-13 q-16 0 -16 -14 v-15 q0 -23 22 -23 z" fill="${C.brown}"/>
    <circle cx="100" cy="-26" r="10" fill="#FFF" opacity="0.5"/>
    <circle cx="118" cy="-58" r="14" fill="#FFF" opacity="0.36"/>
    <circle cx="140" cy="-98" r="18" fill="#FFF" opacity="0.22"/>
  </g>

  <!-- mato em camadas -->
  <path d="M0 980 q120 -70 240 -18 q120 52 240 -12 q120 -64 288 6 v196 H0 z" fill="${C.leafDark}"/>
  <path d="M0 1050 q140 -56 280 -8 q140 48 288 -14 q100 -42 200 10 v114 H0 z" fill="${C.leaf}"/>
  <g fill="${C.yellow}" opacity="0.9">
    <circle cx="120" cy="1010" r="6"/><circle cx="210" cy="1064" r="5"/>
    <circle cx="640" cy="1024" r="6"/><circle cx="700" cy="1090" r="5"/>
  </g>

  ${titulo(['O Saci-Pererê'])}
</svg>`;

// --- O Curupira: guardião de cabelo de fogo e pés virados -----------------
const curupira = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="mata" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0E5E4C"/>
      <stop offset="55%" stop-color="${C.leaf}"/>
      <stop offset="100%" stop-color="#0E5E4C"/>
    </linearGradient>
    <linearGradient id="fogo" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${C.red}"/>
      <stop offset="60%" stop-color="${C.coral}"/>
      <stop offset="100%" stop-color="${C.yellow}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#mata)"/>

  <!-- raios de sol entre as árvores -->
  <g opacity="0.16" fill="#FFFFFF">
    <path d="M120 0 L250 0 L470 ${H} L300 ${H} z"/>
    <path d="M470 0 L540 0 L700 ${H} L610 ${H} z"/>
  </g>

  <!-- troncos -->
  <g fill="${C.wood}" opacity="0.85">
    <rect x="40" y="180" width="76" height="972" rx="30"/>
    <rect x="656" y="120" width="86" height="1032" rx="32"/>
  </g>
  <g fill="${C.leafDark}">
    <ellipse cx="78" cy="300" rx="120" ry="70"/>
    <ellipse cx="700" cy="240" rx="140" ry="80"/>
  </g>

  <!-- trilha de pegadas: os dedos apontam para trás, a marca do Curupira -->
  <g fill="${C.cream}" opacity="0.6">
    ${[
      [188, 1064],
      [248, 1004],
      [194, 940],
      [254, 880],
    ]
      .map(
        ([x, y]) => `
      <g transform="translate(${x} ${y})">
        <ellipse cx="0" cy="0" rx="17" ry="26"/>
        <circle cx="-10" cy="30" r="5"/>
        <circle cx="0" cy="33" r="5"/>
        <circle cx="10" cy="30" r="5"/>
      </g>`,
      )
      .join('')}
  </g>

  <!-- guardião -->
  <g transform="translate(430 700)">
    <!-- cabelo de fogo -->
    <path d="M-104 -108 q-16 -96 40 -140 q-6 66 30 92 q-10 -86 44 -126 q4 74 40 104 q10 -60 56 -84 q-14 62 14 112 q26 -30 54 -30 q-40 44 -30 96 z"
          fill="url(#fogo)"/>
    <!-- cabeça -->
    <circle cx="0" cy="-40" r="86" fill="#C98A5E"/>
    <circle cx="-30" cy="-52" r="9" fill="${C.night}"/>
    <circle cx="30" cy="-52" r="9" fill="${C.night}"/>
    <path d="M-34 -12 q34 34 68 0" stroke="${C.night}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <!-- corpo -->
    <rect x="-64" y="44" width="128" height="150" rx="56" fill="#C98A5E"/>
    <!-- saiote de folhas -->
    <g fill="${C.leaf}">
      ${[-62, -38, -14, 10, 34, 58]
        .map((x) => `<path d="M${x} 148 q14 44 0 74 q-14 -30 0 -74 z" transform="rotate(${x / 6} ${x} 160)"/>`)
        .join('')}
    </g>
    <path d="M-70 142 q70 26 140 0 v20 q-70 26 -140 0 z" fill="${C.grass}"/>
    <!-- cajado atrás da mão -->
    <rect x="96" y="-96" width="20" height="368" rx="10" fill="${C.brown}" transform="rotate(8 106 88)"/>
    <!-- braços, com a mão fechada no cajado -->
    <rect x="-124" y="66" width="66" height="26" rx="13" fill="#C98A5E" transform="rotate(-18 -91 79)"/>
    <rect x="56" y="58" width="70" height="26" rx="13" fill="#C98A5E" transform="rotate(16 91 71)"/>
    <circle cx="124" cy="82" r="19" fill="#C98A5E"/>
    <!-- pernas e pés virados para trás (calcanhar na frente, dedos atrás) -->
    <rect x="-46" y="188" width="34" height="92" rx="16" fill="#C98A5E"/>
    <rect x="14" y="188" width="34" height="92" rx="16" fill="#C98A5E"/>
    <g fill="#B87B50">
      <ellipse cx="-40" cy="286" rx="32" ry="17"/>
      <ellipse cx="54" cy="286" rx="32" ry="17"/>
      <circle cx="-68" cy="286" r="6"/><circle cx="-62" cy="272" r="6"/><circle cx="-62" cy="300" r="6"/>
      <circle cx="82" cy="286" r="6"/><circle cx="76" cy="272" r="6"/><circle cx="76" cy="300" r="6"/>
    </g>
  </g>

  <!-- folhagem da frente -->
  <path d="M0 1060 q120 -60 240 -10 q120 50 244 -6 q120 -56 284 10 v98 H0 z" fill="#0E5E4C"/>

  ${titulo(['O Curupira'])}
</svg>`;

// --- Sítio do Picapau Amarelo: pica-pau amarelo e a casa branca ------------
const sitio = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ceuDia" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8FD0FF"/>
      <stop offset="70%" stop-color="#CDEBFF"/>
      <stop offset="100%" stop-color="#F2FBE9"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ceuDia)"/>

  <!-- sol e nuvens (longe do título, que fica no topo) -->
  <circle cx="654" cy="392" r="60" fill="${C.yellow}"/>
  <g fill="#FFFFFF" opacity="0.9">
    <ellipse cx="170" cy="330" rx="86" ry="40"/>
    <ellipse cx="226" cy="316" rx="62" ry="48"/>
    <ellipse cx="440" cy="470" rx="66" ry="32"/>
    <ellipse cx="484" cy="458" rx="48" ry="38"/>
  </g>

  <!-- morros -->
  <path d="M0 720 q180 -140 360 -30 q170 104 408 -26 v180 H0 z" fill="${C.grassDark}"/>
  <path d="M0 800 q200 -110 396 -18 q190 90 372 -34 v420 H0 z" fill="${C.grass}"/>

  <!-- ribeirão -->
  <path d="M0 1010 q200 -60 380 0 q180 58 388 -14 v40 q-208 74 -392 14 q-184 -60 -376 0 z" fill="${C.sky}" opacity="0.9"/>

  <!-- casa branca de telhado vermelho -->
  <g transform="translate(392 760)">
    <rect x="0" y="60" width="250" height="140" rx="14" fill="#FFFFFF"/>
    <path d="M-22 62 L125 -22 L272 62 z" fill="${C.red}"/>
    <rect x="104" y="120" width="56" height="80" rx="10" fill="${C.brown}"/>
    <rect x="28" y="100" width="52" height="46" rx="10" fill="${C.sky}"/>
    <rect x="182" y="100" width="52" height="46" rx="10" fill="${C.sky}"/>
  </g>

  <!-- tronco com o pica-pau -->
  <g transform="translate(96 520)">
    <rect x="0" y="0" width="150" height="632" rx="46" fill="${C.wood}"/>
    <ellipse cx="112" cy="250" rx="26" ry="30" fill="#4A2F20"/>
    <g transform="translate(150 300)">
      <!-- corpo -->
      <ellipse cx="0" cy="60" rx="76" ry="104" fill="${C.yellow}"/>
      <path d="M-52 20 q60 -30 92 40 q-52 46 -92 -40 z" fill="#F0B21F"/>
      <!-- cabeça -->
      <circle cx="-10" cy="-42" r="60" fill="${C.yellow}"/>
      <path d="M-64 -76 q6 -60 60 -66 q-16 44 6 68 z" fill="${C.red}"/>
      <circle cx="10" cy="-52" r="10" fill="${C.night}"/>
      <path d="M-64 -34 L-140 -12 L-62 6 z" fill="${C.coral}"/>
      <!-- rabo e pés -->
      <path d="M56 130 q56 34 74 88 q-64 -14 -96 -50 z" fill="#F0B21F"/>
      <path d="M-56 120 l-40 18 m40 6 l-40 18" stroke="${C.brown}" stroke-width="10" stroke-linecap="round"/>
    </g>
  </g>

  <!-- pomar -->
  <g>
    <circle cx="700" cy="880" r="58" fill="${C.leaf}"/>
    <rect x="690" y="920" width="20" height="70" rx="9" fill="${C.wood}"/>
    <circle cx="676" cy="866" r="9" fill="${C.coral}"/>
    <circle cx="722" cy="900" r="9" fill="${C.coral}"/>
  </g>

  ${titulo(['Sítio do', 'Picapau Amarelo'], '#FFFFFF', 'rgba(58,46,92,0.45)')}
</svg>`;

// --- A Biblioteca Mágica da Vovó Rosa -------------------------------------
const biblioteca = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="quarto" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F7E3F2"/>
      <stop offset="100%" stop-color="#FDEFF8"/>
    </linearGradient>
    <radialGradient id="magia" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="${C.yellow}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${C.yellow}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#quarto)"/>

  <!-- estante com livros coloridos -->
  ${[560, 760, 960]
    .map(
      (y) => `
    <rect x="70" y="${y}" width="628" height="18" rx="9" fill="${C.wood}"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const cores = [C.coral, C.mint, C.sky, C.pink, C.purple, C.yellow, C.red, C.leaf];
        const h = 92 + ((i * 37 + y) % 46);
        const x = 92 + i * 76;
        return `<rect x="${x}" y="${y - h}" width="${54 + (i % 3) * 6}" height="${h}" rx="8" fill="${cores[(i + y / 200) % 8 | 0]}"/>`;
      })
      .join('')}`,
    )
    .join('')}

  <!-- livro aberto flutuando, soltando brilho -->
  <g transform="translate(384 400)">
    <circle cx="0" cy="0" r="210" fill="url(#magia)"/>
    <path d="M-160 60 q80 -46 156 -10 v-116 q-76 -36 -156 10 z" fill="#FFFFFF"/>
    <path d="M160 60 q-80 -46 -156 -10 v-116 q76 -36 156 10 z" fill="#FFF7F0"/>
    <path d="M-160 60 q80 -46 156 -10 q76 -36 156 10 l0 22 q-80 -46 -156 -10 q-76 -36 -156 10 z" fill="${C.coral}"/>
    <g fill="${C.yellow}">
      <circle cx="-70" cy="-140" r="9"/>
      <circle cx="20" cy="-186" r="13"/>
      <circle cx="96" cy="-134" r="8"/>
      <circle cx="-130" cy="-96" r="7"/>
      <circle cx="148" cy="-70" r="10"/>
    </g>
  </g>

  ${titulo(['A Biblioteca Mágica', 'da Vovó Rosa'], '#FFFFFF', 'rgba(124,92,252,0.55)')}
</svg>`;

// --- O Robô que Aprendeu a Sonhar -----------------------------------------
const robo = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="noiteRobo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1F1B3A"/>
      <stop offset="70%" stop-color="${C.purpleDark}"/>
      <stop offset="100%" stop-color="#7B6BE8"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#noiteRobo)"/>
  ${stars(40, 23)}

  <!-- planeta e órbita -->
  <circle cx="620" cy="300" r="58" fill="${C.mint}"/>
  <ellipse cx="620" cy="300" rx="104" ry="30" fill="none" stroke="${C.yellow}" stroke-width="7" opacity="0.7" transform="rotate(-18 620 300)"/>

  <!-- robô -->
  <g transform="translate(384 760)">
    <rect x="-14" y="-292" width="28" height="60" rx="14" fill="#9AA6C4"/>
    <circle cx="0" cy="-306" r="20" fill="${C.yellow}"/>
    <rect x="-130" y="-238" width="260" height="196" rx="52" fill="#C9D3E8"/>
    <rect x="-96" y="-206" width="192" height="120" rx="34" fill="#2B2650"/>
    <circle cx="-42" cy="-146" r="22" fill="${C.sky}"/>
    <circle cx="42" cy="-146" r="22" fill="${C.sky}"/>
    <path d="M-30 -108 q30 24 60 0" stroke="${C.mint}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <rect x="-104" y="-24" width="208" height="180" rx="42" fill="#B7C3DE"/>
    <circle cx="0" cy="60" r="42" fill="${C.purple}"/>
    <path d="M0 40 l12 24 h-24 z" fill="${C.yellow}"/>
    <rect x="-176" y="-4" width="70" height="26" rx="13" fill="#9AA6C4"/>
    <rect x="106" y="-4" width="70" height="26" rx="13" fill="#9AA6C4"/>
    <rect x="-72" y="156" width="52" height="70" rx="20" fill="#9AA6C4"/>
    <rect x="20" y="156" width="52" height="70" rx="20" fill="#9AA6C4"/>
  </g>

  <!-- balão de sonho -->
  <g transform="translate(556 560)">
    <circle cx="0" cy="0" r="66" fill="#FFFFFF" opacity="0.92"/>
    <circle cx="-52" cy="52" r="18" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="-76" cy="78" r="10" fill="#FFFFFF" opacity="0.7"/>
    <path d="M0 -30 q26 -26 44 0 q16 24 -44 54 q-60 -30 -44 -54 q18 -26 44 0 z" fill="${C.pink}"/>
  </g>

  ${titulo(['O Robô que', 'Aprendeu a Sonhar'])}
</svg>`;

// --- Os Três Porquinhos ---------------------------------------------------
const porquinhos = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ceuPorco" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9BD9FF"/>
      <stop offset="72%" stop-color="#D9F0FF"/>
      <stop offset="100%" stop-color="#EFFBE4"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ceuPorco)"/>
  <g fill="#FFFFFF" opacity="0.9">
    <ellipse cx="150" cy="360" rx="80" ry="38"/>
    <ellipse cx="204" cy="346" rx="58" ry="44"/>
    <ellipse cx="612" cy="300" rx="66" ry="32"/>
  </g>

  <path d="M0 620 q200 -90 392 -14 q190 74 376 -30 v576 H0 z" fill="${C.grass}"/>

  <!-- três casinhas: palha, madeira e tijolo -->
  <g transform="translate(96 560)">
    <rect x="0" y="60" width="130" height="110" rx="12" fill="#E8C86A"/>
    <path d="M-16 62 L65 -6 L146 62 z" fill="#D9B34E"/>
    <rect x="46" y="112" width="38" height="58" rx="8" fill="${C.wood}"/>
  </g>
  <g transform="translate(300 580)">
    <rect x="0" y="60" width="140" height="110" rx="12" fill="#C89A6B"/>
    <path d="M-18 62 L70 -8 L158 62 z" fill="#A97B4E"/>
    <rect x="52" y="112" width="38" height="58" rx="8" fill="${C.wood}"/>
  </g>
  <g transform="translate(520 550)">
    <rect x="0" y="60" width="150" height="120" rx="12" fill="#E07A5F"/>
    <path d="M-18 62 L75 -12 L168 62 z" fill="${C.red}"/>
    <rect x="56" y="118" width="40" height="62" rx="8" fill="${C.wood}"/>
    <g stroke="#FFFFFF" stroke-width="3" opacity="0.45">
      <path d="M0 92 H150 M0 124 H150 M0 156 H150"/>
    </g>
  </g>

  <!-- os três porquinhos -->
  ${[
    [176, 916],
    [384, 972],
    [594, 916],
  ]
    .map(
      ([x, y], i) => `
    <g transform="translate(${x} ${y}) scale(${1.25 - i * 0.05})">
      <ellipse cx="0" cy="0" rx="72" ry="62" fill="#FFB4C8"/>
      <circle cx="-46" cy="-46" r="20" fill="#FF9DBA"/>
      <circle cx="46" cy="-46" r="20" fill="#FF9DBA"/>
      <ellipse cx="0" cy="16" rx="26" ry="20" fill="#FF8FB0"/>
      <circle cx="-9" cy="16" r="5" fill="#C9527A"/>
      <circle cx="9" cy="16" r="5" fill="#C9527A"/>
      <circle cx="-26" cy="-14" r="7" fill="${C.night}"/>
      <circle cx="26" cy="-14" r="7" fill="${C.night}"/>
    </g>`,
    )
    .join('')}

  ${titulo(['Os Três', 'Porquinhos'], '#FFFFFF', 'rgba(58,46,92,0.45)')}
</svg>`;

const CAPAS = [
  { file: 'saci.jpg', svg: saci },
  { file: 'curupira.jpg', svg: curupira },
  { file: 'sitio.jpg', svg: sitio },
  { file: 'livro02.jpg', svg: biblioteca },
  { file: 'livro03.jpg', svg: robo },
  { file: 'livro04.jpg', svg: porquinhos },
];

await mkdir(outDir, { recursive: true });
for (const capa of CAPAS) {
  const dest = path.join(outDir, capa.file);
  await sharp(Buffer.from(capa.svg)).jpeg({ quality: 92 }).toFile(dest);
  console.log(`  ${capa.file} gerada em ${outDir}`);
}
