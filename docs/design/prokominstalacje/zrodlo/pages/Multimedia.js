  initState() { return { pr: [1899, 2599, 1499, 349], prv: 0, prT: '', jp: 3, jr: false, ldp: 25, tab: 'rec', sl: 0, touched: false }; }
  navKey() { return 'usl'; }
  rvIds() { return ['gd', 'syn', 'jas', 'tvc', 'cms', 'led', 'ext', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, T = ['rec', 'menu', 'win', 'conf'], n = 0;
    this.every(2800, function () {
      n++;
      var s = (self.state.sl + 1) % 3;
      if (!self.state.touched && s === 0 && n % 3 === 0) { var i = (T.indexOf(self.state.tab) + 1) % T.length; self.setState({ tab: T[i], sl: 0 }); return; }
      self.setState({ sl: s });
    });
  }
  page(P, c) {
    const st = this.state, self = this;
    const S = {
      rec: { n: 'Recepcja', ic: P.bed, port: false, sched: [[6, 10, 'Śniadanie i pogoda'], [10, 17, 'Atrakcje'], [17, 23, 'Kolacja i Wi-Fi']], note: 'Ekran w recepcji odpowiada na pytania gości, zanim je zadadzą: pogoda, dojazdy, godziny posiłków, Wi-Fi.',
        s: [{ h: 'Dzień dobry! Pogoda dziś', items: [[P.sun, '−4°', 'rano'], [P.snow, 'śnieg', 'na stokach'], [P.cloud, '+1°', 'po południu']], f: 'Przykładowe dane · pogoda i warunki z wybranych serwisów' }, { h: 'Dziś w okolicy', items: [[P.mountain, 'Szlaki', 'komunikaty TPN'], [P.car, 'Bus 8:15', 'do Zakopanego'], [P.food, 'Kolacja', '18:00–21:00']], f: 'Treści ustawiasz w harmonogramie' }, { h: 'Wi-Fi dla gości', items: [[P.wifi, 'Goście', 'nazwa sieci'], [P.key, '7H2K', 'kod na pobyt'], [P.phone, 'Recepcja', 'wew. 100']], f: 'Kod zmienia się co pobyt' }] },
      menu: { n: 'Menu board', ic: P.food, port: true, sched: [[7, 11, 'Śniadania'], [11, 17, 'Obiady'], [17, 22, 'Kolacje']], note: 'Menu zmienia się samo o ustalonych godzinach. Nową pozycję albo cenę wpisujesz w telefonie i za chwilę jest na ekranie.',
        s: [{ h: 'Śniadania', sub: '7:00–11:00', items: [['Jajecznica na maśle', '24 zł'], ['Oscypek z żurawiną', '18 zł'], ['Moskol z masłem', '14 zł'], ['Kawa z ekspresu', '12 zł']], f: 'Przykładowe menu i ceny' }, { h: 'Obiady', sub: '11:00–17:00', items: [['Kwaśnica na żeberku', '26 zł'], ['Pstrąg z grilla', '42 zł'], ['Placki po zbójnicku', '38 zł'], ['Kompot domowy', '10 zł']], f: 'Przykładowe menu i ceny' }, { h: 'Kolacje', sub: '17:00–22:00', items: [['Deska serów', '36 zł'], ['Pierogi z bryndzą', '29 zł'], ['Grzane wino', '19 zł'], ['Szarlotka', '16 zł']], f: 'Przykładowe menu i ceny' }] },
      win: { n: 'Witryna', ic: P.shop, port: true, sched: [[8, 18, 'Oferta dnia'], [18, 24, 'Wieczór']], note: 'Ekran w witrynie zmienia ofertę w ciągu dnia. Na zewnątrz i w Zakopanem najpierw sprawdzamy, co pozwalają lokalne przepisy.',
        s: [{ h: 'Narty, kaski, gogle', sub: 'Wypożyczalnia czynna 8:00–18:00', f: 'Wejdź do środka →' }, { h: 'Serwis nart od ręki', sub: 'Ostrzenie i smarowanie', f: 'Zapytaj w środku →' }, { h: 'Wieczorem do 20:00', sub: 'Zwrot sprzętu bez kolejki', f: 'Zapraszamy →' }] },
      conf: { n: 'Sala konferencyjna', ic: P.users, port: false, sched: [[8, 16, 'Prezentacje'], [16, 22, 'Ekran powitalny']], note: 'W sali konferencyjnej laptop łączy się z ekranem bez szukania kabli, a między spotkaniami ekran wita gości i pokazuje plan dnia.',
        s: [{ h: 'Prezentacja z laptopa', sub: 'połączenie bezprzewodowe', items: [['I', 40], ['II', 65], ['III', 52], ['IV', 85]], f: 'Przykładowy wykres' }, { h: 'Plan szkolenia', sub: 'Sala A', items: [['9:00', 30], ['11:00', 55], ['13:00', 45], ['15:00', 70]], f: 'Harmonogram z kalendarza obiektu' }, { h: 'Witamy uczestników', sub: 'Przerwa kawowa 10:30', items: [['', 20], ['', 35], ['', 50], ['', 65]], f: 'Ekran powitalny' }] }
    };
    const t = S[st.tab], sl = t.s[st.sl];
    const s = { h: sl.h, sub: sl.sub || '', f: sl.f, items: (sl.items || []).map((x) => st.tab === 'rec' ? { ic: x[0], v: x[1], n: x[2], st: '' } : st.tab === 'menu' ? { n: x[0], v: x[1], st: '' } : { n: x[0], st: 'height:' + x[1] + '%' }) };
    const cur = t.sched[Math.min(st.sl, t.sched.length - 1)];
    const pad = (n) => String(n).padStart(2, '0');
    const tv = {
      tabs: Object.keys(S).map((k) => ({ n: S[k].n, ic: S[k].ic, on: st.tab === k ? 'true' : 'false', cls: st.tab === k ? 'on' : '', pick: () => self.setState({ tab: k, sl: 0, touched: true }) })),
      fmt: t.port ? 'Ekran pionowy' : 'Ekran poziomy', frame: 'tvf' + (t.port ? ' port' : ''), scls: 'tvsc', k: st.tab + st.sl,
      isRec: st.tab === 'rec', isMenu: st.tab === 'menu', isWin: st.tab === 'win', isConf: st.tab === 'conf', s: s,
      clock: pad(cur[0] + 1) + ':' + pad((st.tick * 7) % 60),
      dots: [0, 1, 2].map((i) => i === st.sl ? 'on' : ''),
      sched: t.sched.map((p) => ({ n: p[2], st: 'left:' + (p[0] / 24 * 100).toFixed(1) + '%;width:' + ((p[1] - p[0]) / 24 * 100 - .6).toFixed(1) + '%', cls: p === cur ? 'on' : '' })),
      nowSt: 'left:' + ((cur[0] + 1) / 24 * 100).toFixed(1) + '%', note: t.note
    };
    const gd = [
      { ic: P.bed, t: 'Recepcja i lobby', d: 'Pogoda, dojazdy, atrakcje, posiłki i Wi-Fi. Mniej pytań przy ladzie.' },
      { ic: P.food, t: 'Menu board', d: 'Menu, które zmienia się o godzinie. Zdjęcia dań, ceny i promocje.' },
      { ic: P.shop, t: 'Witryna i totem', d: 'Oferta dnia widoczna z ulicy. Pionowe ekrany przy wejściu.' },
      { ic: P.users, t: 'Sale konferencyjne', d: 'Ekran lub projektor, prezentacja bezprzewodowa, nagłośnienie i mikrofony.' },
      { ic: P.grid, t: 'Ściany wideo', d: 'Kilka ekranów jako jeden obraz w holu, salonie albo na wydarzeniach.' },
      { ic: P.school, t: 'Projektory w salach i szkołach', d: 'Sprzęt projekcyjny w salach szkoleniowych, konferencyjnych i klasach. Robiliśmy to m.in. w Blachotrapezie i w szkole w Rabce-Zdroju.' }
    ];
    const cms = [
      { ic: P.phone, t: 'Zmiany z telefonu lub komputera', d: 'Wgrywasz zdjęcie, zmieniasz cenę albo tekst i publikujesz na wybranych ekranach.' },
      { ic: P.clock, t: 'Harmonogramy', d: 'Śniadanie, obiad, kolacja. Treść zmienia się sama, także w weekendy i święta.' },
      { ic: P.wrench, t: 'Treści na zlecenie', d: 'Możemy przygotowywać i aktualizować treści za Ciebie. Zakres i cena: [SZEF].' }
    ];
    const ext = [
      { ic: P.sun, t: 'Jasność', d: 'Ekrany zewnętrzne mają wielokrotnie wyższą jasność, np. Samsung OHDX 55": 3500 nitów.' },
      { ic: P.snow, t: 'Mróz', d: 'Ten sam model pracuje od −30 do +50°C, w trybie 24/7.' },
      { ic: P.drop, t: 'Woda i pył', d: 'Obudowa IP56 i odporność na uderzenia IK10.' },
      { ic: P.doc, t: 'Przepisy lokalne', d: 'Uchwała krajobrazowa w Zakopanem i przepisy innych gmin. Sprawdzamy przed montażem.' }
    ];
    // dwa salony
    const PN = ['Smartfon 128 GB', 'Smartfon 256 GB', 'Tablet 11 cali', 'Słuchawki bezprzewodowe'];
    const pr = st.pr, now = new Date();
    const stamp = () => { const d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map((x) => String(x).padStart(2, '0')).join(':'); };
    const push = (np, msg, hl) => self.setState({ pr: np, prv: st.prv + 1, prT: 'Zmiana wysłana o ' + stamp() + ' · ' + msg + ' · oba ekrany zaktualizowane', prH: hl });
    const sy = {
      k: 'p' + st.prv, flash: st.prv ? 'fl' : '', date: now.getDate() + '.' + String(now.getMonth() + 1).padStart(2, '0'),
      log: st.prT || 'Demo z przykładowymi cenami. Kliknij przycisk powyżej.',
      btns: [
        { n: 'Obniż cenę smartfona o 100 zł', go: () => { const a = pr.slice(); a[0] = Math.max(999, a[0] - 100); push(a, 'smartfon 128 GB: ' + a[0] + ' zł', 0); } },
        { n: 'Promocja na słuchawki', go: () => { const a = pr.slice(); a[3] = a[3] === 349 ? 279 : 349; push(a, a[3] === 279 ? 'promocja na słuchawki' : 'koniec promocji', 3); } },
        { n: 'Przywróć ceny', go: () => push([1899, 2599, 1499, 349], 'ceny wyjściowe', -1) }
      ],
      screens: [{ n: 'Rabka-Zdrój', st: 'zsynchronizowano' }, { n: 'Zakopane', st: 'zsynchronizowano' }],
      rows: PN.map((n, i) => ({ n: n, p: pr[i].toLocaleString('pl-PL') + ' zł', cls: 'synr' + (st.prv && st.prH === i ? ' hot' : '') + (i === 3 && pr[3] === 279 ? ' promo' : '') }))
    };
    // jasność
    const JP = [
      ['Biuro, sala', P.office, 350, '350–500 nitów', 'Ekran do wnętrz 16/7, np. seria QBC (350 nitów)', 'W biurze czy sali wystarczy podstawowy ekran profesjonalny. Gdy ma pracować cały dzień w sklepie, wybieramy serię do pracy ciągłej.'],
      ['Środek sklepu', P.shop, 500, 'ok. 500 nitów', 'Ekran 24/7, np. seria QMC (500 nitów)', 'Ekran działa przez cały dzień otwarcia i jeszcze dłużej, a jasność 500 nitów spokojnie wystarcza w oświetlonym wnętrzu.'],
      ['Jasne wnętrze', P.sun, 700, 'ok. 700 nitów', 'Ekran o podwyższonej jasności, np. seria QHC (700 nitów)', 'Duże przeszklenia, lobby hotelu, galeria. Powłoka antyrefleksyjna ogranicza odbicia.'],
      ['Witryna w cieniu', P.eye, 2000, '1500–2500 nitów', 'Ekran witrynowy, np. OMDX 32" (2000 nitów)', 'Ekran za szybą od strony północnej albo pod zadaszeniem. Montujemy go w odstępie od szyby, żeby się nie przegrzewał.'],
      ['Witryna w słońcu', P.sun2, 3000, '2500–4000 nitów', 'Ekran witrynowy, np. OMB 55" (3000 nitów)', 'Słońce na szybie to najtrudniejsze miejsce. Nagrzana szyba potrafi przyciemnić obraz, więc liczy się jasność, chłodzenie i odstęp od szyby.'],
      ['Na zewnątrz', P.snow, 3500, 'od 2500 nitów', 'Ekran zewnętrzny, np. OHDX 55" (3500 nitów, IP56, od −30°C)', 'Deszcz, mróz i słońce odbite od śniegu. Tylko ekran przeznaczony na zewnątrz, a w Zakopanem najpierw sprawdzamy zasady uchwały krajobrazowej.']
    ];
    const J = JP[st.jp];
    const wash = st.jr ? Math.max(0, Math.min(1, (J[2] - 350) / 2500)) : 0;
    const js = {
      places: JP.map((p, i) => ({ n: p[0], ic: p[1], on: st.jp === i ? 'true' : 'false', cls: 'chip' + (st.jp === i ? ' on' : ''), pick: () => self.setState({ jp: i }) })),
      vcls: 'p' + st.jp, nits: J[3], cls: J[4], txt: J[5], bar: 'width:' + Math.min(100, J[2] / 3500 * 100).toFixed(0) + '%',
      marks: [[350, '350'], [700, '700'], [2000, '2000'], [3500, '3500']].map((m) => ({ n: m[1], st: 'left:' + (m[0] / 3500 * 100).toFixed(0) + '%' })),
      scrSt: 'opacity:' + (1 - wash * 0.85).toFixed(2) + ';filter:contrast(' + (1 - wash * 0.7).toFixed(2) + ')',
      rLabel: st.jr ? 'Pokaż dobrany ekran' : 'Pokaż zwykły ekran 350 nitów', tR: () => self.setState({ jr: !st.jr })
    };
    const tvc = [
      ['Gwarancja przy użytku w firmie', 'Wyłączona albo ograniczona w warunkach Samsung i LG', 'Zaprojektowany do firm, Samsung LFD: 36 miesięcy'],
      ['Godziny pracy', 'Producent nie podaje', '16/7 albo 24/7, zależnie od serii'],
      ['Jasność', 'Do wnętrz', 'Od 350 do kilku tysięcy nitów'],
      ['Praca w pionie', 'Zwykle nieprzewidziana', 'Pion i poziom, np. QBC, QMC, QHC'],
      ['Odtwarzanie treści', 'Aplikacje telewizora', 'Wbudowany odtwarzacz, bez komputera'],
      ['Zdalne zarządzanie', 'Zwykle brak', 'Włączanie, harmonogram, monitoring, blokada USB i pilota']
    ].map((r) => ({ k: r[0], a: r[1], b: r[2] }));
    const lp = st.ldp / 10;
    const ld = { p: st.ldp, pT: lp.toFixed(1).replace('.', ','), onP: (e) => self.setState({ ldp: +((e && e.target && e.target.value) || 25) }),
      min: lp.toFixed(1).replace('.', ','), cmf: (lp * 2.4).toFixed(1).replace('.', ','),
      z1: 'width:' + Math.min(100, lp / 25 * 100).toFixed(0) + '%', z2: 'left:' + Math.min(100, lp / 25 * 100).toFixed(0) + '%;width:' + Math.max(0, Math.min(100, lp * 2.4 / 25 * 100) - Math.min(100, lp / 25 * 100)).toFixed(0) + '%' };
    const ldx = [
      { ic: P.grid, t: 'Ściany wideo', d: 'Kilka ekranów z wąską ramką jako jeden obraz. Np. Samsung VM55B-U ma 3,5 mm przerwy między obrazami sąsiednich ekranów i fabryczną kalibrację kolorów.' },
      { ic: P.finger, t: 'Monitory interaktywne Avtek', d: 'Polska marka firmy VIDIS. Np. TouchScreen 6 Connect 86: 4K, 20 punktów dotyku, według producenta 5 lat gwarancji.' },
      { ic: P.users, t: 'Samsung Flip i monitory edukacyjne', d: 'Interaktywny flipchart do sal spotkań i monitory z Google Play i Classroom do szkół.' },
      { ic: P.tv, t: 'Projektory i ekrany', d: 'Sale konferencyjne, szkoły i kościoły. Projektor, ekran projekcyjny i nagłośnienie w jednym projekcie.' }
    ];
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Ekrany i digital signage', eye: 'Ekrany, menu board, witryny, ściany wideo · Zakopane i Podhale', h1a: 'Ekrany, które mówią za Ciebie.', h1b: 'Menu, pogoda, oferta.', lead: 'Montujemy ekrany w recepcjach, restauracjach, witrynach i salach konferencyjnych. Dobieramy sprzęt do miejsca, ustawiamy odtwarzanie i harmonogram, a treści zmieniasz z telefonu albo zlecasz nam.', kv: [['24/7', 'ekrany do pracy ciągłej'], ['Z telefonu', 'zmienisz menu'], ['−30°C', 'zakres pracy ekranów zewnętrznych']], tags: ['Samsung', 'Menu board', 'Totemy', 'Sale konferencyjne'] },
      anc: [['gdzie', 'Gdzie montujemy'], ['dwa-salony', 'Demo: dwa salony'], ['jasnosc', 'Jasność'], ['tv-czy-ekran', 'Telewizor czy ekran'], ['tresci', 'Treści'], ['sciany-led', 'LED i interaktywne'], ['zewnatrz', 'Na zewnątrz'], ['pakiety', 'Zestawy'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.food, n: 'Menu board', d: 'Restauracja, kawiarnia, bar.', f: ['1–3 ekrany pionowe lub poziome', 'Odtwarzacz i oprogramowanie', 'Szablon menu w Twoich kolorach', 'Harmonogram śniadań i obiadów', 'Szkolenie z edycji'], pr: 'od [CENA] zł z montażem' },
        { ic: P.bed, n: 'Recepcja i lobby', d: 'Pensjonat, hotel, wypożyczalnia.', f: ['Ekran w recepcji', 'Pogoda, atrakcje, posiłki, Wi-Fi', 'Harmonogram treści', 'Integracja z siecią obiektu', 'Opieka nad treścią na życzenie'], pr: 'od [CENA] zł z montażem', hot: true },
        { ic: P.users, n: 'Sala konferencyjna', d: 'Hotel, firma, szkoła.', f: ['Ekran lub projektor', 'Prezentacja bezprzewodowa', 'Nagłośnienie i mikrofony', 'Okablowanie w stole', 'Szkolenie obsługi, dokumentacja według oferty'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.tv, t: 'Rodzaj i wielkość ekranu', d: 'Ekran do pracy ciągłej, zewnętrzny, pionowy, ściana wideo.' },
        { ic: P.cpu, t: 'Odtwarzacz i oprogramowanie', d: 'Wbudowany odtwarzacz lub osobny, licencja systemu treści.' },
        { ic: P.build, t: 'Montaż', d: 'Uchwyt ścienny, sufitowy, totem, praca na wysokości.' },
        { ic: P.net, t: 'Zasilanie i sieć', d: 'Gniazdo, przewód sieciowy lub Wi-Fi przy ekranie.' },
        { ic: P.grid, t: 'Treści', d: 'Szablony, projekt graficzny, aktualizacje na zlecenie.' },
        { ic: P.wrench, t: 'Serwis', d: 'Zdalny nadzór i wymiana sprzętu w razie awarii.' }
      ],
      faq: [
        ['Czy mogę zwykły telewizor użyć jako menu board?', 'Można, ale telewizor nie jest projektowany do pracy wiele godzin dziennie i zwykle ma słabsze zarządzanie treścią. Do pracy ciągłej dobieramy ekrany profesjonalne.'],
        ['Kto zmienia treści na ekranach?', 'Ty, w aplikacji lub przeglądarce, albo my w ramach opieki nad treścią. Ustawiamy też harmonogramy, żeby menu zmieniało się samo.'],
        ['Czy w Zakopanem mogę mieć ekran w witrynie?', 'Od 4 lipca 2026 r. obowiązuje tam uchwała krajobrazowa, a według materiałów miasta ogranicza ona m.in. nośniki o zmiennej, migającej treści. Ekran w witrynie lub na elewacji może być więc mocno ograniczony. Pełny tekst uchwały sprawdzamy przed każdą ofertą na taki montaż.'],
        ['Czy ekran zniesie mróz na zewnątrz?', 'Ekran przeznaczony na zewnątrz tak. Przykładowo Samsung OHDX 55" pracuje od −30 do +50°C i ma obudowę IP56. Zwykły ekran za szybą w nieogrzewanym miejscu to ryzyko.'],
        ['Czy licencja na oprogramowanie jest płatna?', 'Zwykle tak. Samsung VXT rozliczany jest w abonamencie. Licencję dobieramy do liczby ekranów i potrzebnych funkcji, a jej koszt podajemy w ofercie.'],
        ['Mamy MagicINFO. Trzeba wszystko wymieniać?', 'Nie od razu. Samsung kończy sprzedaż MagicINFO w wersji lokalnej z końcem 2026 roku, ale wspiera istniejące instalacje do końca 2029. Wyjątek: MagicINFO Cloud przestaje działać 28.02.2027, więc tam migrację na VXT trzeba zaplanować wcześniej. W pozostałych przypadkach migrujemy wtedy, gdy ma to sens.'],
        ['Czy ekran połączy się z nagłośnieniem?', 'Tak. W salach konferencyjnych i restauracjach łączymy obraz z nagłośnieniem stref.']
      ],
      segRel: ['rest', 'sklep', 'hotel', 'gmina', 'szk'],
      rel: ['snd', 'wifi', 'smart'],
      src: [['Samsung VX Docs: harmonogram MagicINFO i VXT', 'https://docs.samsungvx.com/docs/'], ['Samsung Polska, polityka gwarancyjna', 'https://www.samsung.com/pl/support/warranty/'], ['Samsung, MagicINFO: komponenty', 'https://www.samsung.com/uk/business/display-solutions/magicinfo/component/'], ['Samsung, VXT CMS', 'https://www.samsung.com/au/business/display-solutions/vxt/'], ['Samsung, Outdoor Signage OHDX 55"', 'https://www.samsung.com/uk/business/smart-signage/outdoor-signage/outdoor-signage-ohdx-lh55ohdebgbxen/'], ['Zakopane, uchwała krajobrazowa', 'https://www.zakopane.pl/zagospodarowanie-przestrzenne/uchwala-krajobrazowa'], ['Zakopane: uchwała krajobrazowa w pigułce (materiał miasta)', 'https://www.zakopane.pl/media/download/7a287fa2-3f7f-4bba-a22f-e1413c373199'], ['Radio Kraków o uchwale krajobrazowej (28.05.2026)', 'https://www.radiokrakow.pl/aktualnosci/nowy-sacz/podhale/koniec-chaosu-reklamowego-w-zakopanem/'], ['LG, warunki gwarancji na telewizory, pkt 10 (PDF)', 'https://www.mediaexpert.pl/products/files/96/969102/LG_Warunki_Gwarancji.pdf'], ['LG, ekran do witryn 55XS4J-B', 'https://lg.com/uk/business/digital-signage/lg-55xs4j-b'], ['Avtek, TouchScreen 6 Connect 86, karta produktu (PDF)', 'https://photos05.redcart.pl/templates/images/description/50523/Image/1715344290-avtek-ts-6-connect-86-karta-pl.pdf'], ['Christie, rozstaw pikseli a odległość oglądania', 'https://www.christiedigital.com/spotlight/understanding-pixel-pitch-led-video-wall/']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Ekran z montażem i treściami na start.', p: 'Każdy zestaw kończy się szkoleniem z edycji treści.', note: 'To przykłady. Wielkość i rodzaj ekranów dobieramy do miejsca, a cenę podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena ekranów.', p: 'Najwięcej zmienia rodzaj ekranu: do recepcji, do pracy ciągłej czy na zewnątrz.' }, relH: 'Obraz, dźwięk i sieć razem.' }
    }), { sy: sy, js: js, tvc: tvc, ld: ld, ldx: ldx, tv: tv, gd: gd, cms: cms, ext: ext, ctaEye: 'Ekrany i multimedia', ctaH: 'Pokaż miejsce na ekran. Zaproponujemy sprzęt i treści na start.', ctaP: 'Dobór ekranu, montaż, odtwarzanie, harmonogram i szkolenie. Potem treści na zlecenie i serwis.' });
  }
