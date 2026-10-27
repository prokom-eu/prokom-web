  initState() { return { tl: ['fib', 'lan', 'rtv', 'dom'], stp: 3, el: -1, touched: false, rTyp: 0, rZak: ['lan', 'fib', 'dom'], rLok: '', rName: '', rTel: '', rMail: '', rOk: false, rFiles: '', rTry: false, rSent: false }; }
  navKey() { return 'usl'; }
  rvIds() { return ['zak', 'dk', 'prz', 'rfq', 'faq', 'rel']; }
  mountPage() {
    var self = this, i = 3;
    this.every(3200, function () {
      if (self.state.touched) return;
      i = (i + 1) % 6;
      self.setState({ stp: i });
    });
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const has = (k) => st.tl.includes(k);
    const LAY = [['fib', 'Światłowód', '#F2B84B'], ['lan', 'Sieć LAN', '#12B6D8'], ['rtv', 'RTV/SAT', '#B58CF0'], ['dom', 'Domofon', '#7BD36A']];
    const STEPS = [
      ['Przedmiar', 'Czytamy projekt i przedmiar. Zaznaczamy braki i kolizje z innymi branżami, zanim zrobi się z nich problem na budowie.'],
      ['Oferta', 'Trasy rozrysowane na projekcie, wycena i harmonogram dopasowany do etapów budowy.'],
      ['Trasy', 'Stan surowy: peszle, korytka, pion, puszki i skrzynki. Kable wejdą później, po tynkach.'],
      ['Montaż', 'Światłowód, skrętka, RTV/SAT i domofon. Szafy, gniazda, osprzęt w każdym lokalu.'],
      ['Pomiary', 'Każde gniazdo i włókno zmierzone i opisane. Protokół dla każdego lokalu.'],
      ['Odbiór', 'Dokumentacja powykonawcza, protokoły pomiarów i odbiór z inspektorem.']
    ];
    const EL = [
      ['Studnia i przyłącze operatora', 'Operator wprowadza swój kabel kanalizacją do budynku. My przygotowujemy przepust i trasę do pomieszczenia teletechnicznego.'],
      ['Punkt styku', 'Granica między siecią operatora a instalacją budynku. Tu podłącza się każdy operator, który chce świadczyć usługi lokatorom.'],
      ['Szafa główna', 'Przełącznice światłowodowe i panele krosowe. Każde włókno i każdy port opisane tak, jak w dokumentacji.'],
      ['Pion teletechniczny', 'Szacht przez wszystkie kondygnacje. Zostawiamy w nim zapas miejsca na instalacje, które dojdą za kilka lat.'],
      ['Skrzynka piętrowa', 'Rozdział włókien i przewodów na lokale danego piętra. Serwis bez wchodzenia do mieszkań.'],
      ['Skrzynka mieszkaniowa', 'Tu kończy się instalacja budynku, a zaczyna sieć w mieszkaniu. Miejsce na router operatora.'],
      ['Gniazda w pokojach', 'Skrętka do pokoi, gniazdo RTV przy telewizorze, unifon przy drzwiach. Wszystko opisane.'],
      ['Antena, SAT i multiswitch', 'Wspólna antena naziemna i satelitarna na dachu. Multiswitch rozdziela sygnał do gniazd w lokalach.'],
      ['Panel domofonu', 'Panel przy wejściu, unifon lub monitor w każdym lokalu. Można dodać otwieranie z aplikacji.']
    ];
    const hl = {}, mk = {};
    EL.forEach((e, i) => {
      hl['k' + (i + 1)] = 'tthl' + (st.el === i ? ' on' : '');
      mk['k' + (i + 1)] = { cls: 'ttm' + (st.el === i ? ' on' : ''), pick: () => touch({ el: st.el === i ? -1 : i }) };
    });
    const cls = 'ttx s' + st.stp + (st.stp < 2 ? ' bp' : '') + [2, 3, 4, 5].filter((n) => st.stp >= n).map((n) => ' g' + n).join('') + LAY.filter((l) => has(l[0])).map((l) => ' L' + l[0]).join('') + (st.el >= 0 ? ' focus' : '');
    const E = st.el >= 0 ? EL[st.el] : null;
    const tt = {
      lay: LAY.map((l) => ({ n: l[1], st: '--vc:' + l[2], on: has(l[0]) ? 'true' : 'false', cls: 'lpill' + (has(l[0]) ? ' on' : ''), pick: () => touch({ tl: has(l[0]) ? st.tl.filter((x) => x !== l[0]) : st.tl.concat([l[0]]), stp: Math.max(st.stp, 3) }) })),
      cls: cls, hl: hl, mk: mk,
      steps: STEPS.map((s, i) => ({ n: String(i + 1).padStart(2, '0'), t: s[0], cls: 'tts' + (i === st.stp ? ' on' : i < st.stp ? ' done' : ''), pick: () => touch({ stp: i, el: -1 }) })),
      nK: E ? String(st.el + 1) : String(st.stp + 1).padStart(2, '0'), nCls: 'ttnk' + (E ? ' el' : ''),
      nT: E ? E[0] : 'Etap: ' + STEPS[st.stp][0], nD: E ? E[1] : STEPS[st.stp][1],
      nums: EL.map((e, i) => ({ n: String(i + 1), lab: (i + 1) + '. ' + e[0], on: st.el === i ? 'true' : 'false', cls: 'xc-ttn' + (st.el === i ? ' on' : ''), pick: () => touch({ el: st.el === i ? -1 : i }) }))
    };
    const zak = [
      { ic: P.net, t: 'Okablowanie strukturalne', d: 'Skrętka w mieszkaniach i lokalach, gniazda, szafy, panele krosowe, opis i pomiary.' },
      { ic: P.fiber, t: 'Światłowód do lokali', d: 'Instalacja światłowodowa od punktu styku do skrzynek mieszkaniowych, gotowa dla operatorów.' },
      { ic: P.tv, t: 'RTV/SAT zbiorcza', d: 'Antena naziemna i satelitarna, multiswitche, rozprowadzenie do gniazd w lokalach.' },
      { ic: P.phone, t: 'Domofony i wideodomofony', d: 'Panele przy wejściach i bramie, unifony lub monitory w lokalach, otwieranie z aplikacji.' },
      { ic: P.cam, t: 'Monitoring części wspólnych', d: 'Garaż podziemny, wejścia, śmietnik, plac zabaw. Zakres dokumentacji (np. pod RODO wspólnoty) ustalamy w ofercie.' },
      { ic: P.lock, t: 'Kontrola dostępu', d: 'Breloki do klatek, garażu i komórek lokatorskich, szlaban na wjeździe.' }
    ];
    const dk = [
      { ic: P.crane, t: 'Deweloperzy', d: 'Teletechnika budynków wielorodzinnych i osiedli domów, od projektu do odbioru.' },
      { ic: P.build, t: 'Generalni wykonawcy', d: 'Podwykonawstwo branży teletechnicznej zgodnie z harmonogramem budowy.' },
      { ic: P.users, t: 'Wspólnoty i zarządcy', d: 'Modernizacja domofonów, RTV/SAT, monitoringu i dostępu w istniejących budynkach.' },
      { ic: P.hotel, t: 'Hotele i obiekty publiczne', d: 'Okablowanie, sieci, TV hotelowa, nagłośnienie i ekrany w jednym zakresie.' }
    ];
    const prz = [
      { t: 'Od 12.02.2026: światłowód w nowym budynku', d: 'Rozporządzenie UE 2024/1309 (Gigabit Infrastructure Act, art. 10): nowe budynki i budynki po gruntownej przebudowie, dla których wniosek o pozwolenie złożono po 12.02.2026, mają mieć wewnętrzną infrastrukturę i okablowanie światłowodowe, a budynki wielorodzinne także punkt dostępu dla operatorów. Wyjątki i szczegóły sprawdzamy w projekcie.' },
      { t: 'Ustawa o wspieraniu rozwoju sieci telekomunikacyjnych', d: 'Art. 30 ust. 6: budynek powinien być wyposażony, zgodnie z warunkami technicznymi, w instalację telekomunikacyjną. Przy przebudowie instalacji w budynkach wielorodzinnych, zamieszkania zbiorowego i użyteczności publicznej obowiązek dotyczy także ich (art. 30 ust. 7–9).' },
      { t: 'Warunki techniczne: okres przejściowy', d: 'Rozporządzenie o warunkach technicznych z 2002 r. utraciło moc 20.09.2026, a nowego do października 2026 nie ogłoszono. Do 20.03.2028 projekt można sporządzić według dotychczasowych warunków (dla teletechniki rozdział 8a), jeśli inwestor złoży oświadczenie (art. 102a–102c Prawa budowlanego). Stan prawny sprawdzamy przy każdym projekcie.' }
    ];
    const RT = ['Budynek wielorodzinny', 'Osiedle domów', 'Hotel lub pensjonat', 'Obiekt komercyjny', 'Modernizacja'];
    const RZ = [['lan', 'Okablowanie LAN'], ['fib', 'Światłowód'], ['rtv', 'RTV/SAT'], ['dom', 'Domofony'], ['cam', 'Monitoring'], ['kd', 'Kontrola dostępu']];
    const rfq = {
      typ: RT.map((t, i) => ({ n: t, on: st.rTyp === i ? 'true' : 'false', cls: 'chip' + (st.rTyp === i ? ' on' : ''), pick: () => self.setState({ rTyp: i }) })),
      zak: RZ.map((z) => { const on = st.rZak.includes(z[0]); return { n: z[1], k: on ? '✓' : '+', on: on ? 'true' : 'false', cls: 'chip' + (on ? ' on' : ''), toggle: () => self.setState({ rZak: on ? st.rZak.filter((x) => x !== z[0]) : st.rZak.concat([z[0]]) }) }; }),
      lok: st.rLok, onLok: (e) => { const v = e && e.target ? String(e.target.value || '').replace(/[^0-9]/g, '').slice(0, 4) : ''; if (e && e.target && e.target.value !== v) e.target.value = v; self.setState({ rLok: v, rSent: false }); },
      name: st.rName, onName: (e) => self.setState({ rName: e && e.target ? String(e.target.value || '') : '', rSent: false }),
      tel: st.rTel, onTel: (e) => self.setState({ rTel: e && e.target ? String(e.target.value || '') : '', rSent: false }),
      mail: st.rMail, onMail: (e) => self.setState({ rMail: e && e.target ? String(e.target.value || '') : '', rSent: false }),
      okOn: st.rOk ? 'true' : 'false', okCls: 'xc-chk' + (st.rOk ? ' on' : '') + (st.rTry && !st.rOk ? ' bad' : ''), okToggle: () => self.setState({ rOk: !st.rOk, rSent: false }),
      files: st.rFiles || 'Nie wybrano pliku', onFiles: (e) => { const f = e && e.target && e.target.files ? Array.prototype.map.call(e.target.files, (x) => x.name) : []; self.setState({ rFiles: f.length ? f.join(', ') : '' }); },
      sTyp: RT[st.rTyp], sZak: RZ.filter((z) => st.rZak.includes(z[0])).map((z) => z[1]).join(', ') || '—', sLok: st.rLok || '—'
    };
    const telOk = st.rTel.replace(/[^0-9]/g, '').length >= 9, mailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(st.rMail.trim());
    const errs = [];
    if (!st.rName.trim()) errs.push('imię i nazwisko lub firmę');
    if (!telOk && !mailOk) errs.push('telefon albo e-mail');
    if (!st.rOk) errs.push('zgodę na kontakt');
    rfq.err = st.rTry && errs.length ? 'Uzupełnij: ' + errs.join(', ') + '.' : '';
    rfq.sent = st.rSent;
    rfq.nameCls = 'zin' + (st.rTry && !st.rName.trim() ? ' xc-bad' : '');
    rfq.telCls = 'zin' + (st.rTry && !telOk && !mailOk ? ' xc-bad' : '');
    rfq.mailCls = rfq.telCls;
    rfq.send = () => self.setState({ rTry: true, rSent: errs.length === 0 });
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Teletechnika w budownictwie', eye: 'Teletechnika · dla deweloperów i wykonawców · Małopolska', h1a: 'Teletechnika budynku', h1b: 'od pionu do gniazdka.', lead: 'Okablowanie strukturalne, światłowód do lokali, RTV/SAT, domofony, monitoring i kontrola dostępu w budynkach wielorodzinnych, osiedlach, hotelach i obiektach komercyjnych. Z pomiarami, opisem i dokumentacją powykonawczą.', kv: [['6 instalacji', 'w jednym zakresie'], ['Pomiary', 'i opis każdego gniazda'], ['od 2004', 'PRO-KOM na Podhalu']], tags: ['Światłowód FTTH', 'RTV/SAT', 'Domofony', 'Pomiary'], cta: 'Wyślij zapytanie', ctaHref: '#zapytanie' },
      anc: [['zakres', 'Zakres'], ['dla-kogo', 'Dla kogo'], ['przepisy', 'Przepisy'], ['zapytanie', 'Zapytanie ofertowe'], ['faq', 'Pytania']],
      faq: [
        ['Czy wejdziecie na budowę na etapie stanu surowego?', 'Tak, to najlepszy moment. Prowadzimy wtedy trasy, piony i puszki, a montaż osprzętu robimy po tynkach i posadzkach.'],
        ['Czy wykonujecie pomiary i dokumentację?', 'Tak. Każde gniazdo i włókno jest opisane i zmierzone, a w dokumentacji powykonawczej dostajesz schematy, protokoły i opis tras.'],
        ['Czy pracujecie poza Podhalem?', 'Tak. Przy inwestycjach budowlanych działamy w całej Małopolsce. Zakres i logistykę ustalamy w ofercie.'],
        ['Czy budynek musi mieć światłowód?', 'Co do zasady tak. Od 12.02.2026 nowe budynki, dla których wniosek o pozwolenie złożono po tej dacie, mają mieć wewnętrzną instalację światłowodową, a budynki wielorodzinne także punkt dostępu dla operatorów (rozporządzenie UE 2024/1309, art. 10). Wyjątki i szczegóły sprawdzamy w projekcie.'],
        ['Czy modernizujecie domofony we wspólnotach?', 'Tak. Często da się wykorzystać istniejące przewody i wymienić panel oraz unifony na wideodomofony z aplikacją.'],
        ['Jaką gwarancję dajecie na instalację?', 'Na wykonane prace 24 miesiące gwarancji PRO-KOM, na urządzenia gwarancja producenta. Szczegóły odbioru i usuwania usterek zapisujemy w umowie.'],
        ['Czy pracujecie jako podwykonawca?', 'Tak, jako podwykonawca branży teletechnicznej generalnego wykonawcy albo bezpośrednio dla inwestora. Zakres, harmonogram i zasady rozliczenia ustalamy w umowie.'],
        ['Co dostajemy przy odbiorze?', 'Dokumentację powykonawczą branży teletechnicznej i protokoły pomiarów w zakresie z projektu i umowy: zwykle opis tras, schematy i zestawienie urządzeń. O odbiorze budynku decyduje organ nadzoru budowlanego. My dajemy komplet dokumentów naszej branży.']
      ],
      segRel: ['dev', 'firma', 'hotel'],
      rel: ['wifi', 'ant', 'kam', 'kd'],
      src: [['Rozporządzenie UE 2024/1309 (Gigabit Infrastructure Act), art. 10', 'https://eur-lex.europa.eu/eli/reg/2024/1309/oj/pol'], ['Murator: światłowód obowiązkowy w nowych budynkach od 12.02.2026', 'https://muratordom.pl/budowa/inne-technologie-budowlane/swiatlowod-jak-prad-i-woda-jest-nowy-obowiazek-dla-kazdego-kto-buduje-dom-aa-4XGv-uZJo-7xW4.html'], ['Murator: stare warunki techniczne jeszcze przez 18 miesięcy (17.10.2026)', 'https://muratordom.pl/prawo/formalnosci-budowlane/stare-warunki-techniczne-jeszcze-przez-18-miesiecy-jak-budowac-dom-w-latach-20262028-aa-oqVJ-ptKZ-PqoP.html'], ['Murator: nowe warunki techniczne spóźnione (28.09.2026)', 'https://muratordom.pl/prawo/formalnosci-budowlane/nowe-warunki-techniczne-spoznione-ratunek-w-prowizorce-stare-przepisy-jeszcze-przez-18-miesiecy-aa-xhtt-Q8pc-pTxz.html'], ['Ustawa z 31.07.2026 zmieniająca Prawo budowlane, dodaje art. 102a–102c (Dz.U. 2026 poz. 1161)', 'https://api.sejm.gov.pl/eli/acts/DU/2026/1161/text.pdf'], ['Warunki techniczne (t.j. Dz.U. 2022 poz. 1225), rozdział 8a, utraciło moc 20.09.2026', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220001225'], ['Ustawa o wspieraniu rozwoju usług i sieci telekomunikacyjnych, art. 30 (t.j. Dz.U. 2026 poz. 562)', 'https://arslege.pl/ustawa-o-wspieraniu-rozwoju-uslug-i-sieci-telekomunikacyjnych/k728/a54650/'], ['GUS: mieszkania oddane w 2024 r., powiat nowotarski (polskawliczbach.pl)', 'https://www.polskawliczbach.pl/powiat_nowotarski'], ['GUS: mieszkania oddane w 2024 r., powiat tatrzański (polskawliczbach.pl)', 'https://www.polskawliczbach.pl/powiat_tatrzanski']],
      sx: { faqA: { t: 'Masz przedmiar albo projekt?', d: 'Wyślij dokumentację branży teletechnicznej. Przygotujemy ofertę z zakresem, harmonogramem i listą pomiarów do odbioru.', cta: 'Wyślij przedmiar →', href: '#zapytanie' }, faqH: 'Pytania wykonawców.', relH: 'Instalacje, które robimy też w gotowych budynkach.' }
    }), { tt: tt, zak: zak, dk: dk, prz: prz, rfq: rfq, ctaEye: 'Dla firm budowlanych', ctaBtn: 'Wyślij przedmiar →', ctaBtnHref: '#zapytanie', ctaH: 'Masz inwestycję w przygotowaniu? Policzymy teletechnikę.', ctaP: 'Przedmiar, oferta z harmonogramem, wykonanie, pomiary i dokumentacja. Jeden partner od branży teletechnicznej.' });
  }
