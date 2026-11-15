import { h2, p, ul } from '../lexical'
import type { BiznesGuidePost } from './types'

// Audyt 15.11 P1-3, partia 3: payment terminals, the season, split payment and the KSeF number in
// transfers, and IT in the company (Windows 10, backups, shredders). Facts checked on 15.11.2026
// (biznes.gov.pl, ksef.podatki.gov.pl, microsoft.com, polcard.pl, posnet.com.pl, synology.com,
// fellowes.com).

const VERIFIED = '2026-11-15'

export const TERMINAL_WITH_REGISTER: BiznesGuidePost = {
  slug: 'terminal-platniczy-zintegrowany-z-kasa',
  title: 'Terminal płatniczy połączony z kasą — po co i jak to działa',
  category: 'terminale',
  lead: 'Kasjer wbija kwotę na kasie, a potem drugi raz na terminalu. Wystarczy jedna pomyłka i rozliczenie dnia się nie zgadza. Połączenie terminala z kasą usuwa ten krok. Wyjaśniamy, jak to działa i co trzeba sprawdzić przed zakupem.',
  summary:
    'Po połączeniu terminala z kasą kwota transakcji trafia do terminala sama, gdy kasjer wybierze płatność kartą. Kasy online komunikują się z terminalem przez krajowy protokół ECR-EFT. Integrację najlepiej przeprowadzić z serwisem, który zna i kasę, i terminal.',
  content: [
    h2('Jedna kwota zamiast dwóch'),
    p(
      'Bez połączenia kasjer nabija paragon, a potem wpisuje tę samą kwotę na terminalu. Przy kolejce łatwo o pomyłkę — za mało albo za dużo pobrane z karty i różnica w raporcie na koniec dnia.',
    ),
    p(
      'Po połączeniu kasa sama wysyła kwotę do terminala w chwili, gdy kasjer wybierze płatność kartą. Klient tylko przykłada kartę albo telefon.',
    ),
    h2('Co zyskujesz'),
    ul(
      ['brak pomyłek przy wpisywaniu kwoty,'],
      ['krótszą obsługę klienta i mniejsze kolejki w sezonie,'],
      ['zgodne raporty kasy i terminala, łatwiejsze rozliczenie dnia.'],
    ),
    h2('Jak to działa technicznie'),
    p(
      'Kasy online rozmawiają z terminalem przez krajowy protokół ECR-EFT. W kasie włącza się obsługę terminala i ustawia połączenie, a w terminalu — współpracę z kasą. Szczegóły zależą od modelu kasy, terminala i wersji ich oprogramowania.',
    ),
    h2('Co sprawdzić przed zakupem'),
    ul(
      ['model i wersję oprogramowania kasy (starsze kasy mogą wymagać aktualizacji),'],
      ['czy terminal współpracuje z Twoją kasą — nie każde połączenie jest obsługiwane,'],
      ['jak terminal łączy się z siecią: kabel, Wi-Fi albo karta SIM,'],
      ['czy potrzebujesz terminala przenośnego, na przykład do stolików albo pokoi.'],
    ),
    h2('Terminal w telefonie'),
    p(
      'Przy małej liczbie płatności kartą wystarczyć może terminal w telefonie, na przykład PolCard Go. Przy stałej sprzedaży na kasie wygodniejszy jest terminal połączony z kasą.',
    ),
    p(
      'Jesteśmy autoryzowanym serwisem kas Posnet i Elzab i oferujemy terminale PolCard. Dobierzemy terminal do kasy, połączymy je i sprawdzimy na próbnej sprzedaży. Zobacz też ',
      { text: 'terminale płatnicze', href: '/oferta/terminale-platnicze' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'PolCard — integracje z systemami kasowymi',
      url: 'https://www.polcard.pl/rozwiazania-platnicze/uslugi-dodatkowe/integracje-z-systemami-kasowymi/',
    },
    {
      name: 'Posnet — integracja kas online z terminalami płatniczymi',
      url: 'https://saio.posnet.com.pl/strefa-wiedzy/integracja-kas-fiskalnych-online-z-terminalami-platniczymi-zostala-przesunieta',
    },
  ],
  products: [
    'terminal-platniczy-polcard',
    'polcard-desk-3200-desk-1500',
    'polcard-move-3500',
    'posnet-netpay',
    'polcard-go-terminal-w-telefonie',
    'posnet-ergo-online',
  ],
  cta: {
    eyebrow: 'Terminale płatnicze',
    title: 'Połączymy terminal z Twoją kasą',
    text: 'Dobór terminala PolCard do kasy Posnet albo Elzab, konfiguracja i próbna sprzedaż.',
    link: { label: 'Zobacz terminale płatnicze', href: '/oferta/terminale-platnicze' },
  },
  contact: {
    heading: 'Chcesz połączyć terminal z kasą?',
    lead: 'Podaj model kasy i to, jak przyjmujesz dziś płatności kartą. Powiemy, co da się połączyć.',
  },
  seo: {
    title: 'Terminal płatniczy połączony z kasą',
    description:
      'Jak działa terminal płatniczy połączony z kasą fiskalną: kwota bez przepisywania, protokół ECR-EFT i co sprawdzić przed zakupem terminala.',
  },
}

export const SEASON_CHECKLIST: BiznesGuidePost = {
  slug: 'kasa-i-terminal-przed-sezonem',
  title: 'Kasa, terminal i Wi-Fi przed sezonem — lista dla sklepu, lokalu i pensjonatu',
  category: 'terminale',
  lead: 'Na Podhalu sezon zaczyna się z dnia na dzień: ferie, majówka, wakacje. Gdy przy pełnej sali kasa traci połączenie albo terminal nie drukuje potwierdzeń, każda minuta kosztuje. Oto lista rzeczy, które warto sprawdzić kilka tygodni wcześniej.',
  summary:
    'Przed sezonem sprawdź termin przeglądu kasy, połączenie kasy online z internetem, terminal i jego łączność, zapas papieru, uprawnienia do KSeF dla nowych pracowników i kopię danych. Lepiej zrobić to na spokojnie niż w pierwszy pełny weekend.',
  content: [
    h2('Kasa fiskalna'),
    ul(
      [
        'Sprawdź w książce kasy, kiedy wypada ',
        { text: 'przegląd techniczny', href: '/aktualnosci/przeglad-kasy-fiskalnej-co-2-lata' },
        ' — w sezonie trudniej o wolny termin.',
      ],
      ['Upewnij się, że kasa online stale łączy się z internetem.'],
      ['Sprawdź stawki VAT i nowe pozycje w menu albo cenniku usług.'],
      ['Zrób zapas rolek papieru — w sezonie schodzą szybciej, niż się wydaje.'],
    ),
    h2('Terminal płatniczy'),
    ul(
      ['Zrób próbną płatność i zwrot, zanim przyjdą goście.'],
      ['Sprawdź łączność terminala w miejscach, gdzie z nim chodzisz: sala, taras, recepcja.'],
      [
        'Jeśli kasjer przepisuje kwoty ręcznie, rozważ ',
        {
          text: 'połączenie terminala z kasą',
          href: '/aktualnosci/terminal-platniczy-zintegrowany-z-kasa',
        },
        '.',
      ],
    ),
    h2('Internet i Wi-Fi'),
    p(
      'Kasa online, terminal, system POS i program do faktur potrzebują internetu. Gdy łącze pada, pada wszystko naraz. Sprawdź router, zasięg Wi-Fi w lokalu i zastanów się nad łączem zapasowym, na przykład modemem z kartą SIM.',
    ),
    h2('Nowi pracownicy'),
    ul(
      ['krótkie szkolenie z kasy, terminala i zwrotów,'],
      [
        'jeśli będą wystawiać faktury — ',
        { text: 'uprawnienia w KSeF', href: '/aktualnosci/uprawnienia-ksef-dla-ksiegowej' },
        ' nadane z wyprzedzeniem,',
      ],
      ['osobne konta w systemie POS, żeby wiedzieć, kto co sprzedał.'],
    ),
    h2('Kopia danych i plan B'),
    p(
      'Sprawdź, czy kopia danych programu sprzedaży działa i czy ktoś wie, jak ją odtworzyć. Spisz też, co robicie, gdy pada internet — także z fakturami w ',
      { text: 'trybie offline KSeF', href: '/aktualnosci/ksef-awaria-tryb-offline24' },
      '.',
    ),
    p(
      'Zrobimy przegląd kasy, sprawdzimy terminal, sieć i kopie danych przed sezonem. Jeśli wolisz mieć to z głowy na stałe, zobacz ',
      { text: 'opiekę IT', href: '/opieka-it' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Kasa fiskalna w firmie — biznes.gov.pl',
      url: 'https://www.biznes.gov.pl/pl/portal/00243',
    },
  ],
  products: [
    'posnet-ergo-online',
    'terminal-platniczy-polcard',
    'polcard-move-3500',
    'apc-back-ups',
  ],
  cta: {
    eyebrow: 'Przed sezonem',
    title: 'Przegląd kasy, terminala i sieci',
    text: 'Sprawdzimy kasę, terminal, Wi-Fi i kopie danych, zanim przyjdą pierwsi goście.',
    link: { label: 'Umów przegląd przed sezonem', href: '/kontakt' },
  },
  contact: {
    heading: 'Przygotujmy firmę na sezon',
    lead: 'Napisz, co masz w lokalu: kasę, terminal, POS, Wi-Fi. Ustalimy termin przeglądu przed sezonem.',
  },
  seo: {
    title: 'Kasa i terminal przed sezonem — lista',
    description:
      'Co sprawdzić przed sezonem w sklepie, lokalu i pensjonacie: przegląd kasy, łączność kasy online, terminal, Wi-Fi, nowi pracownicy, KSeF i kopia danych.',
  },
}

export const SPLIT_PAYMENT_KSEF: BiznesGuidePost = {
  slug: 'split-payment-i-numer-ksef-w-przelewie',
  title: 'Split payment i numer KSeF w przelewie — co zmienia się w płatnościach między firmami',
  category: 'ksef',
  lead: 'Mechanizm podzielonej płatności działa od lat, ale od 1 stycznia 2027 dochodzi nowy obowiązek: numer KSeF faktury w przelewie. Wyjaśniamy, kiedy split payment jest obowiązkowy i co trzeba będzie wpisywać w przelewach do kontrahentów.',
  summary:
    'Split payment jest obowiązkowy, gdy faktura między podatnikami VAT przekracza 15 000 zł brutto i obejmuje towary lub usługi z załącznika 15 do ustawy o VAT. Od 1 stycznia 2027 czynny podatnik VAT płacący innemu podaje w przelewie numer KSeF faktury.',
  content: [
    h2('Jak działa split payment'),
    p(
      'Przy podzielonej płatności nabywca robi jeden przelew, a bank dzieli kwotę: netto trafia na rachunek firmowy sprzedawcy, a VAT na jego rachunek VAT. Rachunek VAT bank zakłada automatycznie, a w komunikacie przelewu podaje się kwotę VAT, kwotę brutto, numer faktury i NIP dostawcy.',
    ),
    h2('Kiedy jest obowiązkowy'),
    ul(
      ['sprzedawca i nabywca są podatnikami VAT,'],
      ['wartość brutto faktury przekracza 15 000 zł,'],
      ['na fakturze są towary lub usługi z załącznika 15 do ustawy o VAT.'],
    ),
    p(
      'Taka faktura musi mieć oznaczenie „mechanizm podzielonej płatności”. W pozostałych przypadkach split payment jest dobrowolny — decyzję o podziale płatności podejmuje nabywca.',
    ),
    h2('Od 1 stycznia 2027: numer KSeF w przelewie'),
    p(
      'Od 1 stycznia 2027 czynny podatnik VAT, który płaci innemu czynnemu podatnikowi VAT, podaje w przelewie numer KSeF faktury. Dotyczy to także płatności w mechanizmie podzielonej płatności. Przy płatności za kilka faktur jednym przelewem przepisy przewidują identyfikator zbiorczy.',
    ),
    p(
      'MF wskazuje, że celem jest przeciwdziałanie zatorom płatniczym: sprzedawca od razu wie, za którą fakturę przyszły pieniądze.',
    ),
    h2('Co przygotować'),
    ul(
      ['sprawdź, czy Twój program do faktur pokazuje numer KSeF przy każdej fakturze zakupu,'],
      ['zapytaj bank, jak w bankowości firmowej wpisuje się numer KSeF i identyfikator zbiorczy,'],
      [
        'ustal z księgową, kto robi przelewy i skąd bierze numery KSeF — o dostępie dla biura piszemy w poradniku ',
        { text: 'o uprawnieniach w KSeF', href: '/aktualnosci/uprawnienia-ksef-dla-ksiegowej' },
        '.',
      ],
    ),
    p(
      'Jako autoryzowany partner InsERT skonfigurujemy program do faktur, uprawnienia i przepływ faktur zakupu przy ',
      { text: 'wdrożeniu KSeF', href: '/ksef' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Mechanizm podzielonej płatności (MPP) — biznes.gov.pl',
      url: 'https://www.biznes.gov.pl/pl/portal/00227',
    },
    {
      name: 'Pytania i odpowiedzi KSeF 2.0 — płatności (MF)',
      url: 'https://ksef.podatki.gov.pl/pytania-i-odpowiedzi-ksef-20/?category=&query=przelew',
    },
    {
      name: 'ustawa o VAT (art. 108a)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
    },
  ],
  products: ['insert-subiekt-nexo', 'insert-subiekt-gt'],
  cta: {
    eyebrow: 'Wdrożenie KSeF',
    title: 'Faktury i płatności po nowemu',
    text: 'Program do faktur z numerami KSeF, uprawnienia dla księgowej i przepływ faktur zakupu.',
    link: { label: 'Zapytaj o wdrożenie KSeF', href: '/ksef' },
  },
  contact: {
    heading: 'Masz pytania o płatności i KSeF?',
    lead: 'Napisz, w jakim programie masz faktury i kto robi przelewy. Pomożemy to poukładać przed 2027.',
  },
  seo: {
    title: 'Split payment i numer KSeF w przelewie',
    description:
      'Kiedy split payment jest obowiązkowy (15 000 zł, załącznik 15) i co zmienia się od 1 stycznia 2027: numer KSeF faktury w przelewie między firmami.',
  },
}

export const WINDOWS_10_END: BiznesGuidePost = {
  slug: 'windows-10-koniec-wsparcia-firma',
  title: 'Windows 10 bez wsparcia — co zrobić z komputerami w firmie',
  category: 'it-w-firmie',
  lead: '14 października 2025 Microsoft zakończył wsparcie Windows 10. Komputery dalej działają, ale nie dostają poprawek bezpieczeństwa. Podpowiadamy, jak sprawdzić, które komputery da się przenieść na Windows 11, a które lepiej wymienić.',
  summary:
    'Windows 10 po 14 października 2025 nie dostaje aktualizacji ani poprawek bezpieczeństwa. Firmy mogą wykupić rozszerzone aktualizacje zabezpieczeń (ESU) najwyżej na 3 lata. Docelowo komputery trzeba przenieść na Windows 11 — wymaga on m.in. TPM 2.0 i bezpiecznego rozruchu UEFI.',
  content: [
    h2('Co się zmieniło po 14 października 2025'),
    p(
      'Komputer z Windows 10 nadal się uruchamia i działa. Microsoft nie wydaje już jednak dla niego aktualizacji funkcji i poprawek bezpieczeństwa ani nie udziela pomocy technicznej. Każda nowa luka zostaje otwarta — a w firmie na tych komputerach są faktury, dane klientów i dostęp do banku.',
    ),
    h2('Rozszerzone aktualizacje (ESU) — rozwiązanie na przejście'),
    p(
      'Firmy mogą wykupić program Extended Security Updates: poprawki bezpieczeństwa najwyżej przez 3 lata po końcu wsparcia, licząc od listopada 2025. Warunek: komputer musi mieć Windows 10 w wersji 22H2. ESU nie obejmuje pomocy technicznej ani nowych funkcji — to czas na spokojną wymianę, nie sposób na kolejne lata.',
    ),
    h2('Czy komputer pójdzie na Windows 11'),
    p('Minimalne wymagania Windows 11 według Microsoft:'),
    ul(
      ['procesor 64-bitowy, co najmniej 1 GHz i 2 rdzenie, z listy zgodnych procesorów,'],
      ['4 GB RAM i 64 GB miejsca na dysku,'],
      ['UEFI z bezpiecznym rozruchem (Secure Boot),'],
      ['moduł TPM w wersji 2.0.'],
    ),
    p(
      'W praktyce do pracy biurowej warto mieć więcej niż minimum — 4 GB RAM to zdecydowanie za mało na przeglądarkę, pocztę i program do faktur naraz.',
    ),
    h2('Plan w trzech krokach'),
    ul(
      ['Spisz komputery: model, wiek, wersję Windows, kto na nim pracuje.'],
      ['Sprawdź zgodność z Windows 11 — część komputerów wystarczy zaktualizować.'],
      ['Starsze komputery zaplanuj do wymiany, zaczynając od tych z danymi klientów i fakturami.'],
    ),
    p(
      'Zrobimy przegląd komputerów w firmie, przeniesiemy zgodne na Windows 11 razem z danymi i programami, a do wymiany zaproponujemy komputery biznesowe Lenovo i Dell. Zacznij od ',
      { text: 'opieki IT', href: '/opieka-it' },
      ' albo zobacz ',
      { text: 'komputery', href: '/oferta/komputery' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Microsoft — koniec wsparcia Windows 10',
      url: 'https://www.microsoft.com/pl-pl/windows/end-of-support',
    },
    {
      name: 'Microsoft Learn — Extended Security Updates dla Windows 10',
      url: 'https://learn.microsoft.com/pl-pl/windows/whats-new/extended-security-updates',
    },
    {
      name: 'Microsoft — wymagania Windows 11',
      url: 'https://www.microsoft.com/pl-pl/windows/windows-11-specifications',
    },
  ],
  products: [
    'lenovo-thinkcentre-neo-50q-55q',
    'lenovo-thinkpad-e14-gen8-e16-gen4',
    'lenovo-thinkpad-t14-gen7',
    'dell-pro-14-16',
  ],
  cta: {
    eyebrow: 'Opieka IT',
    title: 'Przegląd komputerów pod Windows 11',
    text: 'Spis komputerów, sprawdzenie zgodności, przeniesienie danych i plan wymiany starszych.',
    link: { label: 'Zobacz opiekę IT', href: '/opieka-it' },
  },
  contact: {
    heading: 'Masz w firmie komputery z Windows 10?',
    lead: 'Napisz, ile ich jest i do czego służą. Sprawdzimy, które przejdą na Windows 11, a które wymienić.',
  },
  seo: {
    title: 'Windows 10 bez wsparcia — co z firmą',
    description:
      'Windows 10 bez wsparcia od 14 października 2025: co to znaczy dla firmy, ESU na maksymalnie 3 lata, wymagania Windows 11 i plan wymiany komputerów.',
  },
}

export const BACKUP_321: BiznesGuidePost = {
  slug: 'kopia-zapasowa-3-2-1-nas',
  title: 'Kopia zapasowa w małej firmie — zasada 3-2-1 i serwer NAS',
  category: 'it-w-firmie',
  lead: 'Awaria dysku, kradzież laptopa, ransomware, który szyfruje pliki. W każdym z tych przypadków liczy się jedno: czy masz kopię, z której da się wszystko odtworzyć. Pokazujemy prosty sposób na kopie danych w małej firmie.',
  summary:
    'Zasada 3-2-1 to trzy kopie danych, na dwóch różnych nośnikach, w tym jedna poza firmą. Serwer NAS z migawkami i kopią do chmury albo na drugi NAS spełnia ją bez ręcznej pracy. Kopia ma sens tylko wtedy, gdy co jakiś czas sprawdzasz, że da się z niej odtworzyć dane.',
  content: [
    h2('Zasada 3-2-1'),
    ul(
      [{ bold: '3 kopie' }, ' danych: oryginał i dwie kopie,'],
      [{ bold: '2 różne nośniki' }, ': na przykład komputer i serwer NAS,'],
      [{ bold: '1 kopia poza firmą' }, ': w chmurze albo na drugim urządzeniu w innym miejscu.'],
    ),
    p(
      'Producenci serwerów NAS rozszerzają ją dziś do 3-2-1-1-0: jedna kopia ma być niezmienna albo odcięta od sieci, a zero oznacza zero błędów przy próbnym odtworzeniu.',
    ),
    h2('Dlaczego sam dysk zewnętrzny nie wystarczy'),
    p(
      'Dysk podłączony na stałe do komputera zaszyfruje ten sam ransomware, który zaszyfruje komputer. Dysk w szufladzie podłącza się zwykle „jak ktoś pamięta”. Kopia musi robić się sama, według harmonogramu.',
    ),
    h2('Serwer NAS w roli strażnika'),
    ul(
      ['automatyczna kopia komputerów i folderów firmy,'],
      [
        'migawki (snapshoty) — możesz cofnąć pliki do stanu sprzed godziny albo dnia, także po ataku,',
      ],
      ['migawki niezmienne: przez ustalony czas nie da się ich usunąć ani zmienić,'],
      ['kopia z NAS do chmury albo na drugi NAS w innej lokalizacji.'],
    ),
    p(
      'Sama migawka na tym samym NAS-ie to jeszcze nie pełna ochrona — dlatego trzecia kopia trafia poza firmę.',
    ),
    h2('Raz na kwartał: próbne odtworzenie'),
    p(
      'Kopia, z której nikt nigdy nie odtwarzał danych, to tylko nadzieja. Raz na kwartał odtwórz kilka plików albo bazę programu i sprawdź, czy działają. Zapisz, jak długo to trwało.',
    ),
    p(
      'Dobierzemy i skonfigurujemy serwer NAS Synology albo QNAP, ustawimy kopie komputerów, migawki i kopię poza firmą, a potem będziemy sprawdzać, czy działają. Zobacz ',
      { text: 'serwery NAS i UPS', href: '/oferta/serwery-nas-ups' },
      ' i ',
      { text: 'zestaw kopii zapasowych', href: '/zestawy/zestaw-kopie-zapasowe' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Synology — kopia zapasowa i ochrona danych',
      url: 'https://www.synology.com/pl-pl/dsm/solution/data_backup',
    },
    {
      name: 'Synology — ochrona przed ransomware',
      url: 'https://www.synology.com/pl-pl/dsm/solution/ransomware',
    },
    {
      name: 'Synology — jak wykonać kopię zapasową NAS',
      url: 'https://kb.synology.com/pl-pl/DSM/tutorial/How_to_back_up_your_Synology_NAS',
    },
  ],
  products: [
    'synology-diskstation-plus-2-4',
    'qnap-nas-2-4',
    'synology-dyski-hat',
    'apc-back-ups-pro',
  ],
  cta: {
    eyebrow: 'Kopie zapasowe',
    title: 'Kopia 3-2-1 bez ręcznej pracy',
    text: 'Serwer NAS, kopie komputerów, migawki i kopia poza firmą — skonfigurowane i sprawdzane.',
    link: { label: 'Zobacz zestaw kopii zapasowych', href: '/zestawy/zestaw-kopie-zapasowe' },
  },
  contact: {
    heading: 'Nie wiesz, czy masz dobrą kopię?',
    lead: 'Napisz, gdzie dziś trzymasz dane firmy i jak robisz kopie. Sprawdzimy, czego brakuje.',
  },
  seo: {
    title: 'Kopia zapasowa 3-2-1 i serwer NAS',
    description:
      'Jak zrobić kopię zapasową w małej firmie: zasada 3-2-1, serwer NAS z migawkami, kopia poza firmą i próbne odtworzenie danych raz na kwartał.',
  },
}

export const SHREDDER_GDPR: BiznesGuidePost = {
  slug: 'niszczarka-dokumentow-rodo-poziom-p4',
  title: 'Niszczarka do dokumentów z danymi osobowymi — jaki poziom wybrać',
  category: 'it-w-firmie',
  lead: 'Faktury, umowy, CV kandydatów, kopie dowodów — w każdej firmie są papiery z danymi osobowymi. Wrzucenie ich do kosza to proszenie się o kłopoty. Wyjaśniamy, co oznaczają poziomy P-1 do P-7 i którą niszczarkę wybrać do biura.',
  summary:
    'Poziomy bezpieczeństwa niszczarek opisuje norma DIN 66399: od P-1 (paski) do P-7. RODO nie wskazuje konkretnego poziomu — wymaga środków dobranych do ryzyka. Do dokumentów z danymi osobowymi producenci zalecają co najmniej P-4.',
  content: [
    h2('Poziomy P-1 do P-7 w skrócie'),
    ul(
      [{ bold: 'P-1, P-2' }, ' — cięcie na paski, niezalecane w firmie ani dla danych osobowych,'],
      [{ bold: 'P-3, P-4' }, ' — cięcie na ścinki, dla dokumentów z danymi osobowymi,'],
      [
        { bold: 'P-4 miniścinki' },
        ' — co najmniej 1000 kawałków z kartki A4, wyraźnie trudniejsze do złożenia,',
      ],
      [{ bold: 'P-5' }, ' — mikrościnki, dla danych ściśle poufnych,'],
      [{ bold: 'P-6, P-7' }, ' — dla dokumentów tajnych, rzadko potrzebne w małej firmie.'],
    ),
    h2('Co mówi RODO'),
    p(
      'RODO nie podaje numeru poziomu niszczarki. Wymaga, żeby firma stosowała środki bezpieczeństwa odpowiednie do ryzyka dla danych. W praktyce przyjmuje się, że do dokumentów z danymi osobowymi nie wystarcza cięcie na paski — producenci zalecają co najmniej P-4, a do dokumentów szczególnie wrażliwych P-5.',
    ),
    h2('Na co jeszcze zwrócić uwagę'),
    ul(
      ['ile kartek niszczarka tnie naraz i jak długo może pracować bez przerwy,'],
      ['automatyczny podajnik — wkładasz plik kartek i wracasz do pracy,'],
      ['czy tnie zszywki i spinacze, płyty i karty,'],
      ['pojemność kosza i głośność, jeśli stoi w biurze.'],
    ),
    h2('Dane na dyskach też trzeba zniszczyć'),
    p(
      'Stary komputer, dysk czy telefon firmowy to te same dane, tylko w innej postaci. Przed sprzedażą albo oddaniem sprzętu dane trzeba trwale usunąć — samo skasowanie plików nie wystarczy. Pomożemy to zrobić przy ',
      { text: 'wymianie komputerów', href: '/aktualnosci/windows-10-koniec-wsparcia-firma' },
      '.',
    ),
    p(
      'Mamy niszczarki Fellowes i Kobra — od biurowych z podajnikiem po modele do dużych archiwów. Zobacz ',
      { text: 'niszczarki', href: '/oferta/niszczarki' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Fellowes — poziomy bezpieczeństwa niszczarek (DIN 66399)',
      url: 'https://www.fellowes.com/pl/pl/catalog/business-machines/resources/pg/shredder-security-levels',
    },
    {
      name: 'PARP — Ochrona danych osobowych w przedsiębiorstwie',
      url: 'https://www.parp.gov.pl/storage/publications/pdf/ochrona_danych_osobowych_.pdf',
    },
  ],
  products: [
    'fellowes-automax-100m',
    'fellowes-automax-200c',
    'kobra-1-cc4-es',
    'kobra-240-c4-turbo-es',
  ],
  cta: {
    eyebrow: 'Niszczarki',
    title: 'Niszczarka dobrana do Twoich dokumentów',
    text: 'Fellowes i Kobra: poziom P-4 albo P-5, podajnik automatyczny, praca w biurze i w archiwum.',
    link: { label: 'Zobacz niszczarki', href: '/oferta/niszczarki' },
  },
  contact: {
    heading: 'Jaką niszczarkę wybrać?',
    lead: 'Napisz, ile dokumentów niszczysz i jakie dane w nich są. Dobierzemy poziom i model.',
  },
  seo: {
    title: 'Niszczarka a RODO — jaki poziom wybrać',
    description:
      'Poziomy niszczarek P-1 do P-7 według DIN 66399, co mówi RODO i dlaczego do dokumentów z danymi osobowymi wybiera się co najmniej P-4. Poradnik dla biura.',
  },
}
