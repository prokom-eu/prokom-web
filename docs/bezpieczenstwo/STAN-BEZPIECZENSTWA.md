# Stan bezpieczeństwa po audycie — listopad 2026

Zbiorczy stan po sesjach AB1–AB4 (18.11.2026) dla wszystkich systemów PRO-KOM na VPS webh.pl. Szczegóły i dowody: `ZNALEZISKA-2026-11.md` w każdym repo (prokom-web: serwer i strony linii; prokom-gaming: Gaming; prokom-system: Tech). Plan i zasady: [AUDYT-PLAN.md](AUDYT-PLAN.md). Stałe czynności: [RYTUAL.md](RYTUAL.md). Włamanie lub wyciek: [INCYDENT.md](INCYDENT.md).

To jest **przegląd wewnętrzny** (autor systemów z pomocą Claude), nie test penetracyjny niezależnej firmy — AUDYT-PLAN §0.

## 1. Co sprawdziliśmy i jest w porządku

- **Serwer:** na zewnątrz otwarte tylko porty 22, 80, 443 (skan `nmap`); SSH tylko kluczem, root wyłączony, fail2ban; zapora `ufw`; bazy, Redis i panele (Umami) niedostępne z internetu; kontenery bez uprawnień `privileged`; pliki z sekretami 600; certyfikaty ważne do 01–02.2027 z automatycznym odnawianiem.
- **Kopie:** codziennie wszystkie 6 stosów, zaszyfrowane, produkcja także poza serwerem (Backblaze B2, blokada usunięcia 14 dni). **Test odtworzenia 18.11 — wszystkie trzy produkcje odtworzone zgodnie** (prokom-web 22 s, Gaming 8 s, Tech 10 s).
- **Strony linii i pro-kom.eu (prokom-web):** dane z formularzy niedostępne bez logowania, izolacja linii w panelu, formularz odporny na spam i wstrzyknięcia, nagłówki bezpieczeństwa, historia repo bez sekretów.
- **Gaming:** klient widzi tylko swoje zamówienia, „Sprawdź ceny” nie publikuje niczego bez dwóch zatwierdzeń admina, klucz Anthropic tylko na serwerze z miesięcznym budżetem.
- **Tech:** ustawienia produkcyjne Django poprawne (`DEBUG` wyłączony, HSTS, bezpieczne ciasteczka, CORS z listą), historia repo bez sekretów.

## 2. Co naprawiliśmy

| Kiedy | System | Co | Gdzie |
| --- | --- | --- | --- |
| 18.11, ten sam wieczór | Tech | **2× Krytyczne:** każdy zalogowany klient widział urządzenia wszystkich klientów (z hasłem/PIN-em urządzenia); rejestracja przejmowała profil klienta-gościa po samym e-mailu | hotfix prokom-system #122 (produkcja 21:21), #121 |
| 18.11 | serwer | Nginx znów przeładowuje konfigurację (odnowione certyfikaty wejdą bez restartu) — doraźnie; restart serwera: nowe jądro i libc | odtworzenie proxy 22:4x, restart 23:14 (jądro 6.8.0-149) |
| 18.11 | Tech | uprawnienia API (wiadomości, oferty, marki i modele), wygasające tokeny, blokada czasowa zamiast dezaktywacji, polityka haseł, logowanie Google, przypisanie kodem SMS wyłączone, dokumentacja API tylko dla admina, brak danych klienta przed potwierdzeniem e-maila, usuwanie napraw i cennik tylko admin | prokom-system [#131](https://github.com/krystian2077/prokom-system/pull/131) |
| 18.11 | Gaming | hasło ustawia właściciel skrzynki po kliknięciu linku (przejęcie konta), blokady dokumentów panelu niewidoczne dla klientów, limit resetu hasła, ochrona CSRF i bezpieczne ciasteczko | prokom-gaming [#119](https://github.com/prokom-eu/prokom-gaming/pull/119) |
| 18.11 | prokom-web | ochrona CSRF i bezpieczne ciasteczko panelu, partnerów edytuje tylko właściwa linia, limit prób logowania w Nginx (panel i Gaming), trwała poprawka wdrożenia Nginx, drobne (unlock, limit plików, bez `X-Powered-By`) | prokom-web [#755](https://github.com/prokom-eu/prokom-web/pull/755) |
| 19.11 | Tech | backend na Django 5.2 LTS i pakietach bez znanych luk (było 76 luk w produkcji) | prokom-system [#140](https://github.com/krystian2077/prokom-system/pull/140) |
| 19.11 | Tech | śledzenie naprawy odporne na zgadywanie (blokada per zgłoszenie), panel admina Django tylko dla superużytkowników | prokom-system [#138](https://github.com/krystian2077/prokom-system/pull/138) |
| 19.11 | Tech | losowe nazwy plików klientów pod `/media/`, tylko formaty zdjęć (koniec wgrywania SVG/HTML) | prokom-system [#146](https://github.com/krystian2077/prokom-system/pull/146) |
| 19.11 | wszystkie | **wdrożenie na produkcję** (akceptacja szefa): Tech eb2a1a4 (Django 5.2.19, #131, #138, #140, #146; nowa konfiguracja bramki), Gaming 42702e6 (#119), prokom-web 56f2314 (#755); bramka wdrożenia i proxy z limitem logowania na serwerze | `deploys.log` 19.11 |

| 19.11, wieczór (AB5) | Tech | RODO: usunięcie konta z ponownym hasłem i pełną anonimizacją (konto, adresy, notatki, hasła urządzeń, kopie maili, ślady logowania, profile gościa), pełny eksport; sekret webhooka w stałym czasie, formularz bez treści błędów, kod OTP z `secrets`; backend i Celery bez roota (uid 10001) — produkcja | prokom-system [#161](https://github.com/krystian2077/prokom-system/pull/161), wydanie [#162](https://github.com/krystian2077/prokom-system/pull/162) |
| 19.11, wieczór (AB5) | Gaming | Next 16.4.6 (poprawki bezpieczeństwa) — produkcja | prokom-gaming [#122](https://github.com/prokom-eu/prokom-gaming/pull/122) |
| 19.11, wieczór (AB5) | prokom-web | `happy-dom` 21.0.4 (SSRF w parserze HTML zależności Payload) — produkcja 19.11 (8a2eae5) | prokom-web [#781](https://github.com/prokom-eu/prokom-web/pull/781) |
| 19.11, wieczór (AB5) | serwer | 11 starych kopii plików z sekretami usuniętych (`shred -u`) | S-09 |

**Stan 19.11 wieczorem: wszystkie poprawki z audytu działają na produkcji.** Sprawdzone z zewnątrz: dokumentacja API i lista urządzeń Tech → 403, `nosniff` na `/media/`, panel GraphQL → 404, limit logowania (429 po 6 próbach) w panelu i Gaming, blokady dokumentów Gaming → 403. Statusy pozycji: kolumna „Status” w `ZNALEZISKA-2026-11.md` każdego repo.

## 3. Co świadomie zostaje (z uzasadnieniem)

| Pozycja | Dlaczego zostaje | Decyzja |
| --- | --- | --- |
| Konto `krystian` w grupie `docker` (= dostęp jak root bez hasła sudo) — S-08 | wdrożenia bez sudo; chroni klucz SSH z hasłem na jednym komputerze | Krystian |
| Wdrożenie stagingu uruchamia skrypty z `develop` na serwerze produkcji — W-04 | jedna osoba scala, `develop` tylko przez PR z zielonym CI; do zmiany, gdy dojdzie druga osoba z prawem scalania | Krystian |
| Partnerzy i dane firmy wspólne dla linii — W-02, W-07 | celowo jeden zestaw danych firmy dla wszystkich stron | Krystian |
| Rejestracja w Tech zdradza, że konto istnieje — T-16 (część) | zmiana wymaga nowego przebiegu rejestracji w panelu klienta (strefa zakazana) | Krystian |

## 4. Co jeszcze do zrobienia (kolejne sesje)

| Pozycja | Ryzyko | Kiedy |
| --- | --- | --- |
| Stare serwisy PHP na nazwa.pl nadal odpowiadają pod starym adresem (S-01) — archiwum i usunięcie | Wysokie | do 25.11 (część K, Krystian) |
| Next.js 14 → wspierana linia (z React 19) w Tech — backend już na Django 5.2 (T-03); krytyczne luki Next 14 bez wektora w naszej konfiguracji | Wysokie | do 15.12 (sesja ze zrzutami paneli) |
| Utwardzenie SSH (S-14): skrypt `skrypty/ab4-ssh-utwardzenie.sh` — wymaga `sudo` Krystiana (instrukcja w §6) | Niskie | przy najbliższym logowaniu |
| CAA w 6 domenach (S-11), DMARC `quarantine` w domenach linii (S-12) — instrukcja w §6 | Niskie | S-11 od razu, S-12 ok. 30.11 |
| Alarm braku kopii produkcji web i Tech (S-04), limit B2 (S-05) | Średnie | do 30.11 |
| Hetzner (stara Tech) — usunięcie i rotacja sekretów (T-20) | Średnie | po 30.11 |
| CSP z ograniczeniem skryptów (W-03, G-04), pliki napraw za logowaniem (T-10) | Średnie | do 18.12 |
| Drugi składnik logowania (2FA) do paneli — obiecany w dokumencie z 12.10 | Średnie | decyzja szefa: zakres i termin |

## 5. Do decyzji szefa lub prawnika

- **RODO:** umowy powierzenia z webh.pl i Seohost; jakie dane trafiają do usług spoza UE (Sentry, Better Stack, Anthropic); okres przechowywania zapytań i danych napraw (T-18); polityki prywatności linii do sprawdzenia przez prawnika (AUDYT-PLAN §4 pkt 10).
- **Dostęp awaryjny** do menedżera haseł dla szefa (jedna osoba zna wszystkie hasła — AUDYT-PLAN §4 pkt 12).
- **Test penetracyjny** zewnętrznej firmy przed startem Strefy Klienta i PRO-KOM System (2027).

## 6. Do zrobienia ręcznie przez Krystiana (Claude nie ma tych dostępów)

Każdy punkt to kilka minut. Po zrobieniu: status w `ZNALEZISKA-2026-11.md` i wiersz w §2.

1. **S-01 — stare serwisy PHP na nazwa.pl** (Wysokie): panel nazwa.pl → hosting `85.128.169.153` → pobrać archiwum plików i baz (zaszyfrować `age`, schować poza serwerem) → usunąć stare aplikacje i bazy albo wyłączyć hosting. Sprawdzenie: `curl -sI -H "Host: <stara-nazwa>" http://85.128.169.153/` nie zwraca strony.
2. **S-14 — SSH** (z otwartą drugą sesją SSH na wypadek błędu):
   `scp docs/bezpieczenstwo/skrypty/ab4-ssh-utwardzenie.sh prokom-vps:/tmp/` → `ssh -t prokom-vps "sudo bash /tmp/ab4-ssh-utwardzenie.sh; rm /tmp/ab4-ssh-utwardzenie.sh"` → z NOWEGO terminala `ssh prokom-vps true`.
3. **S-11 — CAA** (najpierw `docs/dns.md`, potem dostawca): w prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl, prokomgaming.pl, prokomserwis.pl i pro-kom.pl rekord `CAA @ 0 issue "letsencrypt.org"`. Sprawdzenie: `nslookup -type=CAA <domena> 8.8.8.8`.
4. **S-12 — DMARC** ok. 30.11, jeśli raporty na `kontakt@` są czyste: `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:kontakt@<domena>` (najpierw `docs/dns.md`).
5. **S-04 — alarm kopii produkcji**: Better Stack → nowy heartbeat (co 24 h, tolerancja 2 h) dla prokom-web prod i Tech prod → adres wpisać w `.env.backup` jako `BACKUP_HEARTBEAT_URL_PROD` (opis w `.env.example`; dla Tech — analogicznie w jego `.env.backup`).
6. **S-05 — limit B2**: Backblaze → Caps & Alerts → alert przy 8 GB i limit dzienny; albo płatny plan (koszt pomijalny przy ~10 GB).
7. **T-20 — Hetzner (po 30.11)**: zaszyfrowane archiwum bazy i mediów → usunięcie serwera → rotacja `SECRET_KEY` Tech, hasła bazy i hasła SMTP (nowe wartości tylko do menedżera haseł i `.env.prod` na VPS).
8. **2FA** do paneli: decyzja szefa o zakresie i terminie (§4).
