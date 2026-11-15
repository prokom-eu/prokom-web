import type { K4HomeFile } from './k4Home'

/**
 * The hero wheel of runda 1411 (PRZEKAZANIE-RUNDA-1411 §1 „Hero — koło”, board `Main.dc.html`):
 * exactly three products a department, all photos. It replaces `kolo_hero` of the K4 package
 * (4 / 6 / 3 / 3 / 2 + a page), which stays 1:1 with the handoff; the seed writes the department
 * lists only when they differ (idempotent), so a second run changes nothing.
 */
export const KOLO_1411: K4HomeFile['kolo_hero'] = [
  {
    g: 'sprz',
    p: ['ergo', 'pol', 'd3'],
    nazwy: {
      ergo: 'Posnet Ergo Online',
      pol: 'Terminal płatniczy PolCard',
      d3: 'Sunmi D3 PRO',
    },
  },
  {
    g: 'biuro',
    p: ['apple-macbook-air-m5', 'lenovo-thinkcentre-neo-50s-55s', 'konica-minolta-bizhub-c3321i'],
    nazwy: {
      'apple-macbook-air-m5': 'Apple MacBook Air (M5)',
      'lenovo-thinkcentre-neo-50s-55s': 'Lenovo ThinkCentre neo 50s',
      'konica-minolta-bizhub-c3321i': 'Konica Minolta bizhub C3321i',
    },
  },
  {
    g: 'prog',
    p: ['gopos', 'nexo', 'microsoft-office-2024'],
    nazwy: {
      gopos: 'GoPOS dla gastronomii',
      nexo: 'InsERT Subiekt nexo',
      'microsoft-office-2024': 'Microsoft Office 2024 dla firm',
    },
  },
  {
    g: 'bezp',
    krotka: 'Sieć i ochrona',
    p: ['euro', 'eset', 'u7'],
    nazwy: {
      euro: 'Podpis kwalifikowany EuroCert',
      eset: 'ESET PROTECT',
      u7: 'Ubiquiti UniFi U7 Pro',
    },
  },
  {
    g: 'usl',
    p: ['ksef', 'fiskalizacja'],
    nazwy: {
      ksef: 'Wdrożenie KSeF w firmie',
      fiskalizacja: 'Fiskalizacja kasy',
    },
    link: { n: 'Opieka IT dla firm', href: '/opieka-it', ic: 'lifebuoy' },
  },
]

/**
 * Wheel photos borrowed from another card's cut-out (the board's choice): a service has no photo
 * of its own. Fiskalizacja → the Elzab K10 till; the Opieka IT page bubble → the ThinkBook.
 */
export const WHEEL_PHOTO_1411: Readonly<Record<string, string>> = {
  fiskalizacja: 'k10',
}
export const WHEEL_LINK_PHOTO_1411: Readonly<Record<string, string>> = {
  usl: 'lenovo-thinkbook-14-g8-g9',
}

/** The K4 home file with the wheel of runda 1411. */
export function withWheel1411<T extends Pick<K4HomeFile, 'kolo_hero'>>(home: T): T {
  return { ...home, kolo_hero: KOLO_1411 }
}
