# Teksty Instalacji → http://panel.localhost:3002

Podgląd, nic nie zapisano (zapis: --write).

INST-6 PR5 (Poradnik), podgląd względem lokalnej bazy po PR4. Wpis „Monitoring w pensjonacie a RODO” dostaje nowy adres `kamery-w-pensjonacie` (stary przekierowuje 308), 8 nowych wpisów skrypt tworzy przy `--write`. Najpierw scal #448 (kategorie) i uruchom migracje na stagingu. `--write` zaraz po wdrożeniu: do tego czasu stary adres wpisu działa bez przekierowania (przekierowanie włącza się, gdy wpis ma nowy slug).

9 rekordów, 18 pól do zmiany.

### inst-services · alarm

| Pole | Było | Będzie |
|---|---|---|
| offer.description | Alarm powiadamia Cię na telefonie, gdy ktoś wejdzie do domu albo firmy. Wideodomofon przy furtce odbierasz z dowolneg… | Alarm powiadamia Cię w telefonie, gdy ktoś wejdzie do domu albo firmy. Wideodomofon przy furtce odbierasz z dowolnego… |
| cta.text | Przyjedziemy, zaplanujemy strefy i czujki i podamy wycenę na piśmie. Po montażu testujemy czujki razem z Tobą i zajmu… | Przyjedziemy, zaplanujemy strefy oraz czujki i podamy wycenę na piśmie. Po montażu testujemy czujki razem z Tobą i za… |

### inst-services · smart

| Pole | Było | Będzie |
|---|---|---|
| hero.h1a | Smart home Ampio na Podhalu, który działa bez internetu | Smart home Ampio na Podhalu, także bez internetu |
| hero.lead | Montujemy polski system Ampio w domach, apartamentach, pensjonatach i firmach. Światłem, ogrzewaniem, roletami, bramą… | Montujemy polski system Ampio w domach, apartamentach, pensjonatach i firmach. Światłem, ogrzewaniem, roletami, bramą… |

### inst-objects · pens

| Pole | Było | Będzie |
|---|---|---|
| hero.facts[0].label | obiektów noclegowych bez kategorii w Zakopanem (09.2026) | obiekty noclegowe bez kategorii w Zakopanem (09.2026) |

### inst-objects · hotel

| Pole | Było | Będzie |
|---|---|---|
| hero.facts[0].label | średnio mniej na ogrzewaniu i chłodzeniu pokoi ze sterowaniem według obecności | mniej na ogrzewaniu i chłodzeniu pokoi w badaniu w USA |

### inst-objects · szk

| Pole | Było | Będzie |
|---|---|---|
| faq[1].answer | Do 3 miesięcy. Ustawiamy rejestrator tak, żeby sam usuwał starsze nagrania i nikt nie musiał o tym pamiętać. | Tyle dni, ile ustali szkoła. Ustawiamy rejestrator tak, żeby sam usuwał starsze nagrania i nikt nie musiał o tym pami… |
| faq[2].answer | Opis systemu i rzut kamer, które dyrektor może pokazać organowi prowadzącemu, radzie pedagogicznej, radzie rodziców i… | Opis systemu i rzut kamer, które dyrektor pokaże na konsultacjach. Przed startem wieszamy tabliczki o monitoringu prz… |

### inst-objects · dev

| Pole | Było | Będzie |
|---|---|---|
| hero.facts[0].label | mieszkań w 2025 r. oddali deweloperzy (GUS) | mieszkań oddali deweloperzy w 2025 r. |
| problems[0].description | Do odbioru budynku potrzebne są protokoły pomiarów instalacji, a na końcu budowy często nikt ich nie ma. | Protokoły pomiarów oddajemy do odbioru budynku, a na końcu budowy często nikt ich nie ma. |

### inst-objects · bud

| Pole | Było | Będzie |
|---|---|---|
| hero.facts[0].label | firm budowlanych zgłasza kradzieże (BauWatch 2026, raport firmy sprzedającej monitoring) | firm budowlanych zgłasza kradzieże |

### pages · alarmy

| Pole | Było | Będzie |
|---|---|---|
| seo.description | Alarmy Satel i Ajax, wideodomofony i domofony na Podhalu. Ochrona domu letniskowego zimą, powiadomienia na telefon i … | Alarmy Satel i Ajax, wideodomofony i domofony na Podhalu. Ochrona domu letniskowego zimą, powiadomienia w telefonie o… |

### posts · kamery-w-pensjonacie

| Pole | Było | Będzie |
|---|---|---|
| slug | monitoring-a-rodo | kamery-w-pensjonacie |
| title | Gdzie powiesić kamery w pensjonacie, żeby goście czuli się dobrze | Kamery w pensjonacie: gdzie je powiesić i jak ustawić |
| category | monitoring | noclegi |
| lead | Parking i narciarnia tak, pokoje i sauna nie. Jak długo przechowywać nagrania, co napisać na tabliczce i dlaczego kam… | Kamery w pensjonacie wiesza się tam, gdzie goście przychodzą i zostawiają rzeczy: na parkingu, przy wejściu, w narcia… |
| content.root.children | 16 pozycji | 34 pozycje |
| seo.description | Monitoring a RODO w pensjonacie, sklepie i firmie: tabliczki, czas przechowywania nagrań, kamery a prywatność gości i… | Gdzie powiesić kamery w pensjonacie, jak ustawić kadr i maski, ile dni trzymać nagrania i jak poinformować gości. Pra… |

Nowe wpisy Poradnika (utworzone przy --write): ile-kamer-do-domu, kamera-wifi-czy-przewodowa, alarm-w-domku-letniskowym, wifi-w-pensjonacie, smart-home-w-nowym-domu, ladowarka-do-auta-w-domu, monitoring-zima-w-gorach, antena-satelitarna-czy-dvb-t2
