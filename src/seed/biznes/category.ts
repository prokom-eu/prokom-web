import type { Payload } from 'payload'

import type { CatalogCategory } from '../../payload-types'
import { isBlank, missingFields } from './fill'

type Report = (name: string, changed: boolean) => void

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

export const CASH_REGISTERS_SLUG = 'kasy-fiskalne'

/** „Do kasy często dobierane” (board): a fiscal printer, a terminal, a drawer, the inspection. */
const BOUGHT_WITH = ['hx', 'pol', 'szuf', 'przkas']

type Content = Pick<
  CatalogCategory,
  'hero' | 'includedSection' | 'facts' | 'faqIntro' | 'faq' | 'help' | 'contact'
>

/**
 * Texts of the cash register page from the board `Kategoria` (spec. §6.1). Legal facts only with
 * a source in the text or in the „Źródło” fields (plan B §4), the rest waits for the owner:
 * TODO(krystian): [SZEF]
 * - chip „Ulga do 700 zł na kasę online” and „Przegląd co 2 lata — przypomnimy” (hero) — facts
 *   without a source next to them;
 * - links to the acts in „Przepisy w pigułce” (ISAP) — a card without one is not shown; the KSeF
 *   card also needs its source (ZMIANY-v20 §5) and the link to the KSeF post (B11);
 * - FAQ „Co z fakturami dla firm i KSeF od 2027 r.?” (date without a source) and the 12 months
 *   of a free terminal in the BLIK answer (Polska Bezgotówkowa conditions);
 * - „ulga 700 zł” in the help card and the contact lead;
 * - „Fiskalizacja … upoważniony przez Posnet i Elzab” — text of the board, kept; to confirm with
 *   the partner statuses (spec. §13).
 */
export const CASH_REGISTERS_CONTENT: Content = {
  hero: {
    title: 'Kasy fiskalne online. Dobrane, zafiskalizowane, z serwisem w Rabce.',
    lead: 'Posnet, Elzab i Fawag — od kieszonkowej kasy dla mechanika po kasę systemową do sklepu ze skanerem. Programujemy, fiskalizujemy, szkolimy i pilnujemy przeglądów.',
    highlights: ['Fiskalizacja i szkolenie'],
  },
  includedSection: {
    eyebrow: 'W cenie każdej kasy od nas',
    title: 'Kupujesz kasę, dostajesz spokój.',
    cards: [
      {
        icon: 'doc',
        title: 'Dobór do branży',
        text: 'Mówimy, która kasa wystarczy — i której nie potrzebujesz. Bez przepłacania za funkcje.',
      },
      {
        icon: 'shield',
        title: 'Fiskalizacja',
        text: 'Wykonuje ją nasz serwisant upoważniony przez Posnet i Elzab. Ty nie jeździsz po urzędach.',
      },
      {
        icon: 'store',
        title: 'Towary i stawki VAT',
        text: 'Programujemy kasę u siebie, zanim do Ciebie trafi: towary, stawki, nagłówek paragonu.',
      },
      {
        icon: 'users',
        title: 'Szkolenie obsługi',
        text: 'Pokazujemy Tobie i pracownikom: sprzedaż, raporty, zwroty, wymiana papieru.',
      },
      {
        icon: 'bell',
        title: 'Przypomnienie o przeglądzie',
        text: 'Przegląd jest obowiązkowy co najmniej raz na 2 lata (rozporządzenie MF, Dz.U. 2019 poz. 816). Zadzwonimy, zanim minie termin.',
      },
      {
        icon: 'wrench',
        title: 'Serwis z Rabki',
        text: 'Awaria? Najpierw pomoc zdalna, potem serwisant — na całym Podhalu i w Małopolsce.',
      },
    ],
  },
  facts: {
    eyebrow: 'Przepisy w pigułce',
    title: 'Trzy rzeczy, które warto wiedzieć przed zakupem.',
    items: [
      {
        value: '700 zł',
        title: 'Ulga na pierwszą kasę online',
        text: '90% ceny netto kasy, maksymalnie 700 zł — dla firm, które pierwszy raz zaczynają ewidencję na kasie. Brak przeglądu w terminie oznacza zwrot ulgi.',
        source: 'Art. 111 ust. 4 ustawy o VAT · sprawdzono 15.10.2026',
      },
      {
        value: '2 lata',
        title: 'Przegląd techniczny kasy',
        text: 'Obowiązkowy co najmniej raz na 2 lata, u serwisanta upoważnionego przez producenta. Przypominamy o terminie — nie musisz go pilnować.',
        source: 'Rozporządzenie MF, Dz.U. 2019 poz. 816',
      },
      {
        value: '2027',
        title: 'Faktury do paragonu przez KSeF',
        text: 'Od 1.01.2027 faktura dla firmy do paragonu idzie przez KSeF, nie z kasy. Ustawiamy to przy zakupie kasy razem z programem.',
      },
    ],
  },
  faqIntro: {
    eyebrow: 'Pytania o kasy',
    title: 'Zanim kupisz kasę',
    lead: 'Sprzedajemy, fiskalizujemy i serwisujemy kasy fiskalne online w Rabce-Zdroju i dojeżdżamy do firm w Nowym Targu, Zakopanem, Jordanowie, Mszanie Dolnej, Limanowej, Myślenicach i całej Małopolsce.',
  },
  faq: [
    {
      question: 'Kasa czy drukarka fiskalna — co wybrać?',
      answer:
        'Kasa działa samodzielnie: ma klawiaturę i własną bazę towarów. Drukarka fiskalna współpracuje z programem sprzedażowym albo POS (Subiekt, PC-Market, GoPOS) i to program jest „mózgiem”. Masz program albo planujesz GoPOS — wybierz drukarkę. Chcesz po prostu sprzedawać — kasę.',
    },
    {
      question: 'Czy przysługuje mi ulga na zakup kasy online?',
      answer:
        'Firmy, które po raz pierwszy zaczynają ewidencję na kasie online, mogą odliczyć 90% ceny netto kasy, maksymalnie 700 zł (art. 111 ust. 4 ustawy o VAT). Warunki — m.in. terminy i obowiązkowy przegląd — sprawdzimy z Tobą przy zamówieniu.',
    },
    {
      question: 'Jak często trzeba robić przegląd kasy?',
      answer:
        'Co najmniej raz na 2 lata, u serwisanta upoważnionego przez producenta (rozporządzenie MF, Dz.U. 2019 poz. 816). Przypomnimy o terminie.',
    },
    {
      question: 'Mam kasę z innego serwisu. Przejmiecie ją?',
      answer:
        'Tak. Zmiana serwisu to formalność, którą załatwiamy po naszej stronie — Ty podpisujesz jeden dokument. Kasa pracuje bez przerwy.',
    },
    {
      question: 'Czy kasa przyjmie płatność kartą lub BLIK?',
      answer:
        'Posnet Ergo Online ma BLIK na kasie. Do kart zbliżeniowych dobieramy terminal PolCard.',
    },
  ],
  help: {
    title: 'Powiedz, co sprzedajesz — dobierzemy kasę w 5 minut rozmowy.',
    text: 'Bez przepłacania za funkcje, których nie użyjesz.',
  },
  contact: {
    heading: 'Nie wiesz, która kasa? Zadzwoń — dobierzemy w 5 minut rozmowy.',
    lead: 'Powiedz, co sprzedajesz i ile masz towarów. Przygotujemy propozycję na piśmie.',
  },
}

/**
 * Content of the cash register category (B10a): only fields still empty are filled, so texts
 * edited in the panel stay (`missingFields`). Products of „często dobierane” by their short id in the package.
 */
export async function seedBiznesCategoryContent(
  payload: Payload,
  tenantId: number,
  product: (shortId: string) => number | undefined,
  report: Report,
): Promise<void> {
  const {
    docs: [category],
  } = await payload.find({
    collection: 'catalog-categories',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: CASH_REGISTERS_SLUG } }] },
    limit: 1,
    ...local,
  })
  if (!category) return
  const boughtWith = BOUGHT_WITH.map(product).filter((id): id is number => id !== undefined)
  const patch: Partial<CatalogCategory> = {
    ...(missingFields(category, CASH_REGISTERS_CONTENT) as Partial<CatalogCategory>),
    ...(isBlank(category.frequentlyBoughtWith) && boughtWith.length > 0
      ? { frequentlyBoughtWith: boughtWith }
      : {}),
  }
  const changed = Object.keys(patch).length > 0
  report(`catalog-categories ${CASH_REGISTERS_SLUG} content`, changed)
  if (changed) {
    await payload.update({
      collection: 'catalog-categories',
      id: category.id,
      data: patch,
      ...local,
    })
  }
}
