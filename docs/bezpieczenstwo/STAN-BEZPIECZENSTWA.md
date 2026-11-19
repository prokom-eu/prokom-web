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
| 18.11 | prokom-web | ochrona CSRF i bezpieczne ciasteczko panelu, partnerów edytuje tylko właściwa linia, limit prób logowania w Nginx (panel i Gaming), trwała poprawka wdrożenia Nginx | prokom-web [#755](https://github.com/prokom-eu/prokom-web/pull/755) |

PR-y #131, #119 i #755 czekają na scalenie i wdrożenie (Tech: wydanie na `master`; prokom-web: kroki na serwerze z opisu PR). Statusy pojedynczych pozycji: kolumna „Status” w `ZNALEZISKA-2026-11.md` (uzupełniana po scaleniu i wdrożeniu).

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
| Aktualizacja Django 5.1 → 5.2 LTS i Next.js 14 → wspierana linia w Tech (T-03) | Wysokie | backend do 25.11, front do 15.12 |
| Alarm braku kopii produkcji web i Tech (S-04), limit B2 (S-05) | Średnie | do 30.11 |
| Hetzner (stara Tech) — usunięcie i rotacja sekretów (T-20) | Średnie | po 30.11 |
| CSP z ograniczeniem skryptów (W-03, G-04), pliki napraw za logowaniem (T-10), `/admin/` Tech (T-13) | Średnie | do 18.12 |
| Drugi składnik logowania (2FA) do paneli — obiecany w dokumencie z 12.10 | Średnie | decyzja szefa: zakres i termin |

## 5. Do decyzji szefa lub prawnika

- **RODO:** umowy powierzenia z webh.pl i Seohost; jakie dane trafiają do usług spoza UE (Sentry, Better Stack, Anthropic); okres przechowywania zapytań i danych napraw (T-18); polityki prywatności linii do sprawdzenia przez prawnika (AUDYT-PLAN §4 pkt 10).
- **Dostęp awaryjny** do menedżera haseł dla szefa (jedna osoba zna wszystkie hasła — AUDYT-PLAN §4 pkt 12).
- **Test penetracyjny** zewnętrznej firmy przed startem Strefy Klienta i PRO-KOM System (2027).
