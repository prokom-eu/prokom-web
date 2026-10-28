# /dla-architektow — specyfikacja strony „Dla architektów i deweloperów”

Wersja 1.0 · 28.10.2026 · wzorzec: wizualizacja v4.2 (`docs/design/prokominstalacje/prototyp/dla-architektow.html`, sekcja `#architekci` w `prototyp/start.html`). Decyzje techniczne: ADR-I005. Źródła faktów: `prokominstalacje-architekci-zrodla.md`. Mapa sekcji i komponentów: `docs/design/prokominstalacje/ARCHITEKCI.md`.

> Kolejność ważności jak w całej linii: STAN → `prokominstalacje.md` (spec linii, §2 decyzje) → ta specyfikacja → ADR-I005 → `ARCHITEKCI.md` → prototyp → `zrodlo/`.

## 1. Cel i odbiorcy
**Cel biznesowy:** zgłoszenia projektów od architektów, projektantów wnętrz, deweloperów i generalnych wykonawców z Podhala i Małopolski (rzuty do konsultacji, prezentacje dla pracowni, inwestycje deweloperskie). Pośrednio: polecenia PRO-KOM inwestorom przez architektów.
**Miary:** liczba wysłanych formularzy „Wyślij rzuty”, prośby o prezentację, zgłoszenia „checklista PDF” i zapisy na nowości (Umami: wysłanie formularza, zmiana widoku przekroju, kliknięcie punktu, filtr rozwiązań), pozycje na frazy z §7.
**Odbiorcy:** architekt, projektant wnętrz, deweloper i inwestor apartamentów, generalny wykonawca.
**Ton:** konkretny, techniczny, bez marketingowych ogólników. Strona ma pokazać wiedzę PRO-KOM: liczby, etapy, przepisy. Motyw przewodni: „Technika, która nie psuje projektu. Zaplanujmy ją przed tynkami.” oraz „Zawsze pomożemy”.

## 2. Decyzje, których nie wolno zmienić w kodzie
1. Wszystko ze spec linii §2 (gwarancja 24 mies. na montaż, „24 h” = odpowiedź w dni robocze, brak pakietu odbiorowego, brak cen sprzętu, brak list źródeł na stronie, Ampio: głos tylko przez Matter).
2. **Brak obietnicy wyższej ceny lokalu dzięki smart home.** Zdanie w sekcji deweloperów („Nie obiecujemy…”) zostaje.
3. Liczby tylko z pliku źródeł. Nowa liczba = wpis w źródłach w tym samym PR.
4. Marki spoza oferty tylko z „np.”; pozycje z `[SZEF: dostępność]` jako wersje robocze w `InstArchNews`.
5. Przepisy z datą stanu i zdaniem „To nie jest porada prawna.”
6. Formularze v1 bez uploadu plików (ADR-I005 §3). Pole „Link do rzutów” zamiast pliku.
7. Zgoda na informacje handlowe przy nowościach e-mail: osobny checkbox, niezaznaczony.
8. Przekrój domu (hero) odtworzony 1:1 z `zrodlo/inc/arscene.html`: ten sam rysunek, 17 punktów w tych samych miejscach, 3 widoki, 10 warstw.

## 3. Adres, nawigacja, SEO podstawowe
- Adres `/dla-architektow` (`Pages`, blok `InstArchitects`). Okruszki: Start / Dla architektów.
- Nawigacja: ADR-I005 §4 (menu desktop z akcentem, mega „Dla kogo”, „Więcej” na telefonie, stopka, szyna na głównej).
- Tytuł: „Dla architektów: smart home, audio i teletechnika | PRO-KOM” (w `Pages.seo` bez „| PRO-KOM”, dopisuje szablon). Opis: z `strony-zrzut/Architekci.json`.
- H1: „Technika, która nie psuje projektu. Zaplanujmy ją przed tynkami.” z nadtytułem „Dla architektów, projektantów wnętrz, deweloperów i wykonawców”.

## 4. Sekcje (kolejność i `id` 1:1 — szczegóły w `ARCHITEKCI.md`)
| # | `id` | Sekcja | Zachowanie |
|---|---|---|---|
| 1 | `hero` | H1, lead, 2 przyciski (Wyślij rzuty → `#wyslij`, Umów prezentację → `#pokaz`), **przekrój domu** (ArchHouseScene), 4 liczby (od 2004, 10 instalacji, 17 punktów, 24 miesiące) | widoki: Gotowy dom / Przed tynkami / Wszystkie instalacje; warstwy 10 usług (wyłączanie przygasza kable i punkty); klik punktu = karta: nazwa, usługa, etap, „Klient widzi”, „W projekcie zaplanuj”, „Liczby do projektu”; strzałki poprz./nast. po widocznych punktach. Start: „Gotowy dom”, po 2,6 s „Wszystkie instalacje” i przełączanie punktów co 3,4 s do pierwszej interakcji. **Ograniczenie ruchu:** start od razu „Wszystkie instalacje”, punkt 1, bez autoodtwarzania. |
| — | nav `anchors` | kotwice sekcji (12) | przyklejony pod nagłówkiem |
| 2 | `dla-ciebie` | Kim jesteś: 4 role | zakładki (role) → panel: nagłówek, opis, 4 punkty, CTA do sekcji |
| 3 | `problemy` 📱 | 4 problemy z „U nas” + pasek BRAVAS 2024 (podpis „badanie w USA”) | statyczna |
| 4 | `etapy` | 6 etapów z osią postępu, „Najlepszy moment” przy 01–02 | zakładki + strzałki; panel: Co robimy / Co dostajesz Ty / Co zyskuje inwestor |
| 5 | `wymiana` | Od Ciebie / Od nas | statyczna; `[SZEF: co bezpłatnie przy montażu u nas]` |
| 6 | `checklista` 📱 | Checklista projektanta | wybór obiektu (5) i instalacji (9, wielokrotny) → lista pozycji w 3 etapach (projekt, przed tynkami, wykończenie), odhaczanie z paskiem postępu (stan tylko w przeglądarce), formularz „Checklista w PDF” (ADR-I005 §3) |
| 7 | `liczby` 📱 | Liczby do projektu, 14 kafli | statyczna; podpis „Stan na … Wartości orientacyjne…” |
| 8 | `instalacje` | 10 instalacji: lista + panel szczegółów | zakładki; panel: nagłówek, opis, „W projekcie zaplanuj”, „We wnętrzu”, marki, link do strony usługi, CTA `#wyslij` |
| 9 | `nowosci` | Nowe rozwiązania (kolekcja `InstArchNews`) | filtr kategorii z licznikami; lista kart (miniatura, kategoria, typ, tytuł, kluczowy parametr) + panel szczegółów (ilustracja, typ, pozycja „x / n”, opis, parametry, „W projekcie zaplanuj”, przykłady, „Gdzie się sprawdza”, CTA, strzałki); zapis „Nowe rozwiązania raz w miesiącu” |
| 10 | `deweloperzy` | ciemny blok: 3 liczby rynku, 5 obszarów (Lokale, Części wspólne, Garaż i parking, Apartamenty inwestycyjne, Odbiór i dokumentacja) | zakładki; „Dlaczego to ważne” z faktem; zdanie o braku obietnicy ceny; CTA |
| 11 | `przepisy` 📱 | oś czasu (6 dat, „teraz” = 20.09.2026) + 8 kart ze statusem (Obowiązuje / Okres przejściowy / Czeka na wdrożenie / W przygotowaniu / Czekamy) | statyczna; zdanie o poradzie prawnej i dacie stanu |
| 12 | `doswiadczenie` 📱 | 4 liczby, wybrane realizacje (8 z pro-kom.eu), marki | `[SZEF]` przy realizacjach i autoryzacjach |
| 13 | `biblioteka` 📱 | 4 własne materiały (status „Na e-mail” / „W przygotowaniu”) + 8 narzędzi producentów (linki zewnętrzne, `rel="noopener"`) | statyczna |
| 14 | `pokaz` | 3 formy prezentacji | CTA `#wyslij` (rola wybrana) |
| 15 | `zasady` 📱 | 6 zasad współpracy | `[SZEF]` przy warunkach |
| 16 | `opiekun` | zdjęcie, imię, rola, cytat „Zawsze pomożemy…”, telefon, e-mail, „Odpowiadamy do 24 h w dni robocze.” | dane z `InstalacjeSettings.architects` |
| 17 | `faq` 📱 | 10 pytań (pierwsze otwarte) + karta „Jedno pytanie do projektu?” | `FAQPage` JSON-LD |
| 18 | `wyslij` | formularz „Wyślij rzuty” | rola (5), etap (5), obiekt (6), imię, pracownia, telefon*, miejscowość, link do rzutów, wiadomość, zgoda; po wysłaniu podsumowanie wyboru i numer zgłoszenia; przekierowanie wg reguł I11 (`/wyslane` albo stan w miejscu — jak inne formularze linii) |

Strona **nie ma** pasa CTA nad stopką (`cta: false` w meta) — formularz jest ostatnią sekcją. 📱 = sekcja zwijana na telefonie (`zrodlo/fold.json` → `Architekci`).

## 5. Sekcja na stronie głównej
`#architekci` po `#uslugi`: nadtytuł „Dla architektów, projektantów i deweloperów”, H2 „Projektujesz dom albo inwestycję? Technikę zaplanujemy z Tobą.”, lead, 4 punkty, przyciski „Współpraca dla architektów →” i „Wyślij rzuty”, przekrój (kompakt) i karta „Nowość” z pierwszą wyróżnioną pozycją `InstArchNews`. Szyna sekcji: pozycja „Architekci”.

## 6. Telefon (MOBILE-APLIKACJA §10 + specyfika)
- Przekrój: przesuwany w poziomie (szerokość rysunku ok. 820 px), podpowiedź „Przesuń w bok, żeby zobaczyć cały dom →”, przełącznik widoków przyklejony, etykiety pomieszczeń ukryte, karta punktu pod rysunkiem, warstwy w przewijanym pasku.
- Zakładki (role, etapy, instalacje, deweloperzy, filtr rozwiązań) jako poziomo przewijane paski; lista rozwiązań jako karuzela, panel szczegółów nad nią.
- Sekcje zwijane wg `fold.json`. Wysokość strony w prototypie: desktop ok. 20 000 px, telefon ok. 25 000 px po zwinięciu.
- Stany wzorcowe: `stany-telefonu/21…25-architekci-*`.

## 7. SEO i widoczność w AI
- Frazy: „smart home dla architektów”, „współpraca z architektami instalacje”, „projekt instalacji niskoprądowych”, „przygotowanie instalacji pod smart home na etapie budowy”, „głośniki do zabudowy w suficie projekt”, „okablowanie strukturalne dom jednorodzinny”, „teletechnika dla dewelopera”, lokalnie: Zakopane, Nowy Targ, Podhale, Kraków. Konkurencja słaba, ruch niewielki: strona głównie zamienia wizyty z polecenia i LinkedIna w zgłoszenia, ruch z Google przyniosą wpisy Poradnika linkujące tutaj.
- JSON-LD: `Service` z `audience` (`BusinessAudience`: architekci, projektanci wnętrz, deweloperzy, wykonawcy), `provider` → `@id` firmy, `areaServed`; `FAQPage`; `BreadcrumbList`; `ItemList` nowych rozwiązań (nazwy). Bez `HowTo`.
- Linkowanie: z każdej strony usługi (sekcja „Powiązane”, I4) link „Projektujesz? Współpraca dla architektów →”; ze stron `/dla-kogo/deweloperzy` i `/dla-kogo/budowy` blok „Dla architektów i deweloperów”; z wpisów Poradnika o projektowaniu.
- Plan wpisów Poradnika (czat → `docs/tresci/`): „Co przewidzieć w projekcie domu: instalacje niskoprądowe”, „Głośniki w suficie: jak zaplanować na etapie projektu”, „Okablowanie strukturalne w domu jednorodzinnym”, „Warunki techniczne 2026–2028 a teletechnika”.

## 8. Dostępność
Zakładki jako `role="tablist"`/`tab`/`tabpanel` ze strzałkami klawiatury; punkty przekroju jako przyciski z `aria-label` (nazwa punktu), sterowanie Enter/spacją; SVG z `role="img"` i opisem; opis tekstowy przekroju dla czytników (lista 17 punktów w `details` albo `sr-only`); kontrast kolorów usług w jasnym motywie przyciemniony (jak w prototypie, `color-mix(… 60%, #000)`); formularze z etykietami i komunikatami błędów `role="alert"`.

## 9. Placeholdery `[SZEF]` (do `prokominstalacje-do-uzupelnienia.md`)
Opiekun (imię, zdjęcie, telefon, e-mail architekci@), dostępność marek (Sonance, Amina, KEF, B&W, ELAC, Molecule, Future Automation, Nuki), partner Sonos, warunki dla pracowni, bezpłatna konsultacja i co gratis przy montażu, pokaz w salonie, realizacje (lata, zgody, zdjęcia, 2–3 domy z projektem architekta), autoryzacje Ampio i Satel, kto prowadzi prezentacje, potwierdzenie danych Elzab.

## 10. Definition of Done (całość I16a–c)
- Zgodność z wzorcem 1440 i 390, oba motywy (`porownaj.mjs dla-architektow`), różnice opisane w PR.
- Wszystkie interakcje z §4 działają myszką, klawiaturą i dotykiem; ograniczenie ruchu respektowane.
- `InstArchNews` w panelu: dodanie karty przez panel pojawia się na stronie po publikacji (rewalidacja); hook blokuje publikację ze znacznikiem.
- Formularze zapisują się w `Inquiries` z kategoriami z ADR-I005 §3; maile jak inne formularze linii.
- Lighthouse telefon ≥ 90 (przekrój: SVG inline tylko w hero, reszta przy przewinięciu).
- Brak `[SZEF`/`[CENA` na produkcji (test e2e), liczby zgodne z plikiem źródeł.
