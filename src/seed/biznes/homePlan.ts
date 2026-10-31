import type { IconName } from '../../lib/catalog/options'
import type { Page } from '../../payload-types'

/**
 * Start content of B7c, v150 (K4c): „Plan Twojej firmy” with „Dla kogo”, „Jak pracujemy”. Texts 1:1
 * from `docs/design/prokombiznes/boards/Main.dc.html` (scenes `S`, points `FPS`, industries
 * `KGT`/`KGR`, `.pextra`, `.dof`, `.s2`, `.j4`). Icons: the nearest of the shared set (a new set
 * comes with SW2a). Local only, like the rest of `pnpm seed:biznes`.
 */

type HomeBlock = NonNullable<Page['layout']>[number]
type Point = { name: string; note: string }

const p = (name: string, note: string): Point => ({ name, note })

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
  })

  return [
    {
      blockType: 'bzPlan',
      eyebrow: 'Plan Twojej firmy',
      heading: 'Zobacz, co ustawimy w Twoim lokalu.',
      // TODO(krystian): plansza mówi „kliknij urządzenie na planie” — w etapie 1 nie ma rzutu
      // do klikania (spec. §4 pkt 6), więc tekst skrócony; wraca 1:1 z etapem 2.
      lead: 'Wybierz rodzaj firmy i zobacz, co zwykle ustawiamy — a my dobierzemy, skonfigurujemy i będziemy serwisować całość.',
      sceneNote: 'z jednej ręki',
      moreLabel: 'Więcej o branży',
      inquiryLabel: 'Przygotuj zapytanie:',
      scenes: [
        {
          tab: 'Sklep',
          icon: 'store',
          title: 'Sklep spożywczy',
          lead: 'Kasa, waga, skaner i program, które ze sobą rozmawiają. Ceny zmieniasz raz — w programie.',
          // Only active industries have a page (`Industries`); the others get no link.
          moreHref: '/branze/handel',
          inquiryHref: '/kreator',
          points: [
            p('Wi-Fi Ubiquiti', 'kasy osobno od gości'),
            p('Ekran w witrynie', 'promocje z telefonu'),
            p('Szuflada Posnet', 'PLN i EUR'),
            p('Posnet Ergo Online', 'kasa z fiskalizacją w cenie'),
            p('Skaner 2D Sunmi', 'kody z każdego towaru'),
            p('Terminal PolCard', 'karty, BLIK, 0 zł na start'),
            p('Waga Fawag WS-1', 'z legalizacją, do kasy'),
            p('Subiekt nexo', 'sprzedaż, magazyn, KSeF'),
            p('ESET', 'ochrona stanowisk'),
            p('Synology NAS', 'kopie co noc'),
            p('Serwer Dell PowerEdge', 'program sklepowy, dane'),
            p('UPS APC', 'prąd gaśnie, kasa nie'),
          ],
        },
        {
          tab: 'Restauracja',
          icon: 'bell',
          title: 'Restauracja',
          lead: 'Zamówienie z sali trafia na kuchnię bez karteczek, rachunek zamykasz przy stoliku, dowozy spływają same.',
          moreHref: '/branze/gastronomia',
          inquiryHref: '/kreator',
          points: [
            p('Wi-Fi Ubiquiti', 'goście osobno od kasy'),
            p('Kiosk Sunmi K2', 'gość zamawia sam'),
            p('Sunmi V3 MIX', 'kelner przy stoliku'),
            p('GoPOS na Sunmi D3 PRO', 'stanowisko sprzedaży'),
            p('Posnet Thermal HX', 'drukarka fiskalna'),
            p('Terminal PolCard', 'płatność przy stoliku'),
            p('Ekran kuchenny KDS', 'zamówienia na kuchnię'),
            p('Drukarka bonów Sunmi', 'bar i kuchnia'),
            p('Synology NAS', 'kopie i nagrania'),
            p('UPS APC', 'kasa i router bez przerw'),
          ],
        },
        {
          tab: 'Pensjonat',
          icon: 'pin',
          title: 'Pensjonat',
          lead: 'Booking, własna strona i recepcja w jednym grafiku, restauracja z rachunkiem na pokój, Wi-Fi, które wytrzyma pełny obiekt.',
          moreHref: '/branze/noclegi',
          inquiryHref: '/kreator',
          points: [
            p('NFHotel', 'rezerwacje, Booking, KSeF'),
            p('Posnet Temo Online', 'drukarka na recepcji'),
            p('Terminal PolCard', 'karty i BLIK'),
            p('Ekran w lobby', 'atrakcje, pogoda, oferta'),
            p('GoPOS w restauracji', 'rachunek na pokój'),
            p('Wi-Fi Ubiquiti', 'osobno goście i recepcja'),
            p('Synology NAS', 'kopie i nagrania'),
            p('Serwer Dell PowerEdge', 'NFHotel, recepcja, biuro'),
            p('Podpis kwalifikowany', 'KSeF, ZUS z telefonu'),
          ],
        },
        {
          tab: 'Biuro',
          icon: 'monitor',
          title: 'Biuro i firma usługowa',
          lead: 'Stanowiska, poczta, pliki i kopie pod jedną opieką. Awaria to telefon, nie koniec dnia.',
          inquiryHref: '/kreator',
          points: [
            p('ThinkCentre neo', 'stanowiska pracy'),
            p('Monitor ThinkVision', '27", ergonomia'),
            p('Microsoft 365', 'poczta, Teams, pliki'),
            p('ESET PROTECT', 'wszystkie stanowiska'),
            p('Konica Minolta bizhub', 'A3, skan do e-mail'),
            p('Monitor interaktywny Avtek', 'sala konferencyjna'),
            p('Serwer Dell PowerEdge', 'Windows Server, domena, RDP'),
            p('Synology NAS', 'kopie co noc'),
            p('UPS APC', 'serwer bez przerw'),
            p('Podpis kwalifikowany', 'umowy, KSeF, przetargi'),
            p('Firewall Stormshield', 'brama sieci, VPN dla pracowników'),
            p('Comarch ERP Optima', 'księgowość, kadry, faktury, KSeF'),
          ],
        },
        {
          tab: 'Szkoła',
          icon: 'grad',
          title: 'Szkoła',
          lead: 'Sale z monitorami, pracownia z komputerami, Wi-Fi w całym budynku — i komplet dokumentów do dofinansowania.',
          inquiryHref: '/kreator',
          points: [
            p('Avtek 75"', 'monitor interaktywny'),
            p('Projektor Sharp/NEC', '3 lata gwarancji'),
            p('Laptop dla nauczyciela', 'Lenovo, Windows 11'),
            p('Wi-Fi Ubiquiti', 'cały budynek'),
            p('Ekran informacyjny', 'plan lekcji, komunikaty'),
            p('ThinkCentre', 'pracownia komputerowa'),
            p('ESET', 'ochrona stanowisk'),
            p('Kyocera', 'sekretariat, niski koszt strony'),
            p('Serwer Dell PowerEdge', 'dziennik, pliki, kopie'),
          ],
        },
        {
          tab: 'Gabinet',
          icon: 'shield',
          title: 'Gabinet i przychodnia',
          lead: 'Rejestracja, na którą można liczyć, kasa dla usług medycznych i dane pacjentów chronione kopią i szyfrowaniem.',
          inquiryHref: '/kreator',
          points: [
            p('Posnet Neo Online', 'kasa dla usług'),
            p('Terminal PolCard', 'karty i BLIK'),
            p('Laptop Dell', 'rejestracja i grafik'),
            p('Kiosk rejestracji', 'pacjent zgłasza się sam'),
            p('Wi-Fi Ubiquiti', 'osobno pacjenci i gabinety'),
            p('ESET PROTECT', 'dane pacjentów'),
            p('Podpis kwalifikowany', 'e-dokumentacja, ZUS'),
            p('Synology NAS', 'kopie i szyfrowanie'),
          ],
        },
        {
          tab: 'Warsztat',
          icon: 'wrench',
          title: 'Warsztat i serwis',
          lead: 'Zlecenia, części i faktury w jednym programie, kasa i terminal w biurze obsługi, Wi-Fi, które sięga do hali.',
          inquiryHref: '/kreator',
          points: [
            p('Posnet Ergo Online', 'kasa, usługi i części'),
            p('Terminal PolCard', 'karty i BLIK'),
            p('Subiekt nexo', 'zlecenia, części, faktury'),
            p('Serwer Dell PowerEdge', 'baza zleceń i kopie'),
            p('Ekran w poczekalni', 'oferta i status naprawy'),
            p('Wi-Fi Ubiquiti', 'sięga do hali'),
            p('Laptop Lenovo', 'diagnostyka, katalogi'),
            p('Drukarka Kyocera', 'protokoły i faktury'),
            p('QNAP NAS', 'kopie i zdjęcia napraw'),
          ],
        },
        {
          tab: 'Produkcja',
          icon: 'server',
          title: 'Produkcja i hurtownia',
          lead: 'Magazyn, produkcja i biuro w jednym systemie — z serwerem, kopiami i siecią, która nie pada w sezonie.',
          inquiryHref: '/kreator',
          points: [
            p('Subiekt nexo / Streamsoft', 'magazyn, zamówienia, KSeF'),
            p('ThinkCentre', 'stanowiska biurowe'),
            p('ESET PROTECT', 'wszystkie stanowiska'),
            p('Serwer Dell PowerEdge', 'Windows Server, dane firmy'),
            p('UPS APC', 'serwer bez przerw'),
            p('Firewall Barracuda', 'hala, biuro i kamery w osobnych strefach'),
            p('Skaner 2D', 'wysyłka i przyjęcia'),
            p('Terminal mobilny Sunmi', 'remanent i przyjęcia'),
            p('Wi-Fi Ubiquiti', 'hala i magazyn'),
            p('Ekran w hali', 'plan produkcji, BHP'),
          ],
        },
      ],
      promises: [
        {
          title: 'Kasa w cenie z obsługą',
          text: 'zgłoszenie, fiskalizacja, programowanie i szkolenie',
        },
        { title: 'Gotowe przed dostawą', text: 'konfigurujemy u siebie, Ty tylko podłączasz' },
        { title: 'KSeF bez nerwów', text: 'program, certyfikat i uprawnienia dla księgowej' },
        {
          title: 'Przeglądy z przypomnieniem',
          text: 'kasy co 2 lata — pilnujemy terminu za Ciebie',
        },
        {
          title: 'Terminal z Polskiej Bezgotówkowej',
          text: 'dla firm, które spełniają warunki programu',
        },
        // TODO(krystian): numer wpisany w tekst — po zmianie telefonu linii poprawić też tutaj.
        { title: 'Jeden numer do wszystkiego', text: '889 003 889 — oferty, awarie, pytania' },
      ],
      industries: {
        // v150 (board `#s4-real`): its own section „Dla kogo” before the plan.
        heading: 'Firmy każdej wielkości. Od straganu po urząd gminy.',
        lead: 'Ponad 100 klientów firmowych — firm i instytucji z Podhala i Małopolski. Wybierz swoją branżę — pokażemy plan lokalu z urządzeniami albo dobierzemy rozwiązanie w konfiguratorze.',
        // Not shown on v150 (the tile „Każda inna firma” is the way in) — cleanup PR after 3b.
        button: { label: 'Opisz swoją firmę', href: '/kreator' },
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
          tile('Każda inna firma', 'opisz ją — dobierzemy rozwiązanie', 'q', 'violet', false),
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
      heading: 'Od pierwszej rozmowy do serwisu — bez niespodzianek.',
      lead: 'Cztery kroki i ten sam zespół z Rabki-Zdroju. Na każdym etapie wiesz, kto się Tobą zajmuje i co dostajesz.',
      getsLabel: 'Dostajesz',
      steps: [
        {
          title: 'Rozmowa',
          icon: 'phone',
          text: 'Telefon, wiadomość albo wizyta w Rabce. Pytamy, jak pracuje firma i co ma się poprawić.',
          gets: 'listę potrzeb — także tego, czego nie musisz kupować',
          role: 'Doradca PRO-KOM',
          // v150: the label above the title (the field keeps its old name).
          roleNote: 'Pierwszy kontakt',
        },
        {
          title: 'Oferta',
          icon: 'doc',
          text: 'Dobieramy sprzęt i programy do skali firmy. Kilka wariantów, każdy z uzasadnieniem.',
          gets: 'ofertę na piśmie, bez zobowiązań',
          role: 'ten sam doradca',
          roleNote: 'Na piśmie',
        },
        {
          title: 'Wdrożenie',
          icon: 'wrench',
          text: 'Konfigurujemy przed dostawą, montujemy, fiskalizujemy kasy, przenosimy dane i szkolimy zespół.',
          gets: 'działające stanowiska od pierwszego dnia',
          role: 'Wdrożeniowiec',
          roleNote: 'U Ciebie w firmie',
        },
        {
          title: 'Opieka',
          icon: 'shield',
          text: 'Serwis, przeglądy kas z przypomnieniem, aktualizacje i pomoc, gdy coś przestaje działać.',
          // TODO(krystian): numer wpisany w tekst — po zmianie telefonu linii poprawić też tutaj.
          gets: 'jeden numer do wszystkiego: 889 003 889',
          role: 'Serwisant i opiekun IT',
          roleNote: 'Na lata',
        },
      ],
      // „Nasze zobowiązania”: title — note (`BzSteps/commitment.ts`).
      guarantees: [
        { text: '60 minut — oddzwaniamy w godzinach pracy' },
        { text: 'Wycena na piśmie — bez zobowiązań, pod Twoją firmę' },
        { text: 'Kasa gotowa do pracy — fiskalizacja, programowanie, szkolenie' },
        // TODO(krystian): numer wpisany w tekst, jak wyżej.
        { text: 'Jeden numer — 889 003 889 — oferty i serwis' },
      ],
    },
  ]
}
