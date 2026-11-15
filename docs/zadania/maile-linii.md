# Maile linii — zadanie dla Claude Code (prokom-web) · kroki FM (część D1-2)

Spec: `docs/design/wspolne/MAILE.md` · decyzja: `docs/decyzje/ADR-024-maile-linii.md` · wzorzec: `docs/design/wspolne/plansze/Maile.dc.html` · logo: `public/brand/mail/prokom-{biznes,instalacje,software}_mail.png` (z księgi znaku, 564×132).

## Miejsce w planie (plan v3, 05.11)
- Maile to **PR D1-2 dużej sesji D1** („dane wspólne i maile”, `docs/zadania/wspolne-elementy.md` §1a). Ten plik to **kroki szczegółowe FM** — sesję uruchamia prompt D1, nie osobny prompt FM.
- D1-2 startuje od gałęzi D1-1 (`feat/wsp-dane` → `feat/wsp-maile`, piętrowo). Kontekst maila (telefon, e-mail, firma, NIP, adres, godziny, polityka prywatności) bierze **loader `getSharedData` z D1-1** — bez osobnego `findMailContext`. Teksty linii zostają w `src/lib/mail/lineCopy.ts`.
- Szacunek części mailowej: **ok. 1 wieczór** z 1,75 całej D1. Jeśli diff D1-2 > 400 linii: D1-2a szablony, potwierdzenie, powiadomienie; D1-2b limit, `/_maile`, `mail:samples`, runbook.
- **Wyjście awaryjne:** gdy maile są pilne, a D1-1 czeka na koniec rund linii, można zrobić ten PR samodzielnie od `origin/develop` (krok 5 wtedy wg wariantu B: `findMailContext` z istniejących `SiteSettings` i `CompanyData`, bez migracji), a D1-1 potem przepina kontekst na loader.
- **Pliki, których ta część dotyka:** `src/lib/inquiry/emails.ts` (+ test), `src/lib/inquiry/submit.ts` (tylko wysyłka), `src/lib/mail/**`, `src/app/(…)/_maile/**`, `scripts/mail-samples.ts`, `package.json` (skrypt), `docs/runbook.md`, `docs/STAN.md`.
- **Konflikty:** sesje linii nie zmieniają tych plików. Biznes `InquiryPage` to UI i zostaje nietknięty.

## Prompt
```
Kroki szczegółowe D1-2 (uruchamia je prompt D1 z wspolne-elementy.md §1a; poniższy nagłówek tylko dla wyjścia awaryjnego):
/zadanie FM — maile linii w marce (potwierdzenie + powiadomienie)
Folder fundamentu (pliki pakietu są nieśledzone — commit w tym PR). W D1: gałąź feat/wsp-maile od feat/wsp-dane. Awaryjnie: od origin/develop.
Przeczytaj: docs/design/wspolne/MAILE.md (całość), docs/decyzje/ADR-024-maile-linii.md, plansze/Maile.dc.html (sekcje 0–2 i 4), obecne src/lib/inquiry/emails.ts, submit.ts, src/lib/mail/send.ts i senders.ts, ADR-003.

1. Typ Email: dodaj html i attachments (nodemailer: filename, content Buffer, cid, contentType). Sprawdź, że obie ścieżki sendLineEmail (własny transport i payload.sendEmail z adapterem nodemailer) przekazują html i attachments. Jeśli adapter je gubi, wysyłaj własnym transportem z ustawieniami domyślnego SMTP. Test.
2. src/lib/mail/html/: esc() (treść i atrybuty), layout({ lang:'pl', preheader, accent, body }) w układzie 600 px na tabelach ze stylami inline, button(), card(), steps(), footer(). Bez nowych zależności (ADR-024 pkt 1). Kolory linii ze spec §3, kontrast AA.
3. src/lib/mail/lineCopy.ts: temat, preheader, lead, 3 kroki dla biznes/instalacje/software oraz wariant „audit” Software, dokładnie wg spec §4.2. Nazwa nadawcy linii z etykiety linii (LINES) i dla powiadomienia sufiks „ · formularz”.
4. src/lib/mail/logo.ts: odczyt public/brand/mail/prokom-<linia>_mail.png (cache na proces). Załącznik cid:logo. MAIL_LOGO_FROM_SITE (opcjonalna, w env + .env.example; po przeglądzie D1-2 zamiast MAIL_LOGO_BASE_URL) przełącza na <img src="https://<domena linii>/brand/mail/…">. Brak pliku = mail bez logo + log.error. Sprawdź, że plik jest w obrazie Docker (public/ jest kopiowane — runtime stage).
5. Kontekst maila → { siteName, origin, phone, phone2, email, company:{name,nip,address,hours}, privacyUrl }. Wariant A (w D1): z loadera getSharedData(tenant) z D1-1, przez zależność SubmitDeps (testowalnie). Wariant B (awaryjnie, bez D1-1): SubmitDeps.findMailContext(tenantId) z SiteSettings tenanta i CompanyData. Adres polityki prywatności sprawdź w routingu/seedzie każdej linii. Bez literałów w kodzie (spec §2).
6. confirmationEmail(inquiry, ctx) → { to, subject, text, html, attachments } wg spec §4.1–4.2 i §5. W karcie TYLKO wartości z list (spec §4.1 pkt 4). notificationEmail(inquiry, ctx, { panelUrl, confirmation:'sent'|'limited'|'none' }) wg §4.3, z Reply-To klienta. Obecna treść tekstowa powiadomienia zostaje (dopisz status potwierdzenia). Usuń RESPONSE_TIME z maili; jeśli używa go jeszcze coś innego, zostaw stałą.
7. Limit potwierdzeń (spec §6.3): createConfirmationLimiter({ max:3, windowMs:24h, now }) na kluczu HMAC(PAYLOAD_SECRET, lower(trim(email))). Wpięcie w submitInquiryWith przed wysyłką; zapytanie zapisuje się zawsze.
8. (D1-2b, jeśli dzielisz) strona /_maile (SITE_ENV ≠ production, inaczej notFound; noindex; poza sitemap): 3 linie × 2 maile w iframe srcdoc + przełącznik HTML/tekst, na danych przykładowych (Biznes: lista 3 pozycji, Instalacje: planer z 2 usługami, Software: Twój projekt 2 pozycje). Skrypt pnpm mail:samples <adres> (odmawia przy SITE_ENV=production), wysyłający 6 maili przez sendLineEmail. Runbook: jak użyć na stagingu.
9. Testy wg spec §8 (wszystkie punkty) + aktualizacja istniejących testów emails/submit.
10. Ręcznie (Ty, przed PR): pnpm mail:samples do Mailpit — zrzuty 600 px i 390 px; porównaj z planszą 08 i wypisz w PR różnice. W PR checklista programów pocztowych ze spec §7 do odhaczenia przez Krystiana po wdrożeniu na staging.
11. Plan v3 ma już maile w D1 — nie dopisuj wiersza. Pakiet plansz: Maile.dc.html i nowy Logo.dc.html (oficjalne znaki) dopisz do plansze/README.md.
Nie zmieniaj: UI stron, formularzy, kolekcji i migracji, maili Payload (reset hasła).
DoD: lint, typecheck, testy, build, CI zielone; /przeglad; STAN (podsekcja „Elementy wspólne linii”: „D1-2 gotowe”); /pr.
```

## Po scaleniu (Krystian, ok. 15 minut)
1. Pipeline sam wdroży staging. Potem uruchom `pnpm mail:samples <twój Gmail>` na stagingu (komenda z runbooka) i dodatkowo na adres w Outlook.com.
2. Wyślij formularz na każdej z 3 stron stagingu. Sprawdź potwierdzenie, powiadomienie w `kontakt@` i przycisk „Odpowiedz” (ma iść do klienta).
3. Sprawdź telefon w ciemnym motywie i mail-tester (≥ 9/10 dla każdej linii).
4. Odhacz checklistę w PR. Ewentualne poprawki zgłoś jako osobny mały PR.
