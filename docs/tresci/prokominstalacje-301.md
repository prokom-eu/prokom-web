# prokominstalacje.pl — mapa przekierowań 301 (szkic)

Stan: 01.11.2026 · przygotował Claude Code (decyzja Krystiana 01.11: „zrób to wszystko sam”) · **do akceptacji Krystiana** (wiersze oznaczone „do decyzji” — szefa).

## Skąd lista
- **pro-kom.eu**: publiczna mapa strony `https://pro-kom.eu/sitemap.xml` (lastmod 30.09.2026), wszystkie adresy o instalacjach i sprzęcie RTV/audio.
- **pro-kom.pl**: `https://pro-kom.pl/page-sitemap1.xml` (8 stron: start, kontakt, systemy POS, KSeF, PRO-KOM, konfigurator PC, o nas, FAQ). Nie ma tam stron o instalacjach, więc **nic z pro-kom.pl nie przekierowujemy na Instalacje**. Ich adresy dotyczą Biznesu i huba.
- Przed przełączeniem (SEO §2.5) porównać listę z zaindeksowanymi adresami starej domeny w Search Console: Strony → „Zaindeksowane”. Dopisać tu adresy spoza mapy strony, np. stare wpisy albo adresy z parametrami.

## Mapa (pro-kom.eu → prokominstalacje.pl)

| Stary adres (pro-kom.eu) | Nowy adres | Uwagi |
|---|---|---|
| `/uslugi/montaz-instalacje` | `https://prokominstalacje.pl/uslugi` | przegląd wszystkich instalacji → pełna oferta |
| `/uslugi/montaz-instalacje/monitoring` | `https://prokominstalacje.pl/monitoring` | |
| `/uslugi/montaz-instalacje/inteligentny-dom` | `https://prokominstalacje.pl/smart-home` | |
| `/uslugi/montaz-instalacje/multimedialne` | `https://prokominstalacje.pl/ekrany` | ekrany, projekcja, digital signage |
| `/uslugi/montaz-instalacje/naglosnieniowe` | `https://prokominstalacje.pl/naglosnienie` | |
| `/uslugi/montaz-instalacje/sieci-strukturalnych` | `https://prokominstalacje.pl/sieci-wifi` | „Okablowanie strukturalne” jest w obszarze Sieci i Wi-Fi pełnej oferty; dla budynków w budowie jest też `/teletechnika` |
| `/uslugi/montaz-instalacje/telewizyjne-i-satelitarne` | `https://prokominstalacje.pl/anteny` | |
| `/realizacje` | `https://prokominstalacje.pl/realizacje` | **do decyzji**: lista starej strony to głównie realizacje AV (te same co w seedzie Instalacji). Jeśli hub pro-kom.eu ma mieć własne „Realizacje” — bez przekierowania |
| `/produkt/reseller/rtv-sat` | `https://prokominstalacje.pl/anteny` | **do decyzji**: to sprzedaż sprzętu, a Instalacje nie sprzedają sprzętu (spec §2). Druga możliwość: strona huba albo Biznesu |
| `/produkt/reseller/audio` | `https://prokominstalacje.pl/naglosnienie` | **do decyzji**: jak wyżej |

Bez przekierowania na Instalacje (inne linie albo hub): `/e-faktura`, `/firma`, `/kariera`, `/kontakt`, `/polityka-prywatnosci`, `/regulamin-sklepu`, `/tworzenie-stron-internetowych` (Software), `/produkt/*` poza dwoma wyżej (Biznes), `/uslugi/opieka-techniczna*`, `/uslugi/serwis*` (Biznes/Tech), `/zdalna-pomoc`.

## Wdrożenie
- Stare adresy są na **pro-kom.eu**, więc przekierowanie musi odpowiadać na tej domenie:
  1. **dopóki pro-kom.eu stoi na obecnym serwerze** (przed hubem, grudzień 2026): reguły 301 na tamtym serwerze, np. w `.htaccess` albo w konfiguracji obecnego hostingu. Robi to Krystian przy przełączeniu Instalacji (I15);
  2. **po przeniesieniu pro-kom.eu do tej aplikacji (hub)**: wpisy w panelu → Przekierowania, tenant `pro-kom`, `from` = stary adres, `to` = pełny adres `https://prokominstalacje.pl/…`. Kolekcja przyjmuje cele `https://` (`src/lib/redirects/rules.ts`), a `proxy.ts` stosuje je przed routingiem.
- Każdy wiersz = 301 (stały), bez łańcuchów (stary adres → od razu docelowy).
- Test po wdrożeniu: `curl -sI https://pro-kom.eu/uslugi/montaz-instalacje/monitoring` → `301` i `location: https://prokominstalacje.pl/monitoring`. Lista kontrolna SEO §6.
