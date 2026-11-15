# Audyt podstron prokombiznes.pl (06.11.2026)

Stan: lokalny `develop` 0703b69 z danymi z `pnpm seed`, adres `biznes.localhost:3000`. Strony główna nie była sprawdzana (ma osobny audyt `AUDYT-GLOWNA-0611.md`).

**Co zostało sprawdzone:**
- Pomiar automatyczny Playwright **121 podstron** (1440 px i 390 px):
  - wszystkie 100 adresów z `sitemap.xml` poza stroną główną;
  - 20 kart produktu (próbka 1 na 14 + 11 wybranych typów: kasa, laptop, program, usługa, HP, tusze, iPhone, automat, GoPOS, KSeF, terminal);
  - strona 404.
- Dla każdej strony: wysokość, `scrollWidth`, `<title>`, opis, canonical, H1, H2 (widoczne i ukryte na telefonie), typy JSON-LD, obrazy (alt, `loading`), błędy konsoli, WhatsApp, małe cele dotykowe oraz 20 reguł tekstowych (ceny, leasing, statusy, zakazane marki, „lorem/TODO”, e-maile, telefony, miasta…).
- Zrzuty 1440 i 390 (jasny) dla 49 stron oraz ciemny dla `/oferta` i `/oferta/kasy-fiskalne` w `audit-sub/shots/`. Zrzuty robione z `prefers-reduced-motion`, żeby animacje wejścia nie zostawiały pustych pól.
- Reguły sprawdzone też w danych (`seed/prokombiznes/**/*.json`) i w kodzie (`src/sites/biznes`).

**Czego nie dało się sprawdzić — wprost:**
- **Serwer dev padł ok. 03:16**, pod koniec pomiaru. Proces `next-server` zniknął, a jego pamięć urosła wcześniej z 2,4 GB do 4,2 GB z 8 GB, więc najpewniej zabrakło pamięci. Zgodnie z poleceniem nie uruchamiałem go ponownie. Przez to nie sprawdziłem:
  - wyszukiwarki Ctrl K;
  - szuflady „Twoje zapytanie” (dodawanie, pola, walidacja);
  - przejścia przez `/konfigurator` do wyniku;
  - arkuszy Filtry i Menu na telefonie;
  - zrzutów `/konfigurator` i `/zapytanie` (nie ma ich w sitemap);
  - ciemnego motywu na pozostałych kluczowych stronach.
- **Linki spoza sitemap (39 adresów) — niezweryfikowane.** Pierwsze sprawdzenie było błędne (zapytanie bez nagłówka `Host` dawało 404 na wszystko), a potem serwer już nie działał. Wszystkie 121 stron z listy odpowiadały 200 (404 tylko strona testowa).
- **Kontrast** — tylko ocena wzrokowa, bez pomiaru axe.
- **Lighthouse** — nie w trybie dev (lista, co zmierzyć na stagingu, jest w P3).
- `/oferta?q=` nie jest adresem wyszukiwania. Parametr w kodzie to `?szukaj=` (`src/lib/catalog/filters.ts:84`), więc mój test `?q=laptop` niczego nie dowodzi.

---

## Werdykt ogólny
Podstrony są dojrzałe:
- spójna rama i jeden H1 na każdej stronie (121/121);
- zero cen poza dozwolonymi wyjątkami (limit KSeF 10 000 zł, ulga do 700 zł);
- zero zakazanych marek, „lorem”, „TODO”, „example.test” i Strefy Klienta;
- statusy marek zgodne z listą;
- dane kontaktowe wszędzie te same (Rabka, kontakt@prokombiznes.pl, 889 003 889 / 883 200 151, pn–pt 9–17);
- tylko jeden przypadek poziomego przewijania.

Największe problemy są **trzy i powtarzalne**:
1. **WhatsApp** jest na 121 z 121 stron (stopka) i w treści 66 stron (głównie panel formularza w każdej kategorii).
2. **Telefon chowa treść**, którą komputer pokazuje: formularz na Kontakcie, FAQ na KSeF, uldze i w kasach fiskalnych, adres na O firmie. Przy tym JSON-LD `FAQPage` zostaje w HTML.
3. **Karty produktów nie mają `alt`**: 767 z 947 zdjęć produktów na sprawdzonych stronach ma pusty opis.

Do tego dochodzi łamanie zasady „bez zdjęć ludzi” na stockowych zdjęciach GoPOS (widać je w ofercie, markach, branży gastronomia i karcie GoPOS).

Treść jest konkretna i ma źródła, ale sporo stron **powtarza te same obietnice 2–3 razy** (salony, kategorie, GoPOS). Do tego dochodzą ciężka stopka na telefonie (~2 000 px) i słabe tytuły SEO kluczowych stron („GoPOS | PRO-KOM Biznes”, „Kontakt | PRO-KOM Biznes”, „Laptopy | PRO-KOM Biznes”).

**Liczby SEO (121 stron):**
- 34 tytuły dłuższe niż 60 znaków i 15 krótszych niż 30;
- 61 opisów krótszych niż 100 znaków;
- 13 stron bez `BreadcrumbList`, choć okruszki są na ekranie;
- 0 z 41 kategorii z `ItemList`;
- `/konfigurator` nie jest w sitemap.

---

## Tabela sprawdzonych stron
Wysokość w px: komputer 1440 / telefon 390. Ocena 1–5 (5 = gotowa do produkcji). Kolumna „najważniejszy problem” pomija problemy wspólne dla wszystkich stron: WhatsApp w stopce, H2 ukrytych okien, długą stopkę telefonu (sekcja „Wspólne problemy”).

| Adres | Wysokość 1440 / 390 | Ocena | Najważniejszy problem |
|---|---|---|---|
| `/automaty-vendingowe` | 7615 / 6884 | 4 | 12/12 zdjęć automatów bez alt; WhatsApp w karcie FAQ; dubel z /oferta/automaty-vendingowe |
| `/gopos` | 10492 / 11848 | 3 | 12 sekcji, moduły pokazane 2× (lista + konfigurator pakietu); tytuł „GoPOS · PRO-KOM Biznes”; zdjęcia bez alt |
| `/insert` | 9085 / 11019 | 4 | Długa (9 085 / 11 019 px); tytuł „InsERT · PRO-KOM Biznes” (23 zn.) |
| `/kontakt` | 4601 / 4426 | 3 | Telefon nie ma formularza (H2 ukryty); WhatsApp 3× (kafel, karta FAQ, stopka); tytuł bez słów kluczowych |
| `/ksef` | 5113 / 4685 | 4 | Telefon ukrywa „Od programu po fakturę”, FAQ i końcowe CTA (wysokość 0 px), a `FAQPage` jest w HTML |
| `/o-firmie` | 5366 / 5747 | 4 | Telefon ukrywa sekcję z adresem i mapą; brak `BreadcrumbList` |
| `/opieka-it` | 6788 / 7161 | 3 | Zepsute ikony SVG (błąd `d` w konsoli, „Sieć i Wi-Fi” bez ikony); telefon ukrywa 3 sekcje i CTA |
| `/ulga-na-kase-fiskalna` | 5005 / 4480 | 4 | Telefon ukrywa FAQ i CTA; 4/4 zdjęcia bez alt |
| `/plan-firmy` | 2583 / 4423 | 5 | Zwięzła i czytelna; tylko opis meta i alt do sprawdzenia |
| `/oferta` | 5650 / 4307 | 4 | 21/21 zdjęć kart bez alt; brak `BreadcrumbList`/`ItemList`; zdjęcie GoPOS z ludźmi w siatce |
| `/oferta/kasy-fiskalne` | 6988 / 4755 | 4 | Telefon ukrywa „Co dostajesz”, „Często dobierane” i FAQ; ulga 700 zł bez dopisku o księgowej; alt |
| `/oferta/drukarki-fiskalne` | 4931 / 4034 | 4 | 12/12 zdjęć kart bez alt; krótki tytuł „Drukarki fiskalne”; opis 58 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/stanowiska-pos` | 4000 / 3374 | 4 | 6/6 zdjęć kart bez alt; krótki tytuł „Stanowiska POS”; opis 70 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/kasoterminale-mobilne` | 4004 / 3438 | 4 | 6/6 zdjęć kart bez alt; opis 62 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/terminale-platnicze` | 3455 / 3134 | 4 | 3/3 zdjęć kart bez alt; opis 52 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/kioski-ekrany-kuchenne` | 3509 / 2807 | 4 | 2/2 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/akcesoria-pos` | 6090 / 4104 | 4 | 17/17 zdjęć kart bez alt; krótki tytuł „Akcesoria POS”; opis 55 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/wagi-sklepowe` | 5037 / 4143 | 4 | 11/11 zdjęć kart bez alt; krótki tytuł „Wagi sklepowe”; opis 55 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/skanery-kolektory-etykiety` | 7150 / 5890 | 4 | 24/24 zdjęć kart bez alt; opis 63 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/automaty-vendingowe` | 7281 / 4169 | 4 | 25/25 zdjęć kart bez alt; opis 72 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/laptopy` | 7262 / 4099 | 4 | 26/26 zdjęć kart bez alt; krótki tytuł „Laptopy”; opis 65 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/komputery` | 6716 / 4115 | 4 | 19/19 zdjęć kart bez alt; opis 69 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/monitory` | 5651 / 4733 | 4 | 15/15 zdjęć kart bez alt; krótki tytuł „Monitory”; opis 61 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/telefony` | 4050 / 3181 | 4 | 4/4 zdjęć kart bez alt; krótki tytuł „Telefony”; opis 72 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/tablety` | 3535 / 3181 | 4 | 3/3 zdjęć kart bez alt; krótki tytuł „Tablety”; opis 58 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/klawiatury-myszy-sluchawki` | 6322 / 4118 | 4 | 18/18 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/serwery-nas-ups` | 7159 / 4139 | 4 | 24/24 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/serwery-nas-ups/serwery` | 4533 / 3673 | 4 | 7/7 zdjęć kart bez alt; opis 86 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/serwery-nas-ups/nas` | 5661 / 4189 | 4 | 14/14 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/serwery-nas-ups/ups` | 6696 / 4113 | 4 | 19/19 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/drukarki-wielofunkcyjne` | 7550 / 4284 | 4 | 26/26 zdjęć kart bez alt; opis 79 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/drukarki-wielofunkcyjne/laser-kolor` | 5316 / 4268 | 4 | 12/12 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/drukarki-wielofunkcyjne/laser-mono` | 5832 / 4212 | 4 | 16/16 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/drukarki-wielofunkcyjne/atramentowe` | 4178 / 3567 | 4 | 5/5 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/drukarki-wielofunkcyjne/skanery` | 3684 / 2922 | 4 | 2/2 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/niszczarki` | 6256 / 4048 | 4 | 16/16 zdjęć kart bez alt; krótki tytuł „Niszczarki”; opis 76 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/drukarki-wielofunkcyjne/mfp-biuro` | 6909 / 4274 | 4 | 19/19 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/ekrany-projektory/monitory-interaktywne` | 4679 / 4029 | 4 | 8/8 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/ekrany-projektory` | 7114 / 4206 | 4 | 22/22 zdjęć kart bez alt; opis 81 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/ekrany-projektory/ekrany-informacyjne` | 4109 / 3430 | 4 | 5/5 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/ekrany-projektory/projektory` | 3635 / 3233 | 4 | 3/3 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/ekrany-projektory/wideokonferencje` | 4211 / 3546 | 4 | 6/6 zdjęć kart bez alt; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/programy-sprzedazowe-erp` | 5384 / 4071 | 4 | 13/13 zdjęć kart bez alt; opis 61 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/microsoft-365-licencje` | 4007 / 3534 | 4 | 5/5 zdjęć kart bez alt; opis 61 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/programy-branzowe` | 5330 / 4015 | 4 | 14/14 zdjęć kart bez alt; krótki tytuł „Programy branżowe”; opis 58 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/antywirus-firewall` | 3394 / 2919 | 4 | 2/2 zdjęć kart bez alt; opis 75 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/siec-wifi` | 6942 / 4029 | 4 | 26/26 zdjęć kart bez alt; krótki tytuł „Sieć i Wi-Fi”; opis 59 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/podpis-kwalifikowany` | 3443 / 2850 | 4 | 2/2 zdjęć kart bez alt; opis 56 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/opieka-it-wdrozenia` | 4370 / 3930 | 4 | 2/2 zdjęć kart bez alt; opis 54 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/serwis-przeglady` | 4869 / 4053 | 4 | 0/0 zdjęć kart bez alt; opis 55 zn.; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/oferta/dofinansowania` | 3316 / 2825 | 4 | 2/2 zdjęć kart bez alt; krótki tytuł „Dofinansowania”; formularz ukryty na telefonie, WhatsApp w formularzu |
| `/marki` | 6493 / 8343 | 4 | Samsung 2× w dwóch grupach; zdjęcia GoPOS z ludźmi w kaflu |
| `/marki/apple` | 5836 / 7230 | 4 | bez błędów krytycznych; tytuł 68 zn. |
| `/marki/avtek` | 4781 / 5985 | 4 | bez błędów krytycznych; tytuł 66 zn. |
| `/marki/brother` | 8970 / 9091 | 4 | „oryginały i sprawdzone zamienniki” — dozwolone (zakaz dotyczy HP), do potwierdzenia przez szefa |
| `/marki/dell` | 8556 / 8227 | 4 | 4/18 zdjęć bez alt |
| `/marki/comex` | 6597 / 7525 | 4 | 5/7 zdjęć bez alt |
| `/marki/elzab` | 7087 / 8202 | 4 | 5/7 zdjęć bez alt |
| `/marki/eset` | 4663 / 6039 | 4 | bez błędów krytycznych; tytuł 64 zn. |
| `/marki/eurocert` | 4590 / 5875 | 4 | bez błędów krytycznych; tytuł 60 zn. |
| `/marki/niszczarki` | 8741 / 8818 | 4 | 3/18 zdjęć bez alt |
| `/marki/druk` | 6898 / 7604 | 4 | 9/11 zdjęć bez alt |
| `/marki/lenovo` | 9190 / 8455 | 4 | 4/15 zdjęć bez alt |
| `/marki/microsoft` | 5165 / 6542 | 4 | bez błędów krytycznych; tytuł 61 zn. |
| `/marki/logitech` | 7313 / 7928 | 4 | 2/16 zdjęć bez alt |
| `/marki/polcard` | 4542 / 5904 | 4 | bez błędów krytycznych; tytuł 59 zn. |
| `/marki/posnet` | 6648 / 8117 | 4 | Te same 4 korzyści (fiskalizacja, szkolenie, przeglądy, serwis) 3× na stronie |
| `/marki/nas` | 6275 / 7527 | 4 | 6/8 zdjęć bez alt |
| `/marki/samsung` | 5209 / 6511 | 4 | bez błędów krytycznych; tytuł 62 zn. |
| `/marki/sunmi` | 5739 / 7281 | 4 | 3/5 zdjęć bez alt |
| `/marki/sharp-nec` | 3934 / 5390 | 4 | bez błędów krytycznych; tytuł 54 zn. |
| `/marki/adobe` | 3834 / 6623 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 1/1 zdjęć bez alt; opis 69 zn. |
| `/marki/siec` | 7312 / 7286 | 4 | 14/16 zdjęć bez alt |
| `/marki/apc` | 4485 / 7543 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 5/5 zdjęć bez alt; opis 71 zn. |
| `/marki/comarch` | 3873 / 6945 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 1/1 zdjęć bez alt; opis 76 zn. |
| `/marki/dibal` | 5106 / 7851 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 7/7 zdjęć bez alt; opis 86 zn. |
| `/marki/fawag` | 4534 / 7622 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 4/4 zdjęć bez alt; opis 72 zn. |
| `/marki/gopos` | 5613 / 8096 | 2 | Cienka strona marki obok pełnej /gopos (dwa adresy na tę samą frazę); zdjęcia z ludźmi |
| `/marki/godex` | 5135 / 8092 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 7/7 zdjęć bez alt; opis 74 zn. |
| `/marki/insert` | 5480 / 8305 | 2 | Cienka strona marki obok pełnej /insert (kanibalizacja) |
| `/marki/insoft` | 4476 / 7515 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 4/4 zdjęć bez alt; opis 75 zn. |
| `/marki/nfhotel` | 3907 / 6909 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 1/1 zdjęć bez alt; opis 74 zn. |
| `/marki/sato` | 3840 / 6874 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 1/1 zdjęć bez alt; opis 68 zn. |
| `/marki/stormshield` | 3913 / 6929 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 1/1 zdjęć bez alt; opis 73 zn. |
| `/marki/zebra` | 4572 / 7777 | 3 | strona marki bez salonu: cienka, na telefonie dłuższa niż na komputerze; 5/5 zdjęć bez alt; opis 86 zn. |
| `/zestawy/zestaw-noclegi-kwatera` | 3722 / 6341 | 4 | tytuł 70 zn. (>60) |
| `/zestawy` | 4955 / 10150 | 4 | Pokazuje 23 zestawy, a tylko 4 są „Gotowe” (sitemap); na telefonie 10 150 px |
| `/zestawy/zestaw-szkola-sala-interaktywna` | 3770 / 6098 | 4 | tytuł 70 zn. (>60) |
| `/zestawy/zestaw-szkola-siec` | 4608 / 7166 | 2 | **Poziome przewijanie na 390 px** (scrollWidth 444) — span z wartością w liście elementów |
| `/zestawy/zestaw-wifi-omada` | 3992 / 6339 | 4 | tytuł 70 zn. (>60) |
| `/branze/gastronomia` | 7729 / 4763 | 3 | „Gotowe zestawy” pokazują 1 zestaw (Wi-Fi Omada) zamiast gastronomicznych; GoPOS ze zdjęciem ludzi; „Wkrótce:” w Inne branże |
| `/branze/handel` | 6750 / 4896 | 3 | Jak gastronomia: formularz ukryty na telefonie, WhatsApp w formularzu |
| `/branze/noclegi` | 6801 / 4737 | 3 | Jak gastronomia; tytuł 71 zn. |
| `/aktualnosci` | 3469 / 3007 | 4 | Jeden wpis; telefon ukrywa licznik i CTA |
| `/aktualnosci/ksef-od-1-stycznia-2027` | 4793 / 5345 | 4 | Ulga 700 zł bez dopisku o księgowej; „paragon z NIP do 450 zł” — K4 §10 [SZEF]; tytuł 91 zn. |
| `/produkt/brother-td-4420dn-td-4520dn` | 6255 / 7119 | 4 | bez błędów krytycznych |
| `/produkt/apple-iphone-17` | 7086 / 8378 | 4 | tytuł 69 zn. (>60) |
| `/produkt/dibal-d-955` | 8579 / 8846 | 4 | bez błędów krytycznych |
| `/produkt/elzab-sprawdzarki-cen-llt-lwt-lft-2d` | 8360 / 9272 | 4 | tytuł 69 zn. (>60) |
| `/produkt/gopos` | 9638 / 11133 | 3 | Galeria ze zdjęciami ludzi (gopos-01, -02) |
| `/produkt/hp-laserjet-pro-4007dw` | 6563 / 7464 | 4 | bez błędów krytycznych |
| `/produkt/konica-minolta-bizhub-c268i` | 6974 / 7457 | 4 | bez błędów krytycznych |
| `/produkt/insert-subiekt-gt` | 8589 / 9556 | 4 | bez błędów krytycznych |
| `/produkt/lenovo-thinkpad-t14s-gen-6` | 9988 / 11562 | 4 | bez błędów krytycznych |
| `/produkt/lenovo-thinkpad-t14-gen7` | 10308 / 11717 | 4 | bez błędów krytycznych |
| `/produkt/omada-switche-poe` | 8874 / 9287 | 4 | bez błędów krytycznych |
| `/produkt/optivendi-kawomat` | 5525 / 6563 | 4 | bez błędów krytycznych |
| `/produkt/optivendi-tortomat` | 5355 / 6590 | 4 | bez błędów krytycznych |
| `/produkt/posnet-ergo-online` | 8196 / 8547 | 4 | „0,6 kg” 4× na stronie; „Do tego zwykle dobierają” zaczyna od routera UniFi |
| `/produkt/sharp-nec-instalacyjne` | 8160 / 9241 | 4 | tytuł 68 zn. (>60) |
| `/produkt/szkolenia-zespolu` | 4780 / 6203 | 4 | bez błędów krytycznych |
| `/produkt/terminal-platniczy-polcard` | 7895 / 8708 | 4 | tytuł 64 zn. (>60) |
| `/produkt/tusze-tonery` | 4448 / 5512 | 4 | Zgodne z zasadą HP; brak zdjęcia (kafel usługi) |
| `/produkt/ubiquiti-u7-lite-u7-lr-u6-plus` | 6318 / 7457 | 4 | tytuł 61 zn. (>60) |
| `/produkt/wdrozenie-ksef-w-firmie` | 5381 / 6758 | 4 | bez błędów krytycznych |
| `/produkt/zakupy-z-dofinansowania` | 4804 / 6278 | 4 | bez błędów krytycznych |
| `/produkt/wymiana-kasy` | 4798 / 6009 | 4 | tytuł 61 zn. (>60) |
| `/cookies` | 1985 / 3766 | 4 | Szablon prawny do akceptacji prawnika; na telefonie połowa wysokości to stopka |
| `/dostepnosc` | 1575 / 3120 | 4 | Krótka; na telefonie 64% wysokości to stopka |
| `/polityka-prywatnosci` | 2692 / 4974 | 4 | Szablon prawny — K4 §10: do akceptacji prawnika |
| `/mapa-strony` | 9869 / 22053 | 3 | Na telefonie 22 053 px, 471 linków < 24 px; brak /konfigurator |
| `/strona-ktorej-nie-ma` | 1586 / 3119 | 5 | Dobra 404 (noindex, wyszukiwarka, 6 skrótów); ostrzeżenie Reacta o `<script>` w konsoli dev |

Nie sprawdzone wizualnie (brak zrzutu po awarii serwera): `/konfigurator`, `/zapytanie`, szuflada, wyszukiwarka.

---

## P0 — błędy i złamane zasady

### P0-1. WhatsApp na 121/121 stronach (zasada 01.11, WSPOLNE-ELEMENTY §2.1)
Dowód: pomiar linków `wa.me` w każdej stronie oraz tekst „WhatsApp”.

| Miejsce | Strony | Kod |
|---|---|---|
| Stopka, kolumna Kontakt: „WhatsApp: 889 003 889” | wszystkie 121 | `src/sites/biznes/components/BiznesFooter.tsx:155–158` |
| Panel formularza „Nie wiesz, co wybrać? Zadzwoń…”: kafel „WhatsApp 889 003 889” | 41 kategorii, 13 stron marek bez salonu (np. `/marki/apc`, `/marki/zebra`), 3 branże, `/aktualnosci`, wpis KSeF, `/oferta/kasy-fiskalne` | `src/sites/biznes/components/forms/ContactPanel.tsx:67–69` |
| Karta kontaktu przy FAQ: „WhatsApp · kontakt@…” | `/gopos`, `/insert`, `/ksef`, `/opieka-it`, `/ulga-na-kase-fiskalna`, `/automaty-vendingowe`, `/kontakt`, `/oferta/kasy-fiskalne`, branże | `src/sites/biznes/components/home/FaqBiznes.tsx:31, 80` |
| Kafel na Kontakcie: „Napisz → WhatsApp 889 003 889 · wyślij zdjęcie usterki albo tabliczki znamionowej”; na telefonie osobny kafel „WHATSAPP” | `/kontakt` (1440 i 390) | `src/sites/biznes/blocks/BzSection/firma/Company.tsx:423–429` |
| Opis meta Kontaktu: „telefon, WhatsApp, e-mail i formularz” | `/kontakt` | dane `src/seed/biznes/k4PagesRun.ts:73` |
| Wyszukiwarka bez wyników: „Napisz na WhatsApp” | okno Ctrl K (kod — nie zweryfikowane na żywo) | `src/sites/biznes/components/SearchOverlay.tsx:662` |
| Menu telefonu (numer WhatsApp przekazywany do menu) | arkusz Menu (kod) | `src/sites/biznes/components/BiznesHeader.tsx:28`, `Frame.tsx:43` |
| Opcja „preferowany kontakt: whatsapp” w logice formularza | szuflada/lista (kod) | `src/lib/inquiry/listForm.ts:66–72` |
| Dane | seed | `src/seed/biznes/contact.ts:41`, `seed/prokombiznes/k4/strony-k4.json → firma.wa` |

**Naprawa:** jeden PR `feat/wsp-bez-whatsapp` usuwa WhatsApp z widoku we wszystkich miejscach (bez migracji) i usuwa opis meta Kontaktu. Usunięcie pola z panelu to migracja usuwająca dane i wymaga decyzji.

### P0-2. Zdjęcia ludzi (zasada „bez zdjęć ludzi”)
Dowód: plansze kontrolne wszystkich 1 343 zdjęć z seedu (`audit-sub/view/all-imgs-*.jpg`) oraz lista obrazów wyrenderowanych na stronach.
- **Ludzie na zdjęciu:**
  - `gopos-01`, `gopos-02` (kelnerka i klientki przy ladzie);
  - `gopos-gocrm-01` (grupa przy stole);
  - `gopos-hotel-01` (kelner hotelowy);
  - zdjęcia `gohub`, `goorder`, `gokiosk`, `gostock`, `numerki-01…03` (`seed/prokombiznes/k3/media/produkty/…`).
- **Widać je na:**
  - `/oferta` (karta GoPOS w siatce „Polecane”);
  - `/marki` (kafel GoPOS: 3 miniatury);
  - `/marki/gopos`;
  - `/produkt/gopos` (galeria);
  - `/branze/gastronomia` (karta GoPOS);
  - `/zestawy`.
- **Zastrzeżenie:** WSPOLNE §2.2 mówi wprost o szefie i pracownikach, a to zdjęcia stockowe producenta. Zasada w zleceniu brzmi jednak „bez zdjęć ludzi”, a zdjęcie kelnerki wygląda jak „nasz zespół”. Rekomendacja: podmienić na zdjęcia urządzeń `k4-gopos-*` (są w repo i używa ich `/gopos`). Ostateczna decyzja w „Do decyzji”.

### P0-3. Poziome przewijanie na telefonie — `/zestawy/zestaw-szkola-siec`
- Pomiar: `scrollWidth` 444 przy 390 px.
- Element: `span.shrink-0 text-right text-sm font-extrabold` (wartość po prawej w liście elementów zestawu, prawdopodobnie długi kod modelu, np. `USW-Pro-Max-24-PoE`).
- Naprawa: `min-w-0` + `break-words` (albo `overflow-wrap:anywhere`) na tej kolumnie.
- Pozostałe 120 stron: 0 poziomego przewijania przy 1440 i 390.

### P0-4. Ulga „do 700 zł” bez dopisku, że rozlicza księgowa (K4-FINAL §1)
- `/oferta/kasy-fiskalne`, FAQ: „…mogą odliczyć 90% ceny netto kasy, maksymalnie 700 zł (art. 111 ust. 4 ustawy o VAT). Warunki (m.in. terminy i obowiązkowy przegląd) sprawdzimy z Tobą przy zamówieniu.”
- `/aktualnosci/ksef-od-1-stycznia-2027`, „Przy okazji: ulga 700 zł”: „…maksymalnie 700 zł (art. 111 ust. 4 ustawy o VAT). Zakup nie później niż 6 miesięcy… brak przeglądu w 3 lata oznacza zwrot ulgi.”
- Wzorzec poprawny jest na `/ulga-na-kase-fiskalna`: „Ulgę rozlicza Twoja księgowa…”. Dopisać zdanie w obu miejscach.

### P0-5. Telefon ukrywa treść, którą komputer pokazuje (a `FAQPage` zostaje w HTML)
Pomiar: H2 niewidoczne przy 390 px (sekcje o wysokości 0) oraz długość widocznego tekstu w `main` (komputer / telefon).

| Strona | Ukryte na telefonie | Tekst 1440 / 390 |
|---|---|---|
| `/kontakt` | **formularz** „Powiedz, czego potrzebujesz…” i pas linii „Szukasz monitoringu, strony albo naprawy telefonu?” | 3 855 / 1 667 znaków |
| `/ksef` | „Od programu po pierwszą fakturę”, **FAQ** „KSeF w pytaniach i odpowiedziach”, końcowe CTA „Zdążmy przed 1 stycznia.” (wysokość 0) | 4 666 / 2 106 |
| `/oferta/kasy-fiskalne` | „Co dostajesz z kasą”, „Często dobierane razem”, **FAQ** „Zanim kupisz kasę” | 6 324 / 1 551 |
| `/ulga-na-kase-fiskalna` | **FAQ** „Pytania o ulgę na kasę”, CTA „Kasa gotowa na dzień otwarcia.” | 3 662 / 2 595 |
| `/o-firmie` | „Rabka-Zdrój, ul. Orkana 16B” (adres, godziny, mapa dojazdu) | 4 477 / 3 453 |
| `/opieka-it` | CTA „Porozmawiajmy o Twojej firmie.” (dwie sekcje są zwinięte przez `FoldOnPhone` — to zgodne z planszą) | 5 546 / 3 175 |
| `/aktualnosci/ksef-…` | „Powiązane produkty”, CTA „KSeF bez nerwów…” | 4 593 / 2 879 |

- Na stronach z ukrytym FAQ JSON-LD `FAQPage` opisuje treść, której użytkownik telefonu nie widzi. Google indeksuje wersję mobilną.
- Naprawa: FAQ jako akordeon na telefonie (pierwsze pytanie otwarte, MOBILE-APLIKACJA §2), adres jako karta z „Wyznacz trasę”.
- Formularz na Kontakcie: albo pokazać, albo zastąpić wyraźnym przyciskiem „Napisz zapytanie”, który otwiera szufladę. Dziś telefon na Kontakcie ma tylko zadzwoń / e-mail / WhatsApp.

### P0-6. Zepsute ikony na `/opieka-it`
- Konsola: `Error: <path> attribute d: Expected number, "M2 8.5a15 15 0 0120 0 M5 12a…"` oraz `"…6v12H4z M4 7l8 6 8-6"` (×2: komputer i telefon).
- W ścieżce ikony jest dosłowny znak „…”, czyli ucięte dane.
- Na zrzucie pozycja „Sieć i Wi-Fi” w „Osiem obszarów” nie ma ikony. Drugi błąd dotyczy ikony poczty.
- Naprawa: poprawić definicje ikon (Wi-Fi, poczta) w danych albo zestawie ikon i dodać test, który odrzuca `d` z „…”.

### P0-7. Zdjęcia produktów w kartach bez `alt` (K4-FINAL §8 DoD: „`alt` = nazwa produktu na zdjęciach w kartach”)
- Pomiar: na 121 stronach **767 z 947** zdjęć produktów (szerokość ≥ 80 px, bez logotypów) ma `alt=""`.
- Gdzie:
  - wszystkie 41 kategorii (np. `/oferta/laptopy` 26/26, `/oferta/siec-wifi` 26/26);
  - `/oferta` 21/21;
  - `/zestawy` 69/69;
  - `/automaty-vendingowe` 12/12;
  - `/gopos` 13/13;
  - salony (np. `/marki/siec` 14/16, `/marki/brother` 10/24).
- Karty produktu mają `alt` poprawnie (0 pustych w galeriach).
- Jeżeli karta-link ma `aria-label`, zdjęcie może mieć pusty `alt` dla czytnika, ale K33 §8 pkt 7 i DoD wymagają opisu (SEO obrazów). Wpisać „Marka Model” z `shortName`.

**Zasady sprawdzone — bez naruszeń:**
- zero cen (tylko 10 000 zł limitu KSeF i 700 zł ulgi);
- brak leasingu, rat i finansowania (trafienia „rat” to „płatności ratalne” w opisie funkcji programu InsERT; „0%” to procenty w treści);
- statusy tylko: Posnet/Elzab „Autoryzowany serwis”, GoPOS/InsERT „Autoryzowany partner”, Optivendi „Partner”, COMEX „we współpracy z COMEX”, bez „Aut.”;
- 0 zakazanych marek i 0 „Strefy Klienta”;
- HP tylko oryginały (`/produkt/tusze-tonery`: „Do HP: wyłącznie oryginały”, „zamienniki (poza HP)”);
- jeden e-mail i dwa telefony;
- tylko adres w Rabce (inne miasta wyłącznie jako zasięg dojazdu);
- „PRO-KOM Tech” na O firmie i Kontakcie;
- 0 „lorem”, „TODO”, „example.test”, `[SZEF…]`.

---

## P1 — co przebudować i uporządkować
Test każdej sekcji: na jakie pytanie klienta odpowiada i czy żadna inna sekcja nie odpowiedziała już na nie wyżej.

1. **Kategorie (41 stron): trzy razy „pomożemy wybrać”.**
   - Na każdej kategorii są:
     - boczna karta „Nie wiesz, co wybrać? Zapytaj o dobór”;
     - na dole „Jedna lista, jeden formularz, jedna wycena.” (3 kroki);
     - pełny formularz „Nie wiesz, która kasa? Zadzwoń, pomożemy wybrać.” z kaflami telefon / WhatsApp / e-mail;
     - w kasach dodatkowo karta kontaktu przy FAQ.
   - Na telefonie i tak nic z tego nie widać (P0-5).
   - Zostawić jeden blok: formularz z 3 krokami jako nagłówkiem (zamiast osobnej sekcji). Boczna karta zostaje tylko tam, gdzie nie ma doboru.
2. **Salony: te same 4 korzyści 3 razy.**
   - `/marki/posnet` ma:
     - kartę w hero „Kupujesz kasę Posnet: dostajesz” (Fiskalizacja, Szkolenie, Przeglądy, Autoryzowany serwis);
     - blok „Autoryzowany serwis Posnet w Rabce-Zdroju” (Fiskalizacja, Przeglądy, Naprawy, Przejęcie serwisu);
     - blok „Kasa gotowa do sprzedaży” (Dobór, Fiskalizacja, Szkolenie, Przeglądy).
   - Do tego modele polecane pokazane 2× (4 karty „Która kasa Posnet?” i znów w „Wszystko w ofercie, według rodzaju”).
   - Scalić serwis i wdrożenie w jeden blok, a kartę w hero skrócić do 2 linijek.
3. **GoPOS (10 492 px, 12 sekcji):**
   - blok „GoPOS ustawiony pod to, jak pracujesz” powtarza dosłownie H1 („GoPOS dla gastronomii: sala, kuchnia i dowozy w jednym systemie”);
   - „Cały lokal w jednym systemie” (lista modułów) i „Wybierz moduły, których potrzebuje Twój lokal” (konfigurator pakietu) to te same moduły dwa razy — scalić w konfigurator z opisem modułu po kliknięciu;
   - kroki z hero (Sala → Kuchnia → Płatność → Raport) wracają na `/branze/gastronomia` jako „Jak wygląda zamówienie w restauracji z GoPOS” — na branży zostawić link do `/gopos`.
4. **Strony marek bez salonu (20 stron: `/marki/apc`, `/adobe`, `/comarch`, `/dibal`, `/fawag`, `/godex`, `/insoft`, `/nfhotel`, `/sato`, `/stormshield`, `/zebra`, `/gopos`, `/insert` i in.):**
   - szablon „O marce · Linie produktów · Fakty · W katalogu” + cały blok „Jedna lista…” + formularz;
   - na telefonie są **dłuższe niż na komputerze** (np. `/marki/apc` 4 485 / 7 543 px, `/marki/gopos` 5 613 / 8 096 px);
   - skrócić końcówkę do jednego CTA.
5. **`/marki/gopos` i `/marki/insert` obok `/gopos` i `/insert`:** dwa adresy na tę samą frazę, a strona marki jest cienka. Rekomendacja: 301 z `/marki/gopos` → `/gopos` i `/marki/insert` → `/insert` (jak HP → oferta z filtrem) albo canonical.
6. **Branże — zestawy nie z tej branży.**
   - `/branze/gastronomia` w „Gotowe zestawy” pokazuje jeden zestaw: „Wi-Fi dla gości i firmy — TP-Link Omada”, obok pustego miejsca na 2 karty.
   - `/zestawy` ma 5 zestawów gastronomicznych (Kawiarnia, Bistro, Restauracja, Food truck, Bar), ale tylko 4 zestawy w całym serwisie są „Gotowe” (sitemap).
   - W „Inne branże” jest tekst „Wkrótce: biura i usługi, szkoły i instytucje…”, czyli obietnica niedokończonej pracy.
   - Do decyzji: pokazywać zestawy branży niezależnie od statusu albo ukryć sekcję, dopóki nie ma gotowych. „Wkrótce” usunąć.
7. **`/zestawy` pokazuje 23 zestawy, ale 19 nie jest „Gotowe”** (nie ma ich w sitemap). Spójnie z punktem 6: albo ukryć niegotowe, albo dokończyć statusy.
8. **Tytuły i opisy SEO (K33 §8 pkt 3: ≤ 60 znaków, „… | PRO-KOM Biznes Rabka-Zdrój”, opis ≤ 155):**
   - Za krótkie i bez fraz:
     - „GoPOS | PRO-KOM Biznes” (22 zn.), „InsERT | PRO-KOM Biznes” (23), „Kontakt | PRO-KOM Biznes” (24), „O firmie | PRO-KOM Biznes” (25), „Opieka IT | PRO-KOM Biznes” (26);
     - „Laptopy | PRO-KOM Biznes”, „Monitory…”, „Telefony…”, „Tablety…”, „Niszczarki…”, „Sieć i Wi-Fi…”, „Aktualności…”.
   - Za długie (34 strony > 60):
     - wpis „KSeF od 1 stycznia 2027: 6 rzeczy, które mała firma musi zrobić do grudnia | PRO-KOM Biznes” (91);
     - `/oferta/drukarki-wielofunkcyjne/mfp-biuro` (79);
     - zestawy (70);
     - karty produktu ~69 („Posnet Ergo Online — Ergo ONLINE, Ergo ONLINE z Wi-Fi | PRO-KOM Biznes”).
   - 61 opisów < 100 znaków (np. kategorie 52–72: `/oferta/terminale-platnicze` 52, `/oferta/opieka-it-wdrozenia` 54).
   - Propozycje: „GoPOS dla gastronomii — wdrożenie w Rabce | PRO-KOM Biznes”, „Opieka IT dla firm na Podhalu | PRO-KOM Biznes”, „Kontakt i dojazd — Rabka-Zdrój | PRO-KOM Biznes”.
   - Pole SEO w panelu z licznikiem i test długości.
9. **Dane strukturalne:**
   - `BreadcrumbList` brak na 13 stronach z widocznymi okruszkami: `/gopos`, `/insert`, `/opieka-it`, `/ksef`, `/ulga-na-kase-fiskalna`, `/automaty-vendingowe`, `/o-firmie`, `/kontakt`, `/oferta`, prawne, mapa strony;
   - `ItemList` — 0 z 41 kategorii (K33 §8 pkt 5);
   - `WebSite` + `SearchAction` — brak (jak na głównej); adres wyszukiwania to `/oferta?szukaj={search_term_string}`, a nie `?q=` z K33;
   - Open Graph — brak `og:image` na `/aktualnosci` i `/mapa-strony`.
10. **`/konfigurator` poza `sitemap.xml` i `/mapa-strony`**, choć jest indeksowalny (`alternates.canonical` w `konfigurator/page.tsx`). Dodać do `siteLinks`.
11. **Stopka na telefonie ~2 000 px.**
    - Pomiar granatowego pasa na zrzutach 390: `/dostepnosc` 3 120 px, z czego stopka od 1 119 px (64% strony); `/cookies` 3 766 px, stopka 2 000 px.
    - Sześć kolumn linków rozwiniętych jedna pod drugą, a dolny pasek i arkusz Menu już dają nawigację.
    - Na telefonie: kontakt + kolumny jako akordeony (PR `feat/wsp-*`, bo stopka jest wspólna).
12. **Sformułowania o umowie do potwierdzenia przez szefa:**
    - O firmie, zasada 04 „Uczciwe terminy”: „Czas reakcji w godzinach roboczych ustalamy w umowie.”;
    - opis meta `/opieka-it`: „…z czasem reakcji w umowie”.
    - K4-FINAL §1 zakazuje „zapisujemy w umowie” i obietnic niepotwierdzonych. To nie jest dosłowne naruszenie, ale ta sama treść, więc wymaga akceptacji.
13. **Karta produktu — powtórzenia.** Na `/produkt/posnet-ergo-online` „0,6 kg” jest 4× (wyróżnik w hero, „W skrócie”, „Wyróżnia się”, parametry), a ekran 192 × 64 px 2× w bento. Bento nie powinno powtarzać wyróżników z hero. „Do tego zwykle dobierają” zaczyna od routera UniFi Dream Router 7 przy kasie mobilnej — sprawdzić kolejność `polecane` (szuflada / skaner / terminal powinny być pierwsze).
14. **Dolny pasek telefonu** to dziś: Start · Oferta · Szukaj · Zapytanie · Kontakt (zgodnie z MOBILE-APLIKACJA §1). WSPOLNE §5 opisuje: Start · Oferta · **Zapytanie (wyróżnione, środek)** · Kontakt · Menu. Biznes używa własnego `src/sites/biznes/components/mobile/TabBar.tsx`. Potwierdzić, czy sesja linii (L2-B) jest jeszcze w planie.

---

## P2 — co dodać
1. **FAQ w kategoriach.** Tylko `/oferta/kasy-fiskalne` ma FAQ (`FAQPage`). Laptopy, drukarki, sieć, terminale, programy i serwery dostają 3–5 pytań z danych (`slowniki-k4.json` ma „Nie wiesz, co wybrać?”). To dużo tekstu pod długie frazy i mniej telefonów z pytaniami.
2. **Dowód od klientów na O firmie i Kontakcie.** Jest karta „Opinie klientów → Opinie w Google ↗”, ale nie ma ani jednej opinii ani oceny na stronie. Ta sama luka co na głównej (decyzja szefa i zgody).
3. **Aktualności:** jeden wpis w całym serwisie. Minimum 3–4 przed produkcją, każdy ze źródłem (K4-FINAL §10: kary KSeF, paragon z NIP do 450 zł, Polska Bezgotówkowa).
4. **Zestawy branżowe** dla branż „Wkrótce” albo usunięcie zapowiedzi (P1-6).
5. **Krótki wstęp SEO w kategoriach** (2–3 zdania z „Rabka-Zdrój / Podhale”, jak FAQ kas: „…dojeżdżamy do firm w Nowym Targu, Zakopanem…”). Dziś to robi tylko kategoria kas.
6. **OG image** dla `/aktualnosci` i `/mapa-strony`.

---

## P3 — wygląd, ruch, telefon
- **Ciemny motyw:** w hero kategorii (`/oferta/kasy-fiskalne`, 1440 i 390, ciemny) zdjęcia produktów stoją na **białych kafelkach**, czyli „białe plamy”, których zakazuje MOBILE-APLIKACJA §4.7. Użyć tła studio w wersji ciemnej. Ciemny motyw pozostałych stron nie sprawdzony (awaria serwera).
- **Strony dłuższe na telefonie niż na komputerze** (> 1,3×): 25 stron.
  - Głównie strony marek bez salonu (P1-4), `/zestawy` (4 955 / 10 150 px) i `/mapa-strony` (9 869 / 22 053 px).
  - MOBILE §7 zakłada salon ≤ ok. 6 000 px na telefonie, a większość salonów ma 7 300–9 100 px (`/marki/brother` 9 091, `/marki/niszczarki` 8 818, `/marki/lenovo` 8 455).
- **Cele dotykowe (390 px):**
  - chipy wersji w karcie produktu mają 36 px wysokości („Ergo ONLINE (standard)” 180 × 36) — gęsty rząd wymaga ≥ 40, pojedyncze ≥ 44;
  - linki „Źródło: …” mają 17 px (`/gopos`, `/insert`, `/automaty-vendingowe`) — wymóg ≥ 24;
  - telefony i e-mail w wizytówce `/o-firmie` mają 18 px;
  - nazwy produktów jako linki w tabeli salonu mają 16 px.
- **Etykiety serii wersalikami:** „LENOVO · THINKPAD T I X13”, „THINKPAD E I L” (`/oferta/laptopy`, 390). Spójnik „i” po zamianie na wersaliki czyta się jak „I”. Lepiej „ThinkPad T/X13” albo bez wersalików w etykiecie serii.
- **Puste miejsca:**
  - `/branze/gastronomia` — 1 karta zestawu w siatce na 3;
  - `/kontakt` (1440) — pod FAQ ok. 350 px pustego tła obok karty kontaktu.
- **Ukryte H2 okien** na każdej stronie: „Kasy i sprzedaż” (środek mega-menu), „Szukaj w ofercie”, „Menu”, „Twoje zapytanie (0)”. Ten sam problem co na głównej: `role="dialog"` + `aria-labelledby`, nagłówek dopiero po otwarciu.
- **Wydajność — do zmierzenia na stagingu** (Lighthouse telefon ≥ 90, LCP < 2,5 s):
  - `/marki` (167 obrazów, 155 lazy);
  - `/automaty-vendingowe` (89);
  - `/zestawy` (88);
  - `/oferta` (76);
  - `/oferta/skanery-kolektory-etykiety` (70);
  - karta produktu z filmem (`/produkt/lenovo-thinkpad-t14-gen7`);
  - `/gopos`.
  - Leniwe ładowanie jest prawie wszędzie: 8 obrazów bez `lazy` na stronę to rama i hero.
- **Ruch:** animacje wejścia sekcji działają tylko po przewinięciu. Przy szybkim przewijaniu zrzut bez `prefers-reduced-motion` miał puste pola (KSeF, O firmie). Upewnić się, że treść nie zależy od animacji: pokazana w HTML, a animacja tylko `transform`/`opacity` z krótkim progiem.

---

## Wspólne problemy (raz, z listą stron)
| Problem | Strony |
|---|---|
| WhatsApp w stopce | wszystkie 121 |
| WhatsApp w panelu formularza / karcie FAQ | 66: 41 kategorii, 13 marek bez salonu, 3 branże, `/gopos`, `/insert`, `/ksef`, `/opieka-it`, `/ulga-…`, `/automaty-vendingowe`, `/kontakt`, `/aktualnosci`, wpis |
| Formularz zapytania ukryty na telefonie (H2 „Nie wiesz, co wybrać? Zadzwoń…” i „Jedna lista…” niewidoczne) | 41 kategorii, 3 branże, 20 marek bez salonu (kod `ListForm` / `FoldOnPhone`) |
| `alt=""` na zdjęciach w kartach | 41 kategorii, `/oferta`, `/zestawy`, salony, `/gopos`, `/automaty-vendingowe`, `/ulga-…`, branże |
| Ukryte H2 okien w drzewie nagłówków | wszystkie |
| Stopka ~2 000 px na telefonie | wszystkie |
| Brak `BreadcrumbList` | 13 stron (P1-9) |
| Tytuł spoza 30–60 znaków | 49 stron (34 za długie, 15 za krótkie) |
| Opis < 100 znaków | 61 stron |

---

## Proponowana kolejność prac (paczki pod PR-y)
| # | Gałąź | Zakres | Wielkość |
|---|---|---|---|
| 1 | `feat/wsp-bez-whatsapp` | WhatsApp z widoku: stopka, `ContactPanel`, `FaqBiznes`, `Company`, `SearchOverlay`, menu telefonu, opcja w `listForm`, opis meta Kontaktu; test „brak `wa.me` w HTML” | mały, bez migracji |
| 2 | `fix/biznes-twarde-zasady` | dopisek o księgowej (2 miejsca), zdjęcia GoPOS → `k4-gopos-*` (po decyzji), przepełnienie zestawu szkolnego, ikony Opieki IT + test „…” w `d` | mały |
| 3 | `fix/biznes-telefon-tresc` | FAQ akordeonem na KSeF / uldze / kasach, adres na O firmie, CTA Kontaktu (formularz albo przycisk szuflady); test: każdy H2 z komputera ma odpowiednik na 390 albo jest w `FoldOnPhone` | średni |
| 4 | `fix/biznes-alt-a11y` | `alt` = „Marka Model” w kartach, nagłówki okien, chipy ≥ 40/44 px, linki źródeł ≥ 24 px | średni |
| 5 | `feat/biznes-seo-podstrony` | tytuły i opisy (pola + test długości), `BreadcrumbList` na 13 stronach, `ItemList` w kategoriach, `/konfigurator` w sitemap, `WebSite`+`SearchAction` (`?szukaj=`), OG dla aktualności / mapy, 301 `/marki/gopos` i `/marki/insert` (po decyzji) | średni |
| 6 | `refactor/biznes-bez-dubli` | kategorie: jeden blok pomocy; salony: jeden blok korzyści; GoPOS: moduły + konfigurator razem; branża bez kroków GoPOS; strony marek bez salonu: krótsza końcówka; zestawy branży z danych i bez „Wkrótce” | duży → 2 PR-y piętrowo |
| 7 | `feat/wsp-stopka-telefon` | stopka telefonu jako akordeony (wspólna dla linii) | mały |
| 8 | treści (panel, bez kodu) | FAQ kategorii, 3–4 wpisy aktualności, opinie po zgodach | praca Krystiana / szefa |

Po 1–3 warto powtórzyć pełny pomiar (skrypt `audit-sub/crawl.mjs`) i dokończyć to, czego teraz nie dało się sprawdzić: Ctrl K, szuflada, konfigurator, arkusze, ciemny motyw.

---

## Do decyzji Krystiana / szefa
1. **Pole WhatsApp w panelu:** usunąć (migracja usuwająca dane) czy tylko ukryć z widoku.
2. **Zdjęcia GoPOS z ludźmi** (stock producenta): czy zasada „bez zdjęć ludzi” obejmuje zdjęcia producentów. Rekomendacja: tak, podmienić na zdjęcia urządzeń.
3. **Niegotowe zestawy (19 z 23):** pokazywać na `/zestawy` i w branżach czy ukryć do statusu „Gotowe”.
4. **26 pozycji na listach, których nie ma w sitemap** („433 pozycje w ofercie” przy 407 kartach w sitemap; m.in. `samsung-om`, `avtek-ts-8-1-easy`, `dell-pro-rugged`, `gopos-all-in-one`, `insert-inspunkty-ksef` mają status `do-sprawdzenia`, `isIndexableProduct`). Pokazywać w katalogu przed sprawdzeniem czy ukryć. Nie zweryfikowałem, czy ich karty działają z `noindex` (serwer padł).
5. **301 `/marki/gopos` → `/gopos` i `/marki/insert` → `/insert`.**
6. **Brother — „oryginały i sprawdzone zamienniki”** (`/marki/brother`, `/produkt/tusze-tonery`). Zasada zakazuje zamienników tylko dla HP, ale szef powinien potwierdzić, że chce je oferować u Brothera i innych.
7. **Brzmienie o umowie:** „Czas reakcji… ustalamy w umowie” (O firmie), „z czasem reakcji w umowie” (opis Opieki IT).
8. **Wpis KSeF:** „Paragon z NIP do 450 zł przestaje być fakturą uproszczoną w B2B” — K4-FINAL §10 [SZEF]: źródło albo usunąć.
9. **Dolny pasek telefonu:** zostaje układ K4 (Szukaj w pasku) czy przechodzimy na wspólny z WSPOLNE §5 (Zapytanie na środku + Menu).

---
Pliki: zrzuty `audit-sub/shots/` (nazwy z adresu strony, `-1440-light`, `-390-light`, `-dark`), podglądy `audit-sub/view/`, dane pomiaru `audit-sub/crawl.json`, tabela `audit-sub/table.tsv`, skrypty `crawl.mjs`, `tile.py`, `interact.mjs` (do powtórzenia po uruchomieniu serwera).
