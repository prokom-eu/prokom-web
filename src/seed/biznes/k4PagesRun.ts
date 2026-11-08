import type { Payload } from 'payload'

import file from '../../../seed/prokombiznes/k4/strony-k4.json'
import {
  aboutK4Layout,
  contactK4Layout,
  goposK4Layout,
  insertK4Layout,
  ksefK4Layout,
  opiekaK4Layout,
  ulgaK4Layout,
  vendingK4Layout,
  type K4FirmaFile,
  type K4PagesFile,
  type K4VendingFile,
  type MediaOf,
  type SlugOf,
  upgradeCareIcons,
  upgradeGoposPhotos,
} from './k4Pages'
import { upsertK4Page, type PageBlock } from './page'

type Report = (name: string, changed: boolean) => void
type Note = (what: string, item: string) => void

const pages = file as unknown as K4PagesFile
/** The K4 pages package, typed: the seed also uploads the photos it names (`run.ts`). */
export const k4PagesFile = pages
const firma = file as unknown as K4FirmaFile
const vending = file as unknown as K4VendingFile

/** The K4 subpages with their title, SEO description and layout (descriptions tested). */
export function k4PageSeeds(slugOf: SlugOf, mediaOf?: MediaOf) {
  return [
    {
      slug: 'gopos',
      title: 'GoPOS',
      description:
        'GoPOS dla gastronomii z wdrożeniem w lokalu: sala, kuchnia i dowozy w jednym systemie. Autoryzowany partner GoPOS z Rabki-Zdroju.',
      replaces: [
        'GoPOS dla gastronomii z PRO-KOM: sprzęt, menu, fiskalizacja, szkolenie w lokalu i serwis w sezonie z Rabki. Sala, kuchnia i dowozy w jednym systemie.',
      ],
      built: goposK4Layout(pages, slugOf, mediaOf),
    },
    {
      slug: 'insert',
      title: 'InsERT',
      description:
        'Subiekt, Rachmistrz i Rewizor z wdrożeniem i KSeF. Dobór programu InsERT, przeniesienie danych i szkolenie — autoryzowany partner z Rabki.',
      replaces: [
        'Subiekt i programy InsERT z PRO-KOM: dobór programu, instalacja, przeniesienie danych, połączenie z kasą, KSeF i szkolenie na Twoich dokumentach.',
      ],
      built: insertK4Layout(pages, slugOf),
    },
    {
      slug: 'opieka-it',
      title: 'Opieka IT',
      // No „abonament” at Opieka IT (K4-FINAL §1) — the B9 description had it.
      description:
        'Opieka IT dla firm: komputery, serwer, sieć, kopie, poczta, kasy i POS pod jedną opieką, z czasem reakcji w umowie. Bezpłatny przegląd IT.',
      built: opiekaK4Layout(firma, slugOf),
    },
    {
      slug: 'o-firmie',
      title: 'O firmie',
      description:
        'PRO-KOM Tadeusz Wójciak z Rabki-Zdroju: od 2004 kasy, POS, programy i opieka IT dla firm z Podhala. Zasady, linie PRO-KOM, marki i dojazd.',
      built: aboutK4Layout(firma),
    },
    {
      slug: 'kontakt',
      title: 'Kontakt',
      description:
        'Kontakt z PRO-KOM w Rabce-Zdroju: telefon, WhatsApp, e-mail i formularz. Oddzwaniamy w ciągu 60 minut w godzinach pracy. Dojazd na całe Podhale.',
      built: contactK4Layout(firma),
    },
    // K4j: new pages (D-K4-7), no older seed.
    {
      slug: 'automaty-vendingowe',
      title: 'Automaty vendingowe',
      description:
        'Automaty vendingowe Optivendi z PRO-KOM: dobór maszyny do produktu i miejsca, płatności kartą i BLIK, zarządzanie z telefonu. Oferta na piśmie.',
      built: vendingK4Layout(vending, slugOf),
    },
    {
      slug: 'ksef',
      title: 'KSeF 2027 — co musi zrobić firma',
      description:
        'KSeF bez wyjątków od 1 stycznia 2027: kogo dotyczy, 6 kroków do gotowości, kary z art. 106ni. Program, uprawnienia i certyfikat z PRO-KOM z Rabki.',
      built: ksefK4Layout(slugOf),
    },
    {
      slug: 'ulga-na-kase-fiskalna',
      title: 'Ulga na kasę fiskalną',
      description:
        'Ulga na kasę fiskalną: 90% ceny netto, do 700 zł na kasę online zgłoszoną na start. Kto może skorzystać, kiedy trzeba oddać ulgę. Rozlicza księgowa.',
      built: ulgaK4Layout(slugOf),
    },
  ]
}

/**
 * K4 subpages (K4hij) from `strony-k4.json`. A page without K4 sections was edited in the
 * panel: it stays and goes to the report, like board ids the database does not know.
 */
export async function seedBiznesK4Pages(
  payload: Payload,
  tenantId: number,
  slugOf: SlugOf,
  report: Report,
  note: Note,
  mediaOf?: MediaOf,
): Promise<void> {
  for (const { slug, title, description, replaces, built } of k4PageSeeds(slugOf, mediaOf)) {
    for (const id of built.missing) note('strona K4: produkt spoza bazy', `${slug}: ${id}`)
    const done = await upsertK4Page(
      payload,
      tenantId,
      {
        slug,
        title,
        description,
        replaces,
        layout: built.layout,
      },
      report,
    )
    if (!done) note('strona K4 edytowana w panelu — bez zmian', slug)
    if (done && slug === 'gopos') await upgradeStoredGopos(payload, tenantId, built.layout, report)
    if (done && slug === 'opieka-it') {
      await upgradeStoredPage(payload, tenantId, slug, upgradeCareIcons, built.layout, report)
    }
  }
}

const SEED_LOCAL = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** D13: the area icons of `/opieka-it` on a page the seed created before (`upgradeCareIcons`). */
async function upgradeStoredPage(
  payload: Payload,
  tenantId: number,
  slug: string,
  upgrade: (stored: PageBlock[], seed: PageBlock[]) => PageBlock[] | null,
  seed: PageBlock[],
  report: Report,
): Promise<void> {
  const {
    docs: [page],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
    limit: 1,
    ...SEED_LOCAL,
  })
  const layout = page && upgrade(page.layout ?? [], seed)
  report(`pages ${slug} icons`, Boolean(layout))
  if (!page || !layout) return
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { layout, _status: page._status ?? 'published' },
    ...SEED_LOCAL,
  })
}

/** POPRAWKI-0311: the GoPOS photos on a page the seed created before (`upgradeGoposPhotos`). */
async function upgradeStoredGopos(
  payload: Payload,
  tenantId: number,
  seed: PageBlock[],
  report: Report,
): Promise<void> {
  const {
    docs: [page],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: 'gopos' } }] },
    limit: 1,
    ...SEED_LOCAL,
  })
  const layout = page && upgradeGoposPhotos(page.layout ?? [], seed)
  report('pages gopos photos', Boolean(layout))
  if (!page || !layout) return
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { layout, _status: page._status ?? 'published' },
    ...SEED_LOCAL,
  })
}
