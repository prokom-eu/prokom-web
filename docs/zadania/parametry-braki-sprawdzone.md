# Parametry sprawdzone u producenta, ale niepodane (PRODUKCJA-BIZNES-1211 §1)

Uzupełnia listę `parametry-braki.md` (generowaną): każde pole, które tam zostało, ma tu wiersz z powodem. Stan na 13.11.2026: strony i karty katalogowe PDF producentów przeczytane ponownie dla wszystkich 150 kart z brakami; 218 pól dopisanych do paczki ze źródłem (nowe adresy w `zrodla` karty). Zostały pola, których producent nie podaje, oraz pola **nie dotyczy** (pole kategorii nie pasuje do urządzenia — np. skaner bez druku, kamera bez ekranu, kafel usługi). Nie zgadujemy: wartość dopisujemy dopiero, gdy pojawi się w źródle.

| Karta | Brak | Gdzie szukano / powód |
|---|---|---|
| `apple-imac-24-m4` | Obudowa i wymiary | Rozbieżność generacji: strona specyfikacji iMaca dotyczy M6 (54,7 × 46,1 cm, 4,42–4,44 kg) — dla M4 brak aktualnej strony; nie wpisuję. |
| `apple-imac-24-m4` | Procesor | Rozbieżność generacji: apple.com/pl/imac/specs/ (13.11.2026) opisuje iMaca z chipem M6 (10 lub 12 rdzeni CPU/GPU), nie M4 — nie wpisuję wartości; kartę trzeba przenieść na iMac M6. |
| `apple-imac-24-m4` | System | Rozbieżność generacji: strona specyfikacji iMaca dotyczy M6, nie M4 (system: macOS — prawdziwe dla każdej generacji, ale wg zasady nie wpisuję z rozbieżnej strony; do decyzji przy aktualizacji karty). |
| `apple-imac-24-m4` | Zasilacz | Rozbieżność generacji: strona specyfikacji iMaca dotyczy M6 (tam zasilacz 143 W) — wartości dla M4 nie ma na aktualnej stronie; nie wpisuję. |
| `apple-macbook-pro-m5` | Procesor | Rozbieżność generacji: apple.com/pl/macbook-pro/specs/ (13.11.2026) pokazuje 14" z chipem M6 (12 CPU / 12 GPU), M5 Pro i M5 Max, a 16" z M5 Pro i M5 Max. Podstawowego M5 (10 CPU / 10 GPU), który wymienia karta, nie ma już w ofercie — nie wpisuję wartości; kartę trzeba zaktualizować (M6 zamiast M5) albo ograniczyć do M5 Pro / M5 Max. |
| `apple-studio-display` | Matryca | apple.com/pl/studio-display/specs/ podaje tylko „Wyświetlacz Retina 5K” — bez typu matrycy (IPS / LCD / mini-LED); nie zgaduję. |
| `avtek-ops` | Przekątna | nie dotyczy: komputer OPS bez ekranu, wsuwany do slotu monitora interaktywnego |
| `brother-ads-1300-ads-1800w` | Druk dwustronny | nie dotyczy: skaner dokumentów, bez funkcji druku |
| `brother-ads-1300-ads-1800w` | Obciążenie miesięczne | karta produktu ADS-1300 (brother.eu PDF PL) ma tylko przypis o maks. liczbie stron bez wartości; specyfikacja w podręczniku support.brother.com nie podaje cyklu; karty PL ADS-1800W nie znaleziono na brother.eu (404), brothersklep.pl/brother.co.uk 403 |
| `brother-ads-4700w-ads-4300n` | Druk dwustronny | nie dotyczy: skaner dokumentów, bez funkcji druku (skanowanie dwustronne już w parametrze prędkości) |
| `brother-ads-4700w-ads-4300n` | Pamięć | karty produktu ADS-4700W i ADS-4300N (brother.eu, PDF PL) nie podają pamięci urządzenia; store.brother.pl zwraca 403 |
| `dell-stacje-dokujace` | Dysk | nie dotyczy: stacja dokująca nie ma dysku |
| `dell-stacje-dokujace` | Pamięć RAM | nie dotyczy: stacja dokująca nie ma pamięci RAM |
| `dell-stacje-dokujace` | Procesor | nie dotyczy: stacja dokująca nie ma procesora |
| `dell-stacje-dokujace` | System | nie dotyczy: stacja dokująca nie ma systemu operacyjnego (działa z laptopem przez USB-C / Thunderbolt) |
| `dell-wideokonferencje` | Przekątna | nie dotyczy: kamery internetowe i zestaw głośnomówiący bez ekranu |
| `elzab-czytnik-kodow-bs80-2d-usb-kit-z-podstawka` | Waga | strona elzab.com.pl (dane techniczne) oraz instrukcje BS80 (Instruction Manual Rev.1.0, User Manual Rev.1.4) nie podają wagi |
| `elzab-kw3` | Montaż | nie dotyczy: oprogramowanie instalowane w urządzeniu z Linux ARM — montaż zależy od myjni / automatu (elzab.com.pl, strona KW3) |
| `elzab-kw3` | Wymiary | nie dotyczy: kasa wirtualna (oprogramowanie), bez własnej obudowy (elzab.com.pl, strona KW3) |
| `elzab-kw3` | Zasilanie | nie dotyczy: KW3 to kasa w postaci oprogramowania na urządzenia z Linux ARM (np. terminal Newland U1000, sterownik myjni/automatu) — zasilanie zależy od urządzenia (elzab.com.pl, strona KW3) |
| `gopos-all-in-one` | Wymiary | ponownie 13.11: gopos.pl/sunmi-v3, /sunmi-v3-mix, /sunmi-d3-mini (także pełne dane techniczne w kodzie strony) — jest tylko waga (V3 419 g, V3 Mix 670 g, D3 Mini 1,1 kg); sunmi.com/en/v3-mix i /d3-mini — bez wymiarów, sunmi.com/en/v3 — 404 |
| `kyocera-ecosys-m8124cidn-m8130cidn` | Obciążenie miesięczne | karty katalogowe Kyocera DS_ECO_M8124cidn i DS_ECO_M8130cidn (PDF) oraz strony produktu .eu nie podają obciążenia miesięcznego |
| `kyocera-taskalfa-2320-2020` | Obciążenie miesięczne | karta katalogowa Kyocera DS_TASKalfa_2020_2320 i strona produktu .eu nie podają obciążenia miesięcznego |
| `kyocera-taskalfa-5004i-6004i` | Obciążenie miesięczne | karty katalogowe Kyocera DS_TASKalfa_5004i i DS_TASKalfa_6004i oraz strony produktu .eu nie podają obciążenia miesięcznego |
| `kyocera-taskalfa-ma3500ci-ma4500ci` | Obciążenie miesięczne | karty katalogowe Kyocera (KDE_TASKalfa_MA3500ci_0811, Datasheet_TASKalfa_MA4500ci) i strony produktu .eu/.pl nie podają zalecanego ani maksymalnego obciążenia |
| `logitech-meetup-2` | Przekątna | nie dotyczy: kamera / listwa wideokonferencyjna bez ekranu |
| `logitech-rally-bar-huddle` | Przekątna | nie dotyczy: listwa wideokonferencyjna bez ekranu (podłącza się do 1 zewnętrznego wyświetlacza) |
| `logitech-rally-bar-mini` | Przekątna | nie dotyczy: listwa wideokonferencyjna bez ekranu (do 2 zewnętrznych wyświetlaczy) |
| `optivendi-kluczomat` | Płatności | strona kluczomatu nie wymienia płatności (podawana wartość pochodzi ze strony innego boxomatu) — do potwierdzenia u Optivendi |
| `optivendi-sklep-samoobslugowy` | Zasilanie | strona sklepu nie podaje zasilania (są tylko ogólne zalecenia montażowe Optivendi) — do potwierdzenia u Optivendi |
| `posnet-bileterka-e-podroznik` | Wymiary | ponownie 13.11: posnet.com.pl/produkty/product/597 (strona bez plików PDF do pobrania) — jest tylko waga 390 g; strona producenta platformy PAX A920 Pro niedostępna (paxglobal.com.cn nie odpowiada) |
| `posnet-werion` | Wymiary | ponownie 13.11: posnet.com.pl/produkty/product/201 — brak wymiarów i brak karty PDF do pobrania; podana tylko przekątna 10,1" |
| `sato-metkownice-judo-kendo` | Interfejsy | nie dotyczy: metkownica ręczna bez zasilania i połączeń z komputerem (broszury SATO KENDO/JUDO) |
| `sato-metkownice-judo-kendo` | Rozdzielczość | nie dotyczy: metkownica ręczna drukuje czcionkami z pasków znaków wałkiem tuszującym, bez głowicy drukującej (broszury SATO KENDO/JUDO nie podają rozdzielczości) |
| `skaner` | Waga | karta Sunmi 2D Handheld Scanner NS020 (elzab.com.pl PDF i strona produktu) podaje tylko wymiary 160 × 95 × 71 mm, bez wagi; sunmi.com nie ma strony/karty tego modelu (wyszukiwanie bez wyniku) |
| `sunmi-blink-blink-2` | Waga | karty Sunmi Blink (NS010, sunmi CDN i elzab PDF) i Blink2 (NS012, Datasheet_Blink2_EN0917.pdf), strony sunmi.com/en/blink i /eu/blink2 oraz strony elzab.com.pl nie podają wagi |
| `tusze-tonery` | Druk dwustronny | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Format | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Obciążenie miesięczne | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Pamięć | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Panel | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Papier | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Prędkość druku | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Rozdzielczość | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Typ | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Waga | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Wymiary | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
| `tusze-tonery` | Łączność | nie dotyczy: kafel usługi dostaw materiałów, bez urządzenia |
