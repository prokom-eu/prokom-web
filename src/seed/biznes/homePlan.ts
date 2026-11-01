import type { IconName } from '../../lib/catalog/options'
import type { Page } from '../../payload-types'
import { BIZNES_CONTACT } from './contact'

/**
 * Start content of B7c, v150 (K4c): „Plan Twojej firmy” with „Dla kogo”, „Jak pracujemy”. Texts 1:1
 * from `docs/design/prokombiznes/boards/Main.dc.html` (industries
 * `KGT`/`KGR`, `.pextra`, `.dof`, `.s2`, `.j4`). Icons: the nearest of the shared set (a new set
 * comes with SW2a). Local only, like the rest of `pnpm seed:biznes`.
 */

type HomeBlock = NonNullable<Page['layout']>[number]

/** Lead of the plan section, board v150 `#s4-plan`. */
export const PLAN_LEAD =
  'Wybierz rodzaj firmy i kliknij urządzenie. Obok zobaczysz film i szczegóły, a całość dodasz do zapytania jednym kliknięciem.'

/** Labels of the plan (board `Web-Plan`): list note, „Gotowe zestawy”, „Dodaj cały plan…”. */
export const PLAN_LABELS = {
  sceneNote: 'Kliknij urządzenie, a otworzy się film i szczegóły',
  moreLabel: 'Gotowe zestawy',
  inquiryLabel: 'Dodaj cały plan do zapytania',
}

/**
 * Scene of the plan each industry tile shows (K4: „Firmy każdej wielkości” set the scene) — the
 * nearest of the 12 scenes of `plany-k4.json`; a tile without one links to its industry page.
 * TODO(krystian): część przypisań to wybór sesji (Firma transportowa, Stragan, Hurtownia, Fryzjer)
 * — potwierdzić albo poprawić w panelu (kafel → „Scena planu”).
 */
export const TILE_SCENES: Readonly<Record<string, string>> = {
  'Sklep spożywczy': 'sklep',
  'Restauracja, bar, kawiarnia': 'gastro',
  'Pensjonat, hotel, apartamenty': 'hotel',
  'Biuro rachunkowe': 'biuro',
  'Gabinet, przychodnia': 'gabinet',
  'Szkoła, przedszkole': 'szkola',
  'Gmina, urząd, biblioteka': 'urzad',
  'Mechanik i serwis': 'warsztat',
  Apteka: 'apteka',
  'Sklep odzieżowy i branżowy': 'sklep',
  'Fryzjer, kosmetyka, beauty': 'gabinet',
  'Zakład produkcyjny': 'produkcja',
  'Hurtownia i magazyn': 'produkcja',
  'Atrakcja, wyciąg, termy': 'bilety',
  'Sala konferencyjna': 'konferencja',
  'Food truck': 'gastro',
  'Stragan, handel obwoźny': 'sklep',
  Kancelaria: 'biuro',
  'Firma transportowa': 'biuro',
}

export function planBlocks(industry: (seedSlug: string) => number | undefined): HomeBlock[] {
  const tile = (
    name: string,
    note: string,
    icon: IconName,
    tone: 'green' | 'red' | 'blue' | 'violet',
    visibleFirst: boolean,
    seedIndustry?: string,
  ) => ({
    name,
    note,
    icon,
    tone,
    visibleFirst,
    industry: seedIndustry ? industry(seedIndustry) : undefined,
    planScene: TILE_SCENES[name] ?? null,
  })

  return [
    {
      blockType: 'bzPlan',
      eyebrow: 'Plan Twojej firmy',
      heading: 'Zobacz, co ustawimy w Twoim lokalu.',
      // K31d′: the board's lead 1:1 (the plan with the drawing is there now); scenes come from
      // „Plany firmy” (`FloorPlans`).
      lead: PLAN_LEAD,
      sceneNote: PLAN_LABELS.sceneNote,
      moreLabel: PLAN_LABELS.moreLabel,
      inquiryLabel: PLAN_LABELS.inquiryLabel,
      industries: {
        // v150 (board `#s4-real`): its own section „Dla kogo” before the plan.
        eyebrow: 'Dla kogo pracujemy',
        heading: 'Firmy każdej wielkości, od straganu po urząd gminy',
        lead: 'Ponad 100 klientów firmowych: firm i instytucji z Podhala i Małopolski. Wybierz swoją branżę, a pokażemy plan lokalu z urządzeniami albo dobierzemy rozwiązanie w konfiguratorze.',
        moreLabel: 'Pokaż wszystkie branże',
        moreNote: 'jeszcze 10 branż',
        // Board `KG5`: 11 at once, 10 after „Pokaż wszystkie”, then „Każda inna firma”.
        tiles: [
          tile('Sklep spożywczy', 'kasa, waga, PC-Market', 'store', 'green', true, 'handel'),
          tile(
            'Restauracja, bar, kawiarnia',
            'GoPOS, ekran kuchenny, terminal',
            'food',
            'red',
            true,
            'gastro',
          ),
          tile(
            'Pensjonat, hotel, apartamenty',
            'NFHotel, kasa, Wi-Fi dla gości',
            'bed',
            'violet',
            true,
            'noclegi',
          ),
          tile('Biuro rachunkowe', 'KSeF, podpis, kopie', 'wallet', 'green', true, 'uslugi'),
          tile(
            'Gabinet, przychodnia',
            'rejestracja, kasa, kopie danych',
            'heart',
            'red',
            true,
            'zdrowie',
          ),
          tile(
            'Szkoła, przedszkole',
            'monitory Avtek, pracownia, Wi-Fi',
            'grad',
            'blue',
            true,
            'szkoly',
          ),
          tile(
            'Gmina, urząd, biblioteka',
            'podpis, ESET, kopie, sala obrad',
            'doc',
            'violet',
            true,
            'szkoly',
          ),
          tile('Mechanik i serwis', 'kasa, Subiekt, Wi-Fi w hali', 'car', 'blue', true),
          tile('Apteka', 'drukarki fiskalne, skanery 2D, UPS', 'shield', 'green', true, 'zdrowie'),
          tile('Sklep odzieżowy i branżowy', 'kasa, skaner, Subiekt', 'bag', 'red', true, 'handel'),
          tile(
            'Fryzjer, kosmetyka, beauty',
            'kasa dla usług, terminal',
            'users',
            'violet',
            true,
            'beauty',
          ),
          tile('Zakład produkcyjny', 'serwer, ERP, sieć w hali', 'server', 'blue', false),
          tile('Hurtownia i magazyn', 'program magazynowy, kolektory', 'box', 'green', false),
          tile('Atrakcja, wyciąg, termy', 'kasy biletowe, bramki, Wi-Fi', 'ticket', 'blue', false),
          tile('Sala konferencyjna', 'ekran, laptopy, Wi-Fi dla gości', 'monitor', 'violet', false),
          tile('Food truck', 'kasoterminal Sunmi, GoPOS', 'food', 'red', false, 'gastro'),
          tile('Stragan, handel obwoźny', 'kasa mobilna, terminal', 'store', 'green', false),
          tile('Kancelaria', 'Microsoft 365, podpis, ESET', 'doc', 'violet', false, 'uslugi'),
          tile('Firma transportowa', 'laptopy, Microsoft 365, podpis', 'car', 'blue', false),
          tile('Sklep internetowy', 'Subiekt, KSeF, drukarka fiskalna', 'site', 'blue', false),
          tile('Stacja paliw, myjnia', 'terminal, sieć, UPS', 'bolt', 'red', false),
          tile('Każda inna firma', 'opisz ją, dobierzemy rozwiązanie', 'q', 'violet', false),
        ],
      },
      funding: {
        label: 'Dofinansowania',
        heading: 'Masz dofinansowanie na sprzęt lub oprogramowanie? Zrealizujesz je u nas.',
        chips: [
          { text: 'Szkoły i przedszkola' },
          { text: 'Gminy i urzędy' },
          { text: 'Szpitale i uzdrowiska' },
          { text: 'Firmy' },
        ],
        button: { label: 'Zapytaj o realizację', href: '/kontakt' },
      },
    },
    {
      blockType: 'bzSteps',
      // v150 (board `#s4-jak`).
      eyebrow: 'Jak pracujemy · ludzie, nie infolinia',
      heading: 'Od pierwszej rozmowy do serwisu',
      lead: 'Cztery kroki i ten sam zespół z Rabki-Zdroju. Na każdym etapie wiesz, kto się Tobą zajmuje i co dostajesz.',
      getsLabel: 'Dostajesz',
      steps: [
        {
          title: 'Rozmowa',
          icon: 'phone',
          text: 'Telefon, wiadomość albo wizyta w Rabce. Pytamy, jak pracuje firma i co ma się poprawić.',
          gets: 'listę potrzeb, także tego, czego nie musisz kupować',
          role: 'Doradca PRO-KOM',
          label: 'Pierwszy kontakt',
        },
        {
          title: 'Oferta',
          icon: 'doc',
          text: 'Dobieramy sprzęt i programy do skali firmy. Kilka wariantów, każdy z uzasadnieniem.',
          gets: 'kilka wariantów z uzasadnieniem',
          role: 'ten sam doradca',
          label: 'Warianty',
        },
        {
          title: 'Wdrożenie',
          icon: 'wrench',
          text: 'Konfigurujemy przed dostawą, montujemy, fiskalizujemy kasy, przenosimy dane i szkolimy zespół.',
          gets: 'działające stanowiska od pierwszego dnia',
          role: 'Wdrożeniowiec',
          label: 'U Ciebie w firmie',
        },
        {
          title: 'Opieka',
          icon: 'shield',
          text: 'Serwis, przeglądy kas z przypomnieniem, aktualizacje i pomoc, gdy coś przestaje działać.',
          gets: `jeden numer do wszystkiego: ${BIZNES_CONTACT.phone}`,
          role: 'Serwisant i opiekun IT',
          label: 'Na lata',
        },
      ],
      commitmentsEyebrow: 'Nasze zobowiązania',
      commitmentsHeading: 'Tak pracujemy na co dzień',
      // „Nasze zobowiązania”: title — note (`BzSteps/commitment.ts`).
      guarantees: [
        { text: '60 minut — oddzwaniamy w godzinach pracy' },
        { text: 'Wycena — pod Twoją firmę, w kilku wariantach' },
        { text: 'Kasa gotowa do pracy — fiskalizacja, programowanie, szkolenie' },
        { text: `Jeden numer — ${BIZNES_CONTACT.phone}, oferty i serwis` },
      ],
    },
  ]
}
