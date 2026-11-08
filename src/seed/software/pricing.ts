import type { Payload } from 'payload'

import type { Page } from '../../payload-types'
import { upsertSoftwarePage } from './page'

type Block = NonNullable<Page['layout']>[number]
type PricingBlock = Extract<Block, { blockType: 'swPricing' }>
type FaqBlock = Extract<Block, { blockType: 'faq' }>

export const SOFTWARE_PRICING_SLUG = 'cennik'

/**
 * `/cennik` of the Software line (ZMIANY-v24 §6.3). Prices, terms and levels are not here: they
 * come from `Solutions` (spec. §1 pkt 1); the solutions grid needs no texts of its own.
 */
export function swPricing(): PricingBlock {
  return {
    blockType: 'swPricing',
    eyebrow: 'Cennik · ceny netto',
    title: 'Ile to kosztuje',
    titleAccent: '— bez małego druku',
    lead: 'Wszystkie {liczba} rozwiązań w jednym miejscu. Każde z ceną „od” i terminem. Dokładną kwotę za Twój zakres dostajesz na piśmie w 5–7 dni, zmiany poza zakresem tylko za Twoją zgodą. Aplikacje i automatyzacje wyceniamy po krótkiej rozmowie.',
    primary: { label: 'Dobierz rozwiązanie · 60 s', href: '/dobierz' },
    secondary: { label: 'Zapytaj o wycenę', href: '/kontakt#formularz' },
    careEyebrow: 'Opieka i rozwój',
    careTitle: 'Opieka po wdrożeniu: wybierasz poziom, rezygnujesz, kiedy chcesz',
    careLead: 'Serwer w Polsce, kopie i aktualizacje. Ceny netto.',
    careButton: 'Zapytaj o opiekę',
    careNote: 'Przejdziesz do formularza kontaktu',
    auditEyebrow: 'Audyt strony lub programu',
    auditTitle: 'Trzy poziomy audytu — pierwszy za darmo',
    auditLead: 'Pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni.',
    auditButton: 'Zamów audyt →',
    auditHref: '/audyt',
  }
}

/** FAQ of `/cennik` (board `Cennik`, 5 questions) — the shared `faq` block, Software look. */
export const SW_PRICING_FAQ: FaqBlock = {
  blockType: 'faq',
  eyebrow: 'Pytania o ceny',
  heading: 'Zanim zapytasz o wycenę',
  items: [
    {
      question: 'Ceny są netto czy brutto?',
      answer: 'Netto. Do cen doliczamy VAT 23%, wystawiamy fakturę VAT.',
    },
    {
      question: 'Co oznacza cena „od”?',
      answer:
        'To cena za podstawowy zakres opisany przy każdym rozwiązaniu. Więcej podstron, języków, modułów albo połączeń z innymi programami wyceniamy w 5–7 dni, zanim cokolwiek zapłacisz.',
    },
    {
      question: 'Jak wygląda płatność?',
      answer:
        '30% zaliczki po podpisaniu umowy. Przy stronach reszta (70%) po odbiorze, przy systemach i aplikacjach raty po każdym etapie. Faktura VAT, przelew 7 dni.',
    },
    {
      question: 'Dlaczego aplikacje i automatyzacje nie mają ceny?',
      answer:
        'Bo zależą od ekranów i programów, które już masz. Po krótkiej rozmowie podajemy cenę i termin.',
    },
    {
      question: 'Czy opieka jest obowiązkowa?',
      answer:
        'Nie. Bez opieki płacisz tylko za serwer i domenę, a zmiany zlecasz, kiedy potrzebujesz.',
    },
  ],
}

export function softwarePricingLayout(): Block[] {
  return [swPricing(), structuredClone(SW_PRICING_FAQ)]
}

type Count = (name: string, result: boolean | 'updated') => void

/** Creates the published `/cennik` of the tenant. */
export async function seedSoftwarePricing(payload: Payload, tenantId: number, count: Count) {
  await upsertSoftwarePage(
    payload,
    tenantId,
    {
      slug: SOFTWARE_PRICING_SLUG,
      title: 'Cennik',
      block: 'swPricing',
      layout: () => softwarePricingLayout(),
    },
    count,
  )
}
