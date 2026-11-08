# Panel stagingu — prokominstalacje.pl (checklista INST-3)

Wersja 08.11.2026 (INST-3). Panel: `https://panel.<domena panelu stagingu>/admin` → tenant **Instalacje**.
Seed na stagingu nie działa — wszystko, co seed robi lokalnie, trzeba wpisać ręcznie. Ta lista zbiera wpisy „Na stagingu po …” z `docs/stan/STAN-instalacje.md` (I7–I16, I-T, INST-1, L1-I, INST-2 PR1–PR4) w jednym miejscu. Wartości do skopiowania są w cudzysłowach albo w plikach seeda wskazanych w nawiasie.

Szacunek: 30–45 minut. Kolejność = od rzeczy widocznych na każdej stronie do pojedynczych podstron. Po każdej grupie odśwież stronę stagingu (cache stron do 60 s).

Zasada: **zmieniasz tylko pola z listy.** Jeśli pole już ma wartość z listy — odhacz i idź dalej.

---

## 1. Dane wspólne linii — `SiteSettings` Instalacji → grupa `shared` (L1-I, INST-2 PR1)

Źródło wszystkich wartości: `src/seed/shared/instalacje.ts` (`INSTALACJE_SHARED`). Jeśli grupa jest pusta, przepisz ją w całości z tego pliku (to większość z 30–45 minut); jeśli jest wypełniona — sprawdź tylko punkty niżej.

- [ ] **Szyna — sekcje i ikony:** Start `home`, Dla kogo `users`, Usługi `grid`, Architekci `compass`, Realizacje `star`, Góry i zima `mountain`, Jak pracujemy `check`, Serwis `wrench`, Pytania `q`, Zaplanuj `cal` (ikona spoza zestawu = szyna pokazuje „dokument”).
- [ ] **Skróty wyszukiwarki:** Zaplanuj instalację `/zaplanuj`, Serwis i przeglądy `/serwis`, Dla architektów `/dla-architektow`, Kontakt `/kontakt`.
- [ ] **Pasek marki:** etykieta telefonu „Instalacje:”, obietnica „Odpowiedź do 24 h w dni robocze”, slot „Zgłoś awarię” → `/serwis#zglos`.
- [ ] **Kapsuła:** CTA „Zaplanuj instalację” → `/zaplanuj` (licznik: brak).
- [ ] **Dolny pasek:** druga pozycja „Usługi” → `/uslugi`; środek „Zaplanuj” → `/zaplanuj`, ikona `cal`.
- [ ] **Stopka:** obietnice „Projekt · montaż · serwis”, „24 miesiące gwarancji na montaż”, „Wycena na piśmie”; trzy kolumny linków (Usługi, Dla kogo, Firma) jak w pliku; nota „Logotypy należą do ich właścicieli”.
- [ ] **Kontakt** (`contact`): H1, lead, fakty, **trzy trasy**: „Planuję instalację” → `/zaplanuj`, **„Awaria albo przegląd” → „Zgłoś awarię” → `/serwis#zglos`**, „Jestem architektem lub deweloperem” → `/dla-architektow`; tematy, tytuł formularza, kolejne kroki, mapa, salon `rabka`.
- [ ] **FAQ Kontaktu — 4 pytania:** „Czy przyjeżdżacie na miejsce?”, „Jak szybko odpowiadacie?”, „Co przygotować przed rozmową?”, „Czy serwisujecie instalacje po innej firmie?” (odpowiedzi z pliku).
- [ ] **O firmie** (`about`): autoryzacje **„Ampio”, „Elzab EcoPower”** (Satel dopiero po potwierdzeniu szefa — nie wpisuj); liczby **„20+ / lat na Podhalu — od 2004 r.”** i **„24 / miesiące gwarancji na montaż”**; „Sprawdź nas”: CEIDG, Google, **„Autoryzacja Ampio” → `/smart-home`**, „Realizacje” → `/realizacje`; zasady, kroki i tekst wizyty z pliku.

## 2. `SiteSettings` Instalacji — pozostałe pola

- [ ] `footer.text` = „Monitoring, alarmy, kontrola dostępu, sieci i Wi-Fi, smart home Ampio, nagłośnienie, ekrany, anteny i teletechnika. Projekt, montaż i serwis na Podhalu i w Małopolsce. PRO-KOM Tadeusz Wójciak, od 2004 roku.” (zamiast „dane przykładowe”).
- [ ] Telefon linii „+48 889 003 889” i e-mail „kontakt@prokominstalacje.pl” (I12/I13 — dane szefa).
- [ ] `footer.links` — można zostawić (strona ich nie czyta; linki prawne idą z `CompanyData.legal`).
- [ ] `seo.ogImage` — puste do czasu obrazu OG z czatu (D6 = A, przed produkcją).

## 3. `CompanyData` (dane firmy, wspólne)

- [ ] Lokalizacja **Zakopane usunięta albo nieopublikowana** (jeden salon — Rabka). Drugi salon pojawi się na `/kontakt` sam, gdy zostanie opublikowany.
- [ ] `legal` — linki do polityki prywatności, cookies i deklaracji dostępności Instalacji (strony z p. 9).

## 4. `InstalacjeSettings`

- [ ] `architects.photo` — **wyczyść** (zasada „bez zdjęć ludzi”; pole zostaje w bazie, strona go nie czyta).
- [ ] `architects` — imię i rola opiekuna: Tadeusz Wójciak (dane szefa 01.11), bez zdjęcia.
- [ ] Pole WhatsApp — nie istnieje od #352 (migracja usunęła je z bazy) — nic do zrobienia.

## 5. Strona główna (`Pages` → `home`, blok `instHome`)

- [ ] Hero „Tytuł, część 1” = „Twój inteligentny obiekt” (INST-1; razem z częścią 2: „Twój inteligentny obiekt na żywo.”).
- [ ] Hero i sekcje bez Zakopanego jako salonu (I12 — jeden salon).
- [ ] SEO tytuł = „Monitoring, alarmy i Wi-Fi na Podhalu | PRO-KOM Instalacje” (strona główna ma pełny tytuł, bez szablonu).

## 6. Tytuły SEO wszystkich stron (I7–I13, I-T, INST-2 PR2)

Wartości = to, co pokazuje lokalna baza po `pnpm seed` (08.11). Szablon dopisuje „| PRO-KOM Instalacje” sam — wpisz tylko tekst przed kreską (wyjątek: strona główna ma pełny tytuł). Strony usług i stałe strony: `Pages` → SEO; „Dla kogo”: `InstObjects` → SEO obiektu. Każdy tytuł bez dopisku ≤ 60 znaków (pilnuje e2e). Najszybciej: uruchom `staging-smoke.mjs` (§11) — pokazuje długość tytułu każdej strony; poprawiaj tylko różniące się.

| Adres | Tytuł | ✓ |
|---|---|---|
| `/` | Monitoring, alarmy i Wi-Fi na Podhalu \| PRO-KOM Instalacje | [ ] |
| `/anteny` | Anteny satelitarne i DVB-T2 na Podhalu | [ ] |
| `/monitoring` | Monitoring CCTV Rabka-Zdrój i Podhale | [ ] |
| `/alarmy` | Alarmy i wideodomofony na Podhalu | [ ] |
| `/kontrola-dostepu` | Zamki z kodem do apartamentów, Zakopane | [ ] |
| `/sieci-wifi` | Wi-Fi i sieci dla pensjonatów, Zakopane | [ ] |
| `/teletechnika` | Teletechnika w budownictwie, Małopolska | [ ] |
| `/smart-home` | Smart home Ampio na Podhalu | [ ] |
| `/naglosnienie` | Nagłośnienie lokali i kościołów | [ ] |
| `/ekrany` | Ekrany i menu board, Zakopane i Podhale | [ ] |
| `/ladowarki-ev` | Ładowarki EV Elzab EcoPower, Podhale | [ ] |
| `/dla-kogo/dom` | Alarm i kamery w domu i domku, Podhale | [ ] |
| `/dla-kogo/apartamenty` | Zamki z kodem dla apartamentów na doby | [ ] |
| `/dla-kogo/pensjonaty` | Wi-Fi, kamery i czujki dla pensjonatów | [ ] |
| `/dla-kogo/hotele` | Wi-Fi, TV i zamki na karty dla hoteli | [ ] |
| `/dla-kogo/restauracje` | Nagłośnienie i Wi-Fi dla restauracji | [ ] |
| `/dla-kogo/sklepy` | Monitoring i alarm w sklepie, Zakopane | [ ] |
| `/dla-kogo/firmy` | Dostęp, monitoring i sieć dla firm | [ ] |
| `/dla-kogo/koscioly` | Nagłośnienie kościoła i transmisja mszy | [ ] |
| `/dla-kogo/szkoly` | Monitoring, dzwonki i Wi-Fi dla szkół | [ ] |
| `/dla-kogo/gminy` | Transmisja sesji i monitoring dla gmin | [ ] |
| `/dla-kogo/deweloperzy` | Teletechnika dla deweloperów, § 192e | [ ] |
| `/dla-kogo/budowy` | Monitoring placu budowy bez prądu | [ ] |
| `/zaplanuj` | Zaplanuj instalację w 2 minuty | [ ] |
| `/kontakt` | Kontakt i dojazd: Rabka-Zdrój i Podhale | [ ] |
| `/serwis` | Serwis kamer, alarmów i sieci, Podhale | [ ] |
| `/dla-architektow` | Dla architektów: instalacje w projekcie | [ ] |
| `/uslugi` | Oferta instalacji na Podhalu | [ ] |
| `/realizacje` | Realizacje: nagłośnienie i multimedia | [ ] |
| `/o-firmie` | O firmie: instalacje na Podhalu od 2004 | [ ] |
| `/poradnik` | Poradnik: monitoring, RODO i Wi-Fi | [ ] |
| `/poradnik/monitoring-a-rodo` | Monitoring w pensjonacie a RODO | [ ] |
| `/polityka-prywatnosci` | Polityka prywatności | [ ] |
| `/cookies` | Cookies | [ ] |
| `/dostepnosc` | Dostępność | [ ] |

## 7. Usługi (`InstServices`) — teksty bez obietnicy „wyślij zdjęcia” (INST-2 PR2)

- [ ] Każda usługa → aside FAQ: „Opisz obiekt albo obecną instalację. Powiemy, od czego zacząć i czego się spodziewać.”
- [ ] Każda usługa → przycisk ceny: „Opisz obiekt do wyceny”.
- [ ] **Ładowarki** → nagłówek CTA: „Opisz rozdzielnicę i przyłącze. Powiemy, którą ładowarkę da się podłączyć.”
- [ ] **Ładowarki** → notka zestawów: „Do wstępnej wyceny wystarczy opis rozdzielnicy, licznika i miejsca montażu — zdjęcia możesz wysłać w odpowiedzi na nasz e-mail. Ostateczną cenę podajemy na piśmie.”
- [ ] **Monitoring** → wstęp ceny: „…Opisz obiekt, a powiemy, czego się spodziewać.”; FAQ o cenie — ostatnie zdanie: „Zdjęcia obiektu możesz wysłać w odpowiedzi na nasz e-mail.”
- [ ] **Anteny** → wstęp ceny: „Opisz dach albo miejsce na antenę i napisz, ile telewizorów chcesz podłączyć. Zdjęcia możesz wysłać w odpowiedzi na nasz e-mail.”
- [ ] **Kontrola dostępu** → wstęp ceny: „Najwięcej zmieniają drzwi i integracje. Opisz drzwi, a zdjęcia z obu stron i boku skrzydła możesz wysłać w odpowiedzi na nasz e-mail. Powiemy, jaki zamek pasuje.”
- [ ] Pozostałe pola usług zmienione w I-T (H2 FAQ „Pytania o …”, gwarancja „24 miesiące gwarancji na montaż. Serwis pod jednym numerem.”) — porównaj z `seed/prokominstalacje/strony-zrzut/<Usługa>.json`; zostaw, jeśli już tak jest.

## 8. Obiekty „Dla kogo” (`InstObjects`)

- [ ] **Budowy** — FAQ 07 i 08 bez znaczników `[SZEF…]` (I14b): FAQ 08 „Kupić czy wynająć?” odpowiada tylko o zakupie; tekst z `seed/prokominstalacje/obiekty/bud.json`.
- [ ] **Deweloperzy** — FAQ o warunkach technicznych: „(stan na październik 2026)” (jak `STAN_FAKTOW`).
- [ ] Nagłówki „Co jeszcze montujemy w …” (I-T, `objectPage.relatedHeadings`) — jak w paczce.

## 9. Strony do ułożenia (jeśli ich nie ma) — `Pages`

Seed zakłada je lokalnie; na stagingu muszą istnieć z właściwym blokiem, inaczej adres daje 404.

- [ ] `/uslugi` (blok `instOffer`), `/realizacje` (`instRealizations`), `/o-firmie` (`instAbout` — „szablon wspólny”), `/poradnik` (`instGuide`), `/kontakt` (`instContact` — „szablon wspólny”), `/zaplanuj`, `/serwis`, `/dla-architektow` (`instArchitects`).
- [ ] **H1 `/realizacje`:** „Realizacje: nagłośnienie, multimedia i sieci” + akcent „od Krakowa po Zakopane.” (I-T).
- [ ] Strony prawne Instalacji: polityka prywatności, cookies, deklaracja dostępności — treść z `src/seed/instalacje/legal.ts` (**szkice do akceptacji szefa/prawnika**; polityka już bez „linku do rzutów”).
- [ ] Wpis poradnika „Monitoring a RODO” (`/poradnik/monitoring-a-rodo`) — kolekcja wpisów, kategoria Monitoring.

## 10. Realizacje (`Realizations`) i Nowe rozwiązania (`InstArchNews`)

- [ ] 8 realizacji ze zdjęciami z `seed/prokominstalacje/realizacje/media/<legacyId>/`, opisy (`alt`) z `zdjecia.json` (INST-1).
- [ ] Realizacje: zaznaczona zgoda klienta i opublikowane (bez zgody strona ich nie pokaże).
- [ ] Realizacja kościoła (legacy 2) — **usuń zdjęcie RØDE `20170125_133515`** (karton mikrofonów, INST-2 PR2).
- [ ] Nowe rozwiązania — zdjęcia z `seed/prokominstalacje/architekci/media/` (opisy i źródła w `nowe-rozwiazania.json` → `zdjecie`); 12 kart opublikowanych, 8 roboczych (czekają na szefa).
- [ ] Karta 20 „Opisz projekt i jego etap”, CTA strony Deweloper i przycisk ceny Smart home — teksty z paczki (INST-1, bez „Wyślij rzuty”).

## 11. Na koniec

- [ ] Strona główna, `/kontakt`, `/o-firmie`, `/dla-architektow`, `/realizacje` otwarte na telefonie i komputerze — brak `[SZEF`, „WhatsApp”, „W przygotowaniu”, „dane przykładowe”.
- [ ] Szyna (≥ 1400 px): każda ikona inna, żadna nie jest „dokumentem”.
- [ ] Smoke Instalacji z hasłem stagingu (35 adresów, tytuły, zakazane słowa, `noindex`, sitemap, `robots.txt` z `Disallow`, `/llms.txt`, 404 linii, JSON-LD):
  ```bash
  SMOKE_AUTH=użytkownik:hasło node docs/design/prokominstalacje/narzedzia/staging-smoke.mjs
  ```
  Wynik „All green.” = gotowe. HTML stron z JSON-LD ląduje w `tmp/staging-html/` (do Rich Results Test, zakładka „Kod”).
- [ ] Wiadomość do Claude Code: „panel stagingu Instalacji gotowy” + wynik smoke → ponowny pomiar Lighthouse.

---

## 12. Formularze na stagingu (Krystian, ok. 15 minut)

Wysyłaj na **własny** e-mail i telefon, w treści „TEST INST-3”. Po każdym formularzu sprawdź trzy rzeczy:
**(a)** potwierdzenie do Ciebie przyszło od `kontakt@prokominstalacje.pl` (logo i kolory Instalacji),
**(b)** powiadomienie trafiło do skrzynki linii (S10d),
**(c)** w panelu → Zapytania jest rekord z tenantem **Instalacje** i kategorią z tabeli.

| # | Gdzie | Co wpisać | Kategoria w panelu | Po wysłaniu | a | b | c |
|---|---|---|---|---|---|---|---|
| 1 | `/kontakt` (szablon wspólny) | temat „Monitoring”, opis, imię, telefon, e-mail, zgoda | kontakt Instalacji (temat w rekordzie) | numer zgłoszenia na stronie | [ ] | [ ] | [ ] |
| 2 | `/zaplanuj` (kreator, 4 kroki) | obiekt „Pensjonat”, usługi Monitoring + Wi-Fi, miejscowość, kontakt | Instalacje — Zaplanuj | przejście na `/wyslane?nr=…` | [ ] | [ ] | [ ] |
| 3 | `/` mini-formularz (sekcja „Zaplanuj”) | usługa, miejscowość, imię, telefon, zgoda | Instalacje — strona główna | potwierdzenie w miejscu | [ ] | [ ] | [ ] |
| 4 | `/dla-architektow#wyslij` | rola, etap, opis projektu, telefon | Architekci · projekt | potwierdzenie w miejscu | [ ] | [ ] | [ ] |
| 5 | `/dla-architektow` checklista PDF | imię, e-mail, zgoda | Architekci · checklista PDF | „Wyślemy checklistę mailem w ciągu 1 dnia roboczego” | [ ] | [ ] | [ ] |
| 6 | `/dla-architektow#nowosci` | imię, e-mail, zgoda + zgoda handlowa | Architekci · nowości | potwierdzenie w miejscu | [ ] | [ ] | [ ] |
| 7 | `/teletechnika` przedmiar | zakres, lokalizacja, termin, telefon, zgoda | Teletechnika — przedmiar | potwierdzenie w miejscu | [ ] | [ ] | [ ] |
| 8 | `/serwis#zglos` | system, objaw, pilność, imię, telefon, zgoda | Instalacje — serwis | karta z krokami | [ ] | [ ] | [ ] |

Dodatkowo (raz): wyślij formularz z pustym telefonem — komunikat błędu przy polu i fokus na nim; 11 zgłoszeń w minutę z jednego IP → odpowiedź „za dużo zgłoszeń” (429, Nginx). Po teście usuń rekordy „TEST INST-3” z panelu.

## 13. Statystyki Umami (Krystian, po uruchomieniu kontenera)

Stan 08.11: kontener Umami dla prokom-web **nie jest jeszcze uruchomiony** na serwerze (w `docker/compose.staging.yml` brak usługi `umami`; ma ją tylko Gaming) — to krok S10b/S10c z `docs/STAN.md` (fundament), nie sesja Instalacji. Bez niego strona po prostu nie ładuje skryptu (ADR-020) — nic się nie psuje. Kod Instalacji jest gotowy od I13.

Gdy kontener działa:
1. Panel Umami → **Add website** → nazwa „prokominstalacje.pl (staging)”, domena `staging.prokominstalacje.pl` → skopiuj **Website ID** (UUID).
2. Na serwerze w `.env.staging` dopisz linię do istniejącej zmiennej (rozdzielone przecinkiem, bez spacji):
   `UMAMI_WEBSITES=software=<id>,instalacje=<id-z-kroku-1>`
   (identyfikator nie jest sekretem — widać go w HTML strony).
3. Zastosuj zmienną: kolejne wdrożenie z pipeline'u albo `docker compose --env-file .env.staging -f docker/compose.prod.yml -f docker/compose.staging.yml up -d app` w `/srv/prokom/prokom-web` (sam restart nie wczyta nowego `.env`).
4. Sprawdź: źródło strony `staging.prokominstalacje.pl` ma `<script … src="/_s/script.js" data-website-id="<id>" data-host-url="/_s" data-do-not-track="true" data-exclude-search="true">`.
5. Przeklikaj na telefonie: otwórz Menu, dotknij pozycji dolnego paska, przejdź kreator `/zaplanuj` do końca, wyślij Kontakt. W panelu Umami → Events powinny być: `menu_otworz`, `pasek_klik`, `kreator_start`, `kreator_krok`, `kreator_wyslij`, `kontakt_wyslij` (oraz odsłona `/wyslane`).
6. Produkcja — to samo w `.env.prod` z osobną stroną „prokominstalacje.pl”, **po** akceptacji polityki prywatności (akapit o Umami).
