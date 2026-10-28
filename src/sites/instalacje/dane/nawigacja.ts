/**
 * Menus of the Instalacje site: column order, phone bottom bar, „Więcej”, header CTA.
 * Generated once from `seed/prokominstalacje/wspolne.json` (`src/seed/instalacje/write-dane.ts`);
 * edit here from now on. Names, icons and colours of services and objects: the panel, by key.
 */
import type { Navigation } from './types'

export const navigation: Navigation = {
  serviceColumns: [
    { label: 'Bezpieczeństwo', keys: ['kam', 'alarm', 'kd'] },
    { label: 'Sieci i technika', keys: ['wifi', 'tel', 'ant', 'ev'] },
    { label: 'Komfort i obraz', keys: ['smart', 'snd', 'scr'] },
  ],
  objectColumns: [
    { label: 'Dom i noclegi', keys: ['dom', 'apt', 'pens', 'hotel'] },
    { label: 'Firmy', keys: ['rest', 'sklep', 'firma'] },
    { label: 'Instytucje', keys: ['kosc', 'szk', 'gmina'] },
    { label: 'Budownictwo', keys: ['dev', 'bud'] },
  ],
  bottomBar: [
    { label: 'Start', icon: 'home', featured: false, href: '/' },
    { label: 'Usługi', icon: 'net', featured: false, sheet: 'services' },
    { label: 'Zaplanuj', icon: 'send', featured: true, href: '/zaplanuj' },
    { label: 'Dla kogo', icon: 'users', featured: false, sheet: 'objects' },
    { label: 'Więcej', featured: false, sheet: 'more' },
  ],
  sheetTabs: { services: 'Usługi', objects: 'Dla kogo', more: 'Więcej' },
  more: [
    { label: 'Realizacje', href: '/realizacje', icon: 'eye', caption: 'Przykłady naszych montaży' },
    {
      label: 'Serwis i przeglądy',
      href: '/serwis',
      icon: 'wrench',
      caption: 'Zgłoś awarię, przegląd, przejęcie instalacji',
    },
    { label: 'Poradnik', href: '/poradnik', icon: 'book', caption: 'Monitoring a RODO i inne' },
    {
      label: 'O firmie',
      href: '/o-firmie',
      icon: 'shield',
      caption: 'PRO-KOM od 2004 r., Rabka i Zakopane',
    },
    {
      label: 'Kontakt i dojazd',
      href: '/kontakt',
      icon: 'pin',
      caption: 'Telefon, e-mail, salony',
    },
    {
      label: 'Pełna oferta',
      href: '/uslugi',
      icon: 'layers',
      caption: 'Wszystkie rozwiązania w jednym miejscu',
    },
  ],
  cta: { label: 'Zaplanuj instalację · 2 minuty', href: '/zaplanuj' },
}
