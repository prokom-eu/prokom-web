# Maile linii — potwierdzenie dla klienta i powiadomienie dla nas (Biznes, Instalacje, Software)

Wersja 1.0 · 03.11.2026 · decyzja: ADR-024 · wzorzec: `plansze/Maile.dc.html` (płótno: https://claude.ai/artifact/7HKNezL1nNmgeZPJum8rQG, plansza „08 · Maile”) · zadanie: `docs/zadania/maile-linii.md`

**Dziś (stan po S10d):** `src/lib/inquiry/emails.ts` wysyła dwa maile, oba tylko tekstowe: `confirmationEmail` i `notificationEmail`. Nadawca jest osobny dla każdej linii (`lib/mail/senders.ts`, `MAIL_SENDERS`). Na stagingu wszystko działa: mail-tester 10/10, Gmail kładzie maile w „Główne”.

**Problemy obecnej wersji:**
1. Wszystkie linie obiecują „Odpowiemy w ciągu 1 dnia roboczego” (`RESPONSE_TIME`), a Biznes i Instalacje mają inną obietnicę.
2. Nazwa nadawcy to wszędzie „PRO-KOM” (`MAIL_FROM_NAME`).
3. Mail nie ma wyglądu marki.
4. Brakuje limitu potwierdzeń na jeden adres.

**Cel:** te same dwa maile w wersji HTML zgodnej z planszą 08, z częścią tekstową zawsze obok. Każda linia ma własny znak, kolor, obietnicę i kroki „Co dalej”. Zasady bezpieczeństwa i dostarczalności opisuje §6.

## 1. Co powstaje

| Mail | Do kogo | Od kogo (nazwa · adres) | Odpowiedz do | Kiedy |
|---|---|---|---|---|
| **Potwierdzenie** | klient (adres z formularza) | `PRO-KOM <Linia>` · `kontakt@<domena linii>` | — (odpowiedź trafia na `kontakt@`) | po zapisaniu zapytania, jeśli klient podał e-mail i nie przekroczył limitu (§6.3) |
| **Powiadomienie** | `Tenants.notificationEmail` | `PRO-KOM <Linia> · formularz` · `kontakt@<domena linii>` | klient (jeśli podał e-mail) | zawsze po zapisaniu zapytania |

Gaming ma maile we własnej marce, w repo `prokom-gaming` (`docs/zadania/gaming-maile.md`). Tech, czyli prokomserwis.pl, zostaje poza zakresem.

## 2. Dane w mailu — skąd

| Dane | Źródło | Uwagi |
|---|---|---|
| telefon linii (przycisk „Zadzwoń”), drugi telefon | `SiteSettings.phone`, `phone2` tenanta | Biznes: 889 003 889 + 883 200 151; Instalacje: 889 003 889; Software: 883 200 151 |
| e-mail linii | `SiteSettings.email` (gdy pusty — adres nadawcy linii) | `kontakt@<domena>` |
| nazwa firmy, NIP, adres, godziny | `CompanyData` (`name`, `nip`, `locations[0]`, `hours`) | PRO-KOM Tadeusz Wójciak · NIP 7352511447 · ul. Orkana 16B, 34-700 Rabka-Zdrój · pn–pt 9:00–17:00 |
| domena i adres strony | `siteOrigin(host)` | linki w stopce do strony głównej i polityki prywatności |
| obietnica, „Co dalej”, preheader, kolor, znak | `src/lib/mail/lineCopy.ts` (kod, test) | treści z §4; po F1 można je przenieść do `SiteSettings.shared` (TODO w kodzie, nie w tej sesji) |

W szablonie nie ma literałów telefonów, adresów ani NIP. Test z §8 pilnuje tego tak samo jak test treści stron.

## 3. Wygląd (plansza 08)

- **Układ:** szerokość 600 px, tabele, style wpisane w elementy (inline). Bez zewnętrznego CSS i bez fontów z sieci. Font: `Arial, Helvetica, sans-serif`, nagłówki pogrubione. Kolor tekstu `#121613`, tekst drugorzędny `#4F5650`, tło ramki `#F3F5FA` (Biznes) albo `#ECEEE8` (Instalacje, Software).
- **Góra:** pasek 5 px w kolorze linii, pod nim logo i po prawej „Zgłoszenie **{numer}**”.
- **Logo:** oficjalny znak poziomy z księgi znaku. Plik PNG `public/brand/mail/prokom-<linia>_mail.png` (564×132, białe tło), wyświetlany w rozmiarze 188×44, z `alt="PRO-KOM <Linia>"`. Dołączany do maila inline jako `cid:logo` (ADR-024 pkt 3).
- **Kolory:**

  | Linia | Pasek / akcent | Przycisk (tło, biały tekst) | Tekst akcentu na jasnym | Tło karty |
  |---|---|---|---|---|
  | Biznes | `#244FB0` | `#244FB0` | `#244FB0` | `#F3F5FA` |
  | Instalacje | `#0093B3` | `#007A96` | `#006A82` | `#ECEEE8` |
  | Software | `#8B61E3` | `#6E45D4` | `#5B33C4` | `#ECEEE8` |

  Kontrast przycisków i tekstu akcentu ≥ 4,5:1 (AA). Biały tekst na `#8B61E3` ma za mały kontrast, dlatego przycisk Software jest w `#6E45D4`.
- **Ciemny motyw:** `<meta name="color-scheme" content="light">` i `supported-color-schemes`. Gmail na iPhonie i Outlook na Windows i tak odwracają kolory, dlatego logo ma białe tło z marginesem, a żadna informacja nie zależy tylko od koloru (plansza 08 pokazuje symulację).
- **Preheader:** ukryty tekst na początku maila. Klient widzi go w skrzynce zaraz po temacie (§4).
- Bez zewnętrznych obrazków poza logo, bez pikseli śledzących i bez parametrów `utm` w linkach.

## 4. Treści

### 4.1 Potwierdzenie — wspólny szkielet
1. Pasek, logo, „Zgłoszenie {numer}”.
2. Plakietka „✓ Wysłane {dziś|data}, {godzina}” (czas Europe/Warsaw).
3. H1 (Biznes: „Mamy Twoje zapytanie.”, pozostałe linie: „Mamy Twoje zgłoszenie.”), a pod nim lead z obietnicą linii.
4. Karta „Twoje zgłoszenie”. Trafiają do niej **tylko** wartości wybierane z listy:
   - rodzaj formularza (`INQUIRY_TYPE_LABELS`, np. „Lista zapytania · 3 pozycje”, „Twój projekt · 2 pozycje”),
   - pozycje: ilość × nazwa z bazy, przy czym **notatek do pozycji nie pokazujemy**,
   - Instalacje: usługi (`serviceLabel`),
   - Software: tematy (`SOFTWARE_TOPIC_LABELS`).

   Nigdy nie pokazujemy: imienia, firmy, NIP, telefonu, miejscowości, wiadomości, adresu strony, odpowiedzi tekstowych z kreatora. Pustą kartę ukrywamy.
5. „Co dalej”: 3 kroki z §4.2. Pierwszy krok ma wyróżnione kółko z numerem.
6. Ramka „Sprawa pilna? Zadzwoń — pn–pt 9:00–17:00” z przyciskiem `tel:` z numerem linii. Godziny bierzemy z `CompanyData`.
7. „Chcesz coś dopisać? Odpowiedz na tę wiadomość — trafi prosto do nas, na **{e-mail linii}**.”
8. Stopka na tle karty: znak linii w mniejszym rozmiarze i domena, potem `PRO-KOM Tadeusz Wójciak · {adres} · NIP {nip}`, potem „Wiadomość wysłana automatycznie po wysłaniu formularza na {domena}. Nie zapisujemy Cię na żaden newsletter.”, potem „Jeśli to nie Ty wysłałeś(-aś) formularz, zignoruj tę wiadomość.”, na końcu linki „Polityka prywatności” i „Strona {domena}”.

### 4.2 Teksty linii (`lineCopy.ts`)

| | Biznes | Instalacje | Software |
|---|---|---|---|
| **Temat** | `Mamy Twoje zapytanie {nr}` | `Mamy Twoje zgłoszenie {nr}` | `Mamy Twoje zgłoszenie {nr}` |
| **Preheader** | `Oddzwonimy w 60 minut (w godzinach pracy). Co dalej — w środku.` | `Odpowiemy w 24 h w dni robocze. Co dalej — w środku.` | `Odpowiemy w 1 dzień roboczy. Podgląd i wycena w 5–7 dni.` |
| **Lead** | `Dziękujemy. W godzinach pracy oddzwonimy w ciągu 60 minut, a potem przygotujemy wycenę na piśmie. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.` | `Dziękujemy za kontakt. Odpowiemy na zgłoszenie w ciągu 24 godzin w dni robocze — oddzwonimy albo odpiszemy.` | `Dziękujemy. Odpowiemy w ciągu 1 dnia roboczego. Zobaczysz projekt, zanim zapłacisz.` |
| **Krok 1** | **Sprawdzamy dostępność i wersje** — Dobieramy modele do Twojej firmy — bez zgadywania. | **Oddzwaniamy i dopytujemy o obiekt** — Kilka pytań o budynek, łącze i to, co ma działać. | **Czytamy i dopytujemy** — Odezwiemy się z kilkoma pytaniami o firmę i cele. |
| **Krok 2** | **Dzwonimy, żeby doprecyzować** — Krótko: liczba stanowisk, programy, termin. | **Wycena ze zdjęć albo wizyta** — Często wystarczą zdjęcia — jeśli nie, umawiamy wizytę na miejscu. | **Podgląd i wycena w 5–7 dni** — Podgląd do klikania i wycena na piśmie. |
| **Krok 3** | **Wysyłamy wycenę na piśmie** — Z cenami, terminem i tym, co robimy na miejscu. | **Oferta z zakresem i terminem** — Na piśmie: co montujemy, kiedy i za ile. | **Startujemy po akceptacji** — Termin i etapy ustalamy razem. |

**Źródła obietnic:**
- Biznes: 60 minut, decyzja szefa 27.10. Tak samo jak na stronie (`homeFacts.ts`, `k4Pages.ts`).
- Instalacje: 24 h, decyzja szefa 26.10. „24 h” oznacza odpowiedź, a nie przyjazd technika.
- Software: 1 dzień roboczy i 5–7 dni (`software-cennik.md`).

Inny rodzaj formularza nie zmienia tekstów. Wyjątek: Software „audit”, który ma lead „Dziękujemy. Raport z bezpłatnego audytu wyślemy w ciągu 2 dni roboczych.” i kroki „Sprawdzamy stronę” / „Raport w 2 dni robocze” / „Krótka rozmowa o wynikach”.

### 4.3 Powiadomienie (dla nas)
- **Temat:** `[<Linia>] {nr} · {rodzaj}{ (N poz.)} · {firma || imię}`, np. `[Biznes] PKB-2026-0142 · Lista zapytania (3 poz.) · Hotel pod Luboniem`. Temat w jednej linii (`oneLine`), skrócony do 140 znaków.
- **HTML:**
  - plakietka „NOWE · <Linia>”, obok rodzaj formularza i liczba pozycji, po prawej numer,
  - H1 `{firma} · {imię}`,
  - przyciski „Zadzwoń {telefon}” (`tel:`, tylko gdy jest telefon) i „Otwórz w panelu →”,
  - siatka 2×N: e-mail (`mailto:`), telefon, preferowany kontakt i termin, miejscowość, NIP, adres strony, źródło (ścieżka strony),
  - blok „Wiadomość klienta” (z escapowaniem, łamanie linii zachowane),
  - pozycje z notatkami, odpowiedzi kreatora,
  - stopka meta: „Wysłane {data godzina} · zgoda RODO ✓ wersja {v} · zgoda marketingowa tak/nie · potwierdzenie do klienta: wysłane / pominięte — limit 3 na dobę / brak e-maila · utm …”.
- **Tekst:** obecna treść `notificationEmail`, uzupełniona o status potwierdzenia.

## 5. Część tekstowa (zawsze)
Każdy mail ma `text` i `html`. Tekst potwierdzenia zawiera te same informacje co HTML w tej samej kolejności: obietnicę, kartę, 3 kroki, telefon, godziny, stopkę z adresem i NIP. Linki piszemy wprost, np. `Polityka prywatności: https://…`.

## 6. Zasady (bezpieczeństwo, dostarczalność, prawo)
1. **Bez treści klienta w potwierdzeniu** (§4.1 pkt 4). Każdy może wpisać w formularz cudzy adres, więc mail nie może nieść tego, co ktoś napisał do obcej osoby, i nie może posłużyć jako przekaźnik spamu. Powitanie to samo „Dzień dobry,”, bez imienia.
2. **Escapowanie** wszystkich wartości w HTML (`& < > " '`), zarówno w treści, jak i w atrybutach. W nagłówkach `oneLine`. W linkach tylko adresy, które sami budujemy: `tel:` z cyfr, `mailto:` po walidacji schematem, `https://` z `siteOrigin` i panelu.
3. **Limit potwierdzeń:** najwyżej 3 na adres e-mail na 24 h (okno przesuwne), dla wszystkich linii łącznie. Klucz: `HMAC-SHA256(PAYLOAD_SECRET, lower(trim(email)))`, bo surowego adresu nie trzymamy w pamięci (ADR-003). Limit działa w pamięci procesu, jak obecny limiter IP, a restart go zeruje (akceptowalne przy jednym kontenerze). Po przekroczeniu potwierdzenia nie wysyłamy, zapytanie zapisuje się normalnie, a powiadomienie dostaje status „pominięte — limit”. Log zapisuje tylko `{ tenant, inquiry, confirmation: 'limited' }`.
4. **Nadawca:** `kontakt@` linii (nie `noreply`), SPF, DKIM i DMARC wyrównane z domeną (S10d, `docs/dns.md`). Nazwa nadawcy pochodzi z etykiety linii (`PRO-KOM Biznes`), a nie z `MAIL_FROM_NAME`. `MAIL_FROM_NAME` zostaje dla maili systemowych Payload.
5. **Rozmiar:** HTML potwierdzenia < 30 KB (Gmail ucina maile od ok. 102 KB), logo ≤ 20 KB.
6. **Bez treści marketingowych** w potwierdzeniu (to wiadomość transakcyjna): bez promocji i bez zapisu do newslettera. W stopce firma, adres, NIP i link do polityki prywatności (obowiązek informacyjny usługodawcy, art. 5 UŚUDE).
7. **Błąd wysyłki nie psuje formularza:** zapytanie jest źródłem prawdy, klient dostaje 201, błąd idzie do logu (tak jak dziś).

## 7. Podgląd i testy ręczne
- `/_maile` to strona podglądu: 3 linie × 2 maile × (HTML | tekst), na przykładowych danych. Działa tylko lokalnie i na stagingu, przy `SITE_ENV=production` zwraca 404. Nie trafia do sitemap, ma `noindex`.
- `pnpm mail:samples <adres>` wysyła 6 maili przykładowych przez prawdziwych nadawców linii. Działa lokalnie (Mailpit) i na stagingu (dopisek w runbooku). Na produkcji odmawia.
- Programy pocztowe do sprawdzenia przed scaleniem (lista w PR z zaznaczeniem):
  - Gmail: web, Android, iOS z ciemnym motywem,
  - Outlook: desktop Windows, Outlook.com,
  - Apple Mail iOS,
  - Thunderbird,
  - mail-tester ≥ 9/10 dla każdej linii.

## 8. Testy automatyczne (vitest)
- potwierdzenie każdej linii: temat, preheader, lead i kroki z `lineCopy`, numer telefonu z `SiteSettings`, adres i NIP z `CompanyData`;
- potwierdzenie **nie zawiera** imienia, firmy, NIP, telefonu klienta, miejscowości, wiadomości ani notatek do pozycji (dane testowe z unikalnymi znacznikami);
- HTML: escapowanie (`<script>` w nazwie firmy → `&lt;script&gt;` w powiadomieniu), `cid:logo`, `lang="pl"`, preheader, rozmiar < 30 KB, brak `http://`;
- tekst: zawiera obietnicę, kroki, telefon i NIP;
- limit: 3 potwierdzenia przechodzą, czwarte jest pominięte, po 24 h znowu działa (zegar wstrzyknięty); wielkość liter i spacje w adresie nie omijają limitu;
- nadawca: nazwa linii w `from`, `replyTo` w powiadomieniu, brak `replyTo` w potwierdzeniu;
- test literałów: `lib/mail` i `lib/inquiry/emails*` bez numerów telefonów, NIP i adresów.
