import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import path from 'path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import katalog from '../../../seed/prokombiznes/katalog.json'
import media from '../../../seed/prokombiznes/media.json'
import gallery from '../../../seed/prokombiznes/media-produkty-v2.json'
import k4Catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import { cardImageKeys, imageKeyFile } from './cardGallery'
import { matchCards } from './k3'
import { k4NewCards, type K4Card } from './k4Catalog'
import { loadK31Catalog } from './k31Data'
import type { SeedCatalog } from './map'

/**
 * Main photo of every ready card as `pnpm seed` imports it (audit 14.11 P1-1): never a brand
 * logo, never the photo of another product, at least 400 px wide — or no photo at all and the
 * service / licence tile (`fallbackTile`).
 */

const MIN_WIDTH = 400

/**
 * Producer photos narrower than 400 px, kept until a bigger file comes (the hand list
 * `docs/zadania/zdjecia-do-pozyskania.md`). The list only shrinks: a card whose photo got
 * bigger must leave it.
 */
const SMALL_PHOTOS: Record<string, string> = {
  'dibal-vc-pvc-ps-wagi-kontrolne': 'Dibal — większy plik do pozyskania',
  'elzab-drukarka-stacji-paliw-df-6-online': 'Elzab — większy plik do pozyskania',
  'elzab-kw3': 'Elzab — większy plik do pozyskania',
  jota: 'Elzab Jota — większy plik do pozyskania',
  'eset-pakiet-advanced': 'pudełko ESET PROTECT z materiałów ESET (375 px)',
  'eset-pakiet-complete': 'pudełko ESET PROTECT z materiałów ESET (375 px)',
  'eset-pakiet-elite': 'pudełko ESET PROTECT z materiałów ESET (375 px)',
  'eset-pakiet-entry': 'pudełko ESET PROTECT z materiałów ESET (375 px)',
  'kobra-1-cc4-es': 'kobra.com — największy plik na stronie modelu',
  'kobra-2-cc2-es': 'kobra.com — największy plik na stronie modelu',
  'kobra-240-1-c2-es': 'kobra.com — największy plik na stronie modelu',
  'kobra-240-c4-turbo-es': 'kobra.com — największy plik na stronie modelu',
  'kobra-3-cc4-es': 'kobra.com — największy plik na stronie modelu',
  'kobra-300-1-c4-es': 'kobra.com — największy plik na stronie modelu',
  'kobra-af-1-40': 'kobra.com — największy plik na stronie modelu',
  'kyocera-ecosys-m8124cidn-m8130cidn': 'Kyocera — większy plik do pozyskania',
  'microsoft-windows-server-cal': 'grafika Microsoft — większy plik do pozyskania',
  'optivendi-kawomat': 'Optivendi — największy plik na stronie producenta',
  'optivendi-ksiazkomat': 'Optivendi — największy plik na stronie producenta',
  'optivendi-lodomat': 'Optivendi — największy plik na stronie producenta',
  'optivendi-push': 'Optivendi — największy plik na stronie producenta',
  'optivendi-smartvend-49': 'Optivendi — największy plik na stronie producenta',
  'sato-metkownice-judo-kendo': 'SATO — większy plik do pozyskania',
  t2s: 'Sunmi T2s Lite — większy plik do pozyskania',
  'zebra-drukarka-biurkowa-zd230': 'Zebra — większy plik do pozyskania',
  'zebra-drukarka-etykiet-zd421': 'Zebra — większy plik do pozyskania',
  'zebra-ds2208-ds2278': 'Zebra — większy plik do pozyskania',
}

/** Cards sharing a main photo on purpose: one family or the same housing seen from the front. */
const SAME_PHOTO: Record<string, string> = {
  'eurocert-ecsigner eurocert-ecsigner-online': 'ten sam program — wersja online',
  'gopos gopos-all-in-one': 'rodzina GoPOS i jej pakiet',
  'kobra-2-cc2-es kobra-3-cc4-es': 'ten sam korpus z przodu (kobra.com)',
  'lenovo-thinkbook-14-g8-g9 lenovo-thinkbook-16-g8-g9': 'ten sam wygląd, inna przekątna',
  'pol polcard-move-2500': 'rodzina terminali PolCard i jej model',
  'u7 u7max': 'ten sam korpus z przodu (UniFi)',
  'posnet-thermal-xl2-a-online posnet-thermal-xl2-b-online xl2': 'rodzina XL2 i jej wersje A/B',
}

/** Cards without a photo the audit named: they show the licence tile now. */
const LICENCE_TILES = [
  'adobe-acrobat-pro-teams',
  'eset-small-business-security',
  'm365-apps-for-business',
  'm365-business-basic',
  'm365-business-premium',
  'm365-business-standard',
  'microsoft-365-business',
]

/** Kinds that have a tile in place of a photo (`fallbackTile`): a service, a licence, own brand. */
const TILE_KINDS = new Set(['Usługi', 'Oprogramowanie'])

const k4Cards = new Map(
  (k4Catalog as unknown as { produkty: K4Card[] }).produkty.map((card) => [card.slug_seed, card]),
)
const { catalog: k31, gallery: k3Gallery } = loadK31Catalog()
const cards = [...k31.cards, ...k4NewCards([...k4Cards.values()], k31.cards)]
const matches = matchCards(k31.cards, (katalog as SeedCatalog).produkty)
const v2Owner = new Map(gallery.pliki.map((file) => [file.plik, file.produkt]))

const ready = cards.flatMap((card) => {
  const k4 = k4Cards.get(card.slug_seed)
  if (k4?.status !== 'gotowe') return []
  const v2 = matches.get(card.slug_seed)
  const keys = cardImageKeys(card, k4, k3Gallery, v2, media.pliki, null)
  return [{ slug: card.slug_seed, k4, v2: v2?.slug, main: keys[0] }]
})

describe('main photo of a ready card (audit 14.11 P1-1)', () => {
  it('a card without a photo has a tile: a service, a licence or the own brand', () => {
    const bare = ready.filter(
      (card) => !card.main && !TILE_KINDS.has(card.k4.rodzaj) && card.k4.marka !== 'PRO-KOM',
    )
    expect(bare.map((card) => card.slug)).toEqual([])
    const tiles = ready.filter((card) => LICENCE_TILES.includes(card.slug))
    expect(tiles.map((card) => [card.slug, card.main ?? null]).sort()).toEqual(
      LICENCE_TILES.map((slug) => [slug, null]),
    )
  })

  it('is never a brand logo', () => {
    const logos = ready.filter(
      (card) => card.main && /(^|[/:])(logo-|marki\/)/.test(imageKeyFile(card.main)),
    )
    expect(logos.map((card) => card.slug)).toEqual([])
  })

  it('a katalog v2 file belongs to the card’s own v2 product', () => {
    const foreign = ready.flatMap((card) => {
      const owner = card.main ? v2Owner.get(card.main) : undefined
      return owner && owner !== card.v2 ? [`${card.slug} ← ${owner}`] : []
    })
    expect(foreign).toEqual([])
  })

  it('is not the main photo of another card, except the listed families', () => {
    const byContent = new Map<string, string[]>()
    for (const card of ready) {
      if (!card.main) continue
      const hash = createHash('sha1')
        .update(readFileSync(path.resolve(imageKeyFile(card.main))))
        .digest('hex')
      byContent.set(hash, [...(byContent.get(hash) ?? []), card.slug])
    }
    const shared = [...byContent.values()]
      .filter((slugs) => slugs.length > 1)
      .map((slugs) => slugs.sort().join(' '))
    expect(shared.filter((group) => !(group in SAME_PHOTO))).toEqual([])
    expect(Object.keys(SAME_PHOTO).filter((group) => !shared.includes(group))).toEqual([])
  })

  it(`is at least ${MIN_WIDTH} px wide, except the listed producer files (the list only shrinks)`, async () => {
    const widths = await Promise.all(
      ready
        .filter((card) => card.main)
        .map(async (card) => {
          const meta = await sharp(path.resolve(imageKeyFile(card.main!))).metadata()
          return [card.slug, meta.width ?? 0] as const
        }),
    )
    const small = widths.filter(([, width]) => width < MIN_WIDTH).map(([slug]) => slug)
    expect(small.filter((slug) => !(slug in SMALL_PHOTOS))).toEqual([])
    expect(Object.keys(SMALL_PHOTOS).filter((slug) => !small.includes(slug))).toEqual([])
  })
})
