# Mapa stron prokominstalacje.pl — 32 strony

Wygenerowane z prototypu v4.0 (27.10.2026), uzupełnione do v4.2 (28.10.2026: `dla-architektow` + `#architekci` na głównej). Każda strona: adres publiczny, plik prototypu, źródło, wysokość w prototypie i sekcje w kolejności.

- Prototyp: `docs/design/prokominstalacje/prototyp/<plik>.html` (otwierasz w przeglądarce, działa bez serwera).
- Źródło: `docs/design/prokominstalacje/zrodlo/pages/<Nazwa>.body.html` (szablon) + `<Nazwa>.js` (stan, logika, treści) + `<Nazwa>.meta.json` (tytuł, opis).
- Treść do seeda: `seed/prokominstalacje/strony-zrzut/<Nazwa>.json`, dla stron obiektów `seed/prokominstalacje/obiekty/<klucz>.json`.
- **Identyfikatory sekcji (`id`) zachowaj 1:1** — używają ich nawigacja kotwiczna, linki między stronami i `narzedzia/porownaj.mjs`. Hero dostaje `id="hero"`, stopka `id="stopka"`.
- 📱 = sekcja zwinięta na telefonie (przycisk „Pokaż całą sekcję”), lista w `zrodlo/fold.json`.
- Wysokości orientacyjne; kod może różnić się o ±10%. Większa różnica = sygnał, że coś odbiega od wzorca.

## Strona główna

### Main — `/`
- Prototyp: `prototyp/start.html` · źródło: `zrodlo/pages/Main.*`
- Tytuł strony: Monitoring, alarmy, Wi-Fi, smart home Podhale | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 12980 px · telefon 12381 px (v4.2, z `#architekci`; bez niej jak w v4.0: 11905 / 10222)
- Sekcje:
  - `#start` — Monitoring, alarmy, Wi-Fi i smart home na Podhalu. Twój obiekt na żywo.
  - `#dla-kogo` — Dla kogo pracujemy · Od domu letniskowego po halę i szkołę.
  - `#uslugi` — Dziesięć obszarów, jeden wykonawca · Jedna firma od kamery po zamek w drzwiach.
  - `#architekci` — Dla architektów, projektantów i deweloperów · Projektujesz dom albo inwestycję? Technikę zaplanujemy z Tobą. (I16c, `ArchTeaser`)
  - `#realizacje` — Realizacje · Wybrane realizacje: nagłośnienie i multimedia.
  - `#gory` — Robimy to w górach, nie w biurowcu · Na Podhalu instalacja ma trudniej. Projektujemy to od początku.
  - `#proces` — Jak pracujemy · Rozmowa, wizja lokalna, projekt, montaż, odbiór, serwis.
  - `#serwis` — Serwis i przeglądy · 
  - `#faq` 📱 — Najczęstsze pytania · Zanim zadzwonisz.
  - `#zaplanuj` — Zaplanuj instalację · 2 minuty · Powiedz, co planujesz. Resztę ustalimy na miejscu.

## Usługi (10)

### Monitoring — `/monitoring`
- Prototyp: `prototyp/monitoring.html` · źródło: `zrodlo/pages/Monitoring.*`
- Tytuł strony: Monitoring CCTV Rabka-Zdrój, Zakopane, Podhale | PRO-KOM
- Wysokość w prototypie: desktop 13108 px · telefon 18256 px
- Sekcje:
  - `#hero` — Monitoring CCTV · Rabka-Zdrój, Zakopane, Podhale · Monitoring na Podhalu, który widzi w nocy, w śniegu i tylko to, co trzeba.
  - `#co-dostajesz` — Monitoring od PRO-KOM · Kamery, które widzą to, co trzeba. I nie widzą tego, czego nie wolno.
  - `#system` 📱 — Wersje instalacji · Monitoring to cały system. Zobacz, co wchodzi w skład.
  - `#typy` — Jaką kamerę wybrać · Pięć rodzajów kamer. Każda do innego miejsca.
  - `#ile-widac` — Kalkulator: ile widać · Twarz czy tylko sylwetka? To zależy od odległości.
  - `#nagrania` — Kalkulator: ile dni nagrań · Dysk dobieramy do liczby kamer. I do przepisów.
  - `#rodo` — Monitoring i RODO · Gdzie kamera może patrzeć, a gdzie nie.
  - `#sprzet-kamery` — Sprzęt · Dahua, Hikvision, BCS. Dobieramy pod obiekt, nie pod markę.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Od czego zwykle zaczynamy.
  - `#cena` 📱 — Wycena · Od czego zależy cena monitoringu.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Monitoring działa najlepiej w zestawie.

### Alarmy — `/alarmy`
- Prototyp: `prototyp/alarmy.html` · źródło: `zrodlo/pages/Alarmy.*`
- Tytuł strony: Alarmy i wideodomofony Rabka-Zdrój, Zakopane | PRO-KOM
- Wysokość w prototypie: desktop 11265 px · telefon 14523 px
- Sekcje:
  - `#hero` — Systemy alarmowe · Rabka-Zdrój, Zakopane, Podhale · Alarm, który budzi złodzieja, a nie Ciebie o trzeciej w nocy.
  - `#jak-dziala` — Jak to działa · Od otwartego okna do powiadomienia w kilka sekund.
  - `#wersje` 📱 — Wersje alarmu · Inny alarm do mieszkania, inny do pustego domu w górach.
  - `#przewod` 📱 — Przewodowy czy bezprzewodowy · Dobieramy system do budynku, a nie odwrotnie.
  - `#wideodomofon` 📱 — Wideodomofony z aplikacją · Kurier przy furtce, a Ty na stoku. Otwierasz z telefonu.
  - `#domofony` 📱 — Domofony i wideodomofony · Od furtki przy domu po wejście do bloku.
  - `#dom-letniskowy` — Dom letniskowy i apartament na wynajem · 
  - `#agencja` — Powiadomienia czy agencja ochrony · Kto reaguje, gdy alarm zawyje?
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Trzy typowe punkty startu.
  - `#cena` 📱 — Wycena · Od czego zależy cena alarmu.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Alarm, kamery i dostęp w jednej aplikacji.

### Dostep — `/kontrola-dostepu`
- Prototyp: `prototyp/kontrola-dostepu.html` · źródło: `zrodlo/pages/Dostep.*`
- Tytuł strony: Zamki do apartamentów, kontrola dostępu Zakopane | PRO-KOM
- Wysokość w prototypie: desktop 10731 px · telefon 15270 px
- Sekcje:
  - `#hero` — Kontrola dostępu · Zakopane, Rabka-Zdrój, Podhale · Gość wchodzi sam o 23:00. Ty śpisz spokojnie.
  - `#metody` — Czym się otwiera · Kod, karta, telefon. Klucz zostaje na wszelki wypadek.
  - `#apartamenty` 📱 — Apartamenty i pensjonaty · Rezerwacja wpada, kod wysyła się sam.
  - `#firma` 📱 — Firma, hala, wspólnota · Każdy wchodzi tam, gdzie powinien. I o tej porze.
  - `#identyfikatory` — Brelok, karta, telefon, palec · Nie każda karta jest bezpieczna. Sprawdź, czym się różnią.
  - `#zamki` — Zwora, elektrozaczep, zamek · Co się dzieje z drzwiami, gdy zabraknie prądu?
  - `#awarie` 📱 — Gdy coś zawiedzie · 
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Od jednych drzwi do całego budynku.
  - `#cena` 📱 — Wycena · Od czego zależy cena.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Dostęp działa najlepiej razem z resztą.

### Sieci — `/sieci-wifi`
- Prototyp: `prototyp/sieci-wifi.html` · źródło: `zrodlo/pages/Sieci.*`
- Tytuł strony: Wi-Fi i sieci dla pensjonatów Rabka-Zdrój, Zakopane | PRO-KOM
- Wysokość w prototypie: desktop 12727 px · telefon 16026 px
- Sekcje:
  - `#hero` — Sieci komputerowe i Wi-Fi · Rabka-Zdrój, Zakopane, Podhale · Wi-Fi w każdym pokoju. Bez wzmacniaczy z gniazdka.
  - `#dlaczego` — Dlaczego Wi-Fi nie działa · Mocniejszy router zwykle nie pomaga. Pomaga plan.
  - `#podzial` 📱 — Osobne sieci w jednym budynku · Gość nie zobaczy Twoich kamer ani kasy.
  - `#portal` 📱 — Wi-Fi dla gości · Strona logowania z Twoim logo. Hasło na pobyt, nie na zawsze.
  - `#okablowanie` 📱 — Kable, szafy, światłowody · Dobre Wi-Fi zaczyna się od kabla.
  - `#narzedzia` — Sprawdź sam · Cztery decyzje, które przesądzają o sieci.
  - `#sprzet` 📱 — Z czego składa się dobra sieć · Cztery elementy zamiast routera od operatora. Jedna aplikacja do wszystkich.
  - `#standardy` 📱 — Wi-Fi 6, 6E i 7 · Co naprawdę zmieniają nowe standardy.
  - `#zapas` — Dla firm średnich i dużych oraz instytucji · 
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Sieć dopasowana do budynku.
  - `#cena` 📱 — Wycena · Od czego zależy cena sieci.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Na dobrej sieci działa reszta.

### Teletechnika — `/teletechnika`
- Prototyp: `prototyp/teletechnika.html` · źródło: `zrodlo/pages/Teletechnika.*`
- Tytuł strony: Teletechnika w budownictwie, Małopolska | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 7454 px · telefon 10789 px
- Sekcje:
  - `#hero` — Teletechnika · dla deweloperów i wykonawców · Małopolska · Teletechnika budynku od pionu do gniazdka.
  - `#zakres` 📱 — Zakres prac · Wszystko, co w budynku przewodzi sygnał.
  - `#dla-kogo` — Dla kogo · Pracujemy z tymi, którzy budują.
  - `#przepisy` — Co się zmieniło w 2026 · stan na październik 2026 · Nowy budynek musi być gotowy na światłowód.
  - `#zapytanie` — Zapytanie ofertowe · Wyślij przedmiar. Odpowiemy wyceną.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania wykonawców.
  - `#powiazane` — Zwykle idzie w parze · Instalacje, które robimy też w gotowych budynkach.

### Anteny — `/anteny`
- Prototyp: `prototyp/anteny.html` · źródło: `zrodlo/pages/Anteny.*`
- Tytuł strony: Anteny satelitarne i DVB-T2 na Podhalu | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 10282 px · telefon 13573 px
- Sekcje:
  - `#hero` — Anteny satelitarne i naziemne DVB-T2 · Podhale · Antena ustawiona miernikiem, nie na oko.
  - `#co-robimy` — Instalacje antenowe · Od jednej anteny na domu po instalację dla całego bloku.
  - `#gory` 📱 — Anteny w górach · Stok zasłania nadajnik, halny szarpie masztem.
  - `#multipleksy` 📱 — Telewizja naziemna, stan na październik 2026 · Pięć multipleksów w DVB-T2. Jeden jeszcze czeka.
  - `#filtr-5g` — Telewizja a 5G i LTE · Obraz się zacina, gdy obok stoi maszt telefonii?
  - `#satelita` 📱 — Telewizja satelitarna · Ile telewizorów, taki konwerter i taka instalacja.
  - `#pensjonat-tv` 📱 — Telewizja w pensjonacie i hotelu · Te same kanały w każdym pokoju, z jednej szafki.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Od domu po cały blok.
  - `#cena` 📱 — Wycena · Od czego zależy cena instalacji antenowej.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Telewizja, sieć i ekrany razem.

### SmartHome — `/smart-home`
- Prototyp: `prototyp/smart-home.html` · źródło: `zrodlo/pages/SmartHome.*`
- Tytuł strony: Smart home Ampio na Podhalu | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 14395 px · telefon 14641 px
- Sekcje:
  - `#hero` — Inteligentny dom i automatyka budynku · Ampio · Podhale · Inteligentny dom, który działa także bez internetu.
  - `#co-sterujesz` — Co sterujesz · Dwanaście rzeczy, którymi steruje Ampio. W jednej aplikacji i na panelach w ścianie.
  - `#dlaczego` 📱 — Dlaczego Ampio · Każdy moduł ma własny mózg. Jedna awaria nie gasi domu.
  - `#panele` — Szklane panele Ampio M-DOT · Panel zaprojektujesz razem z nami.
  - `#integracje` 📱 — Integracje · Pompa ciepła, rekuperacja, alarm, kamery. Wszystko się dogada.
  - `#obiekty` 📱 — Pensjonaty, apartamenty, hotele · Pusty pokój grzeje mniej i nie świeci. A wszystkie obiekty masz w jednym telefonie.
  - `#moduly` 📱 — Dla dociekliwych · Z czego składa się instalacja Ampio.
  - `#etapy` 📱 — Kiedy zacząć · Najlepiej, zanim elektryk położy pierwszy przewód.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Od kilku scen do pełnej automatyki.
  - `#cena` 📱 — Wycena · Od czego zależy cena smart home.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Ampio łączy się z resztą instalacji.

### Naglosnienie — `/naglosnienie`
- Prototyp: `prototyp/naglosnienie.html` · źródło: `zrodlo/pages/Naglosnienie.*`
- Tytuł strony: Nagłośnienie APART dla lokali i kościołów, Podhale | PRO-KOM
- Wysokość w prototypie: desktop 13987 px · telefon 16727 px
- Sekcje:
  - `#hero` — Nagłośnienie · restauracje, hotele, kościoły, szkoły · Podhale · Muzyka tam, gdzie trzeba. Cisza tam, gdzie ma być cicho.
  - `#obiekty` 📱 — Gdzie nagłaśniamy · Inaczej gra restauracja, inaczej kościół.
  - `#apart` — APART · nasz mocny punkt · Sprzęt zrobiony do nagłośnienia na stałe. Od głośnika w suficie po kolumnę w kościele.
  - `#jak-dziala` 📱 — Jak działa system strefowy · Muzyka, mikrofon i gong. Każda strefa po swojemu.
  - `#kosciol` 📱 — Nagłośnienie kościoła · Głośniej nie znaczy wyraźniej.
  - `#ile-glosnikow` — Kalkulator: ile głośników · Szybki szacunek dla Twojej sali.
  - `#sala-obrad` 📱 — Gminy, szkoły, sale obrad · Sesja rady słyszalna, nagrana i transmitowana.
  - `#dso` 📱 — Nagłośnienie a DSO · Dźwiękowy system ostrzegawczy to osobna sprawa.
  - `#licencje` 📱 — Muzyka w lokalu · Głośniki to jedno. Prawo do muzyki to drugie.
  - `#realizacje-n` 📱 — Realizacje nagłośnienia · Kościoły, sklepy i lokale od Krakowa po Zakopane.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Od kawiarni do kościoła.
  - `#cena` 📱 — Wycena · Od czego zależy cena nagłośnienia.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Dźwięk i obraz w jednym projekcie.

### Multimedia — `/ekrany`
- Prototyp: `prototyp/ekrany.html` · źródło: `zrodlo/pages/Multimedia.*`
- Tytuł strony: Ekrany i menu board, Zakopane i Podhale | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 10751 px · telefon 15603 px
- Sekcje:
  - `#hero` — Ekrany, menu board, witryny, ściany wideo · Zakopane i Podhale · Ekrany, które mówią za Ciebie. Menu, pogoda, oferta.
  - `#gdzie` — Gdzie montujemy ekrany · Ekran, który pracuje, a nie tylko świeci.
  - `#dwa-salony` — Wdrażamy to u siebie · Jedna zmiana ceny. Dwa salony. Kilka sekund.
  - `#jasnosc` — Dobierz ekran do miejsca · W witrynie zwykły ekran po prostu zniknie.
  - `#tv-czy-ekran` 📱 — Telewizor czy ekran profesjonalny · Telewizor w witrynie to oszczędność tylko na starcie.
  - `#tresci` — Treści i zarządzanie · Zmieniasz menu z telefonu. Albo robimy to za Ciebie.
  - `#sciany-led` 📱 — 
  - `#zewnatrz` 📱 — Ekrany zewnętrzne i w witrynie · Na zewnątrz w górach potrzebny jest inny ekran.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Ekran z montażem i treściami na start.
  - `#cena` 📱 — Wycena · Od czego zależy cena ekranów.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Obraz, dźwięk i sieć razem.

### Ladowarki — `/ladowarki-ev`
- Prototyp: `prototyp/ladowarki-ev.html` · źródło: `zrodlo/pages/Ladowarki.*`
- Tytuł strony: Ładowarki Elzab EcoPower: CC Home, CC Wall, CC City | PRO-KOM
- Wysokość w prototypie: desktop 10902 px · telefon 15907 px
- Sekcje:
  - `#hero` — Elzab EcoPower · dom, firma, parking · Podhale · Ładowarki Elzab EcoPower. Od garażu po parking.
  - `#oferta` — Oferta Elzab EcoPower · Trzy ładowarki. Od garażu po parking hotelu.
  - `#model` — Dobór wersji · Złóż swoją ładowarkę.
  - `#urzadzenia` 📱 — Porównanie · CC Home, CC Wall i CC City obok siebie.
  - `#kalkulator` — Kalkulator · Ile potrwa ładowanie Twojego auta?
  - `#formalnosci` 📱 — Formalności · Przyłącze, UDT, wspólnota. Pomagamy przejść przez wszystko.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Przykładowe zestawy · Ładowarka z montażem i formalnościami.
  - `#cena` 📱 — Wycena · Od czego zależy cena ładowarki.
  - `#faq` 📱 — Pytania i odpowiedzi · Zanim zadzwonisz.
  - `#powiazane` — Zwykle idzie w parze · Ładowarka w systemie budynku.

## Dla kogo (12 obiektów)

### SegDom — `/dla-kogo/dom`
- Prototyp: `prototyp/dom.html` · źródło: `zrodlo/pages/SegDom.*`
- Tytuł strony: Alarm i kamery dla domu i domku letniskowego — Podhale | PRO-KOM
- Wysokość w prototypie: desktop 10308 px · telefon 12297 px
- Sekcje:
  - `#hero` — Instalacje dla domu i domku letniskowego · Rabka-Zdrój, Zakopane, Podhale · Wiesz, co dzieje się w domu, nawet gdy jesteś 400 km dalej.
  - `#problemy` 📱 — Co słyszymy od właścicieli domów · Sześć rzeczy, które martwią właściciela pustego domu.
  - `#rok` 📱 — Rok w domku letniskowym · Od wyjazdu w październiku do ferii w lutym.
  - `#przepisy` 📱 — Przepisy i obowiązki · Kamery przy domu, czujki dymu i wynajem. Co mówią przepisy.
  - `#gory` 📱 — Specyfika Podhala · Mróz, śnieg, burze i słaby internet.
  - `#realizacje-s` — Nasze realizacje · Domy, w których pracowaliśmy.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla domu · Od „wiem, co się dzieje” po dom, który pilnuje się sam.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania właścicieli domów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegApartament — `/dla-kogo/apartamenty`
- Prototyp: `prototyp/apartamenty.html` · źródło: `zrodlo/pages/SegApartament.*`
- Tytuł strony: Zamki z kodem dla apartamentów na wynajem — Zakopane | PRO-KOM
- Wysokość w prototypie: desktop 9891 px · telefon 11691 px
- Sekcje:
  - `#hero` — Instalacje dla apartamentów na wynajem · Zakopane, Kościelisko, Podhale · Gość wchodzi sam o 23:00. Ty widzisz, że dotarł, i śpisz spokojnie.
  - `#problemy` 📱 — Co słyszymy od właścicieli apartamentów · Sześć problemów, które psują opinie i rachunki.
  - `#rok` 📱 — Od rezerwacji do wymeldowania · Jedna rezerwacja, zero przekazywania kluczy.
  - `#przepisy` 📱 — Przepisy i obowiązki · Kamery, wspólnota, czujka dymu i nowe przepisy o najmie.
  - `#gory` 📱 — Specyfika Podhala · Późne przyjazdy, sezony i mróz na drzwiach.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla apartamentów · Od wejścia bez kluczy po kilka apartamentów w jednej aplikacji.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania właścicieli apartamentów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### Noclegowe — `/dla-kogo/pensjonaty`
- Prototyp: `prototyp/pensjonaty.html` · źródło: `zrodlo/pages/Noclegowe.*`
- Tytuł strony: Wi-Fi, kamery i czujki dla pensjonatów — Zakopane | PRO-KOM
- Wysokość w prototypie: desktop 9926 px · telefon 11715 px
- Sekcje:
  - `#hero` — Instalacje dla pensjonatów i pokoi gościnnych · Zakopane, Kościelisko, Rabka, Podhale · Pensjonat, który działa sam, gdy Ty śpisz albo jesteś na stoku.
  - `#problemy` 📱 — Co słyszymy od właścicieli pensjonatów · Sześć rzeczy, które trafiają do opinii albo do nocnych telefonów.
  - `#rok` 📱 — Doba w pensjonacie w ferie · Od śniadania do przyjazdu o północy.
  - `#przepisy` 📱 — Przepisy i obowiązki · Czujki dymu, ppoż., kamery i telewizory. Co mówią przepisy.
  - `#gory` 📱 — Specyfika Podhala · Narciarnia, parking zimą i dobudówki.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla pensjonatów · Od kilku pokoi gościnnych po pensjonat z dobudówką.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania właścicieli pensjonatów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegHotel — `/dla-kogo/hotele`
- Prototyp: `prototyp/hotele.html` · źródło: `zrodlo/pages/SegHotel.*`
- Tytuł strony: Wi-Fi, TV i zamki na karty dla hoteli — Zakopane | PRO-KOM
- Wysokość w prototypie: desktop 9837 px · telefon 11847 px
- Sekcje:
  - `#hero` — Instalacje dla hoteli · Zakopane, Białka, Bukowina, Podhale · Wi-Fi w każdym pokoju to już wymóg kategoryzacji. Zróbmy je tak, żeby goście chwalili je w opiniach.
  - `#problemy` 📱 — Co słyszymy od hotelarzy · Sześć spraw, które decydują o opiniach i rachunkach.
  - `#rok` 📱 — Doba w hotelu w ferie · Od śniadania do zameldowania o północy.
  - `#przepisy` 📱 — Przepisy i obowiązki · Kategoryzacja, ppoż., kamery i telewizory. Co mówią przepisy.
  - `#gory` 📱 — Specyfika Podhala · Pełne obłożenie, mały rynek i zima.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla hoteli · Od pensjonatu z ambicjami po hotel z salami konferencyjnymi.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania hotelarzy.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegRestauracja — `/dla-kogo/restauracje`
- Prototyp: `prototyp/restauracje.html` · źródło: `zrodlo/pages/SegRestauracja.*`
- Tytuł strony: Nagłośnienie i Wi-Fi dla restauracji i sal weselnych | PRO-KOM
- Wysokość w prototypie: desktop 10566 px · telefon 13221 px
- Sekcje:
  - `#hero` — Instalacje dla restauracji i domów weselnych · Zakopane, Rabka, Podhale · Muzyka tam, gdzie trzeba. Kasa i Wi-Fi mają zapas także w sobotę o 21:00.
  - `#problemy` 📱 — Co słyszymy od restauratorów · Sześć rzeczy, które psują sobotni wieczór, i jak je naprawiamy.
  - `#rok` 📱 — Sobota w lokalu z weselem · Od dostawy rano do alarmu po poprawinach.
  - `#przepisy` 📱 — Przepisy i obowiązki · Muzyka, kamery, pożar i Wi-Fi. Co mówią przepisy.
  - `#gory` 📱 — Specyfika Podhala · Sezon, mróz i burze. Lokal pod Tatrami ma trudniej.
  - `#realizacje-s` — Nasze realizacje · Od domu weselnego w Mszanie Dolnej po kawiarnię w Nowym Sączu.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla restauracji · Od kawiarni po dom weselny.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania restauratorów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegSklep — `/dla-kogo/sklepy`
- Prototyp: `prototyp/sklepy.html` · źródło: `zrodlo/pages/SegSklep.*`
- Tytuł strony: Monitoring i alarm dla sklepów — Zakopane, Podhale | PRO-KOM
- Wysokość w prototypie: desktop 10414 px · telefon 13134 px
- Sekcje:
  - `#hero` — Instalacje dla sklepów i salonów · Zakopane, Rabka, Podhale · Mniej ginie z półek. Terminal ma łącze zapasowe, gdy padnie internet.
  - `#problemy` 📱 — Co słyszymy od właścicieli sklepów · Sześć problemów, które kosztują sklep najwięcej.
  - `#rok` 📱 — Dzień w sklepie w sezonie · Od otwarcia do nocy po zamknięciu.
  - `#przepisy` 📱 — Przepisy i obowiązki · Kamery w sklepie, muzyka i kradzież. Co mówią przepisy.
  - `#gory` 📱 — Specyfika Podhala · Sezon, turyści i witryna na mrozie.
  - `#realizacje-s` — Nasze realizacje · Nagłaśnialiśmy salony Empik w Zakopanem i Krakowie.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla sklepów · Od butiku po kilka sklepów w jednej aplikacji.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania właścicieli sklepów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegFirma — `/dla-kogo/firmy`
- Prototyp: `prototyp/firmy.html` · źródło: `zrodlo/pages/SegFirma.*`
- Tytuł strony: Kontrola dostępu, monitoring i sieć dla firm — Podhale | PRO-KOM
- Wysokość w prototypie: desktop 10603 px · telefon 13020 px
- Sekcje:
  - `#hero` — Instalacje dla firm, biur, hal i magazynów · Podhale i Małopolska · Wiesz, kto otworzył magazyn w sobotę. I masz sieć, która nie staje w środku zmiany.
  - `#problemy` 📱 — Co słyszymy od właścicieli firm · Na czym firma traci czas i pieniądze.
  - `#rok` 📱 — Dzień w firmie · Od pierwszej zmiany do alarmu w nocy.
  - `#przepisy` 📱 — Przepisy i obowiązki · Kamery, czas pracy i drzwi ewakuacyjne. Co mówią przepisy.
  - `#gory` 📱 — Specyfika Podhala · Działki z kilkoma budynkami, burze i mróz w hali.
  - `#realizacje-s` — Nasze realizacje · Od sali konferencyjnej po stanowiska biurowe w Blachotrapezie.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla firm · Od biura po zakład z kilkoma budynkami.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania pracodawców.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegKosciol — `/dla-kogo/koscioly`
- Prototyp: `prototyp/koscioly.html` · źródło: `zrodlo/pages/SegKosciol.*`
- Tytuł strony: Nagłośnienie i transmisja mszy dla parafii — Podhale | PRO-KOM
- Wysokość w prototypie: desktop 10458 px · telefon 13041 px
- Sekcje:
  - `#hero` — Instalacje dla kościołów i parafii · Rabka-Zdrój, Zakopane, Podhale · Każde słowo słychać w ostatniej ławce. A msza trafia do tych, którzy nie mogą przyjść.
  - `#problemy` 📱 — Najczęstsze sprawy · Z czym proboszczowie dzwonią najczęściej.
  - `#rok` 📱 — Tydzień i rok w parafii · Jeden system na codzienną mszę, odpust i noc.
  - `#przepisy` 📱 — Przepisy i obowiązki · Kościół ma własne zasady. Znamy je.
  - `#gory` 📱 — Specyfika Podhala · Drewniane kościoły, burze i mróz. Na to projektujemy.
  - `#realizacje-s` — Nasze realizacje · Nagłośnialiśmy kościoły w Rabce i Ślemieniu.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla parafii · Od „żeby było słychać” po parafię online.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania proboszczów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegSzkola — `/dla-kogo/szkoly`
- Prototyp: `prototyp/szkoly.html` · źródło: `zrodlo/pages/SegSzkola.*`
- Tytuł strony: Monitoring, dzwonki i Wi-Fi dla szkół — Podhale | PRO-KOM
- Wysokość w prototypie: desktop 10452 px · telefon 12355 px
- Sekcje:
  - `#hero` — Instalacje dla szkół i przedszkoli · Rabka-Zdrój, Nowy Targ, Podhale · Bezpieczne wejście, słyszalne dzwonki i Wi-Fi na 30 tabletów i laptopów w klasie.
  - `#problemy` 📱 — Z rozmów z dyrektorami · Od wejścia po Wi-Fi: sprawy, o które pytają dyrektorzy.
  - `#rok` 📱 — Dzień w szkole · Od wejścia o 7:30 do alarmu po lekcjach.
  - `#przepisy` 📱 — Przepisy i obowiązki · Art. 108a i inne zasady, o które pytają dyrektorzy.
  - `#gory` 📱 — Specyfika Podhala · Małe szkoły, dwa budynki i zima przy wejściu.
  - `#realizacje-s` — Nasze realizacje · Sprzęt projekcyjny w Szkole Podstawowej w Rabce-Zdroju.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla szkół · Od bezpiecznego wejścia po całą szkołę w jednej sieci.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania dyrektorów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegGmina — `/dla-kogo/gminy`
- Prototyp: `prototyp/gminy.html` · źródło: `zrodlo/pages/SegGmina.*`
- Tytuł strony: Transmisja sesji i monitoring dla gmin i powiatów | PRO-KOM
- Wysokość w prototypie: desktop 9794 px · telefon 11594 px
- Sekcje:
  - `#hero` — Instalacje dla gmin, powiatów i urzędów · Podhale i Małopolska · Sesja idzie na żywo, a nagranie zapisuje się lokalnie. Nawet gdy padnie internet.
  - `#problemy` 📱 — Co słyszymy od sekretarzy gmin · Co wraca na każdej sesji i w każdym urzędzie.
  - `#rok` 📱 — Dzień sesji w urzędzie · Od otwarcia urzędu do nagrania w BIP.
  - `#przepisy` 📱 — Przepisy i obowiązki · Sesje, głosowanie, monitoring i dostępność. Co mówią przepisy.
  - `#gory` 📱 — Specyfika Podhala · Małe gminy, jedna sala na wszystko i słabe łącze.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla gmin · Od sali obrad po cały urząd i przestrzeń gminy.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania urzędów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegDeweloper — `/dla-kogo/deweloperzy`
- Prototyp: `prototyp/deweloperzy.html` · źródło: `zrodlo/pages/SegDeweloper.*`
- Tytuł strony: Teletechnika dla deweloperów, § 192e — Małopolska | PRO-KOM
- Wysokość w prototypie: desktop 10023 px · telefon 11775 px
- Sekcje:
  - `#hero` — Teletechnika dla deweloperów · Podhale i Małopolska · Teletechnika przygotowana do odbioru, która nie wraca w reklamacjach.
  - `#problemy` 📱 — Co słyszymy od deweloperów · Gdzie teletechnika psuje odbiory na końcu budowy.
  - `#rok` 📱 — Teletechnika na osi budowy · Od projektu do przekazania wspólnocie.
  - `#przepisy` 📱 — Przepisy i obowiązki · Warunki techniczne, megaustawa i ustawa deweloperska.
  - `#gory` 📱 — Specyfika Podhala · Apartamenty pod wynajem, stoki i burze.
  - `#przygotuj` — Przed wyceną · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla deweloperów · Od zgodności z warunkami technicznymi po osiedle premium.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania deweloperów.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

### SegBudowa — `/dla-kogo/budowy`
- Prototyp: `prototyp/budowy.html` · źródło: `zrodlo/pages/SegBudowa.*`
- Tytuł strony: Monitoring placu budowy bez prądu i kabla — Podhale | PRO-KOM
- Wysokość w prototypie: desktop 9477 px · telefon 11663 px
- Sekcje:
  - `#hero` — Monitoring placu budowy · Zakopane, Rabka, Podhale · Plac pilnuje się sam, zanim powstanie przyłącze prądu.
  - `#problemy` 📱 — Co słyszymy od inwestorów i wykonawców · Prąd, zasięg, mróz i złodzieje. Typowe kłopoty placu budowy.
  - `#rok` 📱 — Doba na budowie · Od pierwszej ekipy do nocy na pustym placu.
  - `#przepisy` 📱 — Przepisy i obowiązki · Kamery na budowie. Kto jest administratorem i co wolno.
  - `#gory` 📱 — Specyfika Podhala · Zima, krótki dzień i doliny bez zasięgu.
  - `#przygotuj` — Przed wizytą · Przygotuj to, a wycena będzie szybsza.
  - `#odbior` — Gwarancja i serwis · Po montażu nie znikamy. Masz numer, pod który dzwonisz.
  - `#pakiety` — Zestawy dla budów · Od budowy domu po kilka placów dewelopera.
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania inwestorów i wykonawców.
  - `#powiazane` — Zwykle idzie w parze · Usługi, które łączymy w tym obiekcie.

## Pozostałe

### Architekci — `/dla-architektow`
- Prototyp: `prototyp/dla-architektow.html` · źródło: `zrodlo/pages/Architekci.*` · szczegóły: `ARCHITEKCI.md`
- Tytuł strony: Dla architektów: smart home, audio i teletechnika | PRO-KOM
- Wysokość w prototypie: desktop 20009 px · telefon 24376 px
- Sekcje: `#hero` · `#dla-ciebie` · `#problemy` 📱 · `#etapy` · `#wymiana` · `#checklista` 📱 · `#liczby` 📱 · `#instalacje` · `#nowosci` · `#deweloperzy` · `#przepisy` 📱 · `#doswiadczenie` 📱 · `#biblioteka` 📱 · `#pokaz` · `#zasady` 📱 · `#opiekun` · `#faq` 📱 · `#wyslij`

### Oferta — `/uslugi`
- Prototyp: `prototyp/oferta.html` · źródło: `zrodlo/pages/Oferta.*`
- Tytuł strony: Oferta instalacji na Podhalu: monitoring, alarmy, sieci | PRO-KOM
- Wysokość w prototypie: desktop 7068 px · telefon 6628 px
- Sekcje:
  - `#hero` — Pełna oferta · 10 obszarów · 76 rozwiązań · Oferta instalacji na Podhalu: monitoring, alarmy, sieci, smart home, nagłośnienie.
  - `#lista` 📱 — Monitoring i kamery
  - `#zawsze` — W każdej instalacji · 

### Zaplanuj — `/zaplanuj`
- Prototyp: `prototyp/zaplanuj.html` · źródło: `zrodlo/pages/Zaplanuj.*`
- Tytuł strony: Zaplanuj instalację: monitoring, alarm, Wi-Fi, smart home | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 2270 px · telefon 4446 px
- Sekcje:
  - `#hero` — Kreator · 4 krótkie kroki · 2 minuty · Zaplanuj instalację: monitoring, alarm, Wi-Fi, smart home na Podhalu.

### Realizacje — `/realizacje`
- Prototyp: `prototyp/realizacje.html` · źródło: `zrodlo/pages/Realizacje.*`
- Tytuł strony: Realizacje: nagłośnienie, multimedia, sieci — Podhale | PRO-KOM
- Wysokość w prototypie: desktop 2754 px · telefon 5623 px
- Sekcje:
  - `#hero` — Realizacje · Podhale, Małopolska i okolice · Wybrane realizacje PRO-KOM.

### Serwis — `/serwis`
- Prototyp: `prototyp/serwis.html` · źródło: `zrodlo/pages/Serwis.*`
- Tytuł strony: Serwis instalacji na Podhalu: kamery, alarmy | PRO-KOM
- Wysokość w prototypie: desktop 5430 px · telefon 8287 px
- Sekcje:
  - `#hero` — Serwis instalacji · Rabka-Zdrój, Zakopane, Podhale · Coś nie działa? Zgłoś. Sprawdzimy zdalnie albo przyjedziemy.
  - `#plany` — Opieka serwisowa · Instalacja ma działać w sezonie, a nie tylko w dniu odbioru.
  - `#przejecie` — Instalacja od innej firmy · Przejmiemy serwis. Bez wymiany wszystkiego.
  - `#zdalnie` — Zdalnie i na miejscu · 
  - `#faq` 📱 — Pytania i odpowiedzi · Pytania o serwis.
  - `#powiazane` — Zwykle idzie w parze · Serwisujemy wszystko, co montujemy.

### Poradnik — `/poradnik`
- Prototyp: `prototyp/poradnik.html` · źródło: `zrodlo/pages/Poradnik.*`
- Tytuł strony: Poradnik: monitoring, RODO, Wi-Fi, ładowarki, anteny | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 3446 px · telefon 6506 px
- Sekcje:
  - `#hero` — Poradnik · przepisy, technika, praktyka · Poradnik: monitoring, RODO, Wi-Fi i instalacje w obiektach na Podhalu.

### PoradnikRodo — `/poradnik/monitoring-a-rodo`
- Prototyp: `prototyp/poradnik-monitoring-rodo.html` · źródło: `zrodlo/pages/PoradnikRodo.*`
- Tytuł strony: Monitoring w pensjonacie a RODO: gdzie kamera może patrzeć | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 4840 px · telefon 8017 px
- Sekcje:
  - `#hero` — Poradnik · Przepisy · 7 minut czytania · Monitoring w pensjonacie a RODO: gdzie kamera może patrzeć, a gdzie nie.

### OFirmie — `/o-firmie`
- Prototyp: `prototyp/o-firmie.html` · źródło: `zrodlo/pages/OFirmie.*`
- Tytuł strony: O firmie PRO-KOM: instalacje na Podhalu od 2004 roku | PRO-KOM Instalacje
- Wysokość w prototypie: desktop 3923 px · telefon 6949 px
- Sekcje:
  - `#hero` — PRO-KOM · Rabka-Zdrój i Zakopane · od 2004 roku · Firma z Podhala, która zostaje po montażu.
  - `#linie` — Linie PRO-KOM · Jedna firma, kilka specjalizacji.
  - `#historia` — Historia · Ponad 20 lat na Podhalu.
  - `#jak` — Jak pracujemy · Zasady, których się trzymamy.
  - `#dane` — Dane firmy · 

### Kontakt — `/kontakt`
- Prototyp: `prototyp/kontakt.html` · źródło: `zrodlo/pages/Kontakt.*`
- Tytuł strony: Kontakt: PRO-KOM Instalacje, Rabka-Zdrój i Zakopane
- Wysokość w prototypie: desktop 3056 px · telefon 4392 px
- Sekcje:
  - `#hero` — Kontakt · PRO-KOM Instalacje · Kontakt: salony w Rabce-Zdroju i Zakopanem.
  - `#napisz` — Napisz do nas · Krótka wiadomość wystarczy.

