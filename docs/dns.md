# Domeny i DNS

Plik jest dokumentacją stanu DNS wszystkich domen projektu. **Zasada: każda zmiana najpierw tutaj (PR), potem u dostawcy.** Gdy coś przestaje działać (strona, poczta, certyfikat), porównujemy rzeczywistość z tym plikiem zamiast zgadywać.

Sprawdzenie rekordu z PowerShell: `Resolve-DnsName prokombiznes.pl -Type A` (typy: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`).

## Zasady własności (obowiązują od zakupu)
- **Abonent domeny: firma** PRO-KOM Tadeusz Wójciak (dane firmy, NIP), nie osoba prywatna.
- **Konto u rejestratora na firmowy e-mail** (`admin@pro-kom.eu` lub inny firmowy), nie na prywatną skrzynkę developera — domeny zostają w firmie niezależnie od tego, kto przy nich pracuje.
- Na koncie rejestratora: **2FA** i **automatyczne odnawianie** z aktualną metodą płatności. Wygaśnięcie domeny = strona i poczta znikają.
- Hasło i **kody odzyskiwania 2FA** w menedżerze haseł (wpis „Rejestrator domen — <dostawca>”). Dostęp ma Krystian; szef wie, gdzie są (procedura awaryjna).
- Data wygaśnięcia każdej domeny w tabeli niżej; przypomnienie w kalendarzu na 30 dni przed — na wypadek, gdyby automatyczne odnowienie się nie udało.

## Domeny
| Domena | Rejestrator / DNS | Abonent | Autoodnawianie | Wygasa | Przeznaczenie |
|---|---|---|---|---|---|
| prokombiznes.pl | Seohost (ADR-019); DNS `dns1/dns2.microhost.pl` | PRO-KOM | TODO | 31.10.2027 | strona Biznes (tenant `biznes`) |
| prokominstalacje.pl | Seohost; DNS `dns1/dns2.microhost.pl` | PRO-KOM | TODO | 31.10.2027 | strona Instalacje (tenant `instalacje`) |
| prokomsoftware.pl | Seohost; DNS `dns1/dns2.microhost.pl` | PRO-KOM | TODO | 31.10.2027 | strona Software (tenant `software`) |
| pro-kom.eu | `TODO(krystian)`: nazwa.pl czy już Seohost? (migracja — ADR-002) | PRO-KOM | TODO | TODO | obecna strona + **poczta firmy**; panel `panel.pro-kom.eu` (S10) |

Serwer: **VPS webh.pl** (ADR-019, `vm280605`, Łódź), IPv4 **`194.28.50.70`**, IPv6 — brak (nie dodajemy rekordów AAAA; gdyby VPS dostał IPv6, dopisujemy AAAA obok każdego A). Kolumny TODO w tabeli wyżej — z panelu Seohost.

## Rekordy
Wpisujemy wszystkie rekordy, także te ustawione domyślnie przez dostawcę. TTL przy zwykłej pracy: 3600; dzień przed planowaną zmianą IP lub migracją obniżamy do 300, po zmianie wracamy do 3600.

Strefy założone 31.10 w panelu Seohost (DNS → Strefy DNS); formularz wymaga IP, więc `@` i `www` od razu wskazują serwer — do startu produkcji Nginx nie ma dla nich bloku i zamyka połączenie (certyfikat produkcji powstaje przy starcie, runbook §3). `<IP>` = IPv4 VPS z akapitu „Serwer” wyżej.

### prokombiznes.pl
| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | serwery DNS strefy z panelu Seohost | ustawione 31.10 |
| A | staging | `<IP>` | 3600 | staging za hasłem (S10) | ustawione 31.10 |
| A | panel.staging | `<IP>` | 3600 | panel stagingu (S10) | ustawione 31.10 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → przekierowanie 301 na wersję bez `www` (od produkcji) | ustawione 31.10 |

### prokominstalacje.pl
| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | serwery DNS strefy z panelu Seohost | ustawione 31.10 |
| A | staging | `<IP>` | 3600 | staging za hasłem (S10) | ustawione 31.10 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → 301 bez `www` (od produkcji) | ustawione 31.10 |

### prokomsoftware.pl
| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | serwery DNS strefy z panelu Seohost | ustawione 31.10 |
| A | staging | `<IP>` | 3600 | staging za hasłem (S10) | ustawione 31.10 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → 301 bez `www` (od produkcji) | ustawione 31.10 |

### Panel (Payload)
Produkcja: `panel.pro-kom.eu` (`PANEL_HOST`, ADR-006). Panel stagingu: **`panel.staging.prokombiznes.pl`** (31.10, A → `<IP>` w strefie prokombiznes.pl). Dlaczego nie w pro-kom.eu — jeśli strefa pro-kom.eu jest jeszcze w nazwa.pl, zmiana tam to rekord w strefie z pocztą firmy; prościej na start `panel.staging.prokombiznes.pl` (A → `<IP>`, strefa w Seohost), a `panel.pro-kom.eu` dopiero przy produkcji. Wybrany adres trafia do `STAGING_PANEL_HOST` w `.env.proxy` i `PANEL_HOST` w `.env.staging`, do certyfikatu `prokom-staging` i do tabeli niżej.

### pro-kom.eu
Strefa: `TODO(krystian)` — nazwa.pl albo Seohost (tabela „Domeny”). **Nie zmieniamy MX/SPF/DKIM/DMARC bez osobnego planu migracji poczty (ADR-002).** Przed pierwszą zmianą: przepisać tutaj aktualny stan strefy 1:1 (to jest nasz punkt powrotu).

## Poczta wychodząca z formularzy (S8/S10)
Powiadomienia o zapytaniach i potwierdzenia dla klientów wychodzą z aplikacji przez SMTP. Żeby nie lądowały w spamie, domena nadawcy musi mieć:

| Rekord | Gdzie | Wartość | Uwagi |
|---|---|---|---|
| SPF | TXT na domenie nadawcy | `v=spf1 include:<serwer pocztowy dostawcy> -all` (dokładna wartość z panelu dostawcy) | **jeden** rekord SPF na domenę |
| DKIM | TXT `<selektor>._domainkey` | klucz z panelu dostawcy poczty | włączyć podpisywanie po stronie dostawcy |
| DMARC | TXT `_dmarc` | start: `v=DMARC1; p=none; rua=mailto:<adres raportów>` | po 2–4 tygodniach bez problemów: `p=quarantine` |

- Domena nadawcy: TODO — decyzja w S8 (np. `formularz@prokombiznes.pl` przez skrzynkę u Seohost albo adres w `pro-kom.eu`).
- Weryfikacja: wysyłka testowa do mail-tester.com — wynik i data tutaj: TODO.
- Kontrola: mail z formularza na stagingu dochodzi do Gmail i Outlook poza spamem (warunek S10).

## Historia zmian DNS
| Data | Domena | Zmiana | Kto | PR |
|---|---|---|---|---|
| 31.10.2026 | prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl | strefy w Seohost (`@`, `www`, `staging`; prokombiznes.pl także `panel.staging`) → 194.28.50.70; delegacja `ns1/ns2.seohost.pl` → `dns1/dns2.microhost.pl` | Krystian | #185 |
