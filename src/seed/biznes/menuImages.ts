import path from 'node:path'

/** Thumbnails of the „Oferta ▾” mega menu (plan 0611 §8.1 pkt 3), cut out of the 0611 prototype. */
export const MENU_MEDIA_DIR = path.join('seed', 'prokombiznes', 'menu', 'media')

/**
 * Category slug → thumbnail file of the prototype (`c-*`). Categories the prototype shows with an
 * icon (tablets, shredders, keyboards, services) have none: the menu falls back to the best
 * product's picture, then the department icon.
 */
export const MENU_IMAGES: Readonly<Record<string, string>> = {
  'kasy-fiskalne': 'c-kasy.webp',
  'drukarki-fiskalne': 'c-druk.webp',
  'stanowiska-pos': 'c-pos.webp',
  'kasoterminale-mobilne': 'c-mob.webp',
  'terminale-platnicze': 'c-term.webp',
  'kioski-ekrany-kuchenne': 'c-kiosk.webp',
  'akcesoria-pos': 'c-akc.webp',
  'wagi-sklepowe': 'c-wagi.webp',
  'skanery-kolektory-etykiety': 'c-kody.webp',
  'automaty-vendingowe': 'c-vend.webp',
  laptopy: 'c-laptopy.webp',
  komputery: 'c-komputery.webp',
  monitory: 'c-monitory.webp',
  'serwery-nas-ups': 'c-serw.webp',
  'drukarki-wielofunkcyjne': 'c-mfp.webp',
  'ekrany-projektory': 'c-av.webp',
  'programy-sprzedazowe-erp': 'c-progs.webp',
  'programy-branzowe': 'c-progb.webp',
  'microsoft-365-licencje': 'c-m365.webp',
  'siec-wifi': 'c-siec.webp',
  'antywirus-firewall': 'c-ochr.webp',
  'podpis-kwalifikowany': 'c-podpis.webp',
}

/** The name the thumbnail gets in Media (unique per tenant, found again by it). */
export const menuUploadName = (file: string) => `menu-${file}`

/** A stored category gets the thumbnail only while its field is empty: the panel's choice wins. */
export function menuImageUpdate(
  stored: number | { id: number } | null | undefined,
  seed: number | undefined,
): number | null {
  if (seed === undefined || (stored !== null && stored !== undefined)) return null
  return seed
}
