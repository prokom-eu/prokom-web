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
| prokomgaming.pl | Seohost; DNS `dns1/dns2.microhost.pl` (od 2.11) | PRO-KOM | TODO | 31.10.2027 | Gaming (osobne repo); tu tylko DNS i poczta |
| pro-kom.eu | `TODO(krystian)`: nazwa.pl czy już Seohost? (migracja — ADR-002) | PRO-KOM | TODO | TODO | obecna strona + **poczta firmy**; panel produkcji przeniesiony na `panel.prokombiznes.pl` (09.11) |

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
| A | panel | `<IP>` | 3600 | panel produkcji (`PANEL_HOST`, decyzja 09.11 — ADR-006 „Rozstrzygnięcie 09.11”) | ustawione 9.11 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → przekierowanie 301 na wersję bez `www` (od produkcji) | ustawione 31.10 |

### prokominstalacje.pl
| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | serwery DNS strefy z panelu Seohost | ustawione 31.10 |
| A | staging | `<IP>` | 3600 | staging za hasłem (S10) | ustawione 31.10 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → 301 bez `www` (od produkcji) | ustawione 31.10 |
| TXT | @ | `v=spf1 redirect=_spf-h99.microhost.pl` | 3600 | SPF domyślny Seohost (poczta linii idzie przez SMTP Seohost) | był w strefie, dopisany tu 13.11 |
| TXT | @ | `google-site-verification=_qaCDRQ0J62tYjdZxPc34M3e-tEuWfTm0MGfKKUEi_E` | 3600 | weryfikacja Search Console (usługa typu Domena) — nie usuwać, Google sprawdza okresowo | do dodania 13.11 |

### prokomsoftware.pl
| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | serwery DNS strefy z panelu Seohost | ustawione 31.10 |
| A | staging | `<IP>` | 3600 | staging za hasłem (S10) | ustawione 31.10 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → 301 bez `www` (od produkcji) | ustawione 31.10 |

### Panel (Payload)
Produkcja: **`panel.prokombiznes.pl`** (`PANEL_HOST`, decyzja Krystiana 09.11, ADR-006 „Rozstrzygnięcie 09.11”; A → `<IP>` w strefie prokombiznes.pl). Dawny plan `panel.pro-kom.eu` odłożony: ta nazwa wskazuje dziś inny serwer (`85.128.169.153`), a strefa pro-kom.eu z pocztą firmy nie jest u nas — można ją dodać później jako drugi adres panelu. Panel stagingu: **`panel.staging.prokombiznes.pl`** (31.10, A → `<IP>` w strefie prokombiznes.pl). Dlaczego nie w pro-kom.eu — jeśli strefa pro-kom.eu jest jeszcze w nazwa.pl, zmiana tam to rekord w strefie z pocztą firmy; prościej na start `panel.staging.prokombiznes.pl` (A → `<IP>`, strefa w Seohost), a `panel.pro-kom.eu` dopiero przy produkcji. Wybrany adres trafia do `STAGING_PANEL_HOST` w `.env.proxy` i `PANEL_HOST` w `.env.staging`, do certyfikatu `prokom-staging` i do tabeli niżej.

### pro-kom.eu
Strefa: `TODO(krystian)` — nazwa.pl albo Seohost (tabela „Domeny”). **Nie zmieniamy MX/SPF/DKIM/DMARC bez osobnego planu migracji poczty (ADR-002).** Przed pierwszą zmianą: przepisać tutaj aktualny stan strefy 1:1 (to jest nasz punkt powrotu).

## Poczta (S10d) — hosting poczty w Seohost
Skrzynki stron i wysyłka z formularzy: **hosting poczty Seohost** (DirectAdmin `srv128408.seohost.com.pl`, serwer `91.236.131.99`, kupiony 2.11.2026, 10 GB). Domeny dodane w hostingu (bez SSL i PHP — strony są na VPS): prokombiznes.pl, prokomsoftware.pl, prokominstalacje.pl, prokomgaming.pl. Skrzynki: **`kontakt@<domena>`** (adres na stronie — decyzja Krystiana 1.11; 2000 MB, limit 300 wysłanych dziennie), hasła w menedżerze haseł („Poczta kontakt@<domena>”). Aplikacja wysyła z `kontakt@` strony (`MAIL_SENDERS`, `.env.example`).

**Hosting sam nie zmienia naszego DNS** — strefy są w Seohost → DNS → Strefy DNS (`dns1/dns2.microhost.pl`). Rekordy poczty przepisujemy stamtąd z panelu hostingu (Zarządzanie kontami → Zarządzanie DNS, domena wybrana w prawym górnym rogu), **bez** rekordów A `@`/`www` hostingu (te zostają na VPS).

Rekordy poczty w strefie **każdej z trzech domen** (`<d>` = domena):

| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| A | mail | `91.236.131.99` | 3600 | serwer poczty (MX, IMAP/SMTP w programach pocztowych) | ustawione 2.11 |
| MX | @ | `10 mail.<d>.` | 3600 | poczta przychodząca do skrzynek w hostingu | ustawione 2.11 |
| TXT | @ | `v=spf1 redirect=_spf-h99.microhost.pl` | 3600 | SPF: serwery wysyłkowe Seohost (`_spf-h99` = adresy `213.239.133.161–165`, `-all`); **jedyny** SPF w domenie — VPS poczty nie wysyła | ustawione 2.11 |
| TXT | x._domainkey | DKIM — klucz domeny niżej | 3600 | podpis DKIM (hosting podpisuje wysyłkę) | ustawione 2.11 |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:kontakt@<d>` | 3600 | DMARC: start bez odrzucania, raporty na `kontakt@`; po 2–4 tygodniach bez problemów `p=quarantine` (fundament S10) — hosting proponuje od razu `quarantine` | ustawione 2.11 |

Bez rekordu SRV `_autodiscover._tcp`: panel Seohost (Strefy DNS) go nie publikuje (2.11, sprawdzone na `dns1`/`dns2`) — w programach pocztowych ustawienia ręcznie: serwer **`h99.seohost.pl`** dla IMAP i SMTP (ten sam serwer `91.236.131.99`; jego certyfikat `*.seohost.pl` pasuje na 993 i 465 — `mail.<d>` i `srv128408.seohost.com.pl` dają w Thunderbirdzie ostrzeżenie: na 993 certyfikat jest `*.seohost.pl`, na 465 `srv128408…`), IMAP 993 (SSL/TLS), SMTP 465 (SSL/TLS), normalne hasło, login = pełny adres. Aplikacja na serwerze: `srv128408.seohost.com.pl:465` (certyfikat SMTP na tę nazwę). W panelu stref: zamiast `@` pełna nazwa domeny, TXT bez cudzysłowów, nazwy i wartości bez kropki na końcu.

Klucze DKIM (`x._domainkey`, wartość 1:1 z panelu hostingu):
- prokombiznes.pl: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqWY1MRlB9hE6QjzqEgFNuj/rKXteZ3v+Rsf8bcBluEQ0Hr/cBsU4oK3fYmHmqyyCtjIRgHy2on6bXOv/ItrsT16uf15XllyVLaZnPUcjqCCP7bGg/9Z3cED/QR1qMW1cf5ZbLckVDpnFJLkfRqj/OEq34ZI1CaU+j7b0w89+PkGwaVUxHQNqHWe8i8U6YICOvmO0b+eA9UFN3Ooi3x4ziMGOey7iyx9Nsl+H6wyxqaluvHS0Al0cQ8FPCanuiAwyzFaic3oUfeNt0qwX99f1phVgMzugilvmoKM48skJbGwzEGs/kch+6KZ6PRP8ev8SwOpRR9UANQCJRNCwolmd5wIDAQAB`
- prokomsoftware.pl: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1URH15Tj0qK6SyYPpFHM1AGRYrFpDkqmFuoE3TIDxCJiBg8A7K1yP+9KR19621u46OY1xCjQx3u+lQNJeL8+WdpJP5AEvNQJE4HsdvL1v9ds1541wCt7r3FzBkCsDnrg+QA7X0vg45hcTMMKU50Js0HwEYCJecsPdGwLoTgjB9uCCKxQMolIneV4ce5u/9DglrPHEpsp7rzijjexX/46kP7aWx5aVRv7gaJc3UtRvZJjuXuYqoSVGebAZ8bdVy5gGqa+L74YFSfsE4nQ+0R27ThX6eswHBcbuuGqeRJDgxpC2dd+vJ/grJZ4QC7uaT1c9CCA/jwPkQwa6nolqEPZHwIDAQAB`
- prokominstalacje.pl: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk8lIq3RZLTI0hAU/Wp/DpZ2rjKUUDxJhJpKiG6lqjrz/V1u8Sz23wvr5ZDmAN9uuFsN4NKnST1G56bV+uMX5+y5ocalAk5QtT87nZwijIDYvYEO4sTthk+Sx+LoIpXq8el85dzxN6G06cQHmcaceaChpdP6h4QrWNaHJvM9JvtzMbpLvtDnoQ/HXvk+l7Vy6mex+4Cg/APAaYmv/1e9zO0yQHyoOenKbLzCI4rsDFEJjU/Mlw6u+2ocq/q5rSbUPsW0MckGFeSYcsBGN3DVVBQq0c2JbGE9Gnh/+E4cns4b/zAHY5pT4edoeft3a4roNnhN62SX1qjOxa3TPluWNlQIDAQAB`

**prokomgaming.pl** (osobne repo Gaming): od 2.11 delegacja `dns1/dns2.microhost.pl` (wcześniej `ns1/ns2.seohost.pl` — strefa z hostingu). Strefa w Seohost → Strefy DNS jak pozostałe: A `@`/`www` → `194.28.50.70` (na start — Nginx zamyka połączenie dla nieznanej domeny; Gaming zmienia je, gdy ruszy) i te same rekordy poczty, DKIM: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5/ZbdgBd4SvAZy+PVGZ8guzRNm87QzSOnjwKDjyHWh5htswo8ka9zlTRwZ6MRs6U0c3YvyHRT3KyxdsaxSLZLpL0yPjm67EeDNAWxZUNJXKimK9NG5AhrF/pE7q3HFAEF69Alc7NZ/KoJnPWA3BhWyAEz5uGEhZTzyKnKOkZHkIsnt4NXgvaQaVKyPtDtpiBypwQiTUul9Kj4CblKQKdSJB/DQNe2oEM8tbvLgpnbSIb1+pG+0GPBejf/I0YK8Mm4amZ27qZXqoa8b/NlccfyWz4/Ioz7fESDKiISYNBrXpgZ7aed8ngcPidJkeqOwXf0Fcrxg+k8OE3OMF89l45+QIDAQAB`. Zmiany rekordów Gaming — zapis tutaj (jedno miejsce dla DNS firmy). **Staging Gaming (G16):** A `staging` → `194.28.50.70` (TTL 3600) — do ustawienia przed certyfikatem `prokom-gaming-staging` (runbook Gaming §1); panel Gaming jest pod `/admin` tej samej domeny, bez osobnej subdomeny.

- **Weryfikacja 2.11.2026:** mail-tester.com **10/10** dla `kontakt@prokombiznes.pl`, `kontakt@prokomsoftware.pl`, `kontakt@prokominstalacje.pl` (SPF, DKIM, DMARC zgodne, serwer poza czarnymi listami; `scripts/server/mail-test.sh`).
- **Kontrola skrzynek 2.11.2026:** Gmail — wszystkie trzy w „Odebranych → Główne”. Outlook (konto uczelniane Microsoft 365) — Biznes i Software w „Priorytetowych”, **Instalacje w Wiadomościach-śmieciach** przy pełnej autoryzacji (`spf=pass`, `dkim=pass`, `dmarc=pass`, `compauth=pass`; `SCL:5`, `SFV:SPM` — ocena treści/reputacji nowej domeny, nie konfiguracji). Działania: „To nie jest wiadomość-śmieć”, test prawdziwego formularza Instalacji po scaleniu S10d, ponowny test Outlooka ok. 16.11; DMARC `quarantine` ok. 30.11.
- **Wysyłka z aplikacji:** SMTP `srv128408.seohost.com.pl:465` (SSL; certyfikat jest na tę nazwę, nie na `mail.<d>`), login = pełny adres skrzynki; `scripts/server/mail-login.sh <stos>` zapisuje to w `.env.<stos>` po sprawdzeniu hasła prawdziwym logowaniem. Gaming (osobne repo): te same dane z `kontakt@prokomgaming.pl`.
- DMARC: po 2–4 tygodniach bez problemów (raporty na `kontakt@`) zmiana na `p=quarantine` — `TODO`: ok. 30.11.2026.

## Historia zmian DNS
| Data | Domena | Zmiana | Kto | PR |
|---|---|---|---|---|
| 9.11.2026 | prokombiznes.pl | A `panel` → 194.28.50.70 — panel produkcji | Krystian | `docs/panel-produkcji-prokombiznes` |
| 2.11.2026 | prokombiznes.pl, prokomsoftware.pl, prokominstalacje.pl | rekordy poczty: A `mail`, MX, SPF, DKIM `x._domainkey`, DMARC `p=none` (hosting poczty Seohost) | Krystian | S10d |
| 2.11.2026 | prokomgaming.pl | delegacja `ns1/ns2.seohost.pl` → `dns1/dns2.microhost.pl`; nowa strefa: A `@`/`www` → 194.28.50.70, rekordy poczty jak wyżej | Krystian | S10d |
| 31.10.2026 | prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl | strefy w Seohost (`@`, `www`, `staging`; prokombiznes.pl także `panel.staging`) → 194.28.50.70; delegacja `ns1/ns2.seohost.pl` → `dns1/dns2.microhost.pl` | Krystian | #185 |
