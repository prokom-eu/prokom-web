# Włamanie albo wyciek danych — co robić

Procedura na wypadek podejrzenia włamania na serwer lub do panelu, wycieku danych osobowych (klienci, zapytania, naprawy) albo wycieku sekretu (hasło, klucz API). Spokojnie, po kolei, wszystko z czasem zapisujesz w „Dzienniku zdarzenia” (koniec pliku albo kartka — godzina, co zrobione, kto).

**Termin prawny: 72 godziny** od stwierdzenia naruszenia ochrony danych osobowych na zgłoszenie do Prezesa UODO (art. 33 RODO), chyba że naruszenie raczej nie powoduje ryzyka dla osób. Decyzję o zgłoszeniu podejmuje szef (administrator danych) — Twoja rola to fakty i liczby.

## 1. Pierwsza godzina

1. **Zawiadom szefa** (telefon) — co wiesz, od kiedy, czego dotyczy. Nie piszesz o szczegółach w mailu ani na czacie, jeśli skrzynka może być przejęta.
2. **Zatrzymaj wyciek, nie niszcząc śladów:**
   - wyciekł sekret (klucz API, hasło, token GitHub) → od razu unieważnij go u dostawcy i wpisz nowy (menedżer haseł → `.env.*` na serwerze → wdrożenie);
   - przejęte konto panelu → dezaktywuj je w panelu albo zmień hasło; w Tech `Token.objects.filter(user=…).delete()` (unieważnia sesję);
   - podejrzenie włamania na serwer → **nie wyłączaj serwera i nie usuwaj plików**; zablokuj dostęp: w panelu webh.pl zapora tylko dla Twojego IP albo wyłączenie stron (strona 503), zmień klucz SSH (nowy klucz, usuń stary z `~/.ssh/authorized_keys`).
3. **Zabezpiecz logi** (zanim się zrotują) — kopia na komputer:
   ```
   ssh prokom-vps 'sudo journalctl --since "-7 days" > /tmp/journal.txt; sudo cp /var/log/auth.log* /tmp/; for c in $(docker ps --format "{{.Names}}"); do docker logs --since 168h $c > /tmp/$c.log 2>&1; done; sudo tar czf /tmp/incydent-logi.tgz /tmp/*.log /tmp/journal.txt /tmp/auth.log*'
   scp prokom-vps:/tmp/incydent-logi.tgz .
   ```
   Do tego: `last -a`, `sudo lastb | head -50`, `docker ps -a`, `ls -la /srv/prokom` (zrzuty ekranu albo do pliku). Archiwum trzymaj zaszyfrowane, nie w repo.

## 2. Ustalenie zakresu (pierwsze 24 h)

- **Co wyciekło:** które tabele / pola (imię, telefon, e-mail, treść zapytania, dane napraw), ile rekordów, ilu osób dotyczy — liczby, nie dane.
- **Od kiedy i jak:** logi Nginx (adresy IP, ścieżki), logowania do paneli (`LoginActivity` w Tech, blokady w Payload), zmiany w kodzie (`git log`), nieznane klucze w `authorized_keys`, nieznane kontenery lub procesy.
- **Czy trwa:** czy luka jest zamknięta (poprawka, wyłączony endpoint, zmienione hasło).
- Zapis faktów dla szefa: co, ilu osób, jakie kategorie danych, możliwe skutki, co zrobione.

## 3. Odtworzenie

- Kod i obrazy są w GitHub/GHCR — wdrożenie znanej, poprawnej wersji: `deploy.sh prod <sha>` (prokom-web, Gaming) lub `scripts/vps/deploy.sh prod <sha>` (Tech).
- Dane z kopii sprzed incydentu: runbook §6 (prokom-web), runbook Gaming, `scripts/vps/restore.sh` (Tech). Klucz `age` z menedżera haseł, po użyciu `shred -u`.
- Serwer niepewny (włamanie na system) → nowy VPS według runbooka („Serwer stracony”), dane z kopii poza serwerem (B2), **wszystkie sekrety nowe** (lista nazw: `ZNALEZISKA-2026-11.md` AB2 „Sekrety do rotacji” + `.env.example` każdego repo).

## 4. Zgłoszenia (decyzja szefa)

- **UODO** — do 72 h od stwierdzenia: formularz na stronie UODO (biznes.gov.pl). Treść: charakter naruszenia, kategorie i przybliżona liczba osób i rekordów, kontakt, możliwe skutki, zastosowane środki. Jeśli nie wszystko wiadomo — zgłoszenie wstępne, potem uzupełnienie.
- **Osoby, których dotyczy** (art. 34 RODO) — gdy wysokie ryzyko (np. wyciek haseł, numerów dokumentów): mail prostym językiem — co się stało, jakie dane, co zrobiliśmy, co radzimy (zmiana hasła).
- **Policja / CERT Polska** (incydent.cert.pl) — przy włamaniu lub szantażu, decyzja szefa.
- Dostawcy: webh.pl (serwer), Backblaze, GitHub — gdy sprawa dotyczy ich usług.

## 5. Po incydencie (do 2 tygodni)

- Krótki opis: przyczyna, oś czasu, co zadziałało, co nie; poprawki w PR-ach; wpis w `STAN-BEZPIECZENSTWA.md` i w dzienniku `RYTUAL.md`.
- Rejestr naruszeń (art. 33 ust. 5 RODO) — każdy incydent z danymi osobowymi, także niezgłoszony do UODO, z uzasadnieniem.

## Kontakty (uzupełnia Krystian, bez haseł)

| Kto | Do czego | Kontakt |
| --- | --- | --- |
| Szef (administrator danych) | decyzje, zgłoszenie UODO | TODO(krystian) |
| webh.pl | serwer VPS, zapora, konsola | TODO(krystian) |
| Seohost / nazwa.pl | DNS, poczta | TODO(krystian) |
| Prawnik / IOD (jeśli jest) | RODO | TODO(krystian) |
| CERT Polska | zgłoszenie incydentu | incydent.cert.pl |

## Dziennik zdarzenia

| Data i godzina | Co | Kto |
| --- | --- | --- |
