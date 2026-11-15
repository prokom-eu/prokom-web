import type { Payload } from 'payload'

import { SEED_CONTEXT } from '../config'

type Rule = { from: string; to: string }

/** Old addresses that live on as hub pages (no rule for them — the page answers). */
export const PROKOM_HUB_PAGES = ['/', '/kontakt', '/polityka-prywatnosci'] as const

/**
 * 301 redirects from the old pro-kom.eu to the new hub (spec §4, ADR-H001 pkt 8, ADR-006). The
 * mechanism is the shared one: `Redirects` per tenant, applied by `proxy.ts` before the pages.
 *
 * Covers every address of the old site's sitemap (15.11.2026, 46 addresses; `OLD_SITEMAP_PATHS`
 * in the test) and the older Joomla addresses from the Web Archive (2013–2023, `JOOMLA_PATHS` in
 * the test): every one points straight at its counterpart on a line site or the hub — one hop,
 * no chains. Individual products of the Joomla shop (`/produkty/muzyczne/<model>`, 175 pages,
 * gone since ~2021) get no rule on purpose: a 404 is honest, a redirect to an unrelated page is
 * a soft 404 for Google anyway. Targets on line sites checked live on 15.11 (all 200);
 * Tech (prokomserwis.pl) — to re-check after its switch on 29.11 (TODO(krystian)).
 */
const BASE: readonly Rule[] = [
  // Firma i strony ogólne
  { from: '/firma', to: '/o-firmie' },
  { from: '/kariera', to: '/o-firmie' },
  { from: '/realizacje', to: '/' },
  { from: '/regulamin-sklepu', to: '/' },
  { from: '/zdalna-pomoc', to: 'https://get.teamviewer.com/pro-kom' },
  { from: '/e-faktura', to: 'https://prokombiznes.pl/ksef' },
  { from: '/tworzenie-stron-internetowych', to: 'https://prokomsoftware.pl/' },
  // Sprzedaż dla firm → Biznes
  { from: '/produkt/reseller/kasy-fiskalne', to: 'https://prokombiznes.pl/oferta/kasy-fiskalne' },
  { from: '/produkt/reseller/komputery', to: 'https://prokombiznes.pl/oferta/komputery' },
  { from: '/produkt/reseller/telefony', to: 'https://prokombiznes.pl/oferta/telefony' },
  { from: '/produkt/reseller/audio', to: 'https://prokombiznes.pl/agd-rtv-dla-firm' },
  { from: '/produkt/reseller/elektronika', to: 'https://prokombiznes.pl/agd-rtv-dla-firm' },
  { from: '/produkt/reseller/rtv-sat', to: 'https://prokominstalacje.pl/anteny' },
  { from: '/produkt/systemy-erp', to: 'https://prokombiznes.pl/oferta/programy-sprzedazowe-erp' },
  { from: '/produkt/systemy-erp/comarch', to: 'https://prokombiznes.pl/marki/comarch' },
  { from: '/produkt/systemy-erp/gastro', to: 'https://prokombiznes.pl/gopos' },
  { from: '/produkt/systemy-erp/insert', to: 'https://prokombiznes.pl/insert' },
  { from: '/produkt/systemy-erp/insoft', to: 'https://prokombiznes.pl/marki/insoft' },
  { from: '/produkt/backup-storage/qnap', to: 'https://prokombiznes.pl/marki/nas' },
  { from: '/produkt/backup-storage/synology', to: 'https://prokombiznes.pl/marki/nas' },
  {
    from: '/produkt/backup-storage/storagecraft',
    to: 'https://prokombiznes.pl/oferta/serwery-nas-ups',
  },
  {
    from: '/produkt/utm-ochrona-brzegowa/barracuda',
    to: 'https://prokombiznes.pl/oferta/antywirus-firewall',
  },
  { from: '/produkt/utm-ochrona-brzegowa/eset', to: 'https://prokombiznes.pl/marki/eset' },
  {
    from: '/produkt/utm-ochrona-brzegowa/progetmdm',
    to: 'https://prokombiznes.pl/oferta/antywirus-firewall',
  },
  {
    from: '/produkt/utm-ochrona-brzegowa/stormshield',
    to: 'https://prokombiznes.pl/marki/stormshield',
  },
  { from: '/produkt/partnerstwo/brother', to: 'https://prokombiznes.pl/marki/brother' },
  { from: '/produkt/partnerstwo/zebra', to: 'https://prokombiznes.pl/marki/zebra' },
  { from: '/produkt/partnerstwo/alsen', to: '/o-firmie' },
  { from: '/produkt/partnerstwo/komputronik', to: '/o-firmie' },
  { from: '/uslugi/opieka-techniczna', to: 'https://prokombiznes.pl/opieka-it' },
  { from: '/uslugi/opieka-techniczna/audyty', to: 'https://prokombiznes.pl/opieka-it' },
  { from: '/uslugi/opieka-techniczna/doradztwo', to: 'https://prokombiznes.pl/opieka-it' },
  { from: '/uslugi/opieka-techniczna/outsourcing-it', to: 'https://prokombiznes.pl/opieka-it' },
  // Montaż → Instalacje
  { from: '/uslugi/montaz-instalacje', to: 'https://prokominstalacje.pl/uslugi' },
  {
    from: '/uslugi/montaz-instalacje/inteligentny-dom',
    to: 'https://prokominstalacje.pl/smart-home',
  },
  { from: '/uslugi/montaz-instalacje/monitoring', to: 'https://prokominstalacje.pl/monitoring' },
  { from: '/uslugi/montaz-instalacje/multimedialne', to: 'https://prokominstalacje.pl/ekrany' },
  {
    from: '/uslugi/montaz-instalacje/naglosnieniowe',
    to: 'https://prokominstalacje.pl/naglosnienie',
  },
  {
    from: '/uslugi/montaz-instalacje/sieci-strukturalnych',
    to: 'https://prokominstalacje.pl/sieci-wifi',
  },
  {
    from: '/uslugi/montaz-instalacje/telewizyjne-i-satelitarne',
    to: 'https://prokominstalacje.pl/anteny',
  },
  // Serwis → Tech
  { from: '/uslugi/serwis', to: 'https://prokomserwis.pl/' },
  {
    from: '/uslugi/serwis/serwis-komputero-notebookow',
    to: 'https://prokomserwis.pl/serwis-laptopow',
  },
  {
    from: '/uslugi/serwis/serwis-telefonow-tabletow',
    to: 'https://prokomserwis.pl/serwis-telefonow',
  },
  // Starsze adresy Joomli (Web Archive 2013–2023), których nie ma w mapie obecnej strony
  { from: '/serwis', to: 'https://prokomserwis.pl/' },
  { from: '/naprawy-sprzetow', to: 'https://prokomserwis.pl/' },
  { from: '/opieka-techniczna', to: 'https://prokombiznes.pl/opieka-it' },
  { from: '/instalacje-konfiguracja', to: 'https://prokominstalacje.pl/uslugi' },
  { from: '/cart', to: '/' },
  { from: '/uslugi', to: '/linie' },
  { from: '/uslugi/obsluga-muzyczna-dj', to: 'https://prokominstalacje.pl/naglosnienie' },
  { from: '/uslugi/technologia-nc', to: '/linie' },
  { from: '/uslugi/technologia-nc/internet', to: '/linie' },
  { from: '/uslugi/technologia-nc/telefon', to: '/linie' },
  { from: '/uslugi/technologia-nc/telewizja', to: 'https://prokominstalacje.pl/anteny' },
  { from: '/produkty', to: '/linie' },
  { from: '/produkty/muzyczne', to: 'https://prokominstalacje.pl/naglosnienie' },
  { from: '/produkty/telefony', to: 'https://prokomserwis.pl/akcesoria' },
]

/**
 * Joomla served every page also under `/index.php/…` (Google and old links still have those);
 * the old site redirected them to the bare path. Here each one goes straight to the final target.
 */
const JOOMLA_INDEX: readonly Rule[] = [
  { from: '/index.php', to: '/' },
  ...PROKOM_HUB_PAGES.filter((page) => page !== '/').map((page) => ({
    from: `/index.php${page}`,
    to: page,
  })),
  ...BASE.map(({ from, to }) => ({ from: `/index.php${from}`, to })),
]

export const PROKOM_REDIRECTS: readonly Rule[] = [...BASE, ...JOOMLA_INDEX]

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void

/** A rule by its source; one changed in the panel stays (the panel wins after the first import). */
export async function seedProkomRedirects(payload: Payload, tenantId: number, count: Count) {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  for (const { from, to } of PROKOM_REDIRECTS) {
    const { totalDocs } = await payload.count({
      collection: 'redirects',
      where: { and: [{ tenant: { equals: tenantId } }, { from: { equals: from } }] },
      overrideAccess: true,
    })
    if (totalDocs > 0) {
      count('redirects', 'skipped')
      continue
    }
    await payload.create({
      collection: 'redirects',
      data: { from, to, tenant: tenantId },
      ...local,
    })
    count('redirects', 'created')
  }
}
