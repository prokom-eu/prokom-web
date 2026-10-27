  initState() { return { avs: 2, dday: 12, dmq: 0, amode: 'full', sim: null, touched: false, vd: 0, vdT: false }; }
  navKey() { return 'usl'; }
  rvIds() { return ['flow', 'wer', 'cmp', 'vd', 'dmf', 'dl', 'ag', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, SCR = [['full', 'in'], ['night', 'water'], ['off', 'in'], ['night', 'smoke']], k = 0, n = 0;
    this.every(1300, function () {
      if (self.state.touched) return;
      n++;
      if (n === 2) self.setState({ sim: { k: SCR[k][1], t0: self.state.tick } });
      if (n >= 9) { n = 0; k = (k + 1) % SCR.length; self.setState({ amode: SCR[k][0], sim: null }); }
    });
    this.every(2600, function () { if (!self.state.vdT) self.setState({ vd: (self.state.vd + 1) % 4 }); });
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const ROOMS = [
      ['syp', 'Sypialnia', 96, 140, 170, 106, 'up'], ['kor', 'Korytarz', 266, 140, 60, 106, 'up'], ['pok', 'Pokój', 326, 140, 138, 106, 'up'],
      ['sal', 'Salon', 96, 246, 140, 106, 'dn'], ['hol', 'Wejście', 236, 246, 72, 106, 'dn'], ['kuch', 'Kuchnia', 308, 246, 156, 106, 'dn'], ['gar', 'Garaż', 464, 232, 140, 120, 'dn']
    ];
    const SENS = [
      ['s1', 'Ruch', 200, 272, 'sal', 0], ['s2', 'Okno', 155, 306, 'sal', 0], ['s3', 'Drzwi', 272, 290, 'hol', 0], ['s4', 'Ruch', 444, 266, 'kuch', 0], ['s5', 'Taras', 397, 300, 'kuch', 0],
      ['s6', 'Dym', 330, 290, 'kuch', 1], ['s7', 'Woda', 330, 336, 'kuch', 1], ['s8', 'Ruch', 586, 252, 'gar', 0], ['s9', 'Brama', 534, 256, 'gar', 0], ['s10', 'Temp.', 498, 336, 'gar', 1],
      ['s11', 'Dym', 230, 168, 'syp', 1], ['s12', 'Ruch', 296, 196, 'kor', 0]
    ];
    const mode = st.amode;
    const armedRoom = (r) => mode === 'full' || (mode === 'night' && r[6] === 'dn');
    const sim = st.sim, step = sim ? Math.max(0, st.tick - sim.t0) : -1;
    const isArmed = (rk) => armedRoom(ROOMS.find((r) => r[0] === rk));
    let alarm = false, alS = [], alR = [], msgs = [], siren = false;
    const M = (t, s, al) => msgs.push({ t: t, s: s, cls: 'amsg' + (al ? ' al' : '') });
    if (sim && sim.k === 'in') {
      const armed = isArmed('kuch');
      alS = ['s5']; if (step >= 1) alS.push('s4');
      if (!armed) { M('Drzwi tarasowe otwarte', 'Dom rozbrojony · tylko informacja', false); }
      else {
        M('Drzwi tarasowe otwarte', '02:14:05 · strefa Parter', true);
        if (step >= 1) { M('Ruch w kuchni', 'czas na wpisanie kodu: 30 s', true); }
        if (step >= 2) { alarm = true; siren = true; alR = ['kuch']; M('ALARM · Parter', 'syrena włączona · SMS i powiadomienie wysłane', true); }
        if (step >= 3) M('Podgląd z kamery tarasu', 'otwórz nagranie z chwili alarmu', false);
      }
    } else if (sim && sim.k === 'water') {
      alS = ['s7']; alarm = true; alR = ['kuch'];
      M('Zalanie · Kuchnia', 'czujka zalania działa zawsze, także po rozbrojeniu', true);
      if (step >= 1) M('Zawór wody zamknięty', 'jeśli jest elektrozawór i automatyka', false);
    } else if (sim && sim.k === 'smoke') {
      alS = ['s6']; alarm = true; siren = step >= 1; alR = ['kuch'];
      M('Dym · Kuchnia', 'czujka pożarowa · sygnał całą dobę', true);
      if (step >= 1) M('Syrena i powiadomienie', 'do Ciebie i osób z listy', true);
    }
    msgs = msgs.reverse().slice(0, 2);
    const rooms = ROOMS.map((r) => ({ n: r[1], x: r[2], y: r[3], w: r[4], h: r[5], tx: r[2] + 8, ty: r[3] + 17, cls: 'hroom' + (alR.includes(r[0]) ? ' al' : armedRoom(r) ? ' arm' : '') }));
    const LT = { 'Ruch': 'R', 'Okno': 'O', 'Drzwi': 'O', 'Taras': 'O', 'Brama': 'O', 'Dym': 'D', 'Woda': 'W', 'Temp.': 'T' };
    const sens = SENS.map((s) => ({ n: s[1], l: LT[s[1]], x: s[2], y: s[3], ty: s[3] + 3.5, cls: 'sg' + (alS.includes(s[0]) ? ' al' : s[5] ? ' d24' : isArmed(s[4]) ? ' arm' : '') }));
    const MODES = [['off', 'Rozbrojony', P.lock], ['night', 'Noc · parter', P.moon], ['full', 'Pełne uzbrojenie', P.shield]];
    const stT = alarm ? 'Alarm' : mode === 'off' ? 'Rozbrojony' : mode === 'night' ? 'Uzbrojony na noc' : 'Uzbrojony';
    const stS = alarm ? 'sprawdź powiadomienia' : mode === 'off' ? 'czujki dymu, zalania i temperatury czuwają' : mode === 'night' ? 'parter i garaż · piętro wolne' : 'cały dom i garaż';
    let note = 'R ruch · O otwarcie · D dym · W zalanie · T temperatura. Niebieskie są uzbrojone, zielone czuwają całą dobę. ';
    note += mode === 'night' ? 'Tryb nocny: śpisz na piętrze, a parter i garaż są pilnowane.' : mode === 'off' ? 'Po rozbrojeniu otwarcie drzwi to tylko informacja w aplikacji.' : 'Wychodzisz z domu: wszystko jest uzbrojone.';
    const pad = (n) => String(n).padStart(2, '0');
    const al = {
      cls: mode, clock: '02:' + pad(14 + Math.floor(st.tick / 46) % 40),
      modes: MODES.map((m) => ({ n: m[1], ic: m[2], on: mode === m[0] ? 'true' : 'false', cls: mode === m[0] ? 'on' : '', pick: () => touch({ amode: m[0], sim: null }) })),
      tests: [['Wejście przez taras', P.door, 'in'], ['Zalanie', P.drop, 'water'], ['Dym', P.fire, 'smoke']].map((t) => ({ n: t[0], ic: t[1], go: () => touch({ sim: { k: t[2], t0: st.tick } }) })),
      rooms: rooms, sens: sens, sirCls: 'sirg' + (siren ? ' on' : ''),
      stCls: alarm ? 'al' : mode !== 'off' ? 'arm' : '', stIc: alarm ? P.bell : mode === 'off' ? P.lock : P.shield, stT: stT, stS: stS, msgs: msgs, note: note
    };
    const flow = [
      { n: '01', ic: P.eye, t: 'Czujki', d: 'Ruchu, otwarcia drzwi i okien, rozbicia szyby, dymu, zalania, temperatury.' },
      { n: '02', ic: P.cpu, t: 'Centrala', d: 'Sprawdza strefy i czas na wpisanie kodu. Ma akumulator na wypadek braku prądu.' },
      { n: '03', ic: P.bell, t: 'Syrena i telefon', d: 'Syrena odstrasza, a powiadomienie i SMS trafiają do Ciebie i wskazanych osób.' },
      { n: '04', ic: P.shield, t: 'Reakcja', d: 'Sprawdzasz kamerę w aplikacji. Opcjonalnie sygnał odbiera agencja ochrony.' }
    ];
    const cmp = [
      { k: 'Kiedy najlepiej', a: 'Nowy dom, remont, firma. Kable prowadzimy razem z elektryką.', b: 'Dom wykończony, apartament, lokal na wynajem. Bez kucia ścian.' },
      { k: 'Niezawodność', a: 'Brak baterii w czujkach, odporność na zakłócenia radiowe.', b: 'Nowoczesne systemy mają szyfrowaną łączność i nadzór czujek.' },
      { k: 'Obsługa', a: 'Klawiatura, aplikacja, piloty.', b: 'Aplikacja, piloty, klawiatura bezprzewodowa.' },
      { k: 'Serwis', a: 'Praktycznie bez wymiany baterii.', b: 'Baterie w czujkach co kilka lat, aplikacja przypomina.' },
      { k: 'Rozbudowa', a: 'Najtańsza na etapie budowy, potem trudniejsza.', b: 'Łatwo dodać czujkę w dowolnym miejscu.' },
      { k: 'Łączność', a: 'LAN, GSM/LTE, zależnie od modułów.', b: 'Ethernet, Wi-Fi, karta SIM, zależnie od modelu.' }
    ];
    const sys = [
      { n: 'Satel PERFECTA i INTEGRA', d: 'Polskie centrale. PERFECTA do mieszkań, domów i lokali, z aplikacją i czujkami bezprzewodowymi MICRA. INTEGRA łączy alarm z automatyką domu.', s: 'Według kart produktów Satel.' },
      { n: 'Ajax', d: 'System bezprzewodowy: zasięg radiowy do 2000 m w otwartej przestrzeni, do 100 urządzeń na centralę, łączność Ethernet i SIM.', s: 'Według producenta, wariant Hub zależny od modelu.' },
      { n: 'Hikvision AX PRO', d: 'Bezprzewodowy alarm z klasą Grade 2, łącznością LAN, Wi-Fi i 4G oraz weryfikacją wideo w aplikacji Hik-Connect.', s: 'Według dystrybutora.' }
    ];
    const VD = [
      { lbl: 'Furtka · dzwoni', msg: 'Ktoś dzwoni do furtki', ic: P.bell, cls: 'ring', on: 0 },
      { lbl: 'Furtka · rozmowa', msg: 'Rozmowa: „Paczka dla Pana, zostawić przy drzwiach?”', ic: P.phone, cls: '', on: 1 },
      { lbl: 'Furtka · otwarta', msg: 'Furtka otwarta na 5 sekund', ic: P.lock, cls: '', on: 2 },
      { lbl: 'Furtka · zamknięta', msg: 'Furtka zamknięta · zdjęcie zapisane w historii', ic: P.check, cls: '', on: -1 }
    ];
    const v = VD[st.vd];
    const vdb = (i) => 'vb' + (v.on === i ? ' on' : '');
    const vd = { time: '14:' + pad(32 + st.vd), lbl: v.lbl, msg: v.msg, ic: v.ic, cls: v.cls, c1: v.on === 0 || v.on === 1 ? 'on' : '', c2: v.on === 2 ? 'on' : '', c3: '', talk: () => self.setState({ vd: 1, vdT: true }), gate: () => self.setState({ vd: 2, vdT: true }), drive: () => self.setState({ vd: 2, vdT: true }) };
    const vdl = [
      { t: 'Aplikacja w telefonie', d: 'Aplikacja producenta, np. Hik-Connect albo DMSS: rozmowa, otwieranie, historia połączeń.' },
      { t: 'Wymiana starego domofonu', d: 'Systemy dwuprzewodowe działają na istniejącym kablu. Często bez kucia.' },
      { t: 'Kilka wejść i lokali', d: 'Furtka, brama, drzwi do budynku, kilka mieszkań lub apartamentów.' },
      { t: 'Razem z alarmem i kamerami', d: 'Jedna aplikacja albo integracja z Ampio w smart home.' }
    ];
    // wersje alarmu
    const EL = {
      cen: [P.cpu, 'Centrala z akumulatorem', 'Mózg systemu. Przy braku prądu pracuje na akumulatorze, przy braku internetu wysyła powiadomienia przez sieć komórkową.', 'np. Satel z kontrolerem ABAX 2, Ajax Hub 2'],
      kl: [P.grid, 'Klawiatura i piloty', 'Uzbrajanie przy wejściu, pilot dla domowników, a do tego aplikacja w telefonie.', 'manipulator, breloki'],
      pir: [P.eye, 'Czujki ruchu odporne na zwierzęta', 'Ignorują psa lub kota do ok. 20 kg, zależnie od modelu.', 'np. Satel APD-200 Pet: pole 14 × 16 m'],
      mag: [P.door, 'Czujki otwarcia drzwi i okien', 'Alarm, zanim ktoś wejdzie do środka.', 'czujki magnetyczne'],
      gb: [P.x, 'Czujki zbicia szyby', 'Przy dużych przeszkleniach, witrynach i drzwiach tarasowych.', 'np. Satel AGD-200: do 6 m'],
      out: [P.sun2, 'Czujki zewnętrzne', 'Alarm, gdy ktoś jest jeszcze na podwórku, a nie dopiero w domu.', 'np. Satel AOD-210: praca od −40°C'],
      sir: [P.bell, 'Sygnalizator z lampą', 'Głośny sygnał i błyskające światło odstraszają i pokazują, gdzie jest alarm.', 'np. Satel ASP-200 R: do 105 dB'],
      fl: [P.drop, 'Czujki zalania i temperatury', 'Woda pod pralką albo spadek temperatury w kotłowni od razu w telefonie.', 'np. Satel AFD-200: bateria do 5 lat'],
      sm: [P.fire, 'Czujki dymu', 'Powiadomienie w telefonie, nawet gdy w domu nikogo nie ma.', 'np. Satel ASD-250, zgodna z EN 14604'],
      cam: [P.camera2, 'Czujka ze zdjęciem', 'Przy alarmie przesyła serię zdjęć, więc od razu widzisz, czy to włamanie.', 'np. Ajax MotionCam: bateria do 4 lat'],
      lte: [P.ant, 'Łączność LTE i Ethernet', 'Dwie drogi powiadomień. Gdy jedna zawiedzie, działa druga.', 'moduł GSM/LTE, dwie karty SIM'],
      ag: [P.shield, 'Agencja ochrony (opcja)', 'Sygnał trafia do całodobowego centrum, które wysyła patrol.', 'umowa z agencją z koncesją']
    };
    const AV = [
      { n: 'Mieszkanie', ic: P.office, sub: 'bezprzewodowo, bez kucia', k: ['cen', 'kl', 'pir', 'mag', 'sir', 'fl', 'sm', 'lte'] },
      { n: 'Dom', ic: P.home, sub: 'strefy i tryb nocny', k: ['cen', 'kl', 'pir', 'mag', 'gb', 'out', 'sir', 'lte', 'ag'] },
      { n: 'Dom letniskowy', ic: P.snow, sub: 'pilnuje także pod nieobecność', k: ['cen', 'kl', 'pir', 'mag', 'sir', 'fl', 'sm', 'cam', 'lte'] },
      { n: 'Firma i sklep', ic: P.shop, sub: 'strefy, kody, agencja', k: ['cen', 'kl', 'pir', 'mag', 'gb', 'out', 'sir', 'cam', 'lte', 'ag'] }
    ];
    const V = AV[st.avs];
    const av = { sub: V.sub, tabs: AV.map((v, i) => ({ n: v.n, ic: v.ic, on: st.avs === i ? 'true' : 'false', cls: st.avs === i ? 'on' : '', pick: () => self.setState({ avs: i }) })),
      items: Object.keys(EL).map((k) => ({ ic: EL[k][0], n: EL[k][1], d: EL[k][2], m: EL[k][3], cls: 'alvi' + (V.k.includes(k) ? ' on' : '') })) };
    // dom letniskowy
    const dd = st.dday;
    const d0 = new Date(2026, 9, 31); const dt = new Date(d0.getTime() + dd * 86400000);
    const MN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    const tIn = dd < 34 ? 12 : dd < 36 ? 4 : 11, outT = dd < 20 ? -3 : dd < 34 ? -9 : dd < 36 ? -18 : -11;
    const deg = (t) => String(t).replace('-', '−') + '°C';
    const EV = [
      [1, P.check, 'Wyjazd: alarm uzbrojony', 'Tryb pusty dom · wszystkie czujki aktywne', 'ok'],
      [21, P.users, 'Sprzątanie: rozbrojono kodem', 'Użytkownik „ekipa sprzątająca”, 10:02–11:15', 'ok'],
      [34, P.thermo, 'Za zimno w kotłowni: 4°C', 'Mróz −18°C. Sprawdź ogrzewanie, zanim zamarzną rury.', 'warn'],
      [35, P.drop, 'Zalanie: łazienka', 'Czujka wykryła wodę. Powiadomienie dostajesz Ty i opiekun domu.', 'bad'],
      [35, P.check, 'Woda zakręcona', 'Opiekun domu dojechał godzinę po alarmie. Czujka znów sucha.', 'ok', 36],
      [52, P.battery, 'Słaba bateria: czujka w garażu', 'Wymiana przy najbliższym przeglądzie', 'ok']
    ];
    const feed = EV.filter((e) => (e[5] || e[0]) <= dd).slice(-4).reverse().map((e) => ({ ic: e[1], t: e[2], s: (e[0] === dd ? 'dzisiaj' : dd - e[0] === 1 ? 'wczoraj' : (dd - e[0]) + ' dni temu') + ' · ' + e[3], cls: 'phn dlf ' + e[4] }));
    const dl = { day: dd, onDay: (e) => self.setState({ dday: +((e && e.target && e.target.value) || 12) }), date: dt.getDate() + ' ' + MN[dt.getMonth()], clock: dd >= 34 && dd < 36 ? '03:12' : '08:00',
      stat: [{ k: 'W domu', v: deg(tIn), ic: P.thermo, cls: 'dls' + (tIn < 6 ? ' bad' : '') }, { k: 'Na zewnątrz', v: deg(outT), ic: P.snow, cls: 'dls' }, { k: 'Woda', v: dd === 35 ? 'wyciek' : 'sucho', ic: P.drop, cls: 'dls' + (dd === 35 ? ' bad' : '') }],
      feed: feed.length ? feed : [{ ic: P.check, t: 'Wyjazd', s: 'Uzbrój alarm z aplikacji', cls: 'phn dlf ok' }] };
    // domofony
    const DMQ = [['Tak, dwie żyły', 'System 2-przewodowy', 'Zasilanie, dźwięk i obraz idą istniejącą parą przewodów. Producent podaje zasięg zależny od przekroju kabla, np. Dahua 2-Wire Hybrid do 200 m. Stan starego przewodu sprawdzamy na miejscu.'], ['Nie, nowy dom', 'Wideodomofon IP z zasilaniem PoE', 'Jeden przewód sieciowy do panelu daje zasilanie i obraz. Najwięcej możliwości: aplikacja, kilka monitorów, połączenie z kamerami.'], ['Nie wiem', 'Sprawdzimy na wizji lokalnej', 'Wystarczy zdjęcie starego unifonu albo monitora i panelu przy furtce. Po nim zwykle wiemy, czy przewody się nadadzą.']];
    const dm = {
      v: [
        { ic: P.home, n: 'Dom i furtka', f: ['Panel z kamerą przy furtce', 'Monitor w domu albo tylko aplikacja', 'Rozmowa i otwieranie z telefonu', 'Elektrozaczep lub zwora w furtce'] },
        { ic: P.gate, n: 'Dom z bramą', f: ['Osobno „furtka” i „brama”', 'Sterowanie napędem bramy', 'Kody PIN i breloki dla domowników', 'Drugi monitor na piętrze'] },
        { ic: P.users, n: 'Blok i wspólnota', f: ['Panel z numerami lokali lub listą', 'Breloki dla mieszkańców', 'Zgubiony brelok blokujemy w systemie', 'Monitory albo aplikacja w mieszkaniach'] },
        { ic: P.bed, n: 'Pensjonat i apartamenty', f: ['Połączenie do recepcji', 'Po godzinach przekierowanie na telefon', 'Breloki dla obsługi', 'Historia otwarć: kto i kiedy'] }
      ],
      q: DMQ.map((x, i) => ({ n: x[0], on: st.dmq === i ? 'true' : 'false', cls: st.dmq === i ? 'on' : '', pick: () => self.setState({ dmq: i }) })),
      r: DMQ[st.dmq][1], rs: DMQ[st.dmq][2], src: 'Rozpoznawania twarzy w panelach nie proponujemy domyślnie: to dane biometryczne i wymagają szczególnych podstaw z RODO.'
    };
    const ag = [
      { ic: P.phone, t: 'Powiadomienia do Ciebie', d: 'Aplikacja, SMS, połączenie głosowe. Bez abonamentu agencji.' },
      { ic: P.users, t: 'Lista osób', d: 'Sąsiad, rodzina, opiekun domu. Każdy dostaje powiadomienie.' },
      { ic: P.shield, t: 'Agencja ochrony', d: 'Całodobowy odbiór sygnałów i patrol interwencyjny, umowa z agencją.' }
    ];
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Alarmy i wideodomofony', eye: 'Systemy alarmowe · Rabka-Zdrój, Zakopane, Podhale', h1a: 'Alarm, który budzi złodzieja,', h1b: 'a nie Ciebie o trzeciej w nocy.', lead: 'Montujemy alarmy przewodowe i bezprzewodowe, czujki dymu, zalania i temperatury oraz wideodomofony z aplikacją. Do domu, domu letniskowego, pensjonatu i firmy. Po montażu testujemy czujki razem z Tobą.', kv: [['całą dobę', 'czujki dymu, zalania i mrozu'], ['od 2004', 'montaż i serwis na Podhalu'], ['1 aplikacja', 'alarm, domofon, kamery jednej marki']], tags: ['Satel', 'Ajax', 'Hikvision', 'Wideodomofony'] },
      anc: [['jak-dziala', 'Jak działa'], ['wersje', 'Wersje alarmu'], ['przewod', 'Przewodowy czy radiowy'], ['wideodomofon', 'Wideodomofon'], ['domofony', 'Domofony'], ['dom-letniskowy', 'Dom letniskowy'], ['agencja', 'Agencja ochrony'], ['pakiety', 'Zestawy'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.home, n: 'Mieszkanie i mały dom', d: 'Podstawowa ochrona wejść i parteru.', f: ['Centrala z aplikacją', 'Czujki ruchu i otwarcia drzwi', 'Syrena zewnętrzna', 'Czujka dymu', 'Test i szkolenie'], pr: 'od [CENA] zł z montażem' },
        { ic: P.home, n: 'Dom z garażem i furtką', d: 'Alarm, wideodomofon i czujki całodobowe.', f: ['Strefy: parter, piętro, garaż', 'Tryb nocny', 'Wideodomofon z aplikacją', 'Czujki zalania i temperatury', 'Integracja z kamerami'], pr: 'od [CENA] zł z montażem', hot: true },
        { ic: P.office, n: 'Firma, sklep, pensjonat', d: 'Strefy, kody dla pracowników, agencja.', f: ['Osobne kody i harmonogramy', 'Strefy: sala, zaplecze, magazyn', 'Łączność LAN i LTE', 'Przekazanie sygnału do agencji', 'Przeglądy okresowe'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.home, t: 'Wielkość obiektu', d: 'Liczba pomieszczeń, wejść, okien i pięter.' },
        { ic: P.wifi, t: 'Przewodowy czy radiowy', d: 'Przewody na etapie budowy są tańsze. W gotowym domu często lepsze radio.' },
        { ic: P.bell, t: 'Rodzaje czujek', d: 'Ruch, otwarcie, szyba, dym, zalanie, temperatura, czujki zewnętrzne.' },
        { ic: P.phone, t: 'Wideodomofon', d: 'Liczba wejść, panel w domu, aplikacja, brama.' },
        { ic: P.globe, t: 'Łączność', d: 'LAN, LTE, a przy agencji ochrony także moduł do jej centrum.' },
        { ic: P.wrench, t: 'Serwis', d: 'Przeglądy okresowe, wymiana akumulatora i baterii.' }
      ],
      faq: [
        ['Przewodowy czy bezprzewodowy alarm?', 'W budowanym domu zwykle przewodowy, bo kable idą razem z elektryką. W domu wykończonym albo apartamencie lepszy bezprzewodowy, bez kucia. Często łączymy oba: przewody tam, gdzie się da, radio w trudnych miejscach.'],
        ['Czy alarm zadziała bez prądu i internetu?', 'Tak. Centrala ma akumulator, a powiadomienia może wysyłać przez sieć komórkową, gdy padnie internet. Ile wytrzyma akumulator, zależy od systemu i liczby czujek.'],
        ['Czy pies uruchomi alarm?', 'Dobieramy czujki odporne na małe zwierzęta i ustawiamy strefy tak, żeby pies mógł chodzić po wybranej części domu. Duży pies na kanapie to temat do omówienia przy projekcie.'],
        ['Czy potrzebuję agencji ochrony?', 'Nie musisz. Powiadomienia mogą trafiać do Ciebie i wskazanych osób. Agencja ma sens, gdy nikt nie może szybko zareagować, np. w firmie albo w domu letniskowym.'],
        ['Czy mogę podłączyć alarm do smart home?', 'Tak. Ampio integruje się m.in. z centralami Satel i kamerami Dahua i Hikvision, więc alarm może np. zgasić światła i zamknąć rolety po uzbrojeniu.'],
        ['Mam stary domofon. Trzeba kuć ściany?', 'Często nie. Wideodomofony dwuprzewodowe działają na istniejącym przewodzie. Sprawdzamy to na miejscu.'],
        ['Jaką gwarancję dostanę?', 'Na montaż dajemy 24 miesiące gwarancji PRO-KOM, a urządzenia mają gwarancję producenta. Na zgłoszenie odpowiadamy do 24 h w dni robocze: oddzwonimy albo odpiszemy.'],
        ['Co dostanę na telefon, gdy alarm się włączy?', 'Powiadomienie z aplikacji z nazwą strefy i czujki, a przy ważnych zdarzeniach także SMS albo połączenie przez moduł GSM/LTE. Jeśli alarm współpracuje z kamerami, od razu sprawdzisz obraz.']
      ],
      segRel: ['dom', 'apt', 'sklep', 'firma', 'kosc'],
      rel: ['kam', 'kd', 'smart'],
      relX: [{ href: 'Serwis.dc.html', ic: P.wrench, n: 'Serwis i przeglądy', s: 'Testy czujek, akumulatory, przejęcie instalacji' }],
      src: [['Ustawa o ochronie osób i mienia (t.j. Dz.U. 2025 poz. 532)', 'https://api.sejm.gov.pl/eli/acts/DU/2025/532/text.pdf'], ['Satel, karta PERFECTA Soft', 'https://www.satel.pl/api/product/leaflet/PERFECTA%20Soft/pl'], ['Satel, karta INTEGRA CONTROL', 'https://www.satel.pl/api/product/leaflet/INTEGRA%20CONTROL/en'], ['Ajax, Hub', 'https://ajax.systems/en/products/hub/'], ['Dahua, wideodomofony 2-przewodowe', 'https://www.dahuasecurity.com/mx/5E/2'], ['Ampio, integracje', 'https://www.ampio.com/integracje'], ['Satel, instrukcja sygnalizatora ASP-200 (do 105 dB z 1 m)', 'https://www.satel.pl/api/download/manuals/12322'], ['Satel, karta czujki AOD-210 (praca od −40°C)', 'https://www.montersi.pl/instrukcje/aod-210-karta.pdf'], ['Satel, karta APD-200 Pet', 'https://rocket.satel.pl/en/produktid/1179/print'], ['Satel, karta AFD-200', 'https://przemek.satel.pl/en/product/10484/AFD-200,Wireless-water-flood-detector/print']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Trzy typowe punkty startu.', p: 'Zakres zawsze dopasowujemy po obejrzeniu budynku.', note: 'To przykłady. Liczbę czujek, strefy i rodzaj systemu ustalamy na wizji lokalnej, a cenę podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena alarmu.', p: 'Najwięcej zmienia to, czy kable da się poprowadzić razem z elektryką, czy montujemy w gotowym wnętrzu.' }, relH: 'Alarm, kamery i dostęp w jednej aplikacji.' }
    }), { av: av, dm: dm, al: al, flow: flow, cmp: cmp, sys: sys, vd: vd, vdl: vdl, dl: dl, ag: ag, ctaEye: 'Alarm na Podhalu', ctaH: 'Zaprojektujemy alarm, który chroni, a nie denerwuje.', ctaP: 'Strefy, tryb nocny, czujki całodobowe i wideodomofon. Montaż, test czujek razem z Tobą i serwis.' });
  }
