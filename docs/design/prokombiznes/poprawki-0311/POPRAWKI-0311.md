# prokombiznes.pl: GoPOS (scena i lokale), „O firmie” i kolorowe loga marek (03.11.2026)

Uwagi Krystiana z przeglądu strony 03.11 (zrzuty w czacie). Wzorzec: `docs/design/prokombiznes/poprawki-0311/sekcje.html` (prototyp, otwórz w przeglądarce). Zdjęcia: paczka `gopos-zdjecia.zip` → `seed/prokombiznes/k4/media/gopos-scena/`.

Zasady bez zmian (K4-FINAL §1, 01.11): bez zdjęć ludzi, zero cen, statusy tylko te dozwolone.

---

## A. Podstrona GoPOS, scena urządzeń w hero (`gopos/Stage.tsx`, `Hero.tsx`)

**Co dziś jest źle:**
1. Urządzenia stoją na białych kartach z **czarnymi, wyłączonymi ekranami**. To pierwsze zdjęcie galerii produktu, czyli packshot producenta, więc nie widać GoPOS.
2. Karty mają kolejność z danych (2 Kuchnia, 4 Kasa, 1 Sala, 3 Płatność), a nie kolejność drogi zamówienia.
3. Białe prostokąty na granacie wyglądają jak katalog, nie jak lokal.
4. Pola `pos`/`lab` w `strony-k4.json → gopos.hero.stage` (kompozycja) nie są używane.

**Jak ma być (prototyp, sekcja 1):**
- **Zdjęcia z włączonym ekranem GoPOS**, wycięte z tła (paczka). Osobne od galerii produktu:

  | Krok | Urządzenie | Plik |
  |---|---|---|
  | 1 Sala | Sunmi V3 MIX z GoPOS | `sala-v3mix.webp` |
  | 2 Kuchnia | ekran KDS z kolejką zamówień | `kuchnia-kds.webp` |
  | 3 Płatność | PolCard (Ingenico) | `platnosc-polcard.webp` |
  | 4 Kasa i raporty | Sunmi D3 PRO z GoPOS | `ekran-d3.webp` |

- **Kompozycja ≥ 721 px**: scena bez kart, urządzenia „stoją” na poświacie.
  - Rozmieszczenie (procent sceny o proporcjach 1,18):
    - Kasa z lewej u góry: left 2%, top 10%, 50 × 54%;
    - Kuchnia z prawej u góry: right 0, top 4%, 46 × 36%;
    - Sala z przodu w środku: left 46%, bottom 3%, 32 × 38%;
    - Płatność z przodu z prawej: right 2%, bottom 2%, 15 × 42%;
    - bilet zamówienia z lewej u dołu: left 0, bottom 2%, szer. min(300 px, 42%).
  - Pozycje zapisz w `stage[].pos` (dane już mają to pole) i nadpisz nowymi wartościami.
  - Na dole eliptyczna poświata (`radial-gradient` w kolorze `--c-biznes-on-dark`, 28% → 0). Na tle hero dwie miękkie poświaty: niebieska za sceną, zielona w lewym górnym rogu.
  - Zdjęcia z podwójnym `drop-shadow`: 0 22 26 / .45 i 0 4 6 / .3.
  - Etykieta kroku: szklana pigułka (granat 72%, `backdrop-filter: blur(10px)`, obwódka biała 14%) z numerem w kółku, przyczepiona do urządzenia.
- **Droga zamówienia gra sama:**
  - co 2,6 s podświetla się kolejne urządzenie (1 → 2 → 3 → 4): skala koloru 1, `translate -6px`, etykieta biała z granatowym numerem;
  - pozostałe przygaszone `saturate(.75) brightness(.72)`;
  - bilet przesuwa status (zrobione = bursztyn `--promo`, bieżący = zielony);
  - klik w urządzenie albo krok ustawia krok i liczy od nowa (store `useGopos` już to ma);
  - ten sam przycisk „Wstrzymaj animację” co przy kole (WCAG 2.2.2);
  - `prefers-reduced-motion`: statycznie na kroku 1.
- **Telefon ≤ 720 px**: siatka 2 × 2 w kolejności 1–4. Kafle szklane (biały 5% + obwódka 10% + poświata od dołu), bez białych kart. Zdjęcie na całą wysokość kafla, pigułka z numerem w lewym górnym rogu.

## B. Podstrona GoPOS, „GoPOS ustawiony pod to, jak pracujesz” (`gopos/Widgets.tsx`, venue)

**Co dziś jest źle:**
- Szare pole z małym, wyłączonym monitorem (D3 bez ekranu) i biletem, który zasłania pół urządzenia.
- Tak samo dla każdego lokalu (`segImg` = packshoty `d3`, `v3mix`, `kds`, `v3`).

**Jak ma być (prototyp, sekcja 2):**
- **Scena**:
  - proporcje 1,12, zaokrąglenie 22;
  - tło: miękka poświata w zieleni linii (`--ok` 20% → 0) + delikatna siatka kropek (`--ink` 9%, co 18 px) + pionowy gradient `surface-2` → `surface-3`;
  - cień eliptyczny pod urządzeniem;
  - urządzenie zajmuje górne 69% (inset 7% 8% 24%), bilet stoi w dolnym pasie (left/right 5%, bottom 5%) i **nie zasłania urządzenia**.
- **Zdjęcie per lokal** (`segImg` → pliki z paczki, wszystkie z włączonym GoPOS):

  | Lokal | Plik | Co widać |
  |---|---|---|
  | Restauracja | `zestaw-restauracja.webp` | kasa D3 + V3 MIX + terminal + drukarka |
  | Kawiarnia | `kasa-d3.webp` | D3 PRO z ekranem dla klienta |
  | Pizzeria i dowozy | `ekosystem.webp` | kiosk, aplikacja, kasa, KDS, panel online |
  | Food truck i sezon | `reczny-v3.webp` | GoPOS All in One (urządzenie ręczne) |
  | Restauracja hotelowa | `aio-stand.webp` | stanowisko z GoPOS i drukarką |

- **Zakładki lokali:** miniatura zdjęcia lokalu (40 px kafel) obok nazwy. Wybrana zakładka granatowa. Hover przesuwa o 3 px w prawo.
- **Zmiana lokalu:** zdjęcie (opacity + 10 px + skala .97, 0,45 s) i tekst panelu (opacity + 8 px) wymieniają się płynnie. Bilet przechodzi po statusach co 1,8 s.
- Na telefonie scena nad tekstem (`order: -1`).
- Tekst biletu na granacie jest biały. W dzisiejszym kodzie dziedziczy szary kolor akapitu.

**Dane:**
- Nowe pliki do Media z seeda, idempotentnie (wzorzec `k4-logo-*`, nazwy `k4-gopos-<plik>`).
- W `strony-k4.json → gopos` dwa nowe pola:
  - `stage[].img` (plik sceny);
  - `segImg` z nazwami plików zamiast slugów produktów.
- `k4Pages.ts` rozpoznaje plik (`*.webp`) albo slug (dla zgodności wstecz).
- Bez migracji, jeśli strona trzyma obrazy w istniejącym polu upload. Jeśli nie ma gdzie, dodaj pole **dodające** kolumnę.

## C. Strona główna, „O firmie” (`BzFacts/Component.tsx`, wariant bez cytatu właściciela)

**Co dziś jest źle:**
- Cytat jest ukryty (audyt 01.11), więc zostały 4 szare kafle z liczbami, małe loga i link.
- Duża pusta przestrzeń nad sekcją (padding poprzedniej sekcji + `py-24` + brak nagłówka).
- Dwie liczby „2 autoryzowane serwisy kas” i „2 autoryzowane partnerstwa” powtarzają to, co mówią loga, i wyglądają jak wypełniacz.

**Jak ma być (prototyp, sekcja 3), gdy `showOwnerQuote` = false:**
- Jedna karta `surface-2`, zaokrąglenie 28, padding clamp(24, 4vw, 48), dwie kolumny (≤ 980 px jedna):
  - **lewa:**
    - widoczny H2: „Od 2004 roku *przy kasach i komputerach firm* z Podhala” (wyróżnienie w `accent`);
    - lead: „Sprzedajemy, wdrażamy i serwisujemy w Rabce-Zdroju. Uprawnienia producentów widzisz obok — to one pozwalają nam serwisować kasy i wdrażać programy.”;
    - link „Poznaj PRO-KOM i pozostałe linie firmy” ze strzałką w granatowym kółku, które przesuwa się o 4 px po najechaniu.
  - **prawa:**
    - 2 duże liczby na białych kartach (`2004` · rok założenia firmy; `100+` · klientów firmowych; liczby 34–46 px Archivo 112%, CountUp bez zmian);
    - pod nimi 4 kafle autoryzacji: kolorowe logo na białej płytce i status z zielonym znaczkiem ✓: Posnet i Elzab „Autoryzowany serwis”, InsERT i GoPOS „Autoryzowany partner”. Hover: −3 px i cień.
- Status bierz z `Partners` (pole statusu z paczki K4). Liczby z bloku. Teksty H2 i leadu do pól bloku (seed), nie na sztywno.
- Odstęp sekcji `py-12 sm:py-16`. Sprawdź na zrzucie, że nad sekcją nie ma pustego pasa ponad ~96 px (1440).
- Wariant z cytatem (`showOwnerQuote` = true) bez zmian.
- Z bloku wypadają stats 3 i 4. Seed je usuwa (zapis przy różnicy).

## D. Marki: loga kolorowe zawsze (`src/styles/motion.css`, `BrandsHome.tsx`, `/marki`)

**Co dziś jest źle:** reguła z promptu animacji (`[data-logo-tint] img { filter: grayscale(1); opacity: .75 }`, kolor dopiero po najechaniu) robi z siatki marek szary katalog. Krystian chce kolorowe.

**Jak ma być:**
- **Usuń szarość.** Loga zawsze w kolorach producenta, `opacity: 1`.
- Zamiast tego delikatny, nowoczesny ruch (tylko mysz, nie przy reduced motion):
  - najechanie na kartę: karta −3 px i cień (jest), logo skala 1,04 (`--dur-hover`, `--ease-out`);
  - po płytce logo raz przechodzi **błysk światła**: pseudo-element `::after` z ukośnym gradientem biały 0 → 55% → 0, szer. 40%, `translate` −120% → 220%, 0,7 s, tylko przy wejściu kursora.
- **Wejście siatki przy przewinięciu:** loga pojawiają się kaskadą (opacity + 8 px, odstęp 40 ms). To istniejący mechanizm `data-revealed` z `motion.css`, nie nowy kod JS.
- To samo na `/marki`, w „O firmie” i wszędzie, gdzie jest `data-logo-tint`. Atrybut możesz zostawić pod błysk albo przemianować na `data-logo-shine`.

---

## Testy
- e2e `biznes-gopos`:
  - 4 urządzenia sceny mają zdjęcia z nowej paczki (src zawiera `k4-gopos-`);
  - kolejność kafli na 390 px = 1, 2, 3, 4;
  - po 3 s inny krok jest aktywny; po „Wstrzymaj” nie;
  - każda z 5 zakładek lokalu zmienia zdjęcie;
  - bilet sceny nie przecina prostokąta zdjęcia urządzenia (≥ 8 px).
- e2e `biznes-home`:
  - sekcja „O firmie” ma widoczny H2;
  - 2 liczby i 4 autoryzacje ze statusem;
  - logo w siatce marek bez `filter` (computed `filter` = `none`) przed najechaniem.
- Zrzuty 1440 i 390, jasny i ciemny, obok prototypu w opisie PR.
