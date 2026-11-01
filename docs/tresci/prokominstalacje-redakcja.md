# prokominstalacje.pl — redakcja tekstów (01.11.2026)

Zakres: nagłówki (H1, H2, nadtytuły) wszystkich 32 stron oraz zdania z najczęstszymi schematami „jak z AI”: „X, a nie Y”, antyteza w dwóch zdaniach, powtarzany nagłówek, frazesy. Uzasadnienie i liczby: `docs/audyty/prokominstalacje-audyt-przed-stagingiem.md` §7.

**Zasada:** zmieniamy tylko to, co jest w tabelach. Teksty, których tu nie ma, zostają, bo są dobre. Żadnych nowych obietnic, liczb ani marek. Fakty bez zmian.

Kolumna **„Jest”** to dokładny tekst do wyszukania (`grep -rn` po `src/` i `seed/prokominstalacje/`). Jeśli tekst jest w Payload (H1 i SEO stron z `strony-zrzut`, `wspolne.json`, `InstServices`, `InstObjects`), zmień go w źródle seeda i sprawdź po `pnpm seed:instalacje`, że lokalnie widać nową wersję. Na stagingu te same pola poprawia się w panelu według tej listy.

## 1. H1 stron

H1 na stronach usług i obiektów to „nadtytuł: tytuł”. Zmieniamy tylko wskazaną część.

| Strona | Część | Jest | Ma być |
|---|---|---|---|
| `/kontrola-dostepu` | tytuł | Gość wchodzi sam o 23:00. Ty śpisz spokojnie. | Kod, karta albo telefon zamiast klucza pod wycieraczką. |
| `/dla-kogo/apartamenty` | tytuł, druga część (`apt.json` → `h1b`) | Ty widzisz, że dotarł, i śpisz spokojnie. | A Ty dostajesz powiadomienie, że dotarł. |
| `/dla-kogo/pensjonaty` | tytuł | Pensjonat, który działa sam, gdy Ty śpisz albo jesteś na stoku. | Gość wchodzi kodem, Wi-Fi działa w każdym pokoju, a Ty możesz być na stoku. |
| `/dla-kogo/restauracje` | tytuł | Muzyka tam, gdzie trzeba. Kasa i Wi-Fi mają zapas także w sobotę o 21:00. | Sobota, 21:00, pełna sala. Muzyka gra, terminal przyjmuje karty, Wi-Fi nie zwalnia. |
| `/naglosnienie` | tytuł | Muzyka tam, gdzie trzeba. Cisza tam, gdzie ma być cicho. | Muzyka na sali, komunikat w holu, cisza na zapleczu. Każda strefa osobno. |
| `/ekrany` | tytuł | Ekrany, które mówią za Ciebie. Menu, pogoda, oferta. | Menu, promocja i pogoda na jednym ekranie w witrynie. |
| `/dla-kogo/budowy` | tytuł | Plac pilnuje się sam, zanim powstanie przyłącze prądu. | Kamery na maszcie z własnym zasilaniem. Plac jest pod okiem, zanim powstanie przyłącze. |
| `/teletechnika` | nadtytuł | Teletechnika · dla deweloperów i wykonawców · Małopolska | Dla deweloperów i wykonawców · Małopolska |
| `/ladowarki-ev` | nadtytuł | Elzab EcoPower · dom, firma, parking · Podhale | Ładowarki do aut elektrycznych · dom, firma, parking · Podhale |
| `/dla-architektow` | H1 (`formPages.ts` / blok) | Dla architektów, projektantów wnętrz, deweloperów i wykonawców: Technika, która nie psuje projektu. Zaplanujmy ją przed tynkami. | H1: „Technika, która nie psuje projektu. Zaplanujmy ją przed tynkami.” Grupa odbiorców zostaje jako nadtytuł nad H1, jako `<p>` poza H1. Fraza „dla architektów” jest w title i w nadtytule. |
| `/realizacje` | H1 | Wybrane realizacje PRO-KOM. | Realizacje: nagłośnienie, multimedia i sieci od Krakowa po Zakopane. |

**Zostają bez zmian:** `/`, `/monitoring`, `/alarmy`, `/sieci-wifi`, `/anteny`, `/smart-home`, `/serwis` i pozostałe strony obiektów. Są konkretne i każda ma inną scenę.

## 2. H2 i nadtytuły sekcji

| Strona · sekcja | Jest | Ma być |
|---|---|---|
| `/monitoring` · `#co-dostajesz` (też `glownaSekcje.ts`, jeśli tam jest) | Kamery, które widzą to, co trzeba. I nie widzą tego, czego nie wolno. | Twarz przy furtce, tablica przy bramie. Bez podglądania sąsiada. |
| `/monitoring` · `#system` | Monitoring to cały system. Zobacz, co wchodzi w skład. | Kamery, rejestrator, dyski, zasilanie i aplikacja. Zobacz cały system. |
| `/monitoring` · `#nagrania` | Dysk dobieramy do liczby kamer. I do przepisów. | Ile dni nagrań zmieści dysk przy Twoich kamerach. |
| `/alarmy` · `#przewod` | Dobieramy system do budynku, a nie odwrotnie. | Przewody tam, gdzie się da. Radio tam, gdzie szkoda ścian. |
| `/alarmy` · baner przed formularzem | Zaprojektujemy alarm, który chroni, a nie denerwuje. | Strefy, tryb nocny i czujki, które nie reagują na kota. |
| `/kontrola-dostepu` · `#metody` | Kod, karta, telefon. Klucz zostaje na wszelki wypadek. | Czym otworzysz drzwi i co zostaje na wypadek awarii. (bo kod, karta i telefon są teraz w H1) |
| `/kontrola-dostepu` · `#firma` | Każdy wchodzi tam, gdzie powinien. I o tej porze. | Magazynier do magazynu od 6:00, ekipa sprzątająca do biura po 18:00. |
| `/kontrola-dostepu` · `#cena` | Od czego zależy cena. | Od czego zależy cena kontroli dostępu. |
| `/smart-home` · `#integracje` (`smartHome.ts:425`) | Pompa ciepła, rekuperacja, alarm, kamery. Wszystko się dogada. | Pompa ciepła, rekuperacja, alarm i kamery w jednej aplikacji Ampio. |
| `/naglosnienie` · `#apart` nadtytuł (`naglosnienie.ts:132`) | APART · nasz mocny punkt | APART · nagłośnienie montowane na stałe |
| `/ekrany` · `#gdzie` (`ekrany.ts:236`) | Ekran, który pracuje, a nie tylko świeci. | Witryna, kasa, recepcja. Każde miejsce potrzebuje innego ekranu. |
| `/serwis` · `#plany` (`serwis.ts:141`) | Instalacja ma działać w sezonie, a nie tylko w dniu odbioru. | Przegląd przed sezonem, zanim przyjadą goście. |
| `/dla-architektow` · `#pokaz` (`architekci.ts:1110`, nagłówek + akcent) | Najlepiej przekonuje pokaz na żywo. | Pokażemy działanie na żywo, zanim wpiszesz je do projektu. |

**Zostają (najlepsze, nie ruszać):**
- „Alarm, który budzi złodzieja, a nie Ciebie o trzeciej w nocy.”
- „Antena ustawiona miernikiem, nie na oko.”
- „Dahua, Hikvision, BCS. Dobieramy pod obiekt, nie pod markę.”
- „Głośniej nie znaczy wyraźniej.”
- „Na Podhalu instalacja ma trudniej. Projektujemy to od początku.”
- „Twój obiekt na żywo.”
- „Wi-Fi w każdym pokoju. Bez wzmacniaczy z gniazdka.”

## 3. Sekcje powtarzane na wielu stronach

Nagłówek ma zawierać nazwę usługi albo obiektu: lepsze SEO i mniej „szablonu”. Technicznie to prop `heading` w komponencie, wartość w `dane/<strona>.ts` albo w mapie w `dane/obiekty.ts`.

**a) `GuaranteeSection` (21 stron)**
- Jest: „Po montażu nie znikamy. Masz numer, pod który dzwonisz.”
- Ma być: „24 miesiące gwarancji na montaż. Serwis pod jednym numerem.”
- Jeden tekst dla wszystkich, bo blok jest ten sam, ale zamiast hasła mówi konkret.

**b) FAQ na stronach usług (`Faq.tsx`, domyślnie „Zanim zadzwonisz.”)**

Na głównej zostaje „Zanim zadzwonisz.”. Na usługach:

| Strona | H2 FAQ |
|---|---|
| `/monitoring` | Pytania o monitoring |
| `/alarmy` | Pytania o alarmy i wideodomofony |
| `/kontrola-dostepu` | Pytania o kontrolę dostępu |
| `/sieci-wifi` | Pytania o sieć i Wi-Fi |
| `/anteny` | Pytania o anteny i telewizję |
| `/smart-home` | Pytania o smart home Ampio |
| `/naglosnienie` | Pytania o nagłośnienie |
| `/ekrany` | Pytania o ekrany i digital signage |
| `/ladowarki-ev` | Pytania o ładowarki do aut |

Strony obiektów mają już własne („Pytania właścicieli pensjonatów” itd.) i zostają.

**c) „Zwykle idzie w parze” na stronach obiektów (`obiekty.ts`, 12×)**
- Jest: „Usługi, które łączymy w tym obiekcie.”
- Ma być: „Co jeszcze montujemy w …” według obiektu:

| Obiekt | Ma być |
|---|---|
| dom | Co jeszcze montujemy w domach |
| apartamenty | Co jeszcze montujemy w apartamentach |
| pensjonaty | Co jeszcze montujemy w pensjonatach |
| hotele | Co jeszcze montujemy w hotelach |
| restauracje | Co jeszcze montujemy w restauracjach |
| sklepy | Co jeszcze montujemy w sklepach |
| firmy | Co jeszcze montujemy w firmach i halach |
| kościoły | Co jeszcze montujemy w kościołach |
| szkoły | Co jeszcze montujemy w szkołach |
| gminy | Co jeszcze montujemy w urzędach |
| deweloperzy | Co jeszcze montujemy w inwestycjach |
| budowy | Co jeszcze montujemy na budowach |

**d) „Przygotuj to, a wycena będzie szybsza.” (12×)** zostaje. To instrukcja, nie hasło, a powtarzalność pomaga.

## 4. Zdania w treści („X, a nie Y” — skracamy do konkretu)

| Plik | Jest | Ma być |
|---|---|---|
| `dane/anteny.ts:55` | Dlatego ustawiamy ją miernikiem, a nie „na oko”, i używamy przewodów, wtyków i anten dobrej klasy. | Ustawiamy ją miernikiem i używamy przewodów, wtyków i anten dobrej klasy. (H1 mówi już „nie na oko”) |
| `dane/anteny.ts:95` | Dobieramy jej typ, wysokość i mocowanie do miejsca, a nie do katalogu. | Typ, wysokość i mocowanie dobieramy do miejsca: wiatru, stoku i tego, co zasłania nadajnik. |
| `dane/monitoring.ts:109` | Dobieramy kamery do miejsca, a nie do katalogu. | Każdą kamerę dobieramy do jej miejsca: furtki, podjazdu, parkingu, wejścia. |
| `dane/monitoring.ts:241` | Podatności w kamerach to realny problem, a nie straszak. | Podatności w kamerach to realny problem. |
| `dane/teletechnika.ts:165` | A gdy przepisy się zmieniają, mówimy o tym na etapie oferty, a nie na odbiorze. | A gdy przepisy się zmieniają, mówimy o tym już w ofercie. |
| `seed/…/obiekty/sklep.json:72` | Kamery i alarm planujemy pod konkretne ryzyko w Twoim sklepie, a nie według ilości. Najpierw pytamy, co i gdzie ginie. | Kamery i alarm planujemy pod konkretne ryzyko w Twoim sklepie. Najpierw pytamy, co i gdzie ginie. |
| `dane/architekci.ts:230` + `seed/…/architekci/strona.json:148` | Technika zgodna z projektem wnętrza, a nie dobrana na budowie. | Technika zgodna z projektem wnętrza od pierwszego dnia budowy. |

Pozostałe „a nie” w treści zostają, bo niosą informację techniczną (np. „Kamera pod sufitem pokazuje sylwetkę, a nie twarz”, „switche przemysłowe, a nie biurowe”, „odpowiedź, a nie przyjazd technika”).

## 5. „Dlatego…” na początku zdania (32×)

Claude Code wypisuje wszystkie wystąpienia („Dlatego” na początku zdania) w `src/sites/instalacje/dane` i `seed/prokominstalacje`. W każdym przypadku:
- jeśli zdanie wcześniej podaje powód, łączy oba przez dwukropek albo przecinek;
- jeśli „Dlatego” nic nie wnosi, usuwa je.

Nie zmienia sensu ani faktów. Cel: najwyżej 12 wystąpień. Lista zmian trafia do opisu PR, żeby Krystian mógł je przejrzeć.

## 6. Zasady na przyszłość (dopisać do `docs/strony/prokominstalacje.md` §8)
1. Najpierw konkret (kto, gdzie, kiedy, ile), potem obietnica. Hasło bez konkretu wyrzucamy.
2. Najwyżej jedna antyteza „X, a nie Y” na ekran.
3. Zakazane frazesy: „śpisz spokojnie”, „mówi za Ciebie”, „wszystko się dogada”, „mocny punkt”, „najlepiej przekonuje”, „kompleksowo”, „innowacyjny”.
4. H2 sekcji powtarzalnej zawiera nazwę usługi albo obiektu.
5. H1 bez powtórzonego słowa i nie dłuższy niż ok. 90 znaków razem z nadtytułem, jeśli ten jest w H1.
6. Zdanie od „Dlatego” tylko wtedy, gdy naprawdę wynika z poprzedniego.

## 7. Prompt dla Claude Code (sesja I-T)

```
Sesja I-T (Instalacje) — redakcja tekstów. Przeczytaj docs/tresci/prokominstalacje-redakcja.md w całości.
Zakres (PR inst/i-t-teksty, tryb szybki — bez logiki): naniesienie §1–§5 dokładnie wg tabel (wyszukaj każdy tekst z kolumny „Jest”; gdy nie ma go dosłownie, zapisz w opisie PR i nie zgaduj). §3 b–c jako props heading z wartością w dane/ (bez zmian w strukturze komponentów poza propem). §6 dopisz do spec §8. Po zmianach: pnpm seed:instalacje lokalnie, sprawdź H1/H2 zmienionych stron, e2e strony.e2e i obiekty, testy jednostkowe danych. W opisie PR: tabela zmienionych pól (plik/pole → nowa wartość) + lista z §5 + lista pól, które na stagingu trzeba poprawić w panelu.
```
