import type { CatalogIndex, IndexProduct } from '../catalog/catalogIndex'
import type { ServiceKey } from './options'

/**
 * „Zobacz sprzęt” of a service page (INST-K2, plan §3.4): the catalog categories that serve the
 * service and where the button leads. Services without equipment cards of Instalacje (Wi-Fi,
 * antennas, smart home, EV chargers) have no section yet; a link from Wi-Fi to the network gear
 * of Biznes (ADR-029 pkt 8) is in „Pomysły na później”.
 */
export const SERVICE_EQUIPMENT: Partial<
  Record<ServiceKey, { label: string; href: string; categories: readonly string[] }>
> = {
  kam: {
    label: 'kamery, rejestratory i akcesoria',
    href: '/oferta?grupa=mon',
    categories: ['kamery-ip', 'kamery-hd', 'rejestratory', 'akcesoria-cctv'],
  },
  alarm: {
    label: 'centrale, czujki i syreny',
    href: '/oferta?grupa=alarm',
    categories: ['alarmy-bezprzewodowe', 'alarmy-przewodowe'],
  },
  kd: {
    label: 'czytniki, zwory i sterowniki',
    href: '/oferta/kontrola-dostepu',
    categories: ['kontrola-dostepu'],
  },
  tel: {
    label: 'wideodomofony i stacje bramowe',
    href: '/oferta/wideodomofony',
    categories: ['wideodomofony'],
  },
  snd: {
    label: 'sprzęt do transmisji mszy, sesji i wydarzeń',
    href: '/oferta/streaming',
    categories: ['streaming', 'przesyl-av'],
  },
  scr: {
    label: 'uchwyty, stojaki i przesył obrazu',
    href: '/oferta?grupa=av',
    categories: ['uchwyty', 'przesyl-av'],
  },
}

/** The equipment of a service: its link and the first listed cards with a picture (max three). */
export function serviceEquipment(
  key: string,
  index: Pick<CatalogIndex, 'products'>,
): { label: string; href: string; products: IndexProduct[] } | null {
  const config = SERVICE_EQUIPMENT[key as ServiceKey]
  if (!config) return null
  const products = index.products
    .filter((product) => product.image && config.categories.includes(product.categories[0] ?? ''))
    .slice(0, 3)
  return products.length ? { label: config.label, href: config.href, products } : null
}
