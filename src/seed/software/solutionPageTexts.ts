/**
 * Full texts of the solution pages most searched with a place (SEO etap 2b: „strona wizytówka
 * Rabka”, „sklep internetowy Podhale”…): H1 with its accent, lead, „Dziś / Z nami / Efekt”, FAQ
 * and the contact block (`Solutions.page`, spec. §6.1). Tiles, „W cenie” and the price come from
 * the solution itself, so they never disagree with the cards; the term and payment rules come
 * from the panel too (`{termin}`, `[ZALICZKA]`, `[ZASADY PŁATNOŚCI]`, filled per request). Every
 * page in its own words. Nothing beyond „W cenie” is promised: the rest says „wyceniamy osobno”.
 * The lead is also the meta description: 120–155 characters, whole sentences, with the region.
 * TODO(krystian): szkice Claude do akceptacji (spec. §6.1: treści pisze Krystian). Poprawki w tym
 * pliku, nie w panelu — seed nadpisuje zakładkę „Strona” przy każdej różnicy.
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
    lead: 'Jedna strona z ofertą, mapą i dużym przyciskiem „Zadzwoń”. Dla małych firm z Rabki-Zdroju, Podhala i całej Polski, które chcą być w Google.',
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
        title: 'Telefony od ludzi, którzy Cię nie znali',
        text: 'Ile telefonów i formularzy przychodzi ze strony, sprawdzimy razem po pierwszych tygodniach, na Twoich zapytaniach.',
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
        a: 'Wizytówka jest gotowa {termin}, zależnie od tego, jak szybko dostaniemy od Ciebie teksty i zdjęcia.',
      },
      {
        q: 'Czy pomożecie z wizytówką w Google?',
        a: 'Tak. Profil Firmy w Google możemy ustawić razem ze stroną, żeby adres, godziny i telefon zgadzały się w obu miejscach. To wyceniamy osobno.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Za wizytówkę płacisz w dwóch częściach, zaliczka przy zamówieniu to [ZALICZKA]. [ZASADY PŁATNOŚCI]',
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
    lead: 'Oferta, realizacje, opinie i formularz prosto do Ciebie, a treści zmieniasz sam w panelu. Strony firmowe z Rabki-Zdroju dla firm z Podhala i Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Strona sprzed lat, której nikt nie umie zmienić',
        text: 'Każda poprawka to telefon do kogoś, kto już dawno nie odbiera. Realizacje z ostatnich dwóch lat są tylko na Twoim telefonie.',
      },
      {
        label: 'Ze stroną firmową',
        title: 'Pokazujesz to, co robisz najlepiej, i zmieniasz to sam',
        text: 'Realizacje ze zdjęciami i opisem, opinie klientów i formularz. Panel jest po polsku i prosty jak poczta.',
      },
      {
        label: EFFECT,
        title: 'Klient przychodzi przekonany, a nie z pytaniem „czy Pan to robi?”',
        text: 'Zapytania z formularza są konkretniejsze, bo klient widział realizacje. Porównamy je razem z tymi sprzed zmiany.',
      },
    ],
    deliverablesTitle: 'W cenie **strony firmowej**',
    faqEyebrow: 'Pytania o stronę firmową',
    faq: [
      {
        q: 'Czy naprawdę sam zmienię treści?',
        a: 'Tak. Panel jest po polsku, a przy odbiorze pokazujemy, jak z niego korzystać, na Twojej stronie. Dodanie realizacji ze zdjęciami to kilka minut.',
      },
      {
        q: 'Ile podstron dostanę w cenie?',
        a: 'Tyle, ile podaje punkt „W cenie” obok: oferta, realizacje, opinie i kontakt. Więcej podstron, blog albo kolejny język wyceniamy osobno.',
      },
      {
        q: 'Czy strona będzie widoczna w Google i w AI?',
        a: 'Dostaje opisy, dane firmy i strukturę, które czytają wyszukiwarki i asystenci AI. Pozycji nie obiecujemy, ale robimy wszystko, co od nas zależy.',
      },
      {
        q: 'Mam już starą stronę. Co z nią?',
        a: 'Domena zostaje Twoja. Przeniesienie starych treści i przekierowania starych adresów wyceniamy osobno, tak jak przy przebudowie strony.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy stronie firmowej zaliczka wynosi [ZALICZKA], resztę płacisz po odbiorze. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o stronie firmowej',
      title: 'Pokaż nam **swoje realizacje**, a zaprojektujemy stronę wokół nich',
      lead: 'Po rozmowie dostajesz podgląd do klikania i cenę w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Opisz firmę i ofertę, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-dla-hotelu-lub-pensjonatu': {
    eyebrow: 'Strona · pensjonaty, apartamenty, hotele',
    title: 'Strona dla pensjonatu i hotelu.',
    titleAccent: 'Gość pisze do Ciebie.',
    lead: 'Pokoje, galeria i zapytanie o termin w trzech językach. Gość z Google pisze do Ciebie, bez prowizji portalu. Dla obiektów na Podhalu i w Małopolsce.',
    compare: [
      {
        label: 'Dziś',
        title: 'Portal bierze prowizję od gości, którzy i tak by przyjechali',
        text: 'Stali goście rezerwują przez portal, bo nie mają gdzie indziej. Na Twoją starą stronę nie da się wygodnie wejść z telefonu.',
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
        q: 'Jakie języki dostanę?',
        a: 'Taki zestaw jest w cenie: polski, angielski i niemiecki, każdy z własnymi opisami dla Google. Inne języki dokładamy osobno.',
      },
      {
        q: 'Czy goście zarezerwują i zapłacą online?',
        a: 'W tej cenie gość wysyła zapytanie o termin. Kalendarz z rezerwacją i zaliczką online to osobne rozwiązanie, które dokładamy, gdy jest potrzebne.',
      },
      {
        q: 'Kiedy najlepiej zacząć?',
        a: 'Na dwa, trzy miesiące przed sezonem. Wtedy strona zdąży trafić do Google, zanim goście zaczną szukać noclegu.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Zaliczka za stronę obiektu to [ZALICZKA], resztę płacisz po odbiorze gotowej strony. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim obiekcie',
      title: 'Opisz **swoje pokoje**, a pokażemy stronę, przez którą goście piszą do Ciebie',
      lead: 'Rozmowa o obiekcie, podgląd strony i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Napisz, ile masz pokoi, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'strona-dla-restauracji-lub-baru': {
    eyebrow: 'Strona · restauracje, bary, karczmy',
    title: 'Strona dla restauracji i baru.',
    titleAccent: 'Menu zmieniasz sam.',
    lead: 'Menu w panelu zamiast PDF-a, godziny w sezonie, dojazd i rezerwacja stolika. Strony dla lokali z Rabki-Zdroju, Podhala i całej Małopolski.',
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
        text: 'Ile rezerwacji przychodzi z formularza, widać w Twojej skrzynce. Po pierwszym sezonie sprawdzimy razem, co jeszcze poprawić.',
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
        a: 'Godziny zmieniasz w panelu tak samo jak menu, więc przed sezonem i po nim gość widzi aktualne.',
      },
      {
        q: 'Czy menu może być po angielsku?',
        a: 'Tak, menu w drugim języku dokładamy osobno. Przydaje się tam, gdzie przyjeżdża dużo turystów z zagranicy.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy stronie lokalu zaliczka to [ZALICZKA], a resztę płacisz, gdy odbierzesz stronę. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim lokalu',
      title: 'Pokaż nam **swoje menu**, a zrobimy stronę, którą łatwo zmieniać',
      lead: 'Pokażemy podgląd strony z Twoim menu i podamy cenę. Bez zobowiązań.',
      quoteCaption: 'Napisz, jaki masz lokal, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'sklep-internetowy': {
    eyebrow: 'Sklep · producenci, sklepy lokalne',
    title: 'Sklep internetowy.',
    titleAccent: 'Zamówienia od razu w panelu.',
    lead: 'Produkty, płatności online i BLIK, dostawa albo odbiór w sklepie, a zamówienie od razu w panelu. Sklepy dla firm z Podhala, Małopolski i całej Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Zamówienia przez telefon, wiadomości i przelewy do sprawdzania',
        text: 'Klient pisze na komunikatorze, Ty sprawdzasz konto i ręcznie liczysz, co jeszcze jest na półce. Wieczorem odpisujesz na pytania o cenę.',
      },
      {
        label: 'Ze sklepem',
        title: 'Klient sam wybiera, płaci i decyduje o odbiorze',
        text: 'Płatność online i BLIK, odbiór w sklepie albo dostawa. Zamówienie trafia do panelu opłacone i gotowe do spakowania.',
      },
      {
        label: EFFECT,
        title: 'Sprzedajesz także wtedy, gdy sklep jest zamknięty',
        text: 'Ile zamówień przychodzi wieczorem i w weekendy, zobaczysz w panelu. Połączenie z magazynem i fakturami dokładamy osobno, gdy przyjdzie pora.',
      },
    ],
    deliverablesTitle: 'W cenie **sklepu**',
    faqEyebrow: 'Pytania o sklep internetowy',
    faq: [
      {
        q: 'Jakie płatności dostanie klient?',
        a: 'Płatności online i BLIK przez operatora płatności, którego wybierzemy razem. Pieniądze trafiają na Twoje konto, a operator pobiera swoją opłatę.',
      },
      {
        q: 'Czy połączycie sklep z moim magazynem albo fakturami?',
        a: 'Tak, to częsty następny krok. Sprawdzamy, jaki program masz, i wyceniamy połączenie osobno.',
      },
      {
        q: 'Ile produktów mogę mieć?',
        a: 'Tyle, ile potrzebujesz. Produkty dodajesz w panelu, a przeniesienie ich z Twojego arkusza wyceniamy osobno.',
      },
      {
        q: 'Dlaczego nie gotowa platforma z abonamentem?',
        a: 'Bo sklep, kod i dane należą do Ciebie, bez naszej prowizji od sprzedaży (operator płatności pobiera swoją opłatę). Gdy gotowa platforma wystarczy, powiemy to wprost.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy sklepie zaliczka wynosi [ZALICZKA], a resztę płacisz po odbiorze sklepu. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoim sklepie',
      title: 'Powiedz, **co sprzedajesz**, a zaplanujemy sklep pod Twoje zamówienia',
      lead: 'Rozmowa, plan sklepu i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Opisz, co i jak dziś sprzedajesz, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'przebudowa-starej-strony': {
    eyebrow: 'Strona · firmy ze starą, wolną stroną',
    title: 'Przebudowa starej strony.',
    titleAccent: 'Bez utraty pozycji w Google.',
    lead: 'Nowa, szybka strona na telefon, a stare adresy przekierowane tam, gdzie trzeba. Przebudowujemy strony firm z Podhala, Małopolski i całej Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Strona ładuje się długo i źle wygląda na telefonie',
        text: 'Boisz się ją zmienić, bo jest w Google od lat. A klienci z telefonu wychodzą, zanim zobaczą ofertę.',
      },
      {
        label: 'Po przebudowie',
        title: 'Nowa strona, te same adresy w Google',
        text: 'Ustawiamy przekierowania ze starych adresów na nowe. Nic, co dziś przyprowadza klientów, nie trafia w pustkę.',
      },
      {
        label: EFFECT,
        title: 'Szybciej na telefonie, bez zgubionych adresów',
        text: 'Szybkość strony mierzymy razem przed przebudową i po niej. Stare adresy sprawdzamy po starcie jeden po drugim.',
      },
    ],
    deliverablesTitle: 'W cenie **przebudowy**',
    faqEyebrow: 'Pytania o przebudowę strony',
    faq: [
      {
        q: 'Czy stracę pozycję w Google?',
        a: 'Robimy wszystko, co od nas zależy: stare adresy przekierowujemy na nowe, a opisy dla Google ustawiamy od nowa. Starą stronę wyłączamy dopiero po odbiorze.',
      },
      {
        q: 'Co z moją domeną i pocztą?',
        a: 'Domena i poczta zostają tam, gdzie są, chyba że chcesz je przenieść. Zmieniamy tylko to, co trzeba dla strony.',
      },
      {
        q: 'Czy przeniesiecie wszystkie treści?',
        a: 'Nowa strona w cenie ma tyle podstron, ile podaje punkt „W cenie”. Przeniesienie większej liczby treści i zdjęć wyceniamy osobno.',
      },
      {
        q: 'Ile to potrwa?',
        a: 'Przebudowa trwa {termin}. Przez cały czas działa stara strona, więc klienci nie trafiają na przerwę.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'Przy przebudowie zaliczka to [ZALICZKA], a resztę płacisz, gdy nowa strona zastąpi starą. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o przebudowie',
      title: 'Podeślij **adres starej strony**, a powiemy, co da się poprawić',
      lead: 'Spojrzymy na stronę bez opłat, potem dostajesz plan przebudowy i stałą cenę.',
      quoteCaption: 'Wklej adres strony, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'system-zlecen-i-grafik-ekip': {
    eyebrow: 'System · firmy z ekipami i zleceniami',
    title: 'System zleceń i grafik ekip.',
    titleAccent: 'Bez dzwonienia wieczorem.',
    lead: 'Kalendarz ekip, zlecenia z adresem i zdjęcia przy zleceniu, a klient sprawdza status pod linkiem. Dla firm z Podhala, Małopolski i całej Polski.',
    compare: [
      {
        label: 'Dziś',
        title: 'Grafik na tablicy, zlecenia w zeszycie, zdjęcia w telefonach',
        text: 'Rano dzwonisz do każdej ekipy, wieczorem przepisujesz protokoły. Klient pyta, kiedy przyjedziecie, i nikt nie wie na pewno.',
      },
      {
        label: 'Z systemem',
        title: 'Jeden kalendarz dla biura i ekip',
        text: 'Zlecenie ma adres, opis i termin. Ekipa dodaje zdjęcia z telefonu, a klient widzi status pod swoim linkiem.',
      },
      {
        label: EFFECT,
        title: 'Mniej telefonów i żadnych zgubionych zleceń',
        text: 'Ile czasu w tygodniu odzyskacie, policzymy razem na Waszych zleceniach po pierwszym miesiącu pracy.',
      },
    ],
    deliverablesTitle: 'W cenie **pierwszego modułu**',
    faqEyebrow: 'Pytania o system zleceń',
    faq: [
      {
        q: 'Od czego zaczynamy?',
        a: 'Od kalendarza ekip ze zleceniami, czyli od pierwszego modułu. Kolejne, na przykład czas pracy albo faktury, dochodzą etapami.',
      },
      {
        q: 'Czy ekipy poradzą sobie z telefonem?',
        a: 'Ekran dla ekipy ma kilka przycisków: zlecenie, zdjęcie, gotowe. Projektujemy go pod Wasz sposób pracy.',
      },
      {
        q: 'Mamy dane w Excelu. Przeniesiecie je?',
        a: 'Tak, import z Excela wyceniamy osobno. Zwykle przenosimy klientów i otwarte zlecenia, żeby zacząć bez przepisywania.',
      },
      {
        q: 'Ile osób może pracować w systemie?',
        a: 'Tyle, ile podaje punkt „W cenie” obok. Więcej osób i osobne role dla biura i ekip dokładamy, gdy firma rośnie.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'System zleceń budujemy etapami, zaliczka na start to [ZALICZKA]. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o grafiku ekip',
      title: 'Opisz **jeden dzień w firmie**, a pokażemy, jak to poukładać',
      lead: 'Rozmowa, podgląd i plan etapów z ceną w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Napisz, ile masz ekip, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
  'crm-dla-malej-i-sredniej-firmy': {
    eyebrow: 'System · usługi, handel, firmy B2B',
    title: 'CRM dla małej i średniej firmy.',
    titleAccent: 'Żaden klient nie ginie.',
    lead: 'Klienci, zapytania, oferty i przypomnienia, do kogo zadzwonić, a cała historia klienta w jednym miejscu. CRM dla firm z Podhala, Małopolski i Polski.',
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
        text: 'Ile ofert kończy się zamówieniem i skąd przychodzą klienci, porównamy razem po pierwszym kwartale.',
      },
    ],
    deliverablesTitle: 'W cenie **CRM**',
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
        a: 'Tylu użytkowników, ile podaje punkt „W cenie”, z komputera i z telefonu. Więcej osób i ról dokładamy później.',
      },
      {
        q: 'Kiedy płacę?',
        a: 'CRM wdrażamy etapami, a na początek płacisz zaliczkę [ZALICZKA]. [ZASADY PŁATNOŚCI]',
      },
    ],
    contact: {
      eyebrow: 'Porozmawiajmy o Twoich klientach',
      title: 'Opisz, **jak dziś prowadzicie klientów**, a zaproponujemy prosty CRM',
      lead: 'Rozmowa o Waszej sprzedaży, podgląd CRM i cena w 5–7 dni. Bez zobowiązań.',
      quoteCaption: 'Napisz, jak wysyłacie oferty, odpiszemy w ciągu [CZAS ODPOWIEDZI]',
    },
  },
}
