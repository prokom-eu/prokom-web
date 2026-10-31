import type { Payload } from 'payload'

import type { Page } from '../../payload-types'
import { upsertSoftwarePage } from './page'

type Block = NonNullable<Page['layout']>[number]
type PricingBlock = Extract<Block, { blockType: 'swPricing' }>
type FaqBlock = Extract<Block, { blockType: 'faq' }>

export const SOFTWARE_PRICING_SLUG = 'cennik'
/** The hero card of the board: „Najczęściej wybierana”. */
export const PRICING_FEATURED_SLUG = 'strona-firmowa-z-panelem'

/**
 * `/cennik` of the Software line (spec. §6.4, v22) — texts of the board `Cennik`. Prices, terms
 * and levels are not here: they come from `Solutions` (spec. §1 pkt 1). The audit section is in
 * the spec. (§6.4), not on the board — expected difference.
 */
export function swPricing(featured: number | null): PricingBlock {
  return {
    blockType: 'swPricing',
    eyebrow: 'Cennik · ceny netto',
    title: 'Ceny bez gwiazdek.',
    titleAccent: 'Na piśmie.',
    lead: 'Wszystkie {liczba} rozwiązań w jednym miejscu. Każde z ceną „od” i terminem. Dokładną kwotę za Twój zakres dostajesz na piśmie w 5–7 dni, zmiany poza zakresem tylko za Twoją zgodą. Aplikacje i automatyzacje wyceniamy po krótkiej rozmowie.',
    primary: { label: 'Dobierz rozwiązanie · 60 s', href: '/dobierz' },
    secondary: { label: 'Zapytaj o wycenę', href: '/kontakt#formularz' },
    featured,
    featuredBadge: 'Najczęściej wybierana',
    featuredPoints: [
      { text: 'Panel po polsku i szkolenie' },
      { text: 'Podstawy SEO i widoczność w AI w cenie' },
      { text: 'Kod, domena i dane są Twoje' },
    ],
    tableEyebrow: 'Cennik rozwiązań',
    tableTitle: 'Wybierz, czego szukasz.',
    tabs: [
      {
        category: 'strony',
        label: 'Strony',
        note: 'Cena „od” to podstawowy zakres opisany w polu „W cenie”. Więcej podstron albo języków wyceniamy na piśmie. Ceny netto.',
      },
      {
        category: 'systemy',
        label: 'Systemy i panele',
        note: 'Cena „od” to jeden moduł na gotowym fundamencie, do 5 użytkowników. Kolejne moduły i połączenia z innymi programami wyceniamy na piśmie.',
      },
      {
        category: 'aplikacje',
        label: 'Aplikacje',
        note: 'Aplikacje zależą od ekranów i połączeń z Twoim systemem. Cenę i termin podajemy po krótkiej rozmowie.',
      },
      {
        category: 'automatyzacje',
        label: 'Automatyzacje i AI',
        note: 'Automatyzacje zależą od programów, których już używasz. Cenę i termin podajemy po krótkiej rozmowie.',
      },
      {
        category: 'opieka',
        label: 'Opieka i audyt',
        note: 'Opieka miesięcznie, bez długich umów. Przejęcie i audyt jednorazowo. Ceny netto.',
      },
    ],
    careEyebrow: 'Opieka po wdrożeniu',
    careTitle: 'Spokój co miesiąc. Bez długich umów.',
    careLead:
      'Serwer w Polsce, kopie i aktualizacje. Wybierasz poziom, zmieniasz, kiedy chcesz. Ceny netto.',
    careButton: 'Zapytaj o opiekę',
    careNote: 'Przejdziesz do formularza kontaktu',
    auditEyebrow: 'Audyt strony lub programu',
    auditTitle: 'Zacznij za darmo. Głębiej, gdy trzeba.',
    auditLead: 'Pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni.',
    auditButton: 'Zamów audyt →',
    auditHref: '/audyt',
    includedEyebrow: 'W cenie każdej strony',
    includedTitle: 'Tego nie dopłacasz.',
    includedItems: [
      { title: 'Projekt pod Twoją firmę', text: 'Bez gotowego szablonu.' },
      { title: 'Wersja na telefon', text: 'Wygodna na każdym ekranie.' },
      { title: 'Formularz i mapa', text: 'Zapytania prosto na Twoją skrzynkę.' },
      { title: 'Podstawy SEO i widoczność w AI', text: 'Tytuły, opisy, dane firmy.' },
      { title: 'Szybkość', text: 'Zmierzona i zapisana w protokole odbioru.' },
      { title: 'Szkolenie z panelu', text: 'Na Twoich treściach.' },
      { title: 'Testy na telefonach i komputerach', text: 'Przed oddaniem strony.' },
      { title: 'Kod, domena i dane są Twoje', text: 'Zapisane w umowie.' },
    ],
    ctaTitle: 'Nie wiesz, co wybrać?',
    ctaText:
      'Dobierz rozwiązanie w 60 sekund: cenę i termin zobaczysz od razu, a wycenę na piśmie dostaniesz po krótkiej rozmowie.',
    ctaPrimary: { label: 'Dobierz rozwiązanie', href: '/dobierz' },
    ctaSecondary: { label: 'Darmowy audyt strony', href: '/audyt' },
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
        'To cena za podstawowy zakres opisany przy każdym rozwiązaniu. Więcej podstron, języków, modułów albo połączeń z innymi programami wyceniamy na piśmie w 5–7 dni, zanim cokolwiek zapłacisz.',
    },
    {
      question: 'Jak wygląda płatność?',
      answer:
        '30% zaliczki po podpisaniu umowy. Przy stronach reszta (70%) po odbiorze, przy systemach i aplikacjach raty po każdym etapie. Faktura VAT, przelew 7 dni.',
    },
    {
      question: 'Dlaczego aplikacje i automatyzacje nie mają ceny?',
      answer:
        'Bo zależą od ekranów i programów, które już masz. Po krótkiej rozmowie podajemy cenę i termin na piśmie.',
    },
    {
      question: 'Czy opieka jest obowiązkowa?',
      answer:
        'Nie. Bez opieki płacisz tylko za serwer i domenę, a zmiany zlecasz, kiedy potrzebujesz.',
    },
  ],
}

export function softwarePricingLayout(featured: number | null): Block[] {
  return [swPricing(featured), structuredClone(SW_PRICING_FAQ)]
}

type Count = (name: string, result: boolean | 'updated') => void

/** Creates the published `/cennik` of the tenant; the hero card is the solution of the board. */
export async function seedSoftwarePricing(payload: Payload, tenantId: number, count: Count) {
  const {
    docs: [featured],
  } = await payload.find({
    collection: 'solutions',
    where: {
      and: [{ tenant: { equals: tenantId } }, { slug: { equals: PRICING_FEATURED_SLUG } }],
    },
    limit: 1,
    depth: 0,
    select: { slug: true },
    overrideAccess: true,
  })
  await upsertSoftwarePage(
    payload,
    tenantId,
    {
      slug: SOFTWARE_PRICING_SLUG,
      title: 'Cennik',
      block: 'swPricing',
      layout: () => softwarePricingLayout(featured?.id ?? null),
    },
    count,
  )
}
