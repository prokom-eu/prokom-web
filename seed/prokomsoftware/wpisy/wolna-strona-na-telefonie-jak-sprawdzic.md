---
slug: wolna-strona-na-telefonie-jak-sprawdzic
title: Strona wolno działa na telefonie – jak to sprawdzić i co poprawić
category: Strony
publishedAt: 2026-11-15 11:10
seoTitle: Wolna strona na telefonie: jak sprawdzić
seoDescription: Jak samodzielnie zmierzyć szybkość strony na telefonie, co oznaczają wskaźniki LCP, INP i CLS oraz które poprawki dają najwięcej. Poradnik bez żargonu.
lead: Klient z telefonem nie czeka. Jeśli strona ładuje się długo albo skacze podczas przewijania, zamyka ją i wybiera kolejną firmę z listy. Pokazujemy, jak sprawdzić swoją stronę i co zwykle ją spowalnia.
summary: Szybkość strony sprawdzisz bezpłatnie narzędziem PageSpeed Insights od Google. Najważniejsze są trzy wskaźniki: LCP (kiedy pojawia się główna treść, dobrze do 2,5 s), INP (jak szybko strona reaguje na dotyk, dobrze do 200 ms) i CLS (czy elementy nie skaczą, dobrze do 0,1). Najczęściej winne są ciężkie zdjęcia, wtyczki i skrypty.
relatedSolutions: audyt-strony-lub-programu, przebudowa-starej-strony
cta: Bezpłatnie | Zmierzymy szybkość Twojej strony | Szybki audyt pokaże, co spowalnia stronę na telefonie i które poprawki dadzą najwięcej. | Zamów darmowy audyt | /audyt
source: web.dev – Web Vitals (Google) | https://web.dev/articles/vitals | 2026-11-15
---

Szybkość strony to nie jest sprawa dla informatyków. To sprawa sprzedaży. Każda sekunda czekania to klient, który mógł zadzwonić do Ciebie, a zadzwonił do konkurencji. Dobra wiadomość: sprawdzenie, jak Twoja strona radzi sobie na telefonie, zajmuje dwie minuty i nic nie kosztuje.

## Jak zmierzyć szybkość strony

Najprostsze narzędzie to PageSpeed Insights od Google. Wpisujesz adres strony, czekasz chwilę i dostajesz wynik osobno dla telefonu i komputera. Patrz przede wszystkim na wynik dla telefonu – jest zwykle gorszy i to on lepiej oddaje sytuację Twoich klientów.

W raporcie zobaczysz dwie części:

- **dane od prawdziwych użytkowników** – jeśli strona ma wystarczająco dużo odwiedzin, Google pokazuje, jak działała u ludzi w ostatnich tygodniach,
- **test laboratoryjny** – symulację ładowania na przeciętnym telefonie i wolniejszym internecie.

Dane od użytkowników są ważniejsze, bo pokazują rzeczywistość. Test laboratoryjny pomaga znaleźć przyczyny.

## Trzy wskaźniki, które warto znać

Google opisuje wygodę strony trzema wskaźnikami nazywanymi Core Web Vitals. Nie musisz znać ich technicznych definicji – wystarczy wiedzieć, co mierzą.

### LCP – kiedy widać najważniejszą treść

Mierzy, po jakim czasie na ekranie pojawia się największy element, na przykład główne zdjęcie albo nagłówek. Według Google dobry wynik to do 2,5 sekundy.

### INP – jak szybko strona reaguje na dotyk

Mierzy, ile czasu mija od stuknięcia w przycisk czy menu do widocznej reakcji. Dobry wynik to do 200 milisekund. Jeśli menu otwiera się z opóźnieniem, klient ma wrażenie, że strona „zamarza”.

### CLS – czy elementy nie skaczą

Mierzy, jak bardzo przesuwa się treść podczas ładowania. Znasz to: chcesz kliknąć link, a w ostatniej chwili wskakuje baner i trafiasz w coś innego. Dobry wynik to do 0,1.

Wszystkie trzy wartości liczy się dla większości wizyt, a nie dla najlepszego przypadku. Dlatego strona, która „u mnie działa szybko” na nowym telefonie i domowym internecie, może wypadać słabo w danych Google.

## Co najczęściej spowalnia stronę

Przyczyny powolnego działania powtarzają się bardzo często:

1. **Za duże zdjęcia.** Zdjęcie prosto z aparatu ma kilka megabajtów, a na telefonie wystarczy jego mała, dobrze skompresowana wersja.
2. **Wtyczki i dodatki.** Każdy dodatek ładuje własne pliki, nawet jeśli na danej podstronie nie jest potrzebny.
3. **Zewnętrzne skrypty.** Czaty, liczniki odwiedzin, piksele reklamowe, osadzone mapy i filmy. Każdy z nich to zapytanie do innego serwera.
4. **Fonty z zewnątrz.** Kilka krojów pisma w kilku grubościach potrafi ważyć więcej niż cała treść strony.
5. **Słaby serwer.** Najtańszy hosting współdzielony z tysiącami innych stron bywa po prostu wolny.
6. **Suwaki i animacje na start.** Duży pokaz slajdów na górze strony to częsta przyczyna słabego LCP.

## Jak czytać wynik od 0 do 100

Na górze raportu PageSpeed Insights widać kolorowe kółko z wynikiem od 0 do 100. To ocena testu laboratoryjnego, a nie bezpośrednia ocena Google dla Twojej strony. Wynik zmienia się nieco przy każdym pomiarze, bo zależy od chwilowego obciążenia serwera i sieci.

Dlatego nie przejmuj się różnicą kilku punktów. Ważniejsze są dwie rzeczy:

- czy dane od prawdziwych użytkowników mieszczą się w zielonych progach,
- które konkretne problemy raport wskazuje w sekcji z zaleceniami.

Zalecenia są uporządkowane według tego, ile czasu można zyskać. Zacznij od pierwszych pozycji na liście – zwykle to zdjęcia i skrypty.

## Co możesz poprawić sam, a co wymaga programisty

Część rzeczy zrobisz bez pomocy: zmniejszysz zdjęcia przed wgraniem, usuniesz nieużywane wtyczki, zrezygnujesz z pokazu slajdów. Inne wymagają zmian w kodzie: wczytywanie zdjęć dopiero przy przewijaniu, odchudzenie skryptów, przeniesienie fontów na własny serwer.

Jeśli strona jest zbudowana na starym szablonie z wieloma wtyczkami, poprawki mogą dać tylko częściowy efekt. Wtedy warto rozważyć [przebudowę](/rozwiazania/przebudowa-starej-strony) – nowa strona pisana pod Twoją firmę może być lekka od początku. Nasze strony projektujemy tak, żeby na telefonie ładowały się poniżej 2,5 sekundy.

## Najczęstsze pytania

### Czy szybkość strony wpływa na pozycję w Google?

Jest jednym z wielu czynników. Sama szybkość nie wypchnie słabej treści na pierwsze miejsce, ale przy podobnych stronach może zdecydować. Ważniejsze jest to, że wolna strona traci klientów, którzy już na nią trafili.

### Mam dobry wynik na komputerze, a słaby na telefonie. Dlaczego?

Test na telefon symuluje słabszy procesor i wolniejsze łącze. To normalne, że wynik jest niższy. Liczy się jednak telefon, bo z niego coraz częściej korzystają osoby szukające usług.

### Jak często sprawdzać szybkość?

Po każdej większej zmianie na stronie i co kilka miesięcy. Nowy dodatek albo ciężkie zdjęcie na stronie głównej potrafią szybko zepsuć dobry wynik.

## Pierwszy krok

Wpisz adres swojej strony w PageSpeed Insights i zobacz wynik dla telefonu. Jeśli jest słaby i nie wiesz, od czego zacząć, zamów nasz [audyt strony](/rozwiazania/audyt-strony-lub-programu) – szybki audyt jest bezpłatny. A jeśli już wiesz, że potrzebujesz nowej strony, sprawdź cenę w [kreatorze](/dobierz).
