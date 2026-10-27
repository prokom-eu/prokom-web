# prokominstalacje.pl — co musi uzupełnić szef przed produkcją

Lista wygenerowana 27.10.2026 z prototypu i seeda (wszystkie znaczniki `[…]`). Test e2e z I13 blokuje produkcję, jeśli którykolwiek znacznik zostanie na stronie. Uzupełnia się w panelu (dane firmy, `InstalacjeSettings`, dokumenty stron) albo przez decyzję „usuwamy ten fragment”.

| Znacznik | Co trzeba podać | Gdzie występuje |
|---|---|---|
| `[SZEF: 2–3 osoby, zdjęcia, uprawnienia SEP, certyfikaty producentów]` | 2–3 osoby, zdjęcia, uprawnienia SEP, certyfikaty producentów | OFirmie |
| `[SZEF: 2–3 realizacje ze zdjęciem i rokiem]` | 2–3 realizacje ze zdjęciem i rokiem | Main |
| `[SZEF: czy oferujemy wynajem; jeśli nie, napisać to wprost]` | czy oferujemy wynajem; jeśli nie, napisać to wprost | SegBudowa, seed:obiekty/bud.json, seed:strony-zrzut/SegBudowa.json |
| `[SZEF: firma DSO do polecania]` | firma DSO do polecania | Naglosnienie |
| `[SZEF: godziny, soboty]` | godziny, soboty | OFirmie |
| `[SZEF: godziny]` | godziny | Kontakt, seed:strony-zrzut/Kontakt.json |
| `[SZEF: imię i nazwisko, rola]` | imię i nazwisko, rola | PoradnikRodo |
| `[SZEF: jak często]` | jak często | Serwis, seed:strony-zrzut/Serwis.json |
| `[SZEF: kiedy otwarty]` | kiedy otwarty | OFirmie, seed:strony-zrzut/OFirmie.json |
| `[SZEF: klauzula RODO]` | klauzula RODO | Kontakt, Main |
| `[SZEF: monitoring, nagłośnienie]` | monitoring, nagłośnienie | OFirmie, seed:strony-zrzut/OFirmie.json |
| `[SZEF: osoba, telefon, e-mail]` | osoba, telefon, e-mail | Teletechnika |
| `[SZEF: parking przy salonie]` | parking przy salonie | Kontakt, seed:strony-zrzut/Kontakt.json |
| `[SZEF: partner — agencja ochrony]` | partner — agencja ochrony | SegBudowa, seed:obiekty/bud.json, seed:strony-zrzut/SegBudowa.json |
| `[SZEF: pełna klauzula RODO i link do polityki prywatności]` | pełna klauzula RODO i link do polityki prywatności | Teletechnika |
| `[SZEF: potwierdź autoryzację Ampio. Bez niej sprzęt kupujemy przez partnera, a okresu gwarancji producenta nie podajemy]` | potwierdź autoryzację Ampio. Bez niej sprzęt kupujemy przez partnera, a okresu gwarancji producenta nie podajemy | SmartHome |
| `[SZEF: potwierdź stan wdrożenia w salonach]` | potwierdź stan wdrożenia w salonach | Multimedia |
| `[SZEF: potwierdź u dystrybutora, że 5 lat obejmuje APART i nasz kanał zakupu]` | potwierdź u dystrybutora, że 5 lat obejmuje APART i nasz kanał zakupu | Naglosnienie, seed:strony-zrzut/Naglosnienie.json |
| `[SZEF: potwierdź zgodę klienta na podanie nazwy]` | potwierdź zgodę klienta na podanie nazwy | Naglosnienie, seed:strony-zrzut/Naglosnienie.json |
| `[SZEF: strefa i zasady dojazdu]` | strefa i zasady dojazdu | Main, seed:strony-zrzut/Main.json |
| `[SZEF: treść klauzuli]` | treść klauzuli | Zaplanuj |
| `[SZEF: zasady dojazdu i stawki]` | zasady dojazdu i stawki | Serwis, seed:strony-zrzut/Serwis.json |
| `[SZEF: zasady dojazdu]` | zasady dojazdu | Kontakt |
| `[SZEF: zasady wizji lokalnej i dojazdu]` | zasady wizji lokalnej i dojazdu | Main, seed:strony-zrzut/Main.json |
| `[SZEF: zasady]` | zasady | Serwis |
| `[SZEF: zgoda klienta na nazwę]` | zgoda klienta na nazwę | Naglosnienie, seed:strony-zrzut/Naglosnienie.json |
| `[SZEF: zgoda klienta na podanie nazwy]` | zgoda klienta na podanie nazwy | Sieci |
| `[ADRES ZAKOPANE]` | adres salonu w Zakopanem | OFirmie, common, seed:strony-zrzut/Kontakt.json, seed:wspolne.json |
| `[CENA]` | ceny „od” — albo decyzja „bez cen” (wtedy `pokazCeny=false` i znacznik znika z widoku) | Alarmy, Anteny, Dostep, Ladowarki, Main, Monitoring, Multimedia, Naglosnienie, Noclegowe, SegApartament, SegBudowa, SegDeweloper, SegDom, SegFirma, SegGmina, SegHotel, SegKosciol, SegRestauracja, SegSklep, SegSzkola, Ser |
| `[E-MAIL]` | e-mail linii Instalacje (np. instalacje@pro-kom.eu) | common, seed:strony-zrzut/Kontakt.json, seed:wspolne.json |
| `[SZEF]` | ogólna decyzja/dane od szefa w danym miejscu | Alarmy, Kontakt, Multimedia, Naglosnienie, OFirmie, Realizacje, seed:strony-zrzut/Kontakt.json, seed:strony-zrzut/Multimedia.json, seed:strony-zrzut/Naglosnienie.json |
| `[TELEFON]` | telefon linii Instalacje | Main, Zaplanuj, common, seed:strony-zrzut/Kontakt.json, seed:wspolne.json |
| `[WHATSAPP]` | numer WhatsApp (albo usunąć przycisk) | common, seed:strony-zrzut/Kontakt.json, seed:wspolne.json |
