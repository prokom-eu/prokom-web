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

## Poczta (S10d) — hosting poczty w Seohost
Skrzynki stron i wysyłka z formularzy: **hosting poczty Seohost** (DirectAdmin `srv128408.seohost.com.pl`, serwer `91.236.131.99`, kupiony 2.11.2026, 10 GB). Domeny dodane w hostingu (bez SSL i PHP — strony są na VPS): prokombiznes.pl, prokomsoftware.pl, prokominstalacje.pl, prokomgaming.pl. Skrzynki: **`kontakt@<domena>`** (adres na stronie — decyzja Krystiana 1.11; 2000 MB, limit 300 wysłanych dziennie), hasła w menedżerze haseł („Poczta kontakt@<domena>”). Aplikacja wysyła z `kontakt@` strony (`MAIL_SENDERS`, `.env.example`).

**Hosting sam nie zmienia naszego DNS** — strefy są w Seohost → DNS → Strefy DNS (`dns1/dns2.microhost.pl`). Rekordy poczty przepisujemy stamtąd z panelu hostingu (Zarządzanie kontami → Zarządzanie DNS, domena wybrana w prawym górnym rogu), **bez** rekordów A `@`/`www` hostingu (te zostają na VPS).

Rekordy poczty w strefie **każdej z trzech domen** (`<d>` = domena):

| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| A | mail | `91.236.131.99` | 3600 | serwer poczty (MX, IMAP/SMTP w programach pocztowych) | do ustawienia |
| MX | @ | `10 mail.<d>.` | 3600 | poczta przychodząca do skrzynek w hostingu | do ustawienia |
| TXT | @ | `v=spf1 redirect=_spf-h99.microhost.pl` | 3600 | SPF: serwery wysyłkowe Seohost (`_spf-h99` = adresy `213.239.133.161–165`, `-all`); **jedyny** SPF w domenie — VPS poczty nie wysyła | do ustawienia |
| TXT | x._domainkey | DKIM — klucz domeny niżej | 3600 | podpis DKIM (hosting podpisuje wysyłkę) | do ustawienia |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:kontakt@<d>` | 3600 | DMARC: start bez odrzucania, raporty na `kontakt@`; po 2–4 tygodniach bez problemów `p=quarantine` (fundament S10) — hosting proponuje od razu `quarantine` | do ustawienia |
| SRV | _autodiscover._tcp | `10 10 443 autodiscover-h99.seohost.pl.` | 3600 | automatyczna konfiguracja Outlooka i telefonu | do ustawienia |

Klucze DKIM (`x._domainkey`, wartość 1:1 z panelu hostingu):
- prokombiznes.pl: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqWY1MRlB9hE6QjzqEgFNuj/rKXteZ3v+Rsf8bcBluEQ0Hr/cBsU4oK3fYmHmqyyCtjIRgHy2on6bXOv/ItrsT16uf15XllyVLaZnPUcjqCCP7bGg/9Z3cED/QR1qMW1cf5ZbLckVDpnFJLkfRqj/OEq34ZI1CaU+j7b0w89+PkGwaVUxHQNqHWe8i8U6YICOvmO0b+eA9UFN3Ooi3x4ziMGOey7iyx9Nsl+H6wyxqaluvHS0Al0cQ8FPCanuiAwyzFaic3oUfeNt0qwX99f1phVgMzugilvmoKM48skJbGwzEGs/kch+6KZ6PRP8ev8SwOpRR9UANQCJRNCwolmd5wIDAQAB`
- prokomsoftware.pl: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1URH15Tj0qK6SyYPpFHM1AGRYrFpDkqmFuoE3TIDxCJiBg8A7K1yP+9KR19621u46OY1xCjQx3u+lQNJeL8+WdpJP5AEvNQJE4HsdvL1v9ds1541wCt7r3FzBkCsDnrg+QA7X0vg45hcTMMKU50Js0HwEYCJecsPdGwLoTgjB9uCCKxQMolIneV4ce5u/9DglrPHEpsp7rzijjexX/46kP7aWx5aVRv7gaJc3UtRvZJjuXuYqoSVGebAZ8bdVy5gGqa+L74YFSfsE4nQ+0R27ThX6eswHBcbuuGqeRJDgxpC2dd+vJ/grJZ4QC7uaT1c9CCA/jwPkQwa6nolqEPZHwIDAQAB`
- prokominstalacje.pl: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk8lIq3RZLTI0hAU/Wp/DpZ2rjKUUDxJhJpKiG6lqjrz/V1u8Sz23wvr5ZDmAN9uuFsN4NKnST1G56bV+uMX5+y5ocalAk5QtT87nZwijIDYvYEO4sTthk+Sx+LoIpXq8el85dzxN6G06cQHmcaceaChpdP6h4QrWNaHJvM9JvtzMbpLvtDnoQ/HXvk+l7Vy6mex+4Cg/APAaYmv/1e9zO0yQHyoOenKbLzCI4rsDFEJjU/Mlw6u+2ocq/q5rSbUPsW0MckGFeSYcsBGN3DVVBQq0c2JbGE9Gnh/+E4cns4b/zAHY5pT4edoeft3a4roNnhN62SX1qjOxa3TPluWNlQIDAQAB`

**prokomgaming.pl** (osobne repo Gaming): delegacja `ns1/ns2.seohost.pl` — strefę obsługuje **sam hosting** (rekordy jak wyżej utworzył panel hostingu automatycznie, razem z A `@`/`www` → `91.236.131.99`, czyli serwer hostingu). Gdy Gaming ma działać na VPS: A `@`/`www` → `194.28.50.70` w panelu hostingu (Zarządzanie DNS) albo przeniesienie strefy do microhost — decyzja w repo Gaming, zapis tutaj.

- Weryfikacja: wysyłka testowa do mail-tester.com — wynik i data: TODO.
- Kontrola: mail z formularza na stagingu dochodzi do Gmail i Outlook poza spamem (warunek S10): TODO.

## Historia zmian DNS
| Data | Domena | Zmiana | Kto | PR |
|---|---|---|---|---|
| 31.10.2026 | prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl | strefy w Seohost (`@`, `www`, `staging`; prokombiznes.pl także `panel.staging`) → 194.28.50.70; delegacja `ns1/ns2.seohost.pl` → `dns1/dns2.microhost.pl` | Krystian | #185 |
