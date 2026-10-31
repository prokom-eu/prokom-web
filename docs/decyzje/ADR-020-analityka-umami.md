# ADR-020: Analityka Umami bez ciasteczek

- **Status:** przyjęta (kod aplikacji — SW12; kontener na serwerze — S10b/S10c)
- **Data:** 2026-11-01
- **Decyduje:** Krystian (technika)

## Kontekst
Spec. prokomsoftware.pl §8.4 wymaga zdarzeń (kreator, „Twój projekt”, formularze, menu, dolny pasek, okno oferty) i konwersji (`/dziekujemy` + `kreator_wyslij`) **bez danych osobowych i bez banera cookies** — strona obiecuje „0 banerów”. `docs/architektura.md` od początku zakłada Umami. Plan nazywał tę decyzję „ADR-016”, ale numer 016 dostały filmy producentów (YouTube) — stąd ADR-020.

Ograniczenia: jedna osoba utrzymuje całość; CLAUDE.md zabrania zewnętrznych usług (analityka, CDN) bez ADR; obraz Dockera jest jeden dla stagingu i produkcji, więc adres analityki nie może być wpisany przy budowie.

## Opcje
| Opcja | Zalety | Wady | Koszt |
|---|---|---|---|
| A. Umami u siebie (kontener) | bez ciasteczek i bez banera; dane na naszym serwerze; zdarzenia z danymi; prosty panel dla szefa | nowy kontener i baza do kopii i aktualizacji | 0 zł, ok. 200–300 MB RAM |
| B. Plausible u siebie | podobne możliwości | ClickHouse — cięższy (ok. 1–2 GB RAM), druga baza innego typu | 0 zł |
| C. Usługa w chmurze (Plausible/Umami Cloud) | zero utrzymania | dane poza firmą, abonament, obcy host w CSP | abonament |
| D. Bez analityki | nic do utrzymania | brak konwersji i zdarzeń ze spec. | 0 zł |

## Decyzja
Wybieramy **A — Umami we własnym kontenerze**, bo nie stawia ciasteczek (baner zbędny), działa na tym samym PostgreSQL (osobna baza `umami`) i jest najlżejszą z opcji spełniających spec.

**Jak to działa w aplikacji:**
- **Ta sama domena.** Skrypt i wysyłka idą przez stronę: `/_s/script.js` (GET) i `/_s/api/send` (POST). `proxy.ts` przepisuje je na `UMAMI_URL` (wewnętrzny adres kontenera, np. `http://umami:3000`) — w czasie działania, nie przy budowie obrazu (`rewrites()` w `next.config.ts` liczą się przy `next build`). Bez obcego hosta: CSP bez zmian, a blokery reklam rzadziej ucinają statystyki. Inne ścieżki pod `/_s` → 404; tak samo nieznana domena i linia bez id w `UMAMI_WEBSITES` (jak każda inna ścieżka strony). Do kontenera idą tylko nagłówki potrzebne Umami (`user-agent`, `accept-language`, `content-type`, `x-forwarded-for`, `x-real-ip`) — bez ciasteczek i bez hasła stagingu (`authorization`).
- **Zmienne (opcjonalne):** `UMAMI_URL` i `UMAMI_WEBSITES` (`<slug tenanta>=<id strony w Umami>,…`). Brak którejś = analityka wyłączona: żaden skrypt, `/_s/*` → 404. Identyfikator strony to nie sekret (widać go w HTML), ale trzymamy go w env, żeby nie potrzebować migracji ani pola w panelu.
- **Skrypt** tylko na stronach linii, która ma id w `UMAMI_WEBSITES` (na start: Software), z `data-host-url="/_s"`, `data-do-not-track="true"` i `data-exclude-search="true"` — odsłony bez parametrów adresu, bo `/dziekujemy?nr=PKS-…` niesie numer zgłoszenia, który łączy wizytę z osobą. Odsłony liczy sam skrypt — także `/dziekujemy` (konwersja).
- **Zdarzenia** tylko przez `track()` z `src/lib/analytics` — typowana lista nazw, dane wyłącznie z dozwolonych kluczy (slug, id, numer kroku, nazwa pola). Nigdy wartości pól formularza, e-maila, telefonu, imienia ani treści zapytania. `formularz_blad` to tylko odrzucone pola — awarie (sieć, limit, błąd serwera) nie są liczone. `kreator_wynik` raz na ścieżkę kreatora; `oferta_okno` także przy otwarciu z linku `?rozwiazanie=` i przy przełączaniu strzałkami.

## Konsekwencje
- **S10b/S10c (serwer):** usługa `umami` w `docker/compose.staging.yml` / `compose.prod.yml` z **przypiętą wersją obrazu**, baza `umami` w istniejącym PostgreSQL (osobny użytkownik), panel Umami tylko przez Nginx na adresie dla Krystiana/szefa (np. za hasłem), baza `umami` w nocnych kopiach. Przed włączeniem sprawdzić w dokumentacji tej wersji atrybuty skryptu (`data-website-id`, `data-host-url`, `data-do-not-track`, **`data-exclude-search`** — wersja bez niego odpada) i ścieżkę `/api/send`. Umami bierze IP z `X-Forwarded-For` (Nginx → app → Umami; Next dokłada tylko `x-forwarded-host`) tylko do liczenia unikalnych odwiedzin, bez zapisu — Nginx ma **nadpisywać** `X-Forwarded-For` adresem klienta (nie dopisywać do nagłówka od klienta), bo Umami bierze pierwszy adres.
- Polityka prywatności Software już wymienia Umami — przy akceptacji prawnika potwierdzić brzmienie.
- Inne linie (Biznes, Instalacje) mogą dostać skrypt przez sam wpis w `UMAMI_WEBSITES` i podpięcie w ich ramce — osobna decyzja.
- Wracamy do decyzji, gdy Umami przestanie wystarczać szefowi (pulpit PRO-KOM System w 2027 może czytać jego API).
