# ADR-I002 — Model treści prokominstalacje.pl (Payload, tenant `instalacje`)

- Status: **przyjęty z poprawkami** (I0, 28.10.2026, sprawdzony na develop 33f6e9b — sekcja „Poprawki I0” na końcu) · wdrożenie w I2 · Data: 27.10.2026

## Kontekst
- 31 stron. Część jest szablonowa (12 stron „Dla kogo” z identyczną strukturą), część bardzo indywidualna (10 stron usług z własnymi kalkulatorami, symulatorami i scenami).
- Wszystkie teksty są już napisane i sprawdzone — leżą w `seed/prokominstalacje/` (zrzut danych z wizualizacji v4.0).
- Panel ma być prosty dla szefa i Krystiana: zmiana telefonu, FAQ, zestawu, ceny „od”, opisu SEO bez programisty. Nie musi edytować logiki kalkulatora.
- W repo istnieją kolekcje wspólne: `Pages` (strony z bloków, ADR-006), `Posts`, `Inquiries` (ADR-003), `SiteSettings`, `Tenants`, `Industries`, `Media`, `Redirects`, `Partners` oraz kolekcje linii (`BiznesSettings`, `Products`, `Catalog*`; `SoftwareSettings`, `Solutions`, `SolutionAreas`, `Cities`). Nie dublujemy wspólnych.
- **Jak repo buduje strony (ADR-006, ADR-010):** każda strona tenanta to dokument `Pages` (slug, publikacja, SEO, podgląd) z polem bloków; rejestr `src/blocks/registry.ts` mówi, które bloki wolno użyć w danej linii; bloki jednej linii leżą w `src/sites/<linia>/blocks/`. Strona główna = `Pages` ze slugiem `home`. Trasy, których nie da się zrobić z `Pages` (np. zagnieżdżone adresy), są w grupie tras linii `src/app/(sites)/[domain]/(<linia>)/` i ich adresy trafiają do `RESERVED_PAGE_SLUGS`.
- **Próg ADR-010:** ok. 30 bloków w panelu. Software zaplanował, że sekcje o stałej kolejności są komponentami wstawianymi **jednym blokiem**, a ich teksty leżą w `SoftwareSettings` (ADR-014, rozstrz. 7). Instalacje robią tak samo. (Stan na 33f6e9b: w `registry.ts` są tylko bloki wspólne i Biznesu — bloki Software dopiero w SW5/SW6; Instalacje mogą wejść do rejestru wcześniej, nowe bloki zawsze na końcu `ALL_BLOCKS`, żeby tabele zachowały nazwy.)

## Decyzja

### 0. Strony Instalacji w modelu repo
| Strona | Jak powstaje | Adres |
|---|---|---|
| Główna | `Pages` `home` + blok **`InstHome`** (cała strona: hero „Twój obiekt na żywo” i sekcje; teksty z `InstalacjeSettings`/`dane/glowna.ts`) | `/` |
| 10 usług | `Pages` o slugach `monitoring`, `alarmy`, `kontrola-dostepu`, `sieci-wifi`, `teletechnika`, `anteny`, `smart-home`, `naglosnienie`, `ekrany`, `ladowarki-ev` + blok **`InstService`** (pole `usluga` → dokument `InstServices`; komponent strony usługi z widżetami) | `/<slug>` |
| 12 obiektów | trasa linii **`(instalacje)/dla-kogo/[obiekt]`** (dane z `InstObjects`; `generateStaticParams`), `dla-kogo` do `RESERVED_PAGE_SLUGS` | `/dla-kogo/<slug>` |
| Pełna oferta (76) | `Pages` `uslugi` + blok **`InstOffer`** | **`/uslugi`** (`/oferta` jest zajęte przez trasę Biznesu) |
| Zaplanuj | `Pages` `zaplanuj` + blok **`InstPlanner`** | `/zaplanuj` |
| Po wysłaniu formularza | trasa linii **`(instalacje)/wyslane`** (jak `/dziekujemy` Software: `noindex`, poza sitemap — `Pages` nie ma przełącznika `noindex`), teksty w `dane/wyslane.ts`, `wyslane` do `RESERVED_PAGE_SLUGS` | **`/wyslane`** (`/dziekujemy` jest zajęte przez trasę Software) |
| Kontakt, Serwis, O firmie, Realizacje | `Pages` + bloki **`InstContact`**, **`InstServiceDesk`**, **`InstAbout`**, **`InstRealizations`** | `/kontakt`, `/serwis`, `/o-firmie`, `/realizacje` |
| Poradnik + wpisy | `Pages` `poradnik` + blok **`InstGuide`** (lista `Posts` tenanta); wpis: trasa linii **`(instalacje)/poradnik/[slug]`**. `poradnik` **nie** trafia do `RESERVED_PAGE_SLUGS` — lista jest stroną `Pages`, a trasa grupy obsługuje tylko adresy zagnieżdżone. Wspólne `postHref()` (`src/lib/posts/list.ts`) daje dziś zawsze `/aktualnosci/…` → w I12 mały PR wsp: adres wpisu zależny od linii (testy Biznesu i Instalacji, też w sitemap) | `/poradnik`, `/poradnik/<slug>` |
| Dla architektów i deweloperów | `Pages` `dla-architektow` + blok **`InstArchitects`** (cała strona; teksty `dane/architekci.ts`, przekrój `dane/przekroj.ts`, nowe rozwiązania z `InstArchNews`) — **ADR-I005** | `/dla-architektow` |
| Prawne | `Pages` z blokiem `RichText` (wspólny) | `/polityka-prywatnosci`, `/cookies`, `/deklaracja-dostepnosci` |

Razem **11 bloków linii** (`InstHome`, `InstService`, `InstOffer`, `InstPlanner`, `InstContact`, `InstServiceDesk`, `InstAbout`, `InstRealizations`, `InstGuide`, `InstArchitects` (W-A, ADR-I005) + ewentualnie `InstCta`) — poniżej progu ADR-010. Bloki w `src/sites/instalacje/blocks/`, wpisy w rejestrze (strefa wspólna). Layout grupy `(instalacje)` jak `(software)/layout.tsx` (`requireLine(params, 'instalacje')`); do `RESERVED_PAGE_SLUGS`: `dla-kogo`, `wyslane`. Frame linii (`InstalacjeFrame`: nagłówek, stopka, dolny pasek, arkusz) wpięty w `[domain]/layout.tsx` obok `BiznesFrame` i `SoftwareFrame` — wybierany po `tenant.line === 'instalacje'`. Biznes i Software wybierają ramkę po swojej grupie w `SiteSettings`; Instalacje mają nawigację w kodzie (`dane/nawigacja.ts`), więc grupa `SiteSettings.instalacje` nie jest potrzebna.

### 1. Podział: panel vs kod
| W panelu (Payload) | W kodzie (`src/sites/instalacje/`) |
|---|---|
| dane kontaktowe i godziny (ustawienia tenanta), teksty hero, CTA, FAQ, przykładowe zestawy, czynniki ceny, ceny „od” z przełącznikiem, powiązania, SEO każdej strony | układ stron, komponenty, sceny SVG, logika kalkulatorów i symulatorów, teksty wewnątrz widżetów (etykiety, kroki, wyniki) |
| strony „Dla kogo” w całości (dane szablonu) | szablon strony obiektu i SVG przekrojów |
| 76 rozwiązań oferty, realizacje, wpisy poradnika | filtr, wyszukiwarka, kreator |

Teksty widżetów w kodzie trzymamy w plikach danych `src/sites/instalacje/dane/<strona>.ts` (typowane, wygenerowane ze `seed/…/strony-zrzut/<Strona>.json`), nie rozsiane po JSX. W etapie 2 można je przenieść do panelu, bez zmiany komponentów.

### 2. Kolekcje własne linii (nazwy angielskie jak w repo, `onlyLineTenant('instalacje', …)` jak `SoftwareSettings`)
Wszystkie z polem tenanta (wtyczka multi-tenant). Nazwy pól poniżej są opisowe (po polsku) — w kodzie po angielsku, konsekwentnie z `Solutions`/`Products` (I2 tłumaczy 1:1 i zapisuje mapę w ADR).

**`InstServices`** (10 dokumentów) — strony usług
- `klucz` (enum: `kam, alarm, kd, wifi, tel, ant, smart, snd, scr, ev` — klucze z prototypu, używane w kreatorze i zapytaniach), `slug`, `nazwa`, `grupa` (Bezpieczeństwo / Sieci i technika / Komfort i obraz), `ikona` (klucz ikony), `kolor` (hex z `wspolne.json → HU`), `podpisMenu`
- `kafel` (strona główna): `opis`, `elementy[]`, `wyroznienia[]`, `cenaOd` (tekst). Cena widoczna tylko, gdy globalny `InstalacjeSettings.pokazCeny = true` **i** pole ceny jest wypełnione (jeden przełącznik, bez flag per usługa).
- `hero`: `eyebrow`, `h1a`, `h1b`, `lead`, `kv[] {wartosc, opis}`, `tagi[]`, `cta {tekst, adres}`
- `kotwice[] {id, nazwa}` (id muszą istnieć w komponencie strony — walidacja)
- `zestawy[] {ikona, nazwa, opis, elementy[], cena, wyrozniony}` (cena jak wyżej — tylko przy `pokazCeny`) + `zestawyNaglowek {eyebrow, h, p, uwaga}`
- `cena[] {ikona, tytul, opis}` + `cenaNaglowek {eyebrow, h, p, przycisk}`
- `faq[] {pytanie, odpowiedz}` (richText bez nagłówków)
- `powiazaneUslugi[]` (relacja), `podobneObiekty[]` (relacja do `InstObjects`), `powiazaneNaglowek`
- `cta {eyebrow, h, p}` (pas przed stopką)
- `seo` (grupa z wtyczki SEO: title, description, obraz OG)

**`InstObjects`** (12 dokumentów) — strony „Dla kogo” (1:1 z `seed/prokominstalacje/obiekty/<klucz>.json`)
- `klucz` (`dom, apt, pens, hotel, rest, sklep, firma, kosc, szk, gmina, dev, bud`), `slug`, `nazwa`, `grupa` (Dom i noclegi / Firmy / Instytucje / Budownictwo), `ikona`, `kolor`, `dla` (odmiana, np. „domu”)
- `hero` (jak wyżej) + `tytulSceny`
- `punkty[] {opis}` — opisy hotspotów w kolejności numerów na SVG (geometria w kodzie)
- `problemy[]`, `doba[]`, `przepisy[] {kto, artykul, tytul, opis}` (bez pola źródła — na stronie nie pokazujemy źródeł), `gory[]`, `realizacje`, `przygotuj {eyebrow, lead, pozycje[]}`, `zestawy[]`, `faq[]`, `powiazane[]`, `kotwice[]`, `cta`, `zwijaneNaTelefonie[]`, `seo`
- Mapowanie pól seeda (`obiekty/<klucz>.json`) → kolekcja: `k`→`klucz`, `h`→`kolor`, `dla`→`dla`, `title`/`desc`→`seo`, `sceneT`→`tytulSceny`, `hero`→`hero`, `hs[].d`→`punkty[].opis`, `pr`→wstęp sekcji problemów, `prob`→`problemy`, `day`→`doba`, `law`→`przepisy` (z nagłówkiem i leadem), `gory`→`gory`, `realH`/`real`→`realizacje`, `prep` (+`prepEye`, `prepLead`, jeśli są)→`przygotuj`, `pkgH`/`pkgs`→`zestawy`, `faqH`/`faq`→`faq`, `rel`→`powiazane`, `anc`→`kotwice`, `cta`→`cta`, `fold`→`zwijaneNaTelefonie`; `page` — tylko do kontroli (nazwa pliku prototypu). Źródła (`src`) są już usunięte z seeda.
- Strona Pensjonat (`/dla-kogo/pensjonaty`) ma rozbudowany układ (`Noclegowe`) — dokument `pens` + dodatkowe sekcje w kodzie.

**`InstSolutions`** (76) — oferta
- `nazwa`, `opis`, `usluga` (relacja), `kategorie[]` (słownik filtra Oferty: `dom, apt, pens, rest, sklep, firma, inst, dev` — **to nie są klucze `InstObjects`**; `inst` = kościół, szkoła, gmina; `pens` obejmuje hotel), `kolejnosc`.
- Źródło: **`seed/prokominstalacje/oferta-76.json`** (pełna lista z `common.js → offer()`). `strony-zrzut/Oferta.json` ma tylko stan zwinięty (po 3 na obszar) — nie importować z niego listy.
- Grupy obszarów w Ofercie (`rodzina`: Bezpieczeństwo / Łączność / Komfort i obraz / E-mobilność) celowo różnią się od kolumn mega menu (Bezpieczeństwo / Sieci i technika / Komfort i obraz) — nie ujednolicać.

**`Realizations`**
- `tytul`, `uslugi[]`, `obiekt`, `miejscowosc`, `rok`, `opis`, `zdjecia[]` (media), `zgodaKlienta` (bool, wymagane do publikacji — hook blokuje publikację bez zgody), `wyrozniona`.
- Seed (`Main.json → rl`, `Realizacje.json`) zawiera **prawdziwe nazwy klientów** z dawnych realizacji. Import: wszystkie jako **wersje robocze z `zgodaKlienta = false`**. Na stronie głównej i w `/realizacje` do czasu zgód: placeholdery z prototypu (bez nazw klientów). Lista do zgód — `docs/strony/prokominstalacje-do-uzupelnienia.md`.

**`InstArchNews`** (nowe rozwiązania dla architektów, panel) — pola, hook znaczników i seed: **ADR-I005 §2**, sesja I16b.

### 3. Ustawienia linii
**`InstalacjeSettings`** (kolekcja z jednym dokumentem na tenant — wzór `BiznesSettings` / `SoftwareSettings`)
- `pokazCeny` (bool, domyślnie **false**), `komunikatBezCen` („Wycena po wizji lokalnej”), `liczbaRozwiazan` (wyliczana), `gwarancjaMies` (24), `tekstOdpowiedzi` („Do 24 h odpowiadamy na zgłoszenia w dni robocze…”) — teksty obietnic w jednym miejscu, żeby zmiana decyzji szefa była jedną edycją.

Dane kontaktowe — w istniejących ustawieniach, gdzie się da (sprawdzone w I0):
- telefon i e-mail linii: `SiteSettings.phone` / `SiteSettings.email` (tenant `instalacje`);
- salony z adresami i godzinami: `CompanyData.locations` (global wspólny dla linii; adres salonu w Zakopanem [SZEF]);
- **WhatsApp:** pole jest tylko w grupie `SiteSettings.biznes` → dla Instalacji `InstalacjeSettings.whatsapp` (strefa własna, ta sama walidacja `toWhatsAppHref`), bez ruszania danych Biznesu.

- **Opiekun architektów:** grupa `InstalacjeSettings.architects` (`name`, `role`, `photo`, `phone`, `email`, `quote`, `responseText`) — ADR-I005 §1, sesja I16c.

Placeholdery z `wspolne.json → K` wpisujemy do seeda, szef podmienia w panelu.

### 4. Kolekcje wspólne — rozszerzenia (PR wspólny w I2)
**Zapytania** (istniejąca kolekcja z ADR-003) — **bez nowych kolumn i bez migracji** (poprawka I0). Kontrakt `POST /api/inquiry` (`src/lib/inquiry/schema.ts`) ma już pola na dane Instalacji. Pomysł z `meta` (JSON) odpada: takiego pola nie ma, a dokładanie go psułoby zgodność 1:1 z modelem `Inquiry` w PRO-KOM System.

| Dane formularza Instalacji | Pole kontraktu | Uwagi |
|---|---|---|
| źródło formularza (`inst-zaplanuj`, `inst-glowna`, `inst-kontakt`, `inst-serwis`, `inst-teletechnika-przedmiar`, `inst-usluga`) | `category` | `source` to grupa {adres strony, UTM}, nie źródło formularza. `category` idzie w temat maila i do panelu, więc zapisujemy **etykietę po polsku** („Zaplanuj”, „Serwis”, „Teletechnika — przedmiar”…); klucze `inst-*` to stałe w `src/sites/instalacje/` (mapa klucz → etykieta) |
| rodzaj | `type` | kreator i mini-formularz strony głównej → `wizard`; kontakt, serwis, przedmiar, zapytanie ze strony usługi → `contact` |
| usługi (`kam, alarm, …, ev`) | `topics[]` | walidacja kluczy usług dla linii `instalacje` (jak tematy Software) |
| obiekt, wielkość, etap, pełne odpowiedzi kreatora, konfiguracja ładowarki | `wizard` (JSON ≤ 8 tys. znaków) | tylko typ `wizard`; serwer sprawdza odpowiedzi regułami linii i zapisuje podsumowanie po polsku (jak B10c Biznesu). Dziś `composeWizard` w `submit.ts` zna tylko reguły Biznesu → gałąź dla `instalacje` |
| miejscowość | `city` | |
| pilność (serwis) | `deadline` | tekst, np. „Pilne — dziś”, „W tym tygodniu” |
| adres strony, UTM | `source.url`, `source.utm*` | |
| pliki (przedmiar, zdjęcia) | — | **bez uploadu w wersji 1** (decyzja Krystiana w I0, jak ADR-014 rozstrz. SW0 3): przy formularzu zdanie „Przedmiar lub zdjęcia prześlij mailem po zgłoszeniu — adres w potwierdzeniu”. `InquiryFiles` — „Pomysły na później” |

- Zmiany tylko w `src/lib/inquiry/schema.ts` (reguły per linia) i `submit.ts` (kreator Instalacji) — **w I11**, razem z formularzami, i dopiero **po scaleniu SW7** Software (ten sam `submit.ts`). Typ `audit`, `auditUrl` i kontakty `meeting`/`online` zostają tylko dla Software.
- Telefon: **wymagany na każdym formularzu Instalacji** (co najmniej 9 cyfr; e-mail opcjonalny) — decyzja Krystiana 31.10.2026 przed I11 (zastępuje regułę „e-mail lub telefon”). Odstępstwo od prototypu przedmiaru Teletechniki, który przyjmował telefon albo e-mail. Reguła liczy cyfry razem z kierunkowym (`+48 600 100 2` przejdzie) — świadomie prosto; pełny numer sprawdza biuro przy oddzwonieniu. Ogólny formularz `InquiryForm` (przykładowa strona `kontakt` z `pnpm seed`) dostaje na Instalacjach `phoneRequired`, dopóki I11 nie podmieni go na formularz linii.
- Wyjątek (I16c, decyzja Krystiana 01.11.2026, ADR-I005 §3): kategorie „Architekci · checklista PDF” i „Architekci · nowości” wymagają e-maila zamiast telefonu (imię zostaje wymagane — kolumna `name` w `Inquiries` jest NOT NULL); telefon, jeśli podany, nadal musi być numerem. Stałe w `src/lib/instalacje/architects.ts`. „Architekci · projekt” (Wyślij rzuty) — telefon jak cała linia.
- **Wdrożenie (I11, PR `inst/wsp-zapytania`):** reguły linii w `schema.ts` (telefon, `topics` = klucze usług bez powtórzeń), kreator w `submit.ts` sprawdzany regułami z kodu `src/lib/instalacje/plan.ts` (obiekty, wielkość, etap, pytanie każdej usługi z „Nie wiem”, ładowarka tylko z usługą `ev`, „Jak się skontaktować?” → `preferredContact`, pora kontaktu i strefa dojazdu w podsumowaniu) — bez pozycji (`items`), bez wywołań bazy. `topics` kreatora bierze serwer z odpowiedzi, nie z ciała żądania. Mail nazywa usługi (`serviceLabel`). Mini-formularz strony głównej i przedmiar wysyłają klucze (`tel` dla przedmiaru, zakres w treści).
- **Konfiguracja ładowarki → kreator:** przycisk „Zapytaj o tę wersję” prowadzi do `/zaplanuj#obiekt=<…>&uslugi=ev&konf=<base64url(JSON)>` (JSON: `{model, punkty, mocNaPunkt, wyjscie, montaz, kolor}` — klucze jak stan `Ladowarki.js`: `cm, wp, wk, wo, wm, wc, hp, ho, cp, ck, co`, przeliczone na nazwy). Kreator dekoduje `konf`, pokazuje podsumowanie wybranej wersji w kroku „Szczegóły” i wysyła je w odpowiedziach (`wizard`); źródło = „Zaplanuj”. Prototyp przekazuje dziś tylko `#obiekt=&uslugi=` — `konf` dochodzi w kodzie (I9 + I11).

**`Industries`** — Instalacje ich **nie używają** (obiekty to `InstObjects`); bez zmian.

**`Posts`** (poradnik) — tenant `instalacje`, kategoria, autor, data aktualizacji; wpis RODO z quizem jako blok. Adres wpisu Instalacji `/poradnik/<slug>` (trasa linii, decyzja Krystiana w I0), wspólne `/aktualnosci` zostaje dla innych linii. Kategorie Instalacji dochodzą do wspólnego `POST_CATEGORIES` z `line: 'instalacje'` (enum → migracja; zapis odrzuca kategorię innej linii — ADR-014 rozstrz. SW0 2). PR wsp w I12.

**Przekierowania** — mapa 301 (SEO §2.5).

### 5. Import danych
Skrypt `pnpm seed:instalacje` (idempotentny, po `klucz`/`slug`). **Mapa plików seeda:**

| Plik seeda | Dokąd |
|---|---|
| `wspolne.json` | `K` → ustawienia firmy/tenanta (placeholdery); `SV`, `SG`, `HU`, `megaCols`, `segCols`, `bnav`, `mmore`, `mtabs` → stałe nawigacji w kodzie (`src/sites/instalacje/dane/nawigacja.ts`) + pola `nazwa/grupa/ikona/kolor/podpisMenu` w `InstServices` i `InstObjects` |
| `obiekty/<klucz>.json` (12) | `InstObjects` (mapowanie pól §2). **Źródło prawdy dla stron obiektów** |
| `strony-zrzut/Seg*.json` (11) | tylko do kontroli (dubluje `obiekty/`), nie importować |
| `strony-zrzut/Noclegowe.json` | sekcje dodatkowe strony pensjonatów → `dane/noclegowe.ts`; część wspólna z `obiekty/pens.json` |
| `strony-zrzut/<Usługa>.json` (10: Monitoring, Alarmy, Dostep, Sieci, Teletechnika, Anteny, SmartHome, Naglosnienie, Multimedia, Ladowarki) | `hero`, `anc`, `pkgs`, `cena`, `faq`, `rel`, `segRel`, `sx`, `ctaEye/ctaH/ctaP` → `InstServices`; **pozostałe klucze** (np. Monitoring: `nv, feats, typ, dori, rec, rodo, brandsM, brD`; Ładowarki: `sh, prods, extras, cf, kTips, devt, form, ev`) → `dane/<strona>.ts` |
| `strony-zrzut/Main.json` | `us`/`u` (kafle usług) → `InstServices.kafel`; `rl` → `Realizations` (wersje robocze, §2); reszta (`gory`, `steps`, `srv`, `objs`, `faq`, `kz`, `brands`) → `dane/glowna.ts`; teksty hero strony głównej są w szablonie `zrodlo/pages/Main.body.html` (sekcja `#start`), scena SVG w kodzie |
| `oferta-76.json` | `InstSolutions` |
| `strony-zrzut/Oferta.json` | teksty strony (nagłówki, „Zawsze w cenie”) → `dane/oferta.ts`; listy nie importować |
| `strony-zrzut/Realizacje.json` | `Realizations` (wersje robocze, bez zgody) + filtry → `dane/realizacje.ts` |
| `strony-zrzut/PoradnikRodo.json`, `Poradnik.json` | wpis w kolekcji wpisów (tenant `instalacje`) + quiz jako blok; lista kategorii → `dane/poradnik.ts` |
| `strony-zrzut/Zaplanuj.json`, `Kontakt.json`, `Serwis.json`, `OFirmie.json` | `dane/<strona>.ts` (kroki kreatora, tematy, objawy, treści stron); dane kontaktowe zawsze z ustawień, nie z pliku |

- Pliki `dane/*.ts` są wygenerowane raz, typowane i commitowane; dalsze poprawki tylko w nich (seed zostaje historią).
- Pomijać klucze UI (`cls`, `on`, `pick`, `go`, `tch`, `cur`, `exp`) i stany widżetów — to stan prototypu, nie treść.
- **Klucz `src` nie zawsze znaczy „źródło”:** źródła-przypisy są już usunięte z seeda. Pozostałe `src` to dane: ścieżki zdjęć ładowarek (`Ladowarki: sh.items[].src, prods[].src, cf.src` → mapuj przez `adresy.json → zdjecia` na `/instalacje/ev/*.webp`), źródła dźwięku w widżecie (`Naglosnienie: ap.c.src, mx.src, chn.src`), teksty (`Alarmy: dm.src`, `Monitoring: feats[].src`). Importować normalnie.
- Adresy `X.dc.html` mapować przez `adresy.json → dc` (fragment `#…` zostaje).

### 6. Adresy w danych
W seedzie linki są w formie `Monitoring.dc.html`, `SegDom.dc.html`, `Zaplanuj.dc.html#obiekt=…`. Import zamienia je na adresy publiczne (mapa w `seed/prokominstalacje/adresy.json`).

## Konsekwencje
- (+) Szef zmienia to, co zmienia się często (kontakt, FAQ, ceny, zestawy, SEO); logika zostaje w kodzie, testowalna.
- (+) Strony obiektów w 100% z panelu — nowy obiekt = nowy dokument + SVG.
- (−) Teksty widżetów zmienia programista (świadomie, etap 2).

## Poprawki I0 (Krystian, 28.10.2026 — sprawdzone na develop 33f6e9b)
Obowiązują zamiast sprzecznych fragmentów wersji z 27.10.
1. **`/wyslane` = trasa linii** `(instalacje)/wyslane` (noindex, poza sitemap), nie `Pages` + `InstSent` → **10 bloków**.
2. **Poradnik pod `/poradnik/<slug>`** — adres wpisu zależny od linii we wspólnym `src/lib/posts/list.ts` + kategorie Instalacji w `POST_CATEGORIES` (I12, PR wsp).
3. **Zapytania bez nowych kolumn** — mapa pól z §4 na istniejący kontrakt; bez `meta`; bez plików w wersji 1; zmiany w `lib/inquiry` w I11, po SW7.
4. **Kontakt:** `SiteSettings.phone`/`email` + `CompanyData.locations`; WhatsApp w `InstalacjeSettings.whatsapp`.
5. **Ramka po `tenant.line`**, bez grupy `SiteSettings.instalacje`.
6. **`Industries` bez zmian.**

## Mapa pól (I2, 28.10.2026 — PR `inst/wsp-rejestracja`)
Nazwy z §2–§3 → pola w kodzie (`src/collections/Inst*.ts`, `Realizations.ts`, `InstalacjeSettings.ts`; wspólne kawałki w `instalacjeFields.ts`, słowniki w `src/lib/instalacje/options.ts`). Slugi kolekcji: `instalacje-settings`, `inst-services`, `inst-objects`, `inst-solutions`, `realizations`. Klucz seeda w nawiasie.

**Wspólne**
| ADR | Pole | Uwagi |
|---|---|---|
| `klucz` | `key` (select) | ustawiany raz — `access.update: false` (kreator i zapytania na nim stoją) |
| `nazwa`, `grupa`, `ikona`, `kolor`, `podpisMenu` | `name`, `group`, `icon`, `color`, `menuCaption` | `group` = wartości angielskie (`security`, `networks`, `comfort`; obiekty: `homes`, `business`, `institutions`, `construction`), etykiety po polsku; `icon` bez prefiksu `ikona:`; `color` `#rrggbb` (dane, jak gradienty katalogu) |
| `hero {eyebrow, h1a, h1b, lead, kv[], tagi[], cta}` | `hero {crumb, eyebrow, h1a, h1b, lead, facts[] {value, label}, tags[], cta {text, href}}` | `kv` ma w seedzie dwa kształty (obiekty: pary `[w, o]`, usługi: `{b, s}`) → jeden `facts`; `tags` usług (`{n}`) → tekst |
| `kotwice[] {id, nazwa}` | `anchors[] {anchorId, name}` | walidacja id względem komponentu — gdy powstaną komponenty (I4+) |
| `zestawy[] {ikona, nazwa, opis, elementy[], cena, wyrozniony}` | `packages[] {name, icon, description, items[], price, badge, featured}` | `badge` dochodzi (jest w seedzie usług) |
| `faq[] {pytanie, odpowiedz}` | `faq[] {question, answer}` | **zwykły tekst** (`faqArray` repo, jak Biznes/Software), nie richText — seed ma sam tekst |
| `cta {eyebrow, h, p}` | `cta {eyebrow, heading, text}` | |
| `seo` | `seo {title, description}` (`seoGroup` repo) | **bez obrazu OG** — jak inne kolekcje repo; OG w I13, jeśli potrzebny |
| wersje | `versions.drafts` | `InstServices`, `InstObjects`, `InstSolutions`, `Realizations` |

**`InstServices`** — `kafel {opis, elementy[], wyroznienia[], cenaOd}` → `tile {description, parts, highlights[], items[], priceFrom, wide}` (`parts`, `wide` z `Main.u`: `parts`, `big`); `zestawyNaglowek` → `packagesIntro {eyebrow, heading, text, note}`; `cena[]` → `priceFactors[] {title, icon, description}`; `cenaNaglowek` → `priceIntro {eyebrow, heading, text, button}`; `powiazaneUslugi`, `podobneObiekty`, `powiazaneNaglowek` → `relatedServices`, `similarObjects`, `relatedHeading`; dochodzą `faqHeading` (`sx.faqH`) i `faqAside {title, text, button, href}` (`sx.faqA`). **Obszar oferty** (`oferta-76.json → obszary[]`: `rodzina`, `opis`, `marki`) → `offer {family, description, brands[]}` — jeden obszar = jedna usługa, więc bez osobnej kolekcji; `family`: `security`, `connectivity`, `comfort`, `emobility`.

**`InstObjects`** — `dla` → `forWhom`; `tytulSceny` → `sceneTitle`; `punkty[]` → `hotspots[] {description}`; `pr` → `problemsIntro {eyebrow, heading, headingAccent, text}`; `problemy[] (q, d, fix, s, ic)` → `problems[] {quote, description, fix, service, icon}`; `doba` → `dayIntro` + `day[] {time, name, description, services[], icon}`; `przepisy` → `lawIntro` + `law[] {who, article, title, description}`; `gory` → `mountainsIntro` + `mountains[] {title, icon, description}`; `realizacje (realH, real)` → `realizationsHeading` + `realizations[] {title, place, description}`; `przygotuj {eyebrow, lead, pozycje[]}` → `prepareIntro {eyebrow, heading, text}` + `prepare[]`; `pkgH` → `packagesHeading`; `faqH` → `faqHeading`; `powiazane[]` (klucze usług) → `relatedServices` (relacja); `zwijaneNaTelefonie[]` (`"problemy:900"`) → `foldOnPhone[] {anchorId, maxHeight}`.

**`InstSolutions`** — `nazwa`, `opis`, `usluga`, `kategorie[]`, `kolejnosc` → `name`, `description`, `service` (relacja), `categories[]`, `order`; dochodzi `legacyId` (pozycja w paczce, klucz importu — jak `Solutions` Software).

**`Realizations`** — `tytul` → `title`; `obiekt` + `miejscowosc` → jedno **`place`** (seed ma je razem: `m` „Rabka-Zdrój · sala konferencyjna”); `rok` → `year`; `uslugi[]` → `services[]` (klucze); `opis` → `description` (`ph`); `zdjecia[]` → `photos[]`; `zgodaKlienta` → `clientConsent`; `wyrozniona` → `featured`; dochodzą `category` (`k`, „Audio, projekcja, IT”), `scope` (`z`) i `legacyId`. Hook: publikacja (także pozostawienie opublikowanej) bez `clientConsent` → 400; status i zgoda brane z zapisanego dokumentu, gdy zapis ich nie wysyła.

**`InstalacjeSettings`** — `pokazCeny` → `showPrices`; `komunikatBezCen` → `noPriceText`; `gwarancjaMies` → `warrantyMonths`; `tekstOdpowiedzi` → `responseText`; `whatsapp` → `whatsapp`. **`liczbaRozwiazan` pominięte** — liczone z `InstSolutions` przy renderowaniu, nie przechowywane.

**Import (I2, PR `inst/i2-model`, 28.10.2026)** — rozstrzygnięcia Krystiana, obowiązują zamiast sprzecznych fragmentów §2, §3 i §5:
- **SEO usług → `Pages.seo`** strony usługi (`_title`/`_description` ze `strony-zrzut/<Usługa>.json`, bez dopisku „| PRO-KOM…”, bo nazwę dopisuje szablon tytułu). Metadane strony repo czyta z `Pages`, więc `InstServices.seo` zostaje puste — do usunięcia albo ukrycia w I4. SEO obiektów → `InstObjects.seo` (trasa `/dla-kogo/…` nie ma dokumentu `Pages`).
- **Kontakt linii nie z seeda:** telefon i e-mail Instalacji wpisuje szef w panelu (`SiteSettings` tenanta, dziś przykładowe wartości z `pnpm seed`), WhatsApp — `InstalacjeSettings.whatsapp`. Placeholdery `[TELEFON]`/`[E-MAIL]` z `wspolne.json → K` nie trafiają do bazy (e-mail nie przeszedłby walidacji). `CompanyData.locations` bez zmian (decyzja w I11).
- **Realizacje z `Realizacje.json`** (11, źródło prawdy); `Main.rl` tylko wskazuje, ile pierwszych jest wyróżnionych (`featured`) — to te same firmy pod krótszymi nazwami.
- **Karty „Powiązane” bez klucza usługi** (Monitoring, Alarmy → Serwis; Nagłośnienie → Realizacje) nie mieszczą się w relacji `relatedServices` — pominięte w imporcie, rozwiązanie w I4 (stała karta w komponencie albo pole linków).
- **Ceny:** tekst bez cyfry i bez `[CENA]` (np. „Cena po wizji lokalnej”) to nie cena — pole zostaje puste, stronę obsługuje `InstalacjeSettings.noPriceText`.
- **Strony `Pages`:** brakujące jako puste wersje robocze z tytułem i SEO; istniejących import nie rusza — `home` i `kontakt` to strony przykładowe z `pnpm seed`, na których stoi test izolacji tenantów (tytuł = nazwa strony). Ich SEO z paczki (`Main.json`, `Kontakt.json`) ustawiają sesje, które je budują (I6, I11). Strony prawne w I13.

**Pliki danych w kodzie (I2, PR `inst/i2-dane`, 28.10.2026)** — zastępuje „wygenerowane raz w I2” z §1 i §5:
- Zrzuty `strony-zrzut/*.json` to **stan jednego ekranu** prototypu: widżet ma pełny tekst tylko dla zaznaczonej zakładki/opcji (np. Monitoring → typ kamery: opis tylko „Kopułkowej”, reszta w `zrodlo/pages/Monitoring.js`), do tego klasy i stan UI. Pliki wygenerowane z nich byłyby niepełne.
- Dlatego w I2 tylko **`dane/nawigacja.ts`** (układ menu, dolny pasek, „Więcej”, CTA; nazwy, ikony i kolory usług i obiektów z panelu po kluczu) + wspólny pomocnik `cleanPrototype` (`src/seed/instalacje/dane.ts`: bez kluczy UI i `[svg-path]`, linki przez `adresy.json`, zdjęcia EV, bez `ikona:`) i typy w `src/sites/instalacje/dane/types.ts`.
- **Każda sesja strony (I4–I12) pisze swój `dane/<strona>.ts`** z pełnego źródła `zrodlo/pages/<Strona>.js` (+ zrzut tam, gdzie jest kompletny), od razu z typami i czytelnymi nazwami pól pod swoje komponenty; dane czyści `cleanPrototype`. Plik po powstaniu edytuje się ręcznie (seed zostaje historią). Nazwy plików jak w §5 (`glowna`, `noclegowe`, `oferta`, `realizacje`, `poradnik`, `wyslane`, `<slug usługi>`, `zaplanuj`, `kontakt`, `serwis`, `o-firmie`).
