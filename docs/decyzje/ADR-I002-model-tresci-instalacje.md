# ADR-I002 — Model treści prokominstalacje.pl (Payload, tenant `instalacje`)

- Status: proponowany (przyjęcie w I0, wdrożenie w I2) · Data: 27.10.2026

## Kontekst
- 31 stron. Część jest szablonowa (12 stron „Dla kogo” z identyczną strukturą), część bardzo indywidualna (10 stron usług z własnymi kalkulatorami, symulatorami i scenami).
- Wszystkie teksty są już napisane i sprawdzone — leżą w `seed/prokominstalacje/` (zrzut danych z wizualizacji v4.0).
- Panel ma być prosty dla szefa i Krystiana: zmiana telefonu, FAQ, zestawu, ceny „od”, opisu SEO bez programisty. Nie musi edytować logiki kalkulatora.
- W repo istnieją kolekcje wspólne: `Pages` (strony z bloków, ADR-006), `Posts`, `Inquiries` (ADR-003), `SiteSettings`, `Tenants`, `Industries`, `Media`, `Redirects`, `Partners` oraz kolekcje linii (`BiznesSettings`, `Products`, `Catalog*`; `SoftwareSettings`, `Solutions`, `SolutionAreas`, `Cities`). Nie dublujemy wspólnych.
- **Jak repo buduje strony (ADR-006, ADR-010):** każda strona tenanta to dokument `Pages` (slug, publikacja, SEO, podgląd) z polem bloków; rejestr `src/blocks/registry.ts` mówi, które bloki wolno użyć w danej linii; bloki jednej linii leżą w `src/sites/<linia>/blocks/`. Strona główna = `Pages` ze slugiem `home`. Trasy, których nie da się zrobić z `Pages` (np. zagnieżdżone adresy), są w grupie tras linii `src/app/(sites)/[domain]/(<linia>)/` i ich adresy trafiają do `RESERVED_PAGE_SLUGS`.
- **Próg ADR-010:** ok. 30 bloków w panelu. Software rozwiązał to tak, że sekcje o stałej kolejności są komponentami wstawianymi **jednym blokiem**, a ich teksty leżą w `SoftwareSettings` (ADR-014, rozstrz. 7). Instalacje robią tak samo.

## Decyzja

### 0. Strony Instalacji w modelu repo
| Strona | Jak powstaje | Adres |
|---|---|---|
| Główna | `Pages` `home` + blok **`InstHome`** (cała strona: hero „Twój obiekt na żywo” i sekcje; teksty z `InstalacjeSettings`/`dane/glowna.ts`) | `/` |
| 10 usług | `Pages` o slugach `monitoring`, `alarmy`, `kontrola-dostepu`, `sieci-wifi`, `teletechnika`, `anteny`, `smart-home`, `naglosnienie`, `ekrany`, `ladowarki-ev` + blok **`InstService`** (pole `usluga` → dokument `InstServices`; komponent strony usługi z widżetami) | `/<slug>` |
| 12 obiektów | trasa linii **`(instalacje)/dla-kogo/[obiekt]`** (dane z `InstObjects`; `generateStaticParams`), `dla-kogo` do `RESERVED_PAGE_SLUGS` | `/dla-kogo/<slug>` |
| Pełna oferta (76) | `Pages` `uslugi` + blok **`InstOffer`** | **`/uslugi`** (`/oferta` jest zajęte przez trasę Biznesu) |
| Zaplanuj | `Pages` `zaplanuj` + blok **`InstPlanner`** | `/zaplanuj` |
| Po wysłaniu formularza | `Pages` `wyslane` + blok **`InstSent`** | **`/wyslane`** (`/dziekujemy` jest zajęte przez trasę Software) |
| Kontakt, Serwis, O firmie, Realizacje | `Pages` + bloki **`InstContact`**, **`InstServiceDesk`**, **`InstAbout`**, **`InstRealizations`** | `/kontakt`, `/serwis`, `/o-firmie`, `/realizacje` |
| Poradnik + wpisy | `Pages` `poradnik` + blok **`InstGuide`** (lista `Posts` tenanta); wpis: trasa linii **`(instalacje)/poradnik/[slug]`** (`poradnik` do `RESERVED_PAGE_SLUGS`) | `/poradnik`, `/poradnik/<slug>` |
| Prawne | `Pages` z blokiem `RichText` (wspólny) | `/polityka-prywatnosci`, `/cookies`, `/deklaracja-dostepnosci` |

Razem **11 bloków linii** (`InstHome`, `InstService`, `InstOffer`, `InstPlanner`, `InstSent`, `InstContact`, `InstServiceDesk`, `InstAbout`, `InstRealizations`, `InstGuide` + ewentualnie `InstCta`) — poniżej progu ADR-010. Bloki w `src/sites/instalacje/blocks/`, wpisy w rejestrze (strefa wspólna). Layout grupy `(instalacje)` jak `(software)/layout.tsx` (`requireLine(params, 'instalacje')`). Frame linii (`InstalacjeFrame`: nagłówek, stopka, dolny pasek, arkusz) wpięty w `[domain]/layout.tsx` obok `BiznesFrame` i `SoftwareFrame`.

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

### 3. Ustawienia linii
**`InstalacjeSettings`** (kolekcja z jednym dokumentem na tenant — wzór `BiznesSettings` / `SoftwareSettings`)
- `pokazCeny` (bool, domyślnie **false**), `komunikatBezCen` („Wycena po wizji lokalnej”), `liczbaRozwiazan` (wyliczana), `gwarancjaMies` (24), `tekstOdpowiedzi` („Do 24 h odpowiadamy na zgłoszenia w dni robocze…”) — teksty obietnic w jednym miejscu, żeby zmiana decyzji szefa była jedną edycją.

Dane kontaktowe (telefon, e-mail, WhatsApp, salony z adresami i godzinami) — **w istniejących ustawieniach firmy/tenanta**, nie w `InstalacjeSettings`. Placeholdery z `wspolne.json → K` wpisujemy do seeda, szef podmienia w panelu.

### 4. Kolekcje wspólne — rozszerzenia (PR wspólny w I2)
**Zapytania** (istniejąca kolekcja z ADR-003, adapter bez zmian kontraktu) — pola opcjonalne dla `tenant = instalacje`:
- pole źródła (nazwa pola z kontraktu ADR-003 — potwierdza I0; w dokumentach „źródło”) z wartościami: `inst-zaplanuj`, `inst-glowna`, `inst-kontakt`, `inst-serwis`, `inst-teletechnika-przedmiar`, `inst-usluga` (te same w spec §6 i promptach)
- `uslugi[]` (klucze usług), `obiekt` (klucz obiektu), `wielkosc`, `etap` (nowa budowa / remont / istniejący obiekt), `miejscowosc`, `odpowiedzi` (JSON z kreatora — pełny zapis wyborów), `konfiguracja` (JSON z konfiguratora ładowarki — patrz niżej), `pilnosc` (serwis), `pliki[]` (upload, limit 20 MB łącznie, typy: jpg, png, webp, heic, pdf, dwg, xlsx), `strona` (adres, z którego wysłano), `utm`.
- Jeśli kontrakt adaptera nie przewiduje dodatkowych pól — dodajemy je w `meta` (JSON), bez łamania kontraktu.
- **Konfiguracja ładowarki → kreator:** przycisk „Zapytaj o tę wersję” prowadzi do `/zaplanuj#obiekt=<…>&uslugi=ev&konf=<base64url(JSON)>` (JSON: `{model, punkty, mocNaPunkt, wyjscie, montaz, kolor}` — klucze jak stan `Ladowarki.js`: `cm, wp, wk, wo, wm, wc, hp, ho, cp, ck, co`, przeliczone na nazwy). Kreator dekoduje `konf`, pokazuje podsumowanie wybranej wersji w kroku „Szczegóły” i zapisuje je w `konfiguracja`; źródło zapytania = `inst-zaplanuj` (formularz wysyła się z kreatora). Prototyp przekazuje dziś tylko `#obiekt=&uslugi=` — `konf` dochodzi w kodzie (I9 + I11).

**`Posts`** (poradnik) — tenant `instalacje`, kategoria, autor, data aktualizacji; wpis RODO z quizem jako blok. Adres wpisu Instalacji `/poradnik/<slug>` (trasa linii), wspólne `/aktualnosci` zostaje dla innych linii.

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
