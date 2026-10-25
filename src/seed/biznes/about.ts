import type { Payload } from 'payload'

import { upsertBiznesPage, type PageBlock } from './page'

type Report = (name: string, changed: boolean) => void

export const ABOUT_SLUG = 'o-firmie'

const card = (title: string, text: string) => ({ title, text, icon: 'check' as const })

/** `/o-firmie` from the board OFirmie, texts 1:1 (spec. §6.9). */
export function biznesAboutLayout(): PageBlock[] {
  return [
    {
      blockType: 'bzPageHero',
      pill: 'PRO-KOM Tadeusz Wójciak · Rabka-Zdrój, od 2004',
      // „22 lata” counted from `sinceYear` (spec. §6.9 [SZEF]: automatically from 2004).
      heading: '{lata} na Podhalu. Ten sam właściciel, ten sam adres, ten sam numer.',
      sinceYear: 2004,
      // TODO(krystian): [SZEF] „ponad 100 firm i instytucji” — a figure to confirm.
      lead: 'Zaczynaliśmy od komputerów i kas fiskalnych dla sklepów w Rabce. Dziś obsługujemy ponad 100 firm i instytucji: sklepy, restauracje, pensjonaty, szkoły, urzędy, gabinety, zakłady. Sprzedajemy, wdrażamy, szkolimy i serwisujemy — a jeśli czegoś nie potrafimy, mówimy to wprost.',
      primary: { label: 'Porozmawiajmy', href: `/${ABOUT_SLUG}#kontakt` },
      secondary: { label: 'Pełna oferta', href: '/oferta' },
      variant: 'stats',
      // TODO(krystian): [SZEF] „100+” (as above) and „2 autoryzacje serwisowe: Posnet i Elzab”
      // (partner statuses, spec. §13 pkt 3) — confirm before production.
      figures: [
        { value: '2004', label: 'rok założenia' },
        { value: '100+', label: 'firm i instytucji pod opieką' },
        { value: '2', label: 'autoryzacje serwisowe: Posnet i Elzab' },
        { value: '4', label: 'linie: Biznes, Instalacje, Software, Tech' },
      ],
    },
    {
      blockType: 'bzCards',
      eyebrow: 'Jak pracujemy',
      heading: 'Zasady, które łatwo sprawdzić.',
      surface: 'muted',
      columns: '4',
      tone: 'accent',
      cards: [
        card(
          'Mówimy, czego nie potrzebujesz',
          'Jeśli tańszy model wystarczy, dostajesz tańszy model. Zaufanie jest warte więcej niż jedna marża.',
        ),
        card(
          'Jeden telefon do wszystkiego',
          'Kasa, komputer, sieć, program, podpis — ten sam numer, ta sama osoba, która zna Twoją firmę.',
        ),
        card(
          'Serwisant z Rabki',
          'Nie z Krakowa i nie z Warszawy. Dojeżdżamy na całe Podhale, w sezonie też.',
        ),
        card(
          'Uczciwe czasy',
          'Czas reakcji w godzinach roboczych, w umowie. Nie obiecujemy 15 minut, których nie da się dotrzymać.',
        ),
        card(
          'Zero cen z sufitu',
          'Wycena pod firmę, na piśmie, z wariantami do wyboru. Bez „promocji kończących się za 10 minut”.',
        ),
        card(
          'Fakty, nie slogany',
          'Terminy KSeF, dofinansowania — podajemy ze źródłem i datą sprawdzenia.',
        ),
        card(
          'Dokumentacja jest Twoja',
          'Hasła, konfiguracje, umowy — w Twoim paszporcie IT. Odchodzisz? Dostajesz komplet.',
        ),
        card(
          'Szkolimy, nie tylko instalujemy',
          'Zespół umie obsłużyć kasę, program i serwer, zanim wyjedziemy. Nowy pracownik — doszkolimy.',
        ),
      ],
    },
    {
      blockType: 'bzLines',
      eyebrow: 'Rodzina PRO-KOM',
      heading: 'Jedna firma, cztery linie. Ten sam telefon.',
      lead: 'Biznes to sprzedaż, wdrożenia i serwis dla firm. Montaż na obiekcie robią Instalacje, strony i aplikacje — Software, naprawy jednostkowe — Tech.',
      lines: [
        {
          name: 'Biznes',
          title: 'Kasy, POS, programy, komputery, serwery, opieka IT',
          text: 'Ta strona. Sprzedaż, wdrożenia, szkolenia i serwis dla firm i instytucji.',
          // This site's own home page: on staging and locally it must not lead to production.
          link: { label: 'prokombiznes.pl', href: '/' },
          current: true,
        },
        {
          name: 'Instalacje',
          title: 'Monitoring, sieci, smart home, nagłośnienie',
          text: 'Projekt i montaż na obiekcie: kamery, okablowanie, Wi-Fi w całym budynku, automatyka.',
          link: { label: 'prokominstalacje.pl', href: 'https://prokominstalacje.pl' },
        },
        {
          name: 'Software',
          title: 'Strony, panele, aplikacje na zamówienie',
          text: 'Strony firmowe, sklepy, panele klienta i integracje — także ta strona powstała u nas.',
          link: { label: 'prokomsoftware.pl', href: 'https://prokomsoftware.pl' },
        },
        {
          name: 'Tech',
          title: 'Naprawy sprzętu',
          text: 'Serwis komputerów, laptopów i telefonów dla klientów indywidualnych. Status naprawy online.',
          link: { label: 'prokomserwis.pl', href: 'https://prokomserwis.pl' },
        },
      ],
    },
    {
      blockType: 'bzBrands',
      eyebrow: 'Autoryzacje i partnerzy',
      heading: 'Marki, które sprzedajemy, wdrażamy i serwisujemy',
      // TODO(krystian): [SZEF] statuses „Autoryzowany serwis” / „Partner handlowy i wdrożeniowy”
      // (spec. §13 pkt 3) — the same as in Partnerzy.
      note: 'Autoryzowany serwis: Posnet, Elzab. Partner handlowy i wdrożeniowy: GoPOS, Sunmi, InsERT, Insoft, NFHotel, PolCard from Fiserv, EuroCert, ESET, Microsoft, Lenovo, Dell, Avtek, Sharp/NEC, Konica Minolta, Kyocera, Synology, APC, Ubiquiti, Samsung. Logotypy należą do ich właścicieli.',
    },
    {
      blockType: 'bzLocation',
      eyebrow: 'Gdzie nas znaleźć',
      lead: 'Biuro, salon i serwis w jednym miejscu. Dojeżdżamy na całe Podhale i Małopolskę: Nowy Targ, Zakopane, Limanowa, Mszana Dolna, Myślenice, Nowy Sącz, Kraków — i dalej, jeśli trzeba.',
      areaLabel: 'Dojeżdżamy na całe Podhale i Małopolskę',
      phoneNote: 'oferty i serwis',
    },
    {
      blockType: 'bzContact',
      heading: 'Porozmawiajmy o Twojej firmie.',
      // The board adds „pn–pt 9–17”: hours come only from the panel (spec. §9 pkt 9).
      lead: 'Telefon, mail albo wizyta w Rabce. Odpowiadamy najszybciej, jak to możliwe.',
      formHeading: 'Formularz zapytania',
      formNote: 'Pola z gwiazdką są wymagane. Resztę dopiszemy razem przez telefon.',
      // TODO(krystian): [SZEF] obietnica „60 min” — ta sama co w Ustawieniach strony (spec. §13).
      promises: [
        { text: 'Odpowiedź w 60 min' },
        { text: 'Wycena na piśmie' },
        { text: 'Bez spamu i newslettera' },
      ],
      successText:
        'Oddzwonimy w ciągu 60 minut w godzinach pracy. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.',
    },
  ]
}

/** `/o-firmie` (B11c): created when missing; later only block types it lacks are added. */
export async function seedBiznesAbout(
  payload: Payload,
  tenantId: number,
  report: Report,
): Promise<void> {
  await upsertBiznesPage(
    payload,
    tenantId,
    {
      slug: ABOUT_SLUG,
      title: 'O firmie',
      layout: biznesAboutLayout(),
      description:
        'PRO-KOM Tadeusz Wójciak z Rabki-Zdroju: od 2004 kasy, POS, programy i opieka IT dla firm z Podhala. Zasady, linie PRO-KOM, marki i dojazd.',
    },
    report,
  )
}
