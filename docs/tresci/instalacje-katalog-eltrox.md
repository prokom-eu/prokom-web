# Katalog sprzętu prokominstalacje.pl — co bierzemy z Eltrox (i od kogo jeszcze), zakres v1, sposób pozyskania danych

Stan: 18.11.2026, przygotowane w czacie. Decyzja: ADR-029. Sesja danych: **INST-K0** (`docs/zadania/runda-1811.md` §4).

## 0. Fakty, na których stoimy
- **PRO-KOM jest partnerem Eltrox** i ma zgodę na używanie zdjęć, opisów i wszystkich potrzebnych materiałów (Krystian, 18.11.2026). Eltrox to sieć sklepów stacjonarnych w całej Polsce ze sklepem internetowym eltrox.pl, z ofertą zabezpieczeń, automatyki domowej i elektroniki (m.in. Dahua).
- **Vidis** — zgoda na materiały (meble akustyczne, Avtek Framewings) — Krystian 18.11.2026.
- **Neomounts, Edbak** — „mamy ich pełną ofertę” (szef, Asana 18.11). Zgoda na zdjęcia producentów: `TODO(krystian)` — potwierdzić, czy przez dystrybutora (zasady jak przy Biznesie: zdjęcia producenta ze źródłem w `zrodla`).
- **Beiks** (streaming: enkodery, kamery do transmisji) — dystrybutor, z którym współpracujemy (szef). Zgoda na materiały: `TODO(krystian)`.
- Marki montowane przez Instalacje (pamięć projektu + Krystian 18.11): **Dahua, Hikvision, BCS, Ubiquiti (UniFi), Satel, Ajax** „i inne” — pełną listę marek, które faktycznie montujemy, Krystian potwierdza w INST-K0 (sesja pokazuje mu listę marek z Eltrox do odhaczenia).

## 1. Zasady (bez wyjątków)
1. **Zero cen** i zero „dostępności/stanów” na stronie (jak Biznes). Ceny Eltrox nie trafiają ani do HTML, ani do seeda.
2. **Opisy po swojemu.** Zgoda partnera rozwiązuje prawo, ale **nie SEO**: tekst skopiowany z eltrox.pl to duplikat strony Eltrox w Google, a Google pokaże Eltrox, nie nas. Z Eltrox bierzemy: nazwę, kod producenta, EAN (wewnętrznie), parametry, zdjęcia, karty katalogowe PDF producenta. Opis (3 akapity jak w K4: co to jest i dla kogo → najważniejsze parametry prostym językiem → **co robi PRO-KOM**: dobór, montaż, konfiguracja aplikacji, serwis) piszemy sami. Parametry sprawdzamy u producenta (link w `zrodla`), tak jak w K3/K4.
3. **Tylko aktualne modele** (bez wycofanych u producenta, jak decyzje 25.10 w K3).
4. **Karty rodzin** zamiast dziesiątek prawie identycznych pozycji (reguła K3.1: jedna karta = jedna seria z wyborem wariantu, np. ogniskowa 2,8/4 mm, kolor obudowy).
5. **Zestawy z Eltrox** (np. „4 kamery + rejestrator + dysk”) — jako **gotowe zestawy** Instalacji (kolekcja `Bundles`, ta sama co Biznes), nie jako produkty.
6. Sprzęt sieciowy (switche, punkty dostępowe, routery) zostaje w Biznesie (ADR-029 pkt 8).
7. **KSC:** Hikvision i Dahua pokazujemy informacyjnie; w treściach dla gmin i instytucji bez rekomendowania tych marek, dopóki szef nie zdecyduje (`TODO(krystian)`).

## 2. Struktura katalogu Instalacji v1 (działy → kategorie → podkategorie)

| Dział | Kategoria (slug) | Podkategorie | Marki (kandydaci) | Kart v1 (cel) |
|---|---|---|---|---|
| **Monitoring** | Kamery IP (`kamery-ip`) | tubowe, kopułkowe, turret, obrotowe PTZ, Wi-Fi i na baterię | Dahua, Hikvision, BCS, UniFi Protect | 28 |
| | Kamery HD po koncentryku (`kamery-hd`) | 4w1 / HDCVI / TVI — modernizacje starych instalacji | Dahua, Hikvision, BCS | 8 |
| | Rejestratory (`rejestratory`) | NVR (IP), XVR (hybrydowe), UniFi NVR / UNVR | Dahua, Hikvision, BCS, Ubiquiti | 12 |
| | Akcesoria monitoringu (`akcesoria-cctv`) | uchwyty i puszki do kamer, dyski do rejestratorów (Surveillance), zasilanie PoE / zasilacze | Dahua, Hikvision, BCS, Western Digital / Seagate, Pulsar | 10 |
| **Alarmy** | Alarmy przewodowe (`alarmy-przewodowe`) | centrale, manipulatory, czujki, sygnalizatory, moduły GSM/LTE i ETHM | Satel | 14 |
| | Alarmy bezprzewodowe (`alarmy-bezprzewodowe`) | huby, czujki ruchu/otwarcia, czujki dymu i zalania, klawiatury, syreny, zestawy startowe | Ajax (+ Satel ABAX — jeśli montujemy) | 16 |
| **Dostęp i domofony** | Wideodomofony (`wideodomofony`) | stacje bramowe, monitory, zestawy, IP/2-przewodowe | Dahua, Hikvision, BCS (+ inne z Eltrox, np. marki domofonowe — Krystian potwierdza) | 8 |
| | Kontrola dostępu (`kontrola-dostepu`) | czytniki kart/kodów/odcisku, zamki i zwory, sterowniki | Dahua, Hikvision, Satel (+ Roger — jeśli montujemy) | 6 |
| **AV, mocowania i streaming** | Uchwyty i stojaki (`uchwyty`) | uchwyty TV i monitorów, sufitowe do projektorów, stojaki mobilne do monitorów interaktywnych, wózki | Neomounts, Edbak, Avtek | 14 |
| | Przesył obrazu i dźwięku (`przesyl-av`) | przedłużacze HDMI po skrętce, rozdzielacze i przełączniki HDMI, prezentacja bezprzewodowa | marki z oferty Eltrox/Beiks — Krystian potwierdza | 6 |
| | Transmisje i streaming (`streaming`) | enkodery wideo, kamery PTZ do transmisji, mikser/rejestrator wizji, zestawy „msza na żywo” | z oferty Beiks — Krystian potwierdza | 6 |
| **Razem v1** | | | | **≈ 128 kart + 10–12 zestawów** |

Uwagi:
- Ładowarki EV (Elzab EcoPower) mają już własną podstronę usługi — w katalogu tylko jako karty z linkiem do niej (3 karty: CC Home, CC Wall, CC City), jeśli Krystian chce je w `/oferta`. Nagłośnienie APART — etap 2.
- Liczby to cel, nie limit. Krystian chciał „jak najwięcej popularnych”: po v1 kolejne partie (np. +60 kart) w tym samym formacie.

## 3. Jak wybieramy „popularne” (INST-K0)
Bez zgadywania, w tej kolejności:
1. **Co montujemy najczęściej** — Krystian/szef zaznacza w arkuszu (`tmp/instalacje-k0/kandydaci.xlsx`) modele z ostatnich realizacji.
2. **Bestsellery / „polecane” w kategorii Eltrox** (sortowanie po popularności w sklepie partnera) — top 5–8 na podkategorię i markę.
3. **Aktualne serie producenta** (np. linie z AI/analityką, kolor w nocy) — weryfikacja na stronie producenta.
4. Odrzucamy: modele wycofane, pozycje bez zdjęć producenta, duplikaty różniące się tylko kolorem (→ wariant).

## 4. Skąd dane — kolejność źródeł
1. **Plik produktów od Eltrox (XML/CSV/API dla partnerów)** — najlepsze źródło: nazwy, kody, EAN, parametry i adresy zdjęć w jednym pliku, odświeżalne. Hurtownie zwykle udostępniają taki plik w panelu partnera (często w schemacie Ceneo albo IOF). → **Krystian pyta opiekuna Eltrox** (gotowa wiadomość w `docs/zadania/runda-1811.md` §8). Dopóki pliku nie ma, punkt 2.
2. **Strony produktów eltrox.pl** — sesja INST-K0 w Claude Code (dom, z siecią) czyta strony z listy kandydatów (adresy wklejone przez Krystiana albo z listy kategorii), **po zgodzie Krystiana na pobieranie w tej sesji**, z przerwą ≥ 2 s między żądaniami, bez obchodzenia zabezpieczeń, tylko pola z §1 pkt 2. Wynik zapisywany do `tmp/instalacje-k0/` (surowe dane, poza repo), potem przerabiany na seed.
3. **Strony producentów** — weryfikacja parametrów i karty PDF (dahuasecurity.com, hikvision.com, bcs.pl, ui.com, satel.pl, ajax.systems, neomounts.com, edbak.com, avtek.eu) — link w `zrodla` z datą.
4. **Vidis** (meble akustyczne — dla Biznesu, sesja BZ-R1 PR 4): kategorie wskazane przez szefa — parawany akustyczne (`https://www.vidis.pl/kategoria/meble-akustyczne/parawany-akustyczne/5496`), budki akustyczne (`https://www.vidis.pl/kategoria/meble-akustyczne/budki-akustyczne/5497`); Avtek Framewings (tablice suchościeralne do monitorów interaktywnych, Biznes): `https://www.vidis.pl/produkty/uchwyty/scienny-system-montazowy-avtek-framewings-75,1mv156`.
5. **Beiks** (streaming): `https://www.beiks.com.pl/content/406-streaming`, `https://www.beiks.com.pl/1318-rozwiazania-do-streamingu-enkodery`.
6. **Neomounts / Edbak:** `https://www.neomounts.com/` (strona angielska — **nie tłumaczymy jej 1:1**, piszemy po swojemu), `https://edbak.com/pl/`.

## 5. Format danych (= K4, żeby działał ten sam import)
Seed Instalacji: `seed/prokominstalacje/katalog/` (nowy folder, poza Prettierem jak inne seedy):
- `katalog-inst.json` — `{ wersja, sprawdzono, liczba, produkty: [...] }`, każda karta w polach K4: `slug_seed, status, dzial, kategoria, marka, rodzaj, nazwa, krotka, korzysc, opis[3], cechy[3], parametry[{k,v}] (10–14), warianty_opis, faq[≥3], konfigurator (warianty: ogniskowa, kolor, liczba kanałów…), polecane[], zestawy[], branze[], zrodla[{url, etykieta, data}], wyrozniki, w_skrocie_wzorzec, nowosc, wideo, zdjecia_premium`. Pola, których Instalacje nie potrzebują, puste — nie wymyślać nowych.
- `slowniki-inst.json` — działy, kategorie, podkategorie z §2 (te same klucze co `slowniki-k4.json`).
- `marki-inst.json` + `salony-inst.json` — marki z §0 (salony 2.0: działy → serie → produkty, „dla kogo” każdej serii, porównanie serii) — wzór: `salony-k4.json`.
- `zestawy-inst.json` — 10–12 gotowych zestawów (np. „Dom: 4 kamery IP + rejestrator”, „Pensjonat: kamery zewnętrzne + alarm Ajax”, „Sala/kościół: transmisja mszy”), elementy z rolą, „dlaczego taki zestaw”, status `do-potwierdzenia` dopóki Krystian nie sprawdzi zgodności.
- `media/` — zdjęcia: przezroczyste tło, kwadrat 1200 px, WebP (jak K3/K4), nazwy `<slug>-<n>.webp`; w `zrodla` adres oryginału.
- `przeglad-inst.xlsx` (tylko dla Krystiana, **nie do repo**) — arkusze: Kandydaci (zaznacz), Karty (status), Zdjęcia, Do decyzji.

Status kart: `gotowe` / `do-sprawdzenia` (noindex, poza sitemap — ADR-026) / `do-akceptacji-szefa`.

## 6. Odbiór INST-K0 (Krystian)
- Arkusz kandydatów zaznaczony; ≥ 110 kart `gotowe`; zero cen; zero zdań skopiowanych 1:1 z eltrox.pl (sesja sprawdza: najdłuższy wspólny fragment z opisem Eltrox < 12 słów); każde zdjęcie przejrzane; lista marek zatwierdzona.
