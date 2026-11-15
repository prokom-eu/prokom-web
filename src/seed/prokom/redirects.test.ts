import { describe, expect, it } from 'vitest'

import {
  buildRedirectMap,
  isValidRedirectTarget,
  normalizeRedirectPath,
} from '@/lib/redirects/rules'

import { PROKOM_REDIRECTS } from './redirects'

/** Every address of the old pro-kom.eu sitemap (https://pro-kom.eu/sitemap.xml, 15.11.2026). */
const OLD_SITEMAP_PATHS = [
  '/',
  '/e-faktura',
  '/firma',
  '/kariera',
  '/kontakt',
  '/polityka-prywatnosci',
  '/produkt/backup-storage/qnap',
  '/produkt/backup-storage/storagecraft',
  '/produkt/backup-storage/synology',
  '/produkt/partnerstwo/alsen',
  '/produkt/partnerstwo/brother',
  '/produkt/partnerstwo/komputronik',
  '/produkt/partnerstwo/zebra',
  '/produkt/reseller/audio',
  '/produkt/reseller/elektronika',
  '/produkt/reseller/kasy-fiskalne',
  '/produkt/reseller/komputery',
  '/produkt/reseller/rtv-sat',
  '/produkt/reseller/telefony',
  '/produkt/systemy-erp',
  '/produkt/systemy-erp/comarch',
  '/produkt/systemy-erp/gastro',
  '/produkt/systemy-erp/insert',
  '/produkt/systemy-erp/insoft',
  '/produkt/utm-ochrona-brzegowa/barracuda',
  '/produkt/utm-ochrona-brzegowa/eset',
  '/produkt/utm-ochrona-brzegowa/progetmdm',
  '/produkt/utm-ochrona-brzegowa/stormshield',
  '/realizacje',
  '/regulamin-sklepu',
  '/tworzenie-stron-internetowych',
  '/uslugi/montaz-instalacje',
  '/uslugi/montaz-instalacje/inteligentny-dom',
  '/uslugi/montaz-instalacje/monitoring',
  '/uslugi/montaz-instalacje/multimedialne',
  '/uslugi/montaz-instalacje/naglosnieniowe',
  '/uslugi/montaz-instalacje/sieci-strukturalnych',
  '/uslugi/montaz-instalacje/telewizyjne-i-satelitarne',
  '/uslugi/opieka-techniczna',
  '/uslugi/opieka-techniczna/audyty',
  '/uslugi/opieka-techniczna/doradztwo',
  '/uslugi/opieka-techniczna/outsourcing-it',
  '/uslugi/serwis',
  '/uslugi/serwis/serwis-komputero-notebookow',
  '/uslugi/serwis/serwis-telefonow-tabletow',
  '/zdalna-pomoc',
]

/** Old addresses that live on as hub pages (no rule — the page answers). */
const HUB_PAGES = new Set(['/', '/kontakt', '/polityka-prywatnosci'])

describe('PROKOM_REDIRECTS', () => {
  it('gives every old sitemap address a target or a hub page', () => {
    const map = buildRedirectMap(PROKOM_REDIRECTS)
    const missing = OLD_SITEMAP_PATHS.filter((path) => !HUB_PAGES.has(path) && !map.has(path))
    expect(missing).toEqual([])
    expect(map.size).toBe(PROKOM_REDIRECTS.length)
  })

  it('keeps sources normalized, unique and away from hub pages', () => {
    const sources = PROKOM_REDIRECTS.map((rule) => rule.from)
    expect(sources.map((from) => normalizeRedirectPath(from))).toEqual(sources)
    expect(new Set(sources).size).toBe(sources.length)
    expect(sources.filter((from) => HUB_PAGES.has(from))).toEqual([])
  })

  it('points at valid targets without chains', () => {
    const sources = new Set(PROKOM_REDIRECTS.map((rule) => rule.from))
    for (const { to } of PROKOM_REDIRECTS) {
      expect(isValidRedirectTarget(to), to).toBe(true)
      if (to.startsWith('/')) expect(sources.has(to), to).toBe(false)
    }
  })
})
