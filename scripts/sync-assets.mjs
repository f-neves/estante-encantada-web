// Copia o acervo do app mobile para a web: capas e áudios para `public/uploads`
// e o catálogo (`books.json`) para `src/data`. Idempotente: só copia arquivos
// novos ou com tamanho diferente, então rodar de novo é barato.
//
// Uso: npm run sync:assets [-- caminho/do/estante-encantada-app]

import { cp, mkdir, readdir, stat, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');

const appRoot = path.resolve(
  process.argv[2] ?? process.env.ESTANTE_APP_PATH ?? path.join(webRoot, '..', 'estante-encantada-app'),
);

const SOURCES = [
  { from: path.join(appRoot, 'backend', 'uploads', 'covers'), to: path.join(webRoot, 'public', 'uploads', 'covers') },
  { from: path.join(appRoot, 'backend', 'uploads', 'audio'), to: path.join(webRoot, 'public', 'uploads', 'audio') },
];

const BOOKS_JSON = {
  from: path.join(appRoot, 'mobile', 'src', 'offline', 'data', 'books.json'),
  to: path.join(webRoot, 'src', 'data', 'books.json'),
};

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function syncDir(from, to) {
  if (!existsSync(from)) {
    console.warn(`  aviso: origem inexistente, pulando · ${from}`);
    return { copied: 0, skipped: 0, bytes: 0 };
  }
  await mkdir(to, { recursive: true });
  const entries = await readdir(from, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;
  let bytes = 0;

  for (const entry of entries) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      const nested = await syncDir(src, dest);
      copied += nested.copied;
      skipped += nested.skipped;
      bytes += nested.bytes;
      continue;
    }
    const srcStat = await stat(src);
    let destStat = null;
    try {
      destStat = await stat(dest);
    } catch {
      destStat = null;
    }
    if (destStat && destStat.size === srcStat.size) {
      skipped += 1;
      continue;
    }
    await copyFile(src, dest);
    copied += 1;
    bytes += srcStat.size;
  }
  return { copied, skipped, bytes };
}

// As capas originais chegam a 2 MB, peso demais para a lista e a grade da
// estante. Cada uma vira uma miniatura webp de 360px, usada em tudo que não
// seja a capa grande da tela de detalhe.
const THUMB_WIDTH = 360;

async function buildThumbnails() {
  const from = path.join(webRoot, 'public', 'uploads', 'covers');
  const to = path.join(from, 'thumbs');
  if (!existsSync(from)) {
    return;
  }
  await mkdir(to, { recursive: true });
  const files = (await readdir(from, { withFileTypes: true }))
    .filter((e) => e.isFile() && /\.(png|jpe?g|webp)$/i.test(e.name))
    .map((e) => e.name);

  let built = 0;
  let bytes = 0;
  for (const file of files) {
    const dest = path.join(to, `${path.parse(file).name}.webp`);
    if (existsSync(dest)) {
      continue;
    }
    await sharp(path.join(from, file))
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(dest);
    built += 1;
    bytes += (await stat(dest)).size;
  }
  console.log(`  miniaturas: ${built} geradas, ${files.length - built} já existiam (${mb(bytes)})`);
}

async function main() {
  if (!existsSync(appRoot)) {
    console.error(`App não encontrado em: ${appRoot}`);
    console.error('Passe o caminho: npm run sync:assets -- C:/caminho/estante-encantada-app');
    process.exit(1);
  }

  console.log(`Sincronizando de ${appRoot}`);
  let total = { copied: 0, skipped: 0, bytes: 0 };
  for (const { from, to } of SOURCES) {
    const label = path.basename(from);
    const result = await syncDir(from, to);
    console.log(`  ${label}: ${result.copied} copiados, ${result.skipped} já iguais (${mb(result.bytes)})`);
    total.copied += result.copied;
    total.skipped += result.skipped;
    total.bytes += result.bytes;
  }

  await buildThumbnails();

  if (existsSync(BOOKS_JSON.from)) {
    await mkdir(path.dirname(BOOKS_JSON.to), { recursive: true });
    await cp(BOOKS_JSON.from, BOOKS_JSON.to);
    const { size } = await stat(BOOKS_JSON.to);
    console.log(`  books.json: atualizado (${mb(size)})`);
  } else {
    console.warn(`  aviso: books.json não encontrado em ${BOOKS_JSON.from}`);
    console.warn('  gere com: cd backend && npm run export:offline');
  }

  console.log(`Pronto: ${total.copied} arquivos novos, ${mb(total.bytes)} transferidos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
