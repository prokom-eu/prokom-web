# ADR-030: IndexNow — zgłaszanie zmienionych adresów do wyszukiwarek

- Status: **przyjęta** (23.11.2026, sesja SEO; polecenie Krystiana „zrób IndexNow”)
- Data: 23.11.2026
- Decyduje: Krystian
- Powiązane: ADR-019 (serwer), `docs/runbook.md` §1.8 (cron), `docs/STAN.md` → „SEO: Search Console, Bing i czaty AI”.

## Kontekst
Bing (a przez niego Copilot i ChatGPT Search, które korzystają z jego indeksu), Yandex, Seznam i Naver przyjmują protokół IndexNow: strona sama zgłasza nowe, zmienione i usunięte adresy, zamiast czekać, aż robot je znajdzie. Google IndexNow nie obsługuje — tam działa mapa witryny w Search Console. Mamy 6 domen (4 w prokom-web, Tech w prokom-system, Gaming w osobnym repo) na jednym serwerze.

## Decyzja
1. **Jeden klucz dla wszystkich domen** (`src/lib/seo/indexnow.ts`, Tech: `frontend/public/<klucz>.txt`). Klucz jest jawny z założenia protokołu: leży pod `https://<domena>/<klucz>.txt` i dowodzi tylko kontroli nad domeną. Nie jest sekretem, więc nie trafia do `.env`.
2. **Wysyłka z serwera, nie z aplikacji:** `scripts/server/indexnow.py` (sama biblioteka standardowa Pythona, bez zależności) uruchamiany co godzinę z crona. Porównuje mapy witryn z ostatnio wysłanym stanem (`/srv/prokom/indexnow/<domena>.json`) i wysyła tylko nowe, zmienione (`lastmod`) i usunięte adresy do `api.indexnow.org` (wspólny punkt przekazuje je dalej). Stan zapisuje dopiero po odpowiedzi 200/202, więc błąd jest ponawiany w następnej godzinie.
3. Domena bez pliku z kluczem jest pomijana (Gaming, dopóki jego repo go nie poda).

## Dlaczego tak
- Zmiany treści w panelu pojawiają się w mapach witryn, a cron wyłapuje je bez żadnego haka w Payload. Ten sam mechanizm obejmuje Tech i Gaming (inne repo), zero kodu w ścieżce żądania.
- Mapa witryny jest jedynym źródłem prawdy o adresach. Skrypt nie zna struktury żadnej strony.
- Bez nowej usługi do utrzymania: brak konta i sekretu. Wysyłane są tylko publiczne adresy stron, żadnych danych osobowych.

## Konsekwencje
- Pierwszy przebieg wysyła wszystkie adresy (ok. 1150). Później zwykle zero albo kilka na godzinę. Po wdrożeniu Tech (data budowy w `lastmod`) wraca ok. 100 adresów — to zgodne z protokołem.
- Hub nie ma `lastmod` w mapie: zgłaszane są tylko nowe i usunięte adresy huba.
- Odwrót: usunąć linię z crona. Plik z kluczem może zostać.
