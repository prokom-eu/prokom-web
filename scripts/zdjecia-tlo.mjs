// Product photos of the card packages without a transparent background, or with a light halo
// around a cut-out product (NAPRAWA-0911 §3b): the list for re-cutting / a manufacturer photo.
//   node scripts/zdjecia-tlo.mjs            → docs/zadania/zdjecia-do-wyciecia.md
//   node scripts/zdjecia-tlo.mjs --stdout   → the table only
// `sharp` is already a dependency (Payload uses it): no new package. Each photo is read at most
// 256 px wide, RGBA:
//   - „białe tło” — the frame (outer 3% of the picture) is opaque and almost white: the product
//     stands on a white rectangle;
//   - „otoczka” — the background is transparent, but the product's outline is mostly very light
//     pixels: a white cloud left from cutting (Sunmi D3 PRO).
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
/** Folders of the card photos in the packages the Biznes seed imports. */
export const SOURCES = [
  'seed/prokombiznes/k3/media/produkty',
  'seed/prokombiznes/media/produkty',
  'seed/prokombiznes/k4/media/produkty',
  'seed/prokombiznes/k4/media/kolory',
  'docs/design/prokombiznes/boards/media',
]
const PHOTO = /\.(webp|png|jpe?g)$/i
/** Reported first (audit 09.11, Krystian's screenshots). */
const FIRST = /\/d3\/|sunmi-d3|polcard|move-?2500/i

/** Classifies one RGBA bitmap (pure; tested). */
export function classify({ data, width, height }) {
  const at = (x, y) => (y * width + x) * 4
  const light = (i) => data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238
  const frame = Math.max(1, Math.round(Math.min(width, height) * 0.03))
  let edge = 0
  let opaque = 0
  let white = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= frame && y >= frame && x < width - frame && y < height - frame) continue
      const i = at(x, y)
      edge++
      if (data[i + 3] > 200) {
        opaque++
        if (light(i)) white++
      }
    }
  }
  if (opaque / edge > 0.9) {
    return white / edge > 0.85 ? { problem: 'białe tło', share: white / edge } : null
  }
  // Transparent background: the outline = opaque pixels next to a transparent one.
  let outline = 0
  let lightOutline = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = at(x, y)
      if (data[i + 3] <= 200) continue
      const nearClear = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].some(
        (j) => data[j + 3] < 40,
      )
      if (!nearClear) continue
      outline++
      if (light(i)) lightOutline++
    }
  }
  if (outline > 40 && lightOutline / outline > 0.45) {
    return { problem: 'otoczka', share: lightOutline / outline }
  }
  return null
}

function files(dir) {
  const out = []
  let entries = []
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...files(full))
    else if (PHOTO.test(name) && (!dir.endsWith('boards' + sep + 'media') || name.startsWith('p-')))
      out.push(full)
  }
  return out
}

/** The card slug: the photo's folder in `produkty/<slug>/`, else the file name. */
const slugOf = (file) => {
  const parts = relative(ROOT, file).split(sep)
  const i = parts.lastIndexOf('produkty')
  return i >= 0 && parts.length > i + 2
    ? parts[i + 1]
    : parts.at(-1).replace(PHOTO, '').replace(/^p-/, '')
}

async function main() {
  const rows = []
  const all = SOURCES.flatMap((source) => files(join(ROOT, source)))
  for (const file of all) {
    try {
      const { data, info } = await sharp(file)
        .resize({ width: 256, withoutEnlargement: true })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      const found = classify({ data, width: info.width, height: info.height })
      if (found)
        rows.push({ slug: slugOf(file), file: relative(ROOT, file).split(sep).join('/'), ...found })
    } catch {
      // No error text: sharp names the absolute path (no absolute paths in docs).
      rows.push({
        slug: slugOf(file),
        file: relative(ROOT, file).split(sep).join('/'),
        problem: 'nie da się odczytać',
        share: 1,
      })
    }
  }
  rows.sort(
    (a, b) =>
      Number(FIRST.test(b.file)) - Number(FIRST.test(a.file)) ||
      a.problem.localeCompare(b.problem) ||
      a.slug.localeCompare(b.slug),
  )
  const table = [
    '| slug | plik | problem |',
    '|---|---|---|',
    ...rows.map(
      (row) =>
        `| ${row.slug} | \`${row.file}\` | ${row.problem} (${Math.round(row.share * 100)}%) |`,
    ),
  ].join('\n')
  if (process.argv.includes('--stdout')) {
    console.log(table)
  } else {
    const out = join(ROOT, 'docs', 'zadania', 'zdjecia-do-wyciecia.md')
    writeFileSync(
      out,
      `# Zdjęcia kart do ponownego wycięcia\n\n` +
        `Wygenerowane: \`node scripts/zdjecia-tlo.mjs\` (NAPRAWA-0911 §3b, audyt stagingu 09.11). ` +
        `Sprawdzono ${all.length} zdjęć z paczek seeda; na liście ${rows.length}.\n\n` +
        `- **białe tło** — brzeg zdjęcia nieprzezroczysty i prawie biały (produkt na białym prostokącie). Od NAPRAWA-0911 karty stoją na białej płycie, więc to już nie razi, ale przezroczyste zdjęcie wygląda lepiej w hero i galerii.\n` +
        `- **otoczka** — tło przezroczyste, ale kontur produktu w większości bardzo jasny: biały „obłok” po wycinaniu. Do poprawy w pierwszej kolejności.\n\n` +
        `Poprawka: ponowne wycięcie do przezroczystego WebP/PNG (Krystian) albo zdjęcie producenta z przezroczystością — ten sam plik w paczce, potem \`pnpm seed:biznes\` i import na staging. Na górze zdjęcia ze zrzutów z audytu (Sunmi D3 PRO, PolCard).\n\n` +
        `To lista do przejrzenia, nie do ślepej poprawki: czysto wycięty biały produkt (drukarka, terminal) też ma jasny kontur i trafia do „otoczki”.

` +
        `${table}\n`,
    )
    console.log(`docs/zadania/zdjecia-do-wyciecia.md: ${rows.length} z ${all.length} zdjęć`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
