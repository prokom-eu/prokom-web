# ADR-024 · Maile linii w marce (HTML + tekst, bez nowych zależności)

- Status: przyjęta 03.11.2026 (Krystian)
- Dotyczy: `src/lib/inquiry/emails.ts`, `src/lib/mail/*`, potwierdzenie i powiadomienie o zapytaniu (Biznes, Instalacje, Software)
- Spec: `docs/design/wspolne/MAILE.md` · wzorzec: `docs/design/wspolne/plansze/Maile.dc.html`

## Kontekst
S10d dało każdej linii własnego nadawcę i działające maile tekstowe (mail-tester 10/10). Klient dostaje jednak potwierdzenie bez wyglądu marki i z obietnicą czasu odpowiedzi wspólną dla wszystkich linii, co dla Biznesu i Instalacji jest nieprawdą. Do tego nadawca wszędzie nazywa się „PRO-KOM”, a potwierdzeń na jeden adres nie ogranicza żaden limit.

## Decyzje
1. **HTML budujemy funkcjami w TypeScripcie** (`src/lib/mail/html/*`: `layout`, `button`, `card`, `steps`, `esc`), bez React Email i MJML. Dlaczego: to tylko dwa szablony; zależności i ich zgodność z Next 16 / React 19 kosztowałyby więcej niż ~300 linii prostych funkcji z testami. Czyste funkcje zwracają `string`, więc łatwo je testować i mierzyć rozmiar. Jeśli szablonów przybędzie powyżej ok. 6, wracamy do tematu React Email.
2. **Każdy mail ma `html` i `text`.** Część tekstowa nie jest skrótem, tylko pełną wersją tej samej treści.
3. **Logo jako załącznik inline (`cid:logo`)** z `public/brand/mail/prokom-<linia>_mail.png`: odczyt z dysku raz na proces (cache), brak pliku oznacza mail bez obrazka i błąd w logu. Dlaczego nie adres URL: staging stoi za hasłem (401), a domen produkcyjnych jeszcze nie ma, więc logo z URL nie wyświetliłoby się przy testach. CID działa wszędzie i nie wymaga „pokaż obrazy”. **Rewizja przy produkcji:** zmienna `MAIL_LOGO_BASE_URL` (np. `https://prokombiznes.pl`) przełącza na `<img src="…/brand/mail/…png">`, co daje lżejszy mail i brak ikony spinacza w części programów.
4. **Teksty linii w kodzie** (`src/lib/mail/lineCopy.ts`) z testem. Dane kontaktowe pochodzą z panelu (`SiteSettings`, `CompanyData`). Po F1 teksty można przenieść do `SiteSettings.shared` (osobne zadanie).
5. **Limit 3 potwierdzeń na adres na dobę**, w pamięci, na kluczu HMAC adresu (spec §6.3).
6. **Nazwa nadawcy = etykieta linii** (`PRO-KOM Biznes`; dla powiadomienia `PRO-KOM Biznes · formularz`). `MAIL_FROM_NAME` zostaje dla maili Payload (reset hasła itp.).

## Konsekwencje
- `Email` (`lib/inquiry/emails.ts`) dostaje `html` i `attachments`. Wysyłka przechodzi przez obie ścieżki `sendLineEmail` (własny transport i `payload.sendEmail`), bo nodemailer przyjmuje oba pola.
- Strona `/_maile` (lokalnie i na stagingu) i `pnpm mail:samples` to stałe narzędzia do sprawdzania maili po każdej zmianie.
- Przy zmianie obietnicy linii (np. decyzja szefa) zmieniamy `lineCopy.ts` razem z tekstami na stronie.
