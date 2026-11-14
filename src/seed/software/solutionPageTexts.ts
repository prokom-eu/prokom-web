/**
 * Full texts of the solution pages most searched with a place (SEO etap 2b: „strona wizytówka
 * Rabka”, „sklep internetowy Podhale”…): H1 with its accent, lead, „Dziś / Z nami / Efekt”, FAQ
 * and the contact block (`Solutions.page`, spec. §6.1). Tiles, „W cenie” and the price come from
 * the solution itself, so they never disagree with the cards. Every page in its own words.
 * TODO(krystian): szkice Claude do akceptacji (spec. §6.1: treści pisze Krystian).
 */

type Compare = { label: string; title: string; text: string }
type Faq = { q: string; a: string }

export type SolutionPageText = {
  eyebrow: string
  title: string
  titleAccent: string
  lead: string
  compare: [Compare, Compare, Compare]
  deliverablesTitle: string
  faqEyebrow: string
  faq: Faq[]
  contact: { eyebrow: string; title: string; lead: string; quoteCaption: string }
}

/** „Efekt” is measured with the client, never a number from the internet (as the field app). */
const EFFECT = 'Efekt (sprawdzamy po starcie)'

export const SOLUTION_PAGE_TEXTS: Readonly<Record<string, SolutionPageText>> = {
  'strona-wizytowka': {
    eyebrow: 'Strona · usługi, rzemiosło, mała firma',
    title: 'Strona wizytówka.',
    titleAccent: 'Klient dzwoni od razu.',
    lead: 'Jedna strona z ofertą, obszarem działania, mapą i dużym przyciskiem „Zadzwoń”. Dla firmy, która chce być w Google i odbierać telefony, a nie tłumaczyć klientom, jak ją znaleźć.',
    compare: [
      {
        label: 'Dziś',
        title: 'Klient szuka Cię w Google i trafia na konkurencję',
        text: 'Masz tylko numer na samochodzie albo stary profil, którego nikt nie aktualizuje. Kto nie zna Cię z polecenia, dzwoni do innych.',
      },
      {
        label: 'Z wizytówką',
        title: 'Usługi, mapa i telefon na jednym ekranie',
        text: 'Klient z telefonu widzi, co robisz i gdzie, i dzwoni jednym kliknięciem. Formularz przychodzi prosto na Twoją skrzynkę.',
      },
      {
        label: EFFECT,
        title: 'Więcej telefonów od ludzi, którzy Cię nie znali',
        text: 'Ile zapytań przychodzi ze strony, widać w statystykach bez ciasteczek. Pokażemy Ci je po pierwszym miesiącu.',
      },
    ],
    deliverablesTitle: 'W cenie **wizytówki**',
    faqEyebrow: 'Pytania o stronę wizytówkę',
    faq: [
      {
        q: 'Czy jedna strona wystarczy?',
        a: 'Dla firmy usługowej na start zwykle tak. Gdy przybędzie oferty albo realizacji, rozbudujemy ją do strony firmowej bez zaczynania od zera.',
      },
      {
        q: 'Jak szybko będzie gotowa?',
        a: 'Pierwszą wersję zwykle pokazujemy po kilku dniach. Gotowa strona jest od tygodnia, zależnie od tego, jak szybko dostaniemy teksty i zdjęcia.',
      },
      {
        q: 'Czy pomożecie z wizytówką w Google?',
        a: 'Tak. Profil Firmy w Google możemy ustawić razem ze stroną, żeby adres, godziny i telefon zgadzały się w obu miejscach.',
      },
      {
        q: 'Nie mam zdjęć ani tekstów. Co wtedy?',
        a: 'Teksty napiszemy po rozmowie z Tobą, prostym językiem. Zdjęcia możesz zrobić telefonem, a my je przytniemy i dobierzemy.',
      },
      {
        q: 'Pracujecie tylko w Rabce?',
        a: 'Biuro mamy w Rabce-Zdroju, ale wizytówki robimy dla firm z całego Podhala i Małopolski, a zdalnie z całej Polski.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twojej wizytówce',
      title: 'Powiedz, **czym się zajmujesz**, a pokażemy, jak to będzie wyglądać',
      lead: 'Krótka rozmowa, potem podgląd strony i stała cena. Bez zobowiązań.',
      quoteCaption: 'Opisz firmę w dwóch zdaniach, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-firmowa-z-panelem': {
    eyebrow: 'Strona · firmy z ofertą i realizacjami',
    title: 'Strona firmowa z panelem.',
    titleAccent: 'Treści zmieniasz sam.',
    lead: 'Oferta, realizacje, opinie i formularz, który trafia prosto do Ciebie. Nową realizację, cennik albo zdjęcie dodajesz w panelu po polsku, bez dzwonienia do informatyka.',
    compare: [
      {
        label: 'Dziś',
        title: 'Strona sprzed lat, której nikt nie umie zmienić',
        text: 'Każda poprawka to telefon do kogoś, kto już dawno nie odbiera. Realizacje z ostatnich dwóch lat są tylko na Twoim telefonie.',
      },
      {
        label: 'Ze stroną firmową',
        title: 'Pokazujesz to, co robisz najlepiej, i zmieniasz to sam',
        text: 'Realizacje ze zdjęciami i opisem, opinie klientów i formularz. Panel jest prosty jak poczta.',
      },
      {
        label: EFFECT,
        title: 'Klient przychodzi przekonany, a nie z pytaniem „czy Pan to robi?”',
        text: 'Zapytania z formularza są konkretniejsze, bo klient widział realizacje. Liczbę zapytań pokażemy w statystykach.',
      },
    ],
    deliverablesTitle: 'W cenie **strony firmowej**',
    faqEyebrow: 'Pytania o stronę firmową',
    faq: [
      {
        q: 'Czy naprawdę sam zmienię treści?',
        a: 'Tak. Panel jest po polsku i pokazujemy go na Twojej stronie. Dodanie realizacji ze zdjęciami to kilka minut.',
      },
      {
        q: 'Ile podstron dostanę w cenie?',
        a: 'Do pięciu: zwykle oferta, realizacje, opinie, o firmie i kontakt. Więcej podstron, blog albo kolejny język wyceniamy osobno.',
      },
      {
        q: 'Czy strona będzie widoczna w Google i w AI?',
        a: 'Dostaje opisy, dane firmy i strukturę, które czytają wyszukiwarki i asystenci AI. Pozycji nie obiecujemy, ale nie zostawiamy niczego, co od nas zależy.',
      },
      {
        q: 'Co z moją starą stroną i domeną?',
        a: 'Domena zostaje Twoja. Treści przenosimy, a stare adresy przekierowujemy, żeby nie stracić tego, co już jest w Google.',
      },
      {
        q: 'Robicie strony dla firm spoza Podhala?',
        a: 'Tak. Najwięcej klientów mamy w Rabce, Nowym Targu i okolicy, ale strony firmowe robimy dla firm z całej Polski, zdalnie.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twojej stronie',
      title: 'Pokaż nam **swoje realizacje**, a zaprojektujemy stronę wokół nich',
      lead: 'Po rozmowie dostajesz podgląd do klikania i cenę w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Opisz firmę i ofertę, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-dla-hotelu-lub-pensjonatu': {
    eyebrow: 'Strona · pensjonaty, apartamenty, hotele',
    title: 'Strona dla pensjonatu.',
    titleAccent: 'Gość pisze do Ciebie.',
    lead: 'Pokoje, galeria, okolica i zapytanie o termin w trzech językach. Gość, który znalazł Cię w Google, pisze prosto do Ciebie, bez prowizji portalu za każdą noc.',
    compare: [
      {
        label: 'Dziś',
        title: 'Portal bierze prowizję od gości, którzy i tak by przyjechali',
        text: 'Stali goście rezerwują przez portal, bo nie mają gdzie indziej. Na Twoją starą stronę nie da się wejść wygodnie z telefonu.',
      },
      {
        label: 'Z własną stroną',
        title: 'Pokoje i zapytanie o termin, po polsku, angielsku i niemiecku',
        text: 'Gość ogląda pokoje i okolicę, a zapytanie przychodzi do Ciebie. Ceny i zdjęcia zmieniasz sam przed każdym sezonem.',
      },
      {
        label: EFFECT,
        title: 'Część rezerwacji bez prowizji',
        text: 'Ile zapytań przychodzi ze strony, a ile z portali, policzymy razem po pierwszym sezonie. Portale zostają tam, gdzie się opłacają.',
      },
    ],
    deliverablesTitle: 'W cenie **strony obiektu**',
    faqEyebrow: 'Pytania o stronę dla pensjonatu',
    faq: [
      {
        q: 'Czy muszę zrezygnować z portali rezerwacyjnych?',
        a: 'Nie. Własna strona przejmuje gości, którzy szukają Cię po nazwie albo wracają. Portale możesz zostawić dla nowych gości.',
      },
      {
        q: 'Dlaczego trzy języki?',
        a: 'Na Podhale przyjeżdżają goście z Polski, Niemiec i z całej Europy. Polski, angielski i niemiecki to najczęstszy zestaw, a każdy język ma własne opisy dla Google.',
      },
      {
        q: 'Czy goście zarezerwują i zapłacą online?',
        a: 'W tej cenie gość wysyła zapytanie o termin. Kalendarz z rezerwacją i zadatkiem online to osobne rozwiązanie, które dokładamy, gdy jest potrzebne.',
      },
      {
        q: 'Kiedy najlepiej zacząć?',
        a: 'Na dwa, trzy miesiące przed sezonem. Wtedy strona zdąży trafić do Google, zanim goście zaczną szukać noclegu.',
      },
      {
        q: 'Robicie strony dla obiektów poza Rabką?',
        a: 'Tak, dla pensjonatów z całego Podhala i Małopolski. Spotykamy się w Rabce albo przez wideo.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim obiekcie',
      title: 'Opisz **swoje pokoje**, a pokażemy stronę, przez którą goście piszą do Ciebie',
      lead: 'Rozmowa o obiekcie, podgląd strony i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Napisz, ile masz pokoi i skąd są goście, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-dla-restauracji-lub-baru': {
    eyebrow: 'Strona · restauracje, bary, karczmy',
    title: 'Strona dla restauracji.',
    titleAccent: 'Menu zmieniasz w minutę.',
    lead: 'Menu w panelu zamiast PDF-a, godziny w sezonie, dojazd i formularz rezerwacji stolika. Gość z telefonu w kilka sekund wie, czy jesteś otwarty i co dziś gotujesz.',
    compare: [
      {
        label: 'Dziś',
        title: 'Menu w PDF-ie sprzed roku i telefon, który dzwoni w środku obiadu',
        text: 'Goście pytają o godziny i o to, czy jest miejsce. Zmiana menu to zdjęcie tablicy wrzucone gdzieś, gdzie nikt go nie znajdzie.',
      },
      {
        label: 'Ze stroną restauracji',
        title: 'Menu, godziny i rezerwacja w jednym miejscu',
        text: 'Menu dnia zmieniasz w panelu w kilka minut. Gość klika „dojazd” albo wysyła rezerwację stolika, a zgłoszenie przychodzi do Ciebie.',
      },
      {
        label: EFFECT,
        title: 'Mniej telefonów z tymi samymi pytaniami',
        text: 'Ile rezerwacji przychodzi przez formularz, zobaczysz w panelu. Resztę policzymy razem po pierwszym sezonie.',
      },
    ],
    deliverablesTitle: 'W cenie **strony lokalu**',
    faqEyebrow: 'Pytania o stronę dla restauracji',
    faq: [
      {
        q: 'Czy menu dnia zmienię sam z telefonu?',
        a: 'Tak. Panel działa w telefonie, a zmiana menu to dopisanie pozycji i ceny. Bez PDF-ów i bez czekania na kogoś.',
      },
      {
        q: 'Jak działa rezerwacja stolika?',
        a: 'Gość wybiera dzień, godzinę i liczbę osób w formularzu, a Ty dostajesz zgłoszenie i potwierdzasz je telefonicznie albo mailem.',
      },
      {
        q: 'Godziny zmieniają się w sezonie. Co wtedy?',
        a: 'Ustawiasz godziny na sezon i poza nim w panelu, a strona pokazuje te, które obowiązują dziś.',
      },
      {
        q: 'Czy menu może być po angielsku?',
        a: 'Tak, menu w dwóch językach dokładamy osobno. Turyści z zagranicy dobrze je widzą także na telefonie.',
      },
      {
        q: 'Obsługujecie lokale poza Rabką?',
        a: 'Tak, karczmy i restauracje z całego Podhala i dalej. Spotkać się możemy w Rabce albo u Ciebie w lokalu.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim lokalu',
      title: 'Pokaż nam **swoje menu**, a zrobimy stronę, którą łatwo zmieniać',
      lead: 'Pokażemy podgląd strony z Twoim menu i podamy cenę. Bez zobowiązań.',
      quoteCaption:
        'Napisz, jaki masz lokal i jak zbierasz rezerwacje, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'sklep-internetowy': {
    eyebrow: 'Sklep · producenci, sklepy stacjonarne, hurt',
    title: 'Sklep internetowy.',
    titleAccent: 'Zamówienia od razu w panelu.',
    lead: 'Produkty, płatności online i BLIK, dostawa albo odbiór w sklepie. Zamówienie widzisz w panelu w chwili, w której klient je opłaci, i od razu wiesz, co spakować.',
    compare: [
      {
        label: 'Dziś',
        title: 'Zamówienia przez telefon, wiadomości i przelewy do sprawdzania',
        text: 'Klient pisze na komunikatorze, Ty sprawdzasz konto i ręcznie liczysz, co jeszcze jest na półce. Wieczorem odpisujesz na pytania o cenę.',
      },
      {
        label: 'Ze sklepem',
        title: 'Klient wybiera, płaci i wybiera odbiór sam',
        text: 'Płatność online i BLIK, odbiór w sklepie albo dostawa. Zamówienie trafia do panelu opłacone i gotowe do spakowania.',
      },
      {
        label: EFFECT,
        title: 'Sprzedajesz także wtedy, gdy sklep jest zamknięty',
        text: 'Ile zamówień przychodzi wieczorem i w weekendy, zobaczysz w panelu. Połączenie z magazynem i fakturami dokładamy, gdy przyjdzie pora.',
      },
    ],
    deliverablesTitle: 'W cenie **sklepu**',
    faqEyebrow: 'Pytania o sklep internetowy',
    faq: [
      {
        q: 'Jakie płatności dostanie klient?',
        a: 'Płatności online i BLIK przez operatora płatności, którego wybierzemy razem. Pieniądze trafiają na Twoje konto.',
      },
      {
        q: 'Czy połączycie sklep z moim magazynem albo fakturami?',
        a: 'Tak, to częsty następny krok. Sprawdzamy, jaki program masz, i wyceniamy połączenie osobno.',
      },
      {
        q: 'Ile produktów mogę mieć?',
        a: 'Tyle, ile potrzebujesz. Produkty dodajesz w panelu albo przenosimy je z Twojego arkusza.',
      },
      {
        q: 'Dlaczego nie gotowa platforma z abonamentem?',
        a: 'Bo sklep, kod i dane należą do Ciebie, bez prowizji od sprzedaży i bez rosnącego abonamentu. Gdy gotowa platforma wystarczy, powiemy to wprost.',
      },
      {
        q: 'Robicie sklepy dla firm spoza Podhala?',
        a: 'Tak. Biuro mamy w Rabce, ale sklepy robimy dla producentów i sklepów z całej Polski, pracując zdalnie.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim sklepie',
      title: 'Powiedz, **co sprzedajesz**, a zaplanujemy sklep pod Twoje zamówienia',
      lead: 'Rozmowa, plan sklepu i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption:
        'Opisz produkty i to, jak dziś sprzedajesz, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'przebudowa-starej-strony': {
    eyebrow: 'Strona · firmy ze starą stroną',
    title: 'Przebudowa starej strony.',
    titleAccent: 'Bez utraty pozycji w Google.',
    lead: 'Nowa, szybka strona na telefon, a wszystkie stare adresy przekierowane tam, gdzie trzeba. Klienci z Google trafiają we właściwe miejsce, a starą stronę wyłączamy dopiero po odbiorze.',
    compare: [
      {
        label: 'Dziś',
        title: 'Strona ładuje się długo i źle wygląda na telefonie',
        text: 'Boisz się ją zmienić, bo jest w Google od lat. A klienci z telefonu wychodzą, zanim zobaczą ofertę.',
      },
      {
        label: 'Po przebudowie',
        title: 'Nowa strona, te same adresy w Google',
        text: 'Przenosimy treści i ustawiamy przekierowania ze starych adresów. Nic, co dziś przyprowadza klientów, nie znika.',
      },
      {
        label: EFFECT,
        title: 'Szybciej na telefonie i bez spadku w Google',
        text: 'Szybkość mierzymy przed i po. Pozycję w Google możemy obserwować po starcie, jeśli dobierzesz kontrolę pozycji.',
      },
    ],
    deliverablesTitle: 'W cenie **przebudowy**',
    faqEyebrow: 'Pytania o przebudowę strony',
    faq: [
      {
        q: 'Czy stracę pozycję w Google?',
        a: 'Robimy wszystko, żeby nie: stare adresy przekierowujemy na nowe, treści przenosimy, a opisy dla Google ustawiamy od nowa. Starą stronę wyłączamy dopiero po odbiorze.',
      },
      {
        q: 'Co z moją domeną i pocztą?',
        a: 'Domena i poczta zostają tam, gdzie są, chyba że chcesz je przenieść. Zmieniamy tylko to, co trzeba dla strony.',
      },
      {
        q: 'Czy przeniesiecie wszystkie treści?',
        a: 'W cenie przenosimy to, co mieści się w nowej stronie do trzech podstron. Przeniesienie wszystkich treści i zdjęć wyceniamy osobno.',
      },
      {
        q: 'Ile to potrwa?',
        a: 'Zwykle od dwóch tygodni. Przez cały czas działa stara strona, więc nie ma przerwy dla klientów.',
      },
      {
        q: 'Przebudowujecie strony firm spoza Rabki?',
        a: 'Tak, z całego Podhala i z całej Polski. Przebudowa idzie zdalnie, a rozmawiamy przez telefon albo wideo.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twojej stronie',
      title: 'Podeślij **adres starej strony**, a powiemy, co da się poprawić',
      lead: 'Darmowe spojrzenie, potem plan przebudowy i stała cena. Bez zobowiązań.',
      quoteCaption: 'Wklej adres strony, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'system-zlecen-i-grafik-ekip': {
    eyebrow: 'System · budowlanka, instalatorzy, serwisy',
    title: 'System zleceń i grafik ekip.',
    titleAccent: 'Bez dzwonienia wieczorem.',
    lead: 'Kalendarz ekip, zlecenia z materiałami, protokoły i zdjęcia przy zleceniu, a klient sprawdza status pod linkiem. Biuro widzi, kto gdzie jest, a szef nie odbiera telefonów o 21:00.',
    compare: [
      {
        label: 'Dziś',
        title: 'Grafik na tablicy, zlecenia w zeszycie, zdjęcia w telefonach',
        text: 'Rano dzwonisz do każdej ekipy, wieczorem przepisujesz protokoły. Klient pyta, kiedy przyjedziecie, i nikt nie wie na pewno.',
      },
      {
        label: 'Z systemem',
        title: 'Jeden kalendarz dla biura i ekip',
        text: 'Zlecenie ma adres, materiały i termin. Ekipa dodaje zdjęcia i protokół z telefonu, a klient widzi status pod swoim linkiem.',
      },
      {
        label: EFFECT,
        title: 'Mniej telefonów i żadnych zgubionych protokołów',
        text: 'Ile godzin tygodniowo odzyskasz, policzymy razem na Twoich zleceniach po pierwszym miesiącu.',
      },
    ],
    deliverablesTitle: 'W cenie **wdrożenia**',
    faqEyebrow: 'Pytania o system zleceń',
    faq: [
      {
        q: 'Od czego zaczynamy?',
        a: 'Od jednego modułu, zwykle kalendarza ekip ze zleceniami. Kolejne moduły, na przykład materiały albo faktury, dochodzą etapami.',
      },
      {
        q: 'Czy ekipy poradzą sobie z telefonem?',
        a: 'Ekran dla ekipy ma kilka przycisków: zlecenie, zdjęcie, protokół. Szkolimy na Waszych prawdziwych zleceniach.',
      },
      {
        q: 'Mamy dane w Excelu. Przeniesiecie je?',
        a: 'Tak, import z Excela wyceniamy osobno. Zwykle przenosimy klientów i otwarte zlecenia, żeby zacząć bez przepisywania.',
      },
      {
        q: 'Ile osób może pracować w systemie?',
        a: 'W cenie do pięciu użytkowników. Więcej osób i osobne role dla biura i ekip dokładamy, gdy firma rośnie.',
      },
      {
        q: 'Wdrażacie system poza Rabką?',
        a: 'Tak. Z Rabki dojeżdżamy na wdrożenie na Podhalu i w Małopolsce, a dalej pracujemy zdalnie i przyjeżdżamy na start.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoich ekipach',
      title: 'Opisz **jeden dzień w firmie**, a pokażemy, jak to poukładać',
      lead: 'Rozmowa, podgląd i plan etapów z ceną w 5–7 dni. Bez zobowiązań.',
      quoteCaption:
        'Napisz, ile masz ekip i jak dziś planujesz zlecenia, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'crm-dla-malej-i-sredniej-firmy': {
    eyebrow: 'System · usługi, handel, firmy B2B',
    title: 'CRM dla małej i średniej firmy.',
    titleAccent: 'Żaden klient nie ginie.',
    lead: 'Klienci, zapytania, oferty i przypomnienia, do kogo zadzwonić. Cała historia klienta w jednym miejscu, a do tego raport, skąd przychodzą nowi. Bez ogromnego systemu, którego nikt nie używa.',
    compare: [
      {
        label: 'Dziś',
        title: 'Zapytania w mailach, oferty w folderach, przypomnienia w głowie',
        text: 'Oferta wysłana trzy tygodnie temu czeka na telefon, o którym nikt nie pamięta. Gdy handlowiec idzie na urlop, klienci idą razem z nim.',
      },
      {
        label: 'Z CRM',
        title: 'Każde zapytanie ma właściciela i następny krok',
        text: 'Zapytanie z formularza trafia do CRM, oferta jest przy kliencie, a system przypomina, kiedy zadzwonić.',
      },
      {
        label: EFFECT,
        title: 'Więcej odpowiedzi na wysłane oferty',
        text: 'Ile ofert kończy się zamówieniem i skąd przychodzą klienci, zobaczysz w raporcie. Porównamy to po pierwszym kwartale.',
      },
    ],
    deliverablesTitle: 'W cenie **wdrożenia**',
    faqEyebrow: 'Pytania o CRM',
    faq: [
      {
        q: 'Dlaczego nie gotowy CRM z abonamentem?',
        a: 'Gotowe CRM-y są dobre, gdy pasują. Robimy CRM, gdy firma ma własny sposób pracy i nie chce płacić za setki funkcji, z których korzysta pięć. Wtedy kod i dane są Twoje.',
      },
      {
        q: 'Przeniesiecie naszych klientów z Excela?',
        a: 'Tak, import danych wyceniamy osobno. Przenosimy klientów, kontakty i otwarte oferty.',
      },
      {
        q: 'Czy CRM połączy się z formularzem na stronie?',
        a: 'Tak, zapytania z formularza trafiają prosto do CRM. Połączenia z innymi programami, na przykład z fakturami, wyceniamy osobno.',
      },
      {
        q: 'Ile osób może z niego korzystać?',
        a: 'W cenie do pięciu użytkowników, z komputera i z telefonu. Więcej osób i ról dokładamy później.',
      },
      {
        q: 'Wdrażacie CRM dla firm spoza Podhala?',
        a: 'Tak. Biuro mamy w Rabce-Zdroju, a CRM wdrażamy dla firm z całej Małopolski i Polski, zdalnie i na miejscu przy starcie.',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoich klientach',
      title: 'Opisz, **jak dziś prowadzicie klientów**, a zaproponujemy prosty CRM',
      lead: 'Rozmowa o Waszej sprzedaży, podgląd CRM i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption:
        'Napisz, skąd macie klientów i jak wysyłacie oferty, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
}
