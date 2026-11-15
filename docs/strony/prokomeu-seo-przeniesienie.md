# pro-kom.eu — przeniesienie bez utraty pozycji w Google (H17, 15.11.2026)

Stara pro-kom.eu działa od lat (Joomla 2013–2021, od 30.09.2026 Next.js na nazwa.pl). Nowa strona to hub na tej samej domenie, a większość treści przechodzi na strony linii. Ten plik mówi, co zrobić przed, w trakcie i po przełączeniu, żeby Google przeniósł zaufanie domeny i podstron na nowe adresy.

## Co już jest w kodzie
- **Ta sama domena i strona główna** — `https://pro-kom.eu/` zostaje stroną główną (najsilniejszy adres, linki z katalogów firm i wizytówki Google). Bez narzędzia „Zmiana adresu” w Search Console (dotyczy tylko zmiany domeny).
- **301 dla każdego znanego adresu, jeden skok, bez łańcuchów** — `src/seed/prokom/redirects.ts`:
  - 46 adresów obecnej mapy strony (sitemap starej strony, 15.11),
  - starsze adresy Joomli z Web Archive (2013–2023): `/index.php/<adres>` → od razu do celu (stara strona robiła to dwoma skokami), `/index.php` → `/`, `/serwis`, `/naprawy-sprzetow`, `/opieka-techniczna`, `/instalacje-konfiguracja`, `/uslugi`, `/produkty`, kategorie sklepu,
  - 175 pojedynczych produktów dawnego sklepu Joomli (`/produkty/muzyczne/<model>`, niewidoczne od ~2021) **celowo bez reguły** — 404 jest uczciwe; przekierowanie na niepasującą stronę Google i tak traktuje jak „miękkie 404”.
  - Testy: `redirects.test.ts` (pokrycie mapy strony i Joomli, `/index.php/X` = cel `X`, brak łańcuchów), e2e `hub-301.e2e.spec.ts` (każda reguła → 301 → cel).
  - Cele na stronach linii sprawdzone na żywo 15.11: wszystkie 200. Wyjątek: `prokomserwis.pl/serwis-telefonow` przekierowuje dziś na `/uslugi` (do sprawdzenia po przełączeniu Tech 29.11).
- **301 z `www.pro-kom.eu`** na domenę bez `www` (Nginx, `PROD_WWW_HOSTS`), `http` → `https`.
- **Każda strona huba:** własny tytuł i opis, `canonical` na `https://pro-kom.eu/...`, dane strukturalne `Organization` + `LocalBusiness` (NAP z panelu), `sitemap.xml` (9 stron), strony prawne i wyszukiwarka `noindex`.
- **301 cache'owane dzień** (`Cache-Control: max-age=86400`) — pomyłkę w panelu da się cofnąć.

## Do zrobienia przed przełączeniem (Krystian)
1. **Search Console — właściwość domeny `pro-kom.eu`** (rekord TXT w nazwa.pl; najpierw `docs/dns.md`). Jeśli jest już właściwość starej strony — z niej:
   - eksport **Skuteczność → Strony** (16 miesięcy) i **Linki → Najczęściej linkowane strony**; każdy adres z ruchem albo linkami, którego nie ma w `redirects.ts`, dopisać do reguł,
   - zapisać pozycje dla 10–20 głównych fraz (np. „PRO-KOM Rabka”, „kasy fiskalne Rabka-Zdrój”, „serwis telefonów Rabka”) — punkt odniesienia po starcie.
2. **Pliki e-faktury** — stara strona serwuje 6 PDF-ów pod `/files/…` (regulamin e-faktury, oświadczenia, umowa powierzenia, przewodnik). To dokumenty dla klientów, nie strona do przekierowania: przenieść je na hub (zadanie H18: strona `/e-faktura` + pliki pod tymi samymi adresami). Dziś reguła `/e-faktura` → `prokombiznes.pl/ksef` prowadzi do innego tematu (KSeF to produkt Biznesu, a te pliki to zgody klientów PRO-KOM na faktury e-mailem).
3. **Wizytówka Google (Google Business Profile)** — adres strony zostaje `https://pro-kom.eu`; nazwa, adres i telefon na wizytówce muszą być takie jak na hubie (NAP). Stara strona pokazuje numery stacjonarne (18 267 65 11, serwis 18 541 20 55) i salon w Zakopanem — decyzja, czy wizytówka ma numer 883 200 151, czy stacjonarny, i czy wizytówka Zakopanego wskazuje `prokomserwis.pl`.
4. **TTL rekordów `A @` i `A www` = 300 s** na 48 h przed (plan poczty najpierw — `docs/dns.md` → „pro-kom.eu”).

## W dniu przełączenia
1. Kolejność z `docs/STAN.md` (H7-2 kroki 4–12) i `docs/dns.md` (poczta → strona).
2. Po zmianie DNS sprawdzić curl-em (z komputera Krystiana):
   ```bash
   for p in / /firma /produkt/reseller/kasy-fiskalne /index.php/firma /index.php /uslugi/serwis /produkty/muzyczne/ambiset; do
     curl -sI "https://pro-kom.eu$p" | grep -iE "^(HTTP|location)"; done
   curl -sI http://www.pro-kom.eu/firma | grep -iE "^(HTTP|location)"
   curl -s https://pro-kom.eu/robots.txt   # bez Disallow: /, z adresem sitemap
   ```
   Oczekiwane: 200 dla `/`, 301 jednym skokiem do celu dla reszty, 404 dla produktu sklepu, `robots.txt` produkcji (nie stagingu).
3. Search Console: **Mapy witryn** → `https://pro-kom.eu/sitemap.xml`; **Sprawdzanie adresu URL** → poproś o zindeksowanie `/`, `/dla-firm`, `/inwestycje-i-dostawy`, `/kontakt`, `/o-firmie`.
4. Nie wyłączać od razu starego hostingu — trzyma pocztę (decyzja 15.11: co najmniej do końca listopada).

## Po przełączeniu (4–8 tygodni)
- **Codziennie przez pierwszy tydzień, potem co tydzień:** Search Console → Strony → „Nie znaleziono (404)” i „Strona z przekierowaniem”. Adres z ruchem albo linkami bez reguły → dopisać **w panelu** (Przekierowania, tenant `prokom`) — seed pomija istniejące reguły i po starcie nie jest już źródłem prawdy.
- **Logi Nginx** (pierwsze 2 tygodnie): 404 na `pro-kom.eu` posortowane po liczbie — to samo, szybciej niż Search Console (przykład; polecenie `docker compose` proxy z runbooka §0, format logu do sprawdzenia na serwerze):
  ```bash
  docker compose … logs nginx --since 24h | grep '"GET ' | grep ' 404 ' | grep 'pro-kom.eu' | awk '{print $7}' | sort | uniq -c | sort -rn | head -30
  ```
- **Reguł 301 nie usuwać** — trzymać co najmniej rok, najlepiej zawsze (kosztują nic).
- **Czego się spodziewać:** przez 2–6 tygodni pozycje mogą się wahać. Frazy produktowe (kasy, monitoring, serwis) przechodzą z pro-kom.eu na strony linii — to zamierzone; pro-kom.eu zostaje silna na frazy firmowe i lokalne („PRO-KOM”, „PRO-KOM Rabka-Zdrój”). Spadek po 8 tygodniach na frazie firmowej = sygnał do sprawdzenia (404, `noindex`, `canonical`).
