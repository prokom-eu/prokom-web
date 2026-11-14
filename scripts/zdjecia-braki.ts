/**
 * Photos of every ready Biznes card, as they are in the database (PRODUKCJA-BIZNES-1211 §1,
 * sesja 2): how many, how wide the original is, white background or transparent — and which
 * cards to get photos for first (home → brand salons → bundles → the rest).
 *   pnpm payload run scripts/zdjecia-braki.ts            → docs/zadania/zdjecia-do-pozyskania.md
 *   pnpm payload run scripts/zdjecia-braki.ts --stdout   → the table only
 * Needs the local database after `pnpm seed` and the media folder (`MEDIA_DIR`). `sharp` is a
 * dependency of Payload already; the background test is `classify` of `zdjecia-tlo.mjs`.
 */
import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'
import sharp from 'sharp'

import k3Media from '../seed/prokombiznes/k3/media-k3.json'
import config from '../src/payload.config'
import { getEnv } from '../src/lib/env'
import { classify } from './zdjecia-tlo.mjs'

/** Target of a card ready for production (Część I §1): 3 shots, 1200 px wide. */
export const MIN_PHOTOS = 3
export const MIN_WIDTH = 1200

type Row = {
  slug: string
  name: string
  where: 'główna' | 'salon' | 'zestaw' | 'reszta'
  photos: number
  narrow: number
  background: string
  sources: string
}

const ORDER = { główna: 0, salon: 1, zestaw: 2, reszta: 3 } as const

/** Shops, not producers: galleries from them are to be replaced with producer files (14.11). */
const SHOP_HOSTS = ['delkom.pl', 'vidis.pl', 'sharp24.pl']

/**
 * Cards that show the licence tile until a producer graphic comes (audit 14.11 P1-1) and the
 * brands whose photos need a person (blocked pages, carousels, banners — STAN 13.11).
 */
const BY_HAND = `## Ręcznie (audyt 14.11)

**Kafel licencji zamiast zdjęcia** — grafika planu z materiałów producenta (≥ 1200 px, bez samego logo), potem \`zdjecia_premium\` w \`seed/prokombiznes/k4/katalog-k4.json\` i usunięcie \`zdjecia_brak\`:
- Microsoft 365: \`microsoft-365-business\`, \`m365-business-basic\`, \`m365-business-standard\`, \`m365-business-premium\`, \`m365-apps-for-business\` — microsoft.com/pl-pl (dawne pliki były z delkom.pl, a „Microsoft 365 Basic” to plan domowy);
- ESET: \`eset-small-business-security\` — eset.com/pl (pudełko lub grafika pakietu);
- Adobe: \`adobe-acrobat-pro-teams\` — adobe.com (dawne pliki 173 i 389 px z delkom.pl).

**Pobranie wymaga człowieka** (press kit / konto partnera): Brother (403), Dell (blokada botów), HP (karuzela innych modeli), COMEX (jedno ujęcie), PolCard (banery z ceną), Logitech, Fellowes. Karty z głównej, salonów i zestawów — min. 2 ujęcia.
`

const payload = await getPayload({ config })
try {
  const tenant = (
    await payload.find({
      collection: 'tenants',
      where: { slug: { equals: 'biznes' } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  if (!tenant) throw new Error('Brak tenanta „biznes” — najpierw pnpm seed.')

  /** Product slugs named anywhere in a document populated one level deep. */
  const productSlugs = (value: unknown, found = new Set<string>()): Set<string> => {
    if (Array.isArray(value)) value.forEach((item) => productSlugs(item, found))
    else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (typeof record.slug === 'string' && 'kind' in record && 'categories' in record)
        found.add(record.slug)
      else Object.values(record).forEach((item) => productSlugs(item, found))
    }
    return found
  }
  const inTenant = { tenant: { equals: tenant.id } }
  const showrooms = await payload.find({
    collection: 'showrooms',
    where: inTenant,
    limit: 100,
    depth: 1,
  })
  const bundles = await payload.find({
    collection: 'bundles',
    where: inTenant,
    limit: 200,
    depth: 1,
  })
  const inSalons = productSlugs(showrooms.docs)
  const inBundles = productSlugs(bundles.docs)

  const products = await payload.find({
    collection: 'products',
    where: { and: [inTenant, { contentStatus: { equals: 'ready' } }] },
    limit: 1000,
    depth: 1,
  })
  const mediaDir = path.resolve(getEnv().MEDIA_DIR, 'media')
  const rows: Row[] = []
  for (const product of products.docs) {
    const images = (product.images ?? []).filter(
      (image): image is Exclude<typeof image, number> => typeof image === 'object' && !!image,
    )
    let narrow = 0
    const problems = new Set<string>()
    for (const image of images) {
      if ((image.width ?? 0) < MIN_WIDTH) narrow++
      const file = image.filename ? path.join(mediaDir, image.filename) : null
      if (file && existsSync(file)) {
        const { data, info } = await sharp(file)
          .resize({ width: 256, withoutEnlargement: true })
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true })
        const result = classify({ data, width: info.width, height: info.height })
        if (result) problems.add(result.problem)
      }
    }
    const sources = [
      ...(product.sources?.productPages ?? []),
      ...(product.sources?.datasheets ?? []),
    ]
    rows.push({
      slug: product.slug,
      name: product.name,
      where: product.featured
        ? 'główna'
        : inSalons.has(product.slug)
          ? 'salon'
          : inBundles.has(product.slug)
            ? 'zestaw'
            : 'reszta',
      photos: images.length,
      narrow,
      background: [...problems].join(', ') || 'ok',
      // The producer's page: where to look for the press kit / media.
      sources: sources[0] ?? '',
    })
  }
  const missing = rows
    .filter((row) => row.photos < MIN_PHOTOS || row.narrow > 0 || row.background !== 'ok')
    .sort(
      (a, b) =>
        ORDER[a.where] - ORDER[b.where] || a.photos - b.photos || a.slug.localeCompare(b.slug),
    )
  const count = (test: (row: Row) => boolean) => rows.filter(test).length
  const table = [
    '| # | slug | gdzie | jest | brakuje | < 1200 px | tło | materiały producenta | uwagi |',
    '|---|---|---|---|---|---|---|---|---|',
    ...missing.map(
      (row, i) =>
        `| ${i + 1} | \`${row.slug}\` | ${row.where} | ${row.photos} | ${Math.max(0, MIN_PHOTOS - row.photos)} | ${row.narrow} | ${row.background} | ${row.sources ? `[strona](${row.sources})` : '—'} | |`,
    ),
  ].join('\n')
  if (process.argv.includes('--stdout')) {
    process.stdout.write(`${table}\n`)
  } else {
    const doc = `# Zdjęcia do pozyskania — karty Biznesu (PRODUKCJA-BIZNES-1211 §1)

Wygenerowane przez \`pnpm payload run scripts/zdjecia-braki.ts\` z lokalnej bazy po \`pnpm seed\` (${new Date().toISOString().slice(0, 10)}). Nie edytuj ręcznie — uruchom skrypt ponownie. Cel karty gotowej do produkcji: **≥ ${MIN_PHOTOS} ujęcia** (przód, bok/porty, detal lub w użyciu bez ludzi), **≥ ${MIN_WIDTH} px** szerokości, wycięte albo czyste białe tło, źródło każdego pliku w \`seed/prokombiznes/media-produkty-v2.json\` (zgoda szefa na materiały producentów: 12.11.2026).

**Stan:** gotowych kart ${rows.length} · bez zdjęcia ${count((row) => row.photos === 0)} · 1 zdjęcie ${count((row) => row.photos === 1)} · 2 zdjęcia ${count((row) => row.photos === 2)} · ≥ 3 zdjęcia ${count((row) => row.photos >= MIN_PHOTOS)} · z plikiem < ${MIN_WIDTH} px ${count((row) => row.narrow > 0)} · z białym tłem lub otoczką ${count((row) => row.background !== 'ok')}.

Kolejność: karty z głównej → salonów marek → zestawów → reszta; w grupie najpierw te z najmniejszą liczbą zdjęć. Kolumna „materiały producenta” to pierwsze źródło karty — tam szukamy sekcji media / press kit. Usługi (karty bez zdjęcia — kafel usługi) są na liście, ale nie potrzebują zdjęć producenta.

${table}

${BY_HAND}
${shopGalleries()}
`
    writeFileSync(path.join('docs', 'zadania', 'zdjecia-do-pozyskania.md'), doc)
    payload.logger.info(
      `zdjecia-do-pozyskania.md: ${missing.length} kart z brakami z ${rows.length}`,
    )
  }
} finally {
  await payload.destroy()
}

/** K3 galleries whose files come from a shop, not the producer (`media-k3.json`). */
function shopGalleries(): string {
  const rows = Object.entries(k3Media.zdjecia as Record<string, { zrodlo_domeny?: string[] }>)
    .filter(([, entry]) =>
      (entry.zrodlo_domeny ?? []).some((url) => SHOP_HOSTS.some((host) => url.includes(host))),
    )
    .map(([slug, entry]) => `- \`${slug}\` — ${(entry.zrodlo_domeny ?? []).join(', ')}`)
  const title = `**Zdjęcia ze sklepów, nie od producenta** — do wymiany na pliki producenta (${rows.length} galerii K3):`
  return [title, ...rows, ''].join('\n')
}
