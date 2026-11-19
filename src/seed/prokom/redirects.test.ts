import { describe, expect, it } from 'vitest'

import {
  buildRedirectMap,
  isValidRedirectTarget,
  normalizeRedirectPath,
} from '@/lib/redirects/rules'

import { PREVIOUS_TARGETS, PROKOM_HUB_PAGES, PROKOM_REDIRECTS } from './redirects'

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

/**
 * Joomla addresses of pro-kom.eu in the Web Archive (CDX, 2013–2023), without assets, Joomla
 * system folders, `/files/*.pdf` (files, not pages) and the 175 single products under
 * `/produkty/muzyczne/…` and `/produkty/telefony/…` (deliberately 404). `?option=…` addresses
 * all have the path `/index.php`.
 */
const JOOMLA_PATHS = [
  '/index.php',
  '/firma',
  '/kontakt',
  '/serwis',
  '/produkty',
  '/uslugi/montaz-instalacje',
  '/uslugi/technologia-nc/internet',
  '/uslugi/technologia-nc/telefon',
  '/uslugi/technologia-nc/telewizja',
  ...[
    '/cart',
    '/e-faktura',
    '/firma',
    '/instalacje-konfiguracja',
    '/kariera',
    '/kontakt',
    '/naprawy-sprzetow',
    '/opieka-techniczna',
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
    '/produkty/muzyczne',
    '/produkty/telefony',
    '/realizacje',
    '/regulamin-sklepu',
    '/serwis',
    '/uslugi/montaz-instalacje',
    '/uslugi/montaz-instalacje/inteligentny-dom',
    '/uslugi/montaz-instalacje/monitoring',
    '/uslugi/montaz-instalacje/multimedialne',
    '/uslugi/montaz-instalacje/naglosnieniowe',
    '/uslugi/montaz-instalacje/sieci-strukturalnych',
    '/uslugi/montaz-instalacje/telewizyjne-i-satelitarne',
    '/uslugi/obsluga-muzyczna-dj',
    '/uslugi/opieka-techniczna',
    '/uslugi/opieka-techniczna/audyty',
    '/uslugi/opieka-techniczna/doradztwo',
    '/uslugi/opieka-techniczna/outsourcing-it',
    '/uslugi/serwis',
    '/uslugi/serwis/serwis-komputero-notebookow',
    '/uslugi/serwis/serwis-telefonow-tabletow',
    '/uslugi/technologia-nc',
    '/zdalna-pomoc',
  ].map((path) => `/index.php${path}`),
]

const HUB_PAGES = new Set<string>(PROKOM_HUB_PAGES)

describe('PROKOM_REDIRECTS', () => {
  it('gives every old sitemap address a target or a hub page', () => {
    const map = buildRedirectMap(PROKOM_REDIRECTS)
    const missing = OLD_SITEMAP_PATHS.filter((path) => !HUB_PAGES.has(path) && !map.has(path))
    expect(missing).toEqual([])
    expect(map.size).toBe(PROKOM_REDIRECTS.length)
  })

  it('gives every old Joomla address (Web Archive) a target or a hub page', () => {
    const map = buildRedirectMap(PROKOM_REDIRECTS)
    expect(JOOMLA_PATHS.filter((path) => !HUB_PAGES.has(path) && !map.has(path))).toEqual([])
  })

  it('sends /index.php/<path> to the same place as <path>, in one hop', () => {
    const map = buildRedirectMap(PROKOM_REDIRECTS)
    for (const [from, to] of map) {
      if (!from.startsWith('/index.php/')) continue
      const bare = from.slice('/index.php'.length)
      expect(to, from).toBe(HUB_PAGES.has(bare) ? bare : map.get(bare))
    }
    expect(map.get('/index.php')).toBe('/')
  })

  it('leaves single products of the Joomla shop to the 404 page', () => {
    const map = buildRedirectMap(PROKOM_REDIRECTS)
    expect(map.has('/index.php/produkty/muzyczne/ambiset')).toBe(false)
    expect(map.has('/produkty/muzyczne/ambiset')).toBe(false)
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

describe('ALSEN (runda 1811 D4)', () => {
  it('sends the old partnership page to the ALSEN section of „O firmie”, the old target upgraded', () => {
    const map = buildRedirectMap(PROKOM_REDIRECTS)
    expect(map.get('/produkt/partnerstwo/alsen')).toBe('/o-firmie#alsen')
    expect(map.get('/index.php/produkt/partnerstwo/alsen')).toBe('/o-firmie#alsen')
    for (const from of Object.keys(PREVIOUS_TARGETS)) expect(map.has(from), from).toBe(true)
  })
})
