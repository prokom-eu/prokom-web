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
| prokomserwis.pl | cyber_Folks → transfer do Seohost (w toku); DNS `dns1/dns2.microhost.pl` (od 14.11) | **prywatny (Krystian)** → zmiana na firmę zaraz po transferze | TODO | 28.04.2027 | PRO-KOM Tech — serwis (repo `prokom-system`); tu DNS i Nginx |
| pro-kom.eu | **nazwa.pl**; DNS `ns1/ns2/ns3.nazwa.pl` (potwierdzone 15.11) | PRO-KOM | TODO | TODO | obecna strona + **poczta firmy**; panel produkcji przeniesiony na `panel.prokombiznes.pl` (09.11) |

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
| TXT | @ | `google-site-verification=r-td7u3He__tBLo4yWUaEQHUDLP_q_B7Kb2SlgksAns` | 3600 | weryfikacja Search Console (usługa typu Domena) — nie usuwać, Google sprawdza okresowo; obok istniejącego SPF | ustawione 16.11 (widoczne w 8.8.8.8), Search Console: zweryfikowana |

### prokominstalacje.pl
| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | serwery DNS strefy z panelu Seohost | ustawione 31.10 |
| A | staging | `<IP>` | 3600 | staging za hasłem (S10) | ustawione 31.10 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → 301 bez `www` (od produkcji) | ustawione 31.10 |
| TXT | @ | `v=spf1 redirect=_spf-h99.microhost.pl` | 3600 | SPF domyślny Seohost (poczta linii idzie przez SMTP Seohost) | był w strefie, dopisany tu 13.11 |
| TXT | @ | `google-site-verification=_qaCDRQ0J62tYjdZxPc34M3e-tEuWfTm0MGfKKUEi_E` | 3600 | weryfikacja Search Console (usługa typu Domena) — nie usuwać, Google sprawdza okresowo | ustawione 13.11 (widoczne w 8.8.8.8 i 1.1.1.1) |
| TXT | x._domainkey | `v=DKIM1; k=rsa; p=…` (klucz z panelu Seohost) | 3600 | DKIM poczty Seohost, selektor `x` | był w strefie, dopisany tu 13.11 |

### prokomsoftware.pl
| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | serwery DNS strefy z panelu Seohost | ustawione 31.10 |
| A | staging | `<IP>` | 3600 | staging za hasłem (S10) | ustawione 31.10 |
| A | @ | `<IP>` | 86400 | strona (Seohost tworzy przy zakładaniu strefy; do startu produkcji Nginx zamyka połączenie) | ustawione 31.10 |
| A | www | `<IP>` | 86400 | `www` → 301 bez `www` (od produkcji) | ustawione 31.10 |
| TXT | @ | `google-site-verification=8zOrqzdWAT7RfJIh6jHwT-MMv_I2bvo1Qkp-NAEtEfc` | 3600 | weryfikacja Search Console (usługa typu Domena) — nie usuwać, Google sprawdza okresowo; obok istniejącego SPF | ustawione 14.11 (widoczne w 8.8.8.8 i 1.1.1.1), Search Console: zweryfikowana |

### Panel (Payload)
Produkcja: **`panel.prokombiznes.pl`** (`PANEL_HOST`, decyzja Krystiana 09.11, ADR-006 „Rozstrzygnięcie 09.11”; A → `<IP>` w strefie prokombiznes.pl). Dawny plan `panel.pro-kom.eu` odłożony: ta nazwa wskazuje dziś inny serwer (`85.128.169.153`), a strefa pro-kom.eu z pocztą firmy nie jest u nas — można ją dodać później jako drugi adres panelu. Panel stagingu: **`panel.staging.prokombiznes.pl`** (31.10, A → `<IP>` w strefie prokombiznes.pl). Dlaczego nie w pro-kom.eu — jeśli strefa pro-kom.eu jest jeszcze w nazwa.pl, zmiana tam to rekord w strefie z pocztą firmy; prościej na start `panel.staging.prokombiznes.pl` (A → `<IP>`, strefa w Seohost), a `panel.pro-kom.eu` dopiero przy produkcji. Wybrany adres trafia do `STAGING_PANEL_HOST` w `.env.proxy` i `PANEL_HOST` w `.env.staging`, do certyfikatu `prokom-staging` i do tabeli niżej.

### pro-kom.eu
Strefa: **nazwa.pl** (decyzja Krystiana 15.11; NS `ns1/ns2/ns3.nazwa.pl`). **Nie zmieniamy MX/SPF/DKIM/DMARC bez osobnego planu migracji poczty (ADR-002).**

**Stan 15.11.2026 — punkt powrotu** (z publicznego DNS, `nslookup … 8.8.8.8` i `ns1.nazwa.pl`; pełną listę rekordów przepisać z panelu nazwa.pl przed pierwszą zmianą — panel może mieć rekordy, których zapytania nie pokażą, np. DKIM pod nieznaną nazwą):

| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `ns1.nazwa.pl`, `ns2.nazwa.pl`, `ns3.nazwa.pl` | — | strefa w nazwa.pl | bez zmian |
| A | @ | `85.128.169.153` (serwer nazwa.pl) | 3600 | obecna strona **i poczta** (MX wskazuje na `pro-kom.eu`) | dziś |
| A | `*` (wildcard) | `85.128.169.153` | 3600 | każda inna nazwa, w tym `www`, `mail`, `poczta`, `smtp`, `imap`, `autodiscover`, `panel` | dziś |
| MX | @ | `10 pro-kom.eu` | — | **poczta firmy — na nazwę domeny, nie na `mail.`** | dziś |
| TXT | @ | `v=spf1 mx a ~all` | — | SPF (`a` = adres `@`) | dziś |
| TXT | @ | `MS=AC454E958B767FB1A3311B03785AFB887F793F49` | — | weryfikacja Microsoft — **nie usuwać** | dziś |
| TXT | _dmarc | `v=DMARC1; p=quarantine;` | — | DMARC | dziś |

**Uwaga przed przełączeniem strony (H7-2):** MX wskazuje na `pro-kom.eu`, a SPF ma `a` — samo przestawienie `A @` na `194.28.50.70` **przeniosłoby pocztę firmy na VPS** (VPS nie ma serwera poczty — poczta przestałaby dochodzić) i dopisało VPS do SPF. Dlatego najpierw, **co najmniej 24 h przed zmianą `A @`** (TODO(krystian): decyzja — to zmiana poczty, ADR-002):
1. `A mail` → `85.128.169.153` jako jawny rekord (dziś działa tylko przez wildcard);
2. `MX @` → `10 mail.pro-kom.eu` (zamiast `pro-kom.eu`);
3. SPF → `v=spf1 mx ip4:85.128.169.153 ~all` (zamiast `a` — po przełączeniu `a` oznaczałby VPS);
4. sprawdzić: `nslookup -type=MX pro-kom.eu 8.8.8.8`, wysłać i odebrać mail z i na adres `@pro-kom.eu` (w tym z Gmaila), nagłówki SPF/DMARC „pass”;
5. **programy pocztowe i telefony pracowników:** skoro MX to `pro-kom.eu`, skrzynki mają najpewniej IMAP/SMTP ustawione na `pro-kom.eu` — po zmianie `A @` przestałyby się łączyć (poczta na serwerze dochodziłaby dalej). Spisać ustawienia na wszystkich urządzeniach i przestawić je na `mail.pro-kom.eu` (albo nazwę serwera z panelu nazwa.pl); sprawdzić adres webmaila (jeśli jest pod `pro-kom.eu/…`, po przełączeniu zniknie) i `autodiscover`;
6. **nadawcy `@pro-kom.eu` w SPF:** w nagłówkach obecnego maila sprawdzić, z jakiego IP wysyła nazwa.pl (czy `85.128.169.153`), i czy rekord `MS=` oznacza Microsoft 365 wysyłający jako `@pro-kom.eu` (wtedy `include:spf.protection.outlook.com`). Jeśli formularze huba mają wysyłać z adresu `@pro-kom.eu` przez inny serwer (np. hosting poczty Seohost, `MAIL_SENDERS` — dziś bez `prokom`), dopisać go do SPF (`include:`/`ip4:`) **przed** startem — przy `_dmarc p=quarantine` maile bez SPF trafią do spamu. **Rozstrzygnięte 16.11:** formularze huba wysyła i odbiera `biuro@prokombiznes.pl` (Seohost, strefa prokombiznes.pl z SPF/DKIM/DMARC; nadawca „PRO-KOM”) — SPF pro-kom.eu nie musi znać nowego nadawcy.
Dopiero potem: `A @` i `A www` (jawny, przed wildcardem) → `194.28.50.70`, TTL 300 na T−48 h. Wildcard i pozostałe nazwy zostają na nazwa.pl. **Hosting poczty jest na tym samym koncie nazwa.pl co obecna strona** — koniec abonamentu (grudzień, ADR-H001) nie może wyłączyć poczty: TODO(krystian) — sprawdzić w nazwa.pl, czy poczta to osobna usługa, zanim abonament strony wygaśnie.

**Ustalone w panelu nazwa.pl 15.11:**
- Strefa pro-kom.eu jest w trybie „Przekierowanie na usługę w nazwa.pl” → hosting `pro-kom.nazwa.pl`. Rekordy A/CNAME/TXT/SRV dla subdomen dodaje się w Panelu Klienta: Domeny → pro-kom.eu → „Konfiguruj domenę” → „Dodatkowy rekord DNS”. **Nie zmieniać trybu** u góry tej strony, bo przestawiłby `@`, MX i pocztę.
- Strona i poczta firmy to **jedna usługa**: „Hosting Cloud Start” `pro-kom.nazwa.pl`, ważna do **14.12.2026**. Na tym hostingu są też `dhnet.pl`, `sklepdlafirm.pl/.com`, `pro-kom24.pl`, `muzykanawesele.com.pl` i subdomeny pro-kom.eu (sklep, komis, extranet, test, demo…). Nie wypowiadać przed decyzją o poczcie i tych domenach (ADR-002). TODO(krystian): przedłużenie do 14.12.
- Dysk poczty i baz danych w CloudHosting Panel: **124,7 GB zajęte, 0,3 GB wolne** (15.11). Pełny dysk = poczta przestaje przyjmować wiadomości. TODO(krystian): porządki w skrzynkach albo „Dodatkowy dysk”.
- CAA zezwala na `letsencrypt.org` (certyfikat `prokom-staging` z `--expand` przejdzie), DNSSEC aktywny.

**Decyzja 15.11 (audyt gotowości):** domena i poczta pro-kom.eu zostają w nazwa.pl **co najmniej do końca listopada 2026**. Przełączenie strony tylko w tej kolejności — kolejny krok dopiero, gdy poprzedni jest sprawdzony:

| Krok | Co | Kiedy | Sprawdzenie |
|---|---|---|---|
| (a) | `A mail` → `85.128.169.153`, `MX @` → `10 mail.pro-kom.eu`, SPF bez `a` (`v=spf1 mx ip4:85.128.169.153 ~all`) | **≥ 24 h przed** (c) | `nslookup -type=MX pro-kom.eu 8.8.8.8`, `nslookup mail.pro-kom.eu 8.8.8.8` |
| (b) | test poczty (wysłanie i odbiór z/na `@pro-kom.eu`, także Gmail; SPF/DMARC „pass”) i przestawienie programów pocztowych i telefonów pracowników na `mail.pro-kom.eu` (pkt 4–6 wyżej) | po propagacji (a) | każda skrzynka wysyła i odbiera po zmianie ustawień |
| (c) | dopiero potem `A @` i `A www` → `194.28.50.70` (TTL 300 na T−48 h) | po (b), z akceptacją szefa (produkcja) | `bash scripts/smoke.sh https://pro-kom.eu`, mail testowy po przełączeniu |

**Ryzyko:** poczta firmy jest na tym samym hostingu nazwa.pl co stara strona — **nie wyłączać ani nie wypowiadać abonamentu** strony bez osobnej decyzji o poczcie (ADR-002).

**Poczta `@pro-kom.eu` przy przełączeniu strony (16.11, ustalenia z publicznego DNS i certyfikatów, przed odpowiedzią nazwa.pl):**

Pocztę `@pro-kom.eu` używają wszyscy pracownicy (Krystian, 16.11). Musi działać bez przerwy, a skrzynki zostają na hostingu `pro-kom.nazwa.pl`.

Pełna strefa z `ns1.nazwa.pl` (16.11) — punkt powrotu i lista do przepisania przy ręcznym DNS:

| Typ | Nazwa | Wartość |
|---|---|---|
| NS | @ | `ns1/ns2/ns3.nazwa.pl` |
| A | @ | `85.128.169.153` |
| A | `*` (wildcard; dziś obsługuje m.in. `www`, `mail`, `poczta`, `smtp`, `imap`, `autodiscover`, `sklep`, `komis`, `extranet`, `test`, `demo`, `dj`, `full`, `zaleglosci`) | `85.128.169.153` |
| A | staging | `194.28.50.70` (dodany 15.11) |
| MX | @ | `10 pro-kom.eu` |
| TXT | @ | `v=spf1 mx a ~all` |
| TXT | @ | `MS=AC454E958B767FB1A3311B03785AFB887F793F49` |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine;` |
| TXT | `1568760578.internal._domainkey` | DKIM (`v=DKIM1; k=rsa; p=MIIBIjAN…` — pełna wartość w panelu: Konfiguruj domenę → DKIM) |
| TXT | `_acme-challenge` | 4 wartości (stare walidacje certyfikatów hostingu) |
| CAA | @ | `issue certum.pl`, `issuewild certum.pl`, `issue letsencrypt.org`, `issuewild letsencrypt.org` |
| DNSSEC | — | aktywny |

**Certyfikaty serwera poczty** (port 993, 16.11): z nazwą `pro-kom.eu` serwer podaje certyfikat `pro-kom.eu`/`www.pro-kom.eu` (najpewniej tego adresu używają dziś programy pocztowe pracowników — po zmianie `A @` przestałyby się łączyć). Z nazwą `pro-kom.nazwa.pl` — `*.nazwa.pl` (ważny). Z nazwą `mail.pro-kom.eu` — też `*.nazwa.pl`, czyli **niezgodny** (ostrzeżenie w programie pocztowym).

**Wniosek (do potwierdzenia przez nazwa.pl):**
- **Serwer w programach pocztowych pracowników:** `pro-kom.nazwa.pl` (IMAP 993 SSL/TLS, SMTP 465 SSL/TLS, użytkownik = pełny adres). Działa już dziś — można przestawiać na spokojnie, długo przed startem, u każdego po kolei (telefony też).
- **MX:** `10 pro-kom.nazwa.pl` zamiast `10 pro-kom.eu` — wtedy rekord `A mail` nie jest potrzebny, a poczta nie zależy od adresu strony. SPF: `v=spf1 mx ip4:85.128.169.153 ~all` (bez `a`).
- **Panel:** w obecnym trybie („Przekierowanie na usługę w nazwa.pl”) MX ustawia nazwa.pl, a „Dodatkowy rekord DNS” przyjmuje tylko TXT, SRV, CNAME, AAAA i A. Zmiana MX najpewniej wymaga przejścia na **ręczną konfigurację DNS** i przepisania całej strefy z tabeli wyżej (subdomeny hostingu przez wildcard albo osobno). Mail z pytaniami do `kontakt@nazwa.pl` przygotowany 16.11 (wysyła Krystian) — **nic w DNS nie zmieniamy przed odpowiedzią.**
- Kroki (a)–(c) z tabeli wyżej zostają, z poprawką: w (a) MX na `pro-kom.nazwa.pl` (albo nazwę zaleconą przez nazwa.pl) zamiast `mail.pro-kom.eu`.

**Ustalenie z nazwa.pl (telefon Krystiana, 16.11):** w dniu startu Krystian dzwoni do nazwa.pl (801 33 22 33), a konsultant prowadzi zmianę w panelu krok po kroku. Nie przełączamy trybu domeny sami.

Ściąga na rozmowę:

- **Domena i hosting:** `pro-kom.eu`, hosting `pro-kom.nazwa.pl`.
- **Strona i www:** `pro-kom.eu` i `www.pro-kom.eu` → **`194.28.50.70`** (nowy serwer; certyfikat SSL i Nginx są już gotowe przed rozmową — H19, rekord TXT `_acme-challenge`).
- **Poczta `@pro-kom.eu`:** bez zmian, zostaje na hostingu `pro-kom.nazwa.pl` (te same skrzynki). MX nie może wskazywać na `pro-kom.eu`. Proponujemy `10 pro-kom.nazwa.pl` albo nazwę, którą zalecą.
- **SPF:** bez `a` → `v=spf1 mx ip4:85.128.169.153 ~all` albo ich zalecenie. Plus nadawca, jeśli wyjdzie z nagłówków (np. Microsoft 365).
- **Subdomeny hostingu:** `sklep`, `komis`, `extranet`, `test`, `demo`, `dj`, `full`, `zaleglosci` bez zmian.
- **Zostają bez zmian:** `staging` → `194.28.50.70`, wildcard, DKIM, DMARC, CAA, TXT `MS=`.
- **Pytanie do konsultanta:** jaki serwer IMAP/SMTP wpisać pracownikom. Nasza propozycja: `pro-kom.nazwa.pl`, IMAP 993, SMTP 465, SSL/TLS.

**Kiedy dzwonić:** w dniu startu, po części A z `docs/wdrozenia.md` → „pro-kom.eu — dzień startu” (kod, treść, certyfikat `prokom-hub-prod`, Nginx i domena tenanta gotowe, próba `curl --resolve` zielona). Po zmianie rekordów zostaje tylko część P (sprawdzenie, odnawianie certyfikatu, poczta).

**Przedtem i tak:**
- programy pocztowe pracowników przestawione na `pro-kom.nazwa.pl`;
- miejsce na dysku poczty;
- przedłużony hosting.

**Po rozmowie:**
- mail testowy z i na `@pro-kom.eu`, także z Gmaila;
- wpis nowej strefy w tej sekcji.

**Staging huba (H7-2 krok 1) — bezpieczny dla poczty, można przed decyzją o poczcie:** jawny rekord `staging` ma pierwszeństwo przed wildcardem tylko dla tej jednej nazwy; `@`, MX, SPF, `mail` i reszta zostają na nazwa.pl. Dziś `staging.pro-kom.eu` trafia przez wildcard na stary serwer `85.128.169.153` (sprawdzone 15.11), więc hubu na stagingu nie da się otworzyć.

| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| A | staging | `194.28.50.70` | 3600 | staging huba za hasłem (`noindex`), tenant `prokom` | **dodany 15.11** (Panel Klienta → Domeny → pro-kom.eu → Konfiguruj domenę → „Dodatkowy rekord DNS”, zapis tylko tej sekcji; MX/SPF/DKIM/DMARC bez zmian) |

Kolejność na serwerze (runbook §0 i §2, jak przy stagingu Tech): (1) panel stagingu → Strony → tenant `prokom` → Domeny: `staging.pro-kom.eu` (środowisko „Staging”) — **przed** dopisaniem hosta, bo smoke test wdrożenia sprawdza każdą domenę z `STAGING_SITE_HOSTS`; (2) po propagacji rekordu certyfikat `prokom-staging` z `--expand` i pełną listą jego domen + `staging.pro-kom.eu`; (3) `staging.pro-kom.eu` w `STAGING_SITE_HOSTS` (`.env.proxy`), przeładowanie Nginx; (4) `bash scripts/staging-content.sh prokom`.

Po przełączeniu (cel):

| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| A | @ | `194.28.50.70` | 3600 (T−48 h: 300) | nowa pro-kom.eu (hub, tenant `prokom`) | do zrobienia (H7-2) |
| A | www | `194.28.50.70` | 3600 (T−48 h: 300) | 301 na `pro-kom.eu` (Nginx, blok `hub-prod.conf.template`) | do zrobienia (H7-2) |
| MX | @ | `10 pro-kom.nazwa.pl` (albo nazwa zalecona przez nazwa.pl; wtedy bez `A mail`) | 3600 | poczta firmy bez zmiany serwera | przy telefonie do nazwa.pl, **przed** `A @` |
| TXT | @ | `v=spf1 mx ip4:85.128.169.153 ~all` (albo zalecony przez nazwa.pl) | 3600 | SPF bez `a` | przy telefonie do nazwa.pl, przed `A @` |
| TXT | `_acme-challenge`, `_acme-challenge.www` | wartości z `certbot --manual` (zmieniają się przy każdym wystawieniu) | najniższy | certyfikat `prokom-hub-prod` przez DNS-01 **przed** zmianą `A @` (`docs/wdrozenia.md` → „pro-kom.eu — dzień startu”, krok A4) | dodać przed telefonem; usunąć po wystawieniu certyfikatu |
| TXT | @ | `google-site-verification=…` | 3600 | Search Console, właściwość domeny (krok A8) | opcjonalnie przed telefonem — **nie usuwać** |

**Start bez przerwy (H19, 16.11):** certyfikat i Nginx dla pro-kom.eu są gotowe na serwerze przed rozmową z nazwa.pl (sprawdzone `curl --resolve`), więc telefon zmienia tylko MX/SPF i `A @`/`A www`. Rekordy TXT dodajemy sami w Panelu Klienta („Dodatkowy rekord DNS”), bez zmiany trybu strefy. Plan z tabeli „Decyzja 15.11” obowiązuje dalej: poczta przed stroną. Jeśli nazwa.pl zaleci odstęp między zmianą MX a `A @`, czekamy.

### pro-kom.pl (stary WordPress — wygaszany 11.2026, tylko 301)
Strefa: **Seohost** (NS `ns1/ns2.seohost.pl`). Strona i poczta na hostingu `188.210.222.1` (microhost). Poczty `@pro-kom.pl` nikt nie używa (Krystian, 16.11), ale rekordów poczty i tak nie ruszamy. Po wygaszeniu WordPressa domena tylko przekierowuje: blok Nginx `docker/nginx/templates/prokom-pl.conf.template` (nakładka `docker/compose.proxy.prokom-pl.yml`, certyfikat `prokom-pl`), wszystkie 8 adresów mapy strony jednym 301, reszta na `https://pro-kom.eu/`:

| Stary adres | Cel 301 |
|---|---|
| `/` i wszystko spoza listy | `https://pro-kom.eu/` |
| `/kontakt/`, `/contact/` | `https://pro-kom.eu/kontakt` |
| `/o-nas/`, `/pro-kom/` | `https://pro-kom.eu/o-firmie` |
| `/systemy-pos/` | `https://prokombiznes.pl/gopos` |
| `/ksef/` | `https://prokombiznes.pl/ksef` |
| `/konfigurator-pc/` | `https://prokomgaming.pl/konfigurator` |
| `/faq/` | `https://pro-kom.eu/` |

Stan 16.11 (punkt powrotu) i cel:

| Typ | Nazwa | Dziś | Po zmianie |
|---|---|---|---|
| A | @ | `188.210.222.1` | **`194.28.50.70`** |
| A | www | `188.210.222.1` | **`194.28.50.70`** |
| A | mail | `188.210.222.1` | bez zmian |
| MX | @ | `10 mail.pro-kom.pl` | bez zmian |
| TXT | @ | `v=spf1 redirect=_spf-h50.microhost.pl` | bez zmian |

**Zrobione 16.11.2026 (ok. 23:00):** strefa aktywna w Seohost była w DirectAdmin starego hostingu `srv78828` (NS `ns1/ns2.seohost.pl`, brak hasła) — przeniesiona na strefę panelu Seohost: **serwery nazw domeny → `dns1/dns2.microhost.pl`** (jak pozostałe domeny), w strefie `A @` i `A www` → `194.28.50.70` (TTL 3600), bez MX (poczty nikt nie używa). Certyfikat `prokom-pl` (webroot, do 14.02.2027), Nginx z nakładką `prokom-pl`, wszystkie adresy sprawdzone `curl --resolve` (301 jednym skokiem, `www` i `http` też). Stary hosting `srv78828` (wygasa 31.12.2026) — wyłączyć dopiero, gdy publiczne DNS (8.8.8.8, 1.1.1.1) pokazują `194.28.50.70`; nie przedłużać. Przy okazji `sklepdlafirm.pl` (Seohost, „Przekierowanie URL”, tylko http) → `https://prokombiznes.pl` zamiast `https://www.pro-kom.pl`.

Pierwotna kolejność: (1) PR z blokiem scalony i wdrożony na staging (pliki proxy na serwerze); (2) w Seohost `A @` i `A www` → `194.28.50.70`; (3) po propagacji certyfikat `prokom-pl` przez webroot z tymczasowym blokiem portu 80 (runbook §0 „Nowy certyfikat bez zatrzymywania Nginx”, domeny `pro-kom.pl` i `www.pro-kom.pl`); (4) start proxy z nakładką `prokom-pl` (runbook §0); (5) sprawdzenie curl-em; (6) dopiero potem wyłączenie starego hostingu. Między (2) a (4) pro-kom.pl odpowiada 444 — kilka minut, strona i tak wygaszana.

### prokomserwis.pl (PRO-KOM Tech, repo `prokom-system`)
Strefa w Seohost od 14.11 (przeniesiona 1:1 z cyber_Folks; szczegóły, stan „przed/po” i TXT: `prokom-system/docs/tech/DNS-PROKOMSERWIS.md`). Do przełączenia (niedziela **29.11.2026**) `@` i `www` wskazują **stary serwer Hetzner `62.238.0.240`** — nie `<IP>`.

| Typ | Nazwa | Wartość | TTL | Po co | Stan |
|---|---|---|---|---|---|
| NS | @ | `dns1.microhost.pl`, `dns2.microhost.pl` | — | strefa w Seohost | ustawione 14.11 |
| A | @ | `62.238.0.240` (Hetzner) → `<IP>` przy przełączeniu | 3600 (T−48 h: 300) | strona i panel serwisu | dziś Hetzner; zmiana 29.11 (`docs/runbook.md` §9) |
| A | www | `62.238.0.240` (Hetzner) → `<IP>` przy przełączeniu | 3600 (T−48 h: 300) | to samo co `@`, **bez 301** (1:1 z Hetznerem) | dziś Hetzner; zmiana 29.11 |
| A | staging | `<IP>` | 3600 | staging Tech za hasłem (certyfikat `prokom-tech-staging`) | ustawione 14.11 |
| TXT | @ | `google-site-verification=…` + 63-znakowy ciąg hex (pełne wartości w `DNS-PROKOMSERWIS.md`) | 3600 | Search Console i rekord do ustalenia — **nie usuwać** | przeniesione 14.11 |

Bez MX (poczty `@prokomserwis.pl` nie ma) i bez AAAA.

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
| 14.11.2026 | prokomserwis.pl | strefa w Seohost 1:1 z cyber_Folks (A `@`/`www` → 62.238.0.240 Hetzner, 2× TXT), delegacja `dns1–3.tld.pl` → `dns1/dns2.microhost.pl`; A `staging` → 194.28.50.70 | Krystian | prokom-system (`DNS-PROKOMSERWIS.md`); Nginx: `chore/proxy-tech` |
| 9.11.2026 | prokombiznes.pl | A `panel` → 194.28.50.70 — panel produkcji | Krystian | `docs/panel-produkcji-prokombiznes` |
| 2.11.2026 | prokombiznes.pl, prokomsoftware.pl, prokominstalacje.pl | rekordy poczty: A `mail`, MX, SPF, DKIM `x._domainkey`, DMARC `p=none` (hosting poczty Seohost) | Krystian | S10d |
| 2.11.2026 | prokomgaming.pl | delegacja `ns1/ns2.seohost.pl` → `dns1/dns2.microhost.pl`; nowa strefa: A `@`/`www` → 194.28.50.70, rekordy poczty jak wyżej | Krystian | S10d |
| 14.11.2026 | prokomsoftware.pl | TXT `google-site-verification=…` (Search Console, usługa typu Domena) | Krystian | SEO Software |
| 16.11.2026 | prokombiznes.pl | TXT `google-site-verification=…` (Search Console, usługa typu Domena) | Krystian | SEO Biznes |
| 31.10.2026 | prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl | strefy w Seohost (`@`, `www`, `staging`; prokombiznes.pl także `panel.staging`) → 194.28.50.70; delegacja `ns1/ns2.seohost.pl` → `dns1/dns2.microhost.pl` | Krystian | #185 |
