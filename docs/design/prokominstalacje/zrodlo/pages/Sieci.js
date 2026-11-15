  initState() { return { wb: 1, ww: 3, cl: 70, cs: 1, ld: 1, lg: 1, ls: 0, fo: false, wm: 'po', vl: '', touched: false, wlM: 0, wlB: 1, brD: 250, brL: 0 }; }
  navKey() { return 'usl'; }
  rvIds() { return ['why', 'vlan', 'portal', 'cab', 'lab', 'hw', 'wall', 'std', 'brd', 'bak', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, VS = ['', 'g', 'k', 'b', 's'], i = 0, n = 0;
    this.every(2400, function () {
      if (self.state.touched) return;
      n++;
      if (n % 6 === 0) { self.setState({ wm: self.state.wm === 'po' ? 'przed' : 'po', vl: '' }); return; }
      if (self.state.wm === 'po') { i = (i + 1) % VS.length; self.setState({ vl: VS[i] }); }
    });
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const po = st.wm === 'po';
    const SRC = po ? [[170, 170, 'AP 1'], [470, 170, 'AP 2'], [320, 292, 'AP 3']] : [[64, 300, 'Router']];
    const ROOMS = [['Pokój 1', 20, 20, 150, 120], ['Pokój 2', 170, 20, 150, 120], ['Pokój 3', 320, 20, 150, 120], ['Pokój 4', 470, 20, 150, 120], ['Korytarz', 20, 140, 600, 60], ['Recepcja', 20, 200, 200, 140], ['Jadalnia', 220, 200, 250, 140], ['Kuchnia', 470, 200, 150, 140]];
    const QN = ['Brak zasięgu', 'Słaby', 'Dobry', 'Świetny'];
    const q = (x, y) => { let d = 1e9; SRC.forEach((s) => { d = Math.min(d, Math.hypot(s[0] - x, s[1] - y)); }); return d < 150 ? 3 : d < 230 ? 2 : d < 320 ? 1 : 0; };
    let sum = 0;
    const rooms = ROOMS.map((r) => { const qq = q(r[1] + r[3] / 2, r[2] + r[4] / 2); sum += qq; return { n: r[0], x: r[1], y: r[2], w: r[3], h: r[4], tx: r[1] + 12, ty: r[2] + 22, qy: r[2] + 40, q: QN[qq], qc: 'wq q' + qq, cls: 'rm' }; });
    const VL = {
      g: { n: 'Goście', c: '#4CCBE6', ic: P.users, d: 'Telefony i laptopy gości. Odizolowane od siebie i od reszty.', x: 'portal z voucherem' },
      k: { n: 'Kamery', c: '#F2B84B', ic: P.cam, d: 'Kamery i rejestrator. Bez dostępu z sieci gości.', x: 'zasilanie PoE' },
      b: { n: 'Recepcja i kasa', c: '#7BD36A', ic: P.office, d: 'Komputer recepcji, kasa fiskalna, terminal płatniczy.', x: 'priorytet ruchu' },
      s: { n: 'Smart i TV', c: '#B58CF0', ic: P.home, d: 'Telewizory, ekran w recepcji, sterowanie Ampio, ładowarka.', x: 'urządzenia IoT' }
    };
    const DEV = [['g', P.phone, 95, 95], ['g', P.phone, 245, 100], ['g', P.phone, 395, 95], ['g', P.phone, 560, 100], ['g', P.phone, 330, 250], ['k', P.cam, 130, 185], ['k', P.cam, 600, 160], ['k', P.cam, 600, 320], ['b', P.office, 150, 300], ['b', P.card, 190, 260], ['s', P.tv, 430, 320], ['s', P.thermo, 540, 60], ['s', P.scr, 120, 220]];
    const devs = DEV.map((d) => ({ x: d[2], y: d[3], ic: d[1], tr: 'translate(' + (d[2] - 7) + ' ' + (d[3] - 7) + ') scale(.58)', cls: 'wdv' + (st.vl ? (st.vl === d[0] ? ' on' : ' dim') : ''), st: '--vc:' + VL[d[0]].c }));
    const wf = {
      modes: [['przed', 'Przed: router operatora', P.wifi], ['po', 'Po: 3 punkty dostępowe', P.check]].map((m) => ({ n: m[1], ic: m[2], on: st.wm === m[0] ? 'true' : 'false', cls: st.wm === m[0] ? 'on' : '', pick: () => touch({ wm: m[0], vl: m[0] === 'przed' ? '' : st.vl }) })),
      tag: po ? 'Zasięg w całym budynku' : Math.round(sum / (ROOMS.length * 3) * 100) + '% zasięgu', tagCls: po ? 'a' : '',
      heat: SRC.map((s) => ({ x: s[0], y: s[1], r: po ? 230 : 300 })),
      rooms: rooms, aps: SRC.map((s) => ({ x: s[0], y: s[1], ty: s[1] + 4, n: s[2].replace('Router', 'R').replace('AP ', '') })),
      devs: devs,
      vl: Object.keys(VL).map((k) => ({ n: VL[k].n, st: '--vc:' + VL[k].c, on: st.vl === k ? 'true' : 'false', cls: 'wvb' + (st.vl === k ? ' on' : ''), pick: () => touch({ vl: st.vl === k ? '' : k, wm: 'po' }) })),
      note: po ? (st.vl ? VL[st.vl].n + ': ' + VL[st.vl].d : 'Trzy punkty dostępowe podłączone kablem dają równy zasięg w pokojach, jadalni i kuchni. Gość przechodzi z pokoju na taras bez zrywania połączenia.') : 'Jeden router w recepcji: w pokojach od strony kuchni i na piętrze zasięg słabnie albo znika. Wzmacniacz z gniazdka zwykle tylko przenosi problem dalej.'
    };
    const vl = Object.keys(VL).map((k) => ({ n: VL[k].n, d: VL[k].d, x: VL[k].x, ic: VL[k].ic, st: '--vc:' + VL[k].c, on: st.vl === k ? 'true' : 'false', cls: 'netvb' + (st.vl === k ? ' on' : ''), pick: () => touch({ vl: st.vl === k ? '' : k, wm: 'po' }) }));
    const why = [
      { ic: P.wifi, t: 'Jeden router na cały budynek', d: 'Router od operatora stoi w szafce przy wejściu, a pokoje są dwa piętra wyżej.' },
      { ic: P.build, t: 'Ściany i stropy', d: 'Beton, cegła, kamień i stropy osłabiają sygnał. Zwykle każde piętro potrzebuje swojego punktu.' },
      { ic: P.layers, t: 'Mesh bez kabla', d: 'Każdy skok radiowy obniża prędkość. Ubiquiti zaleca najwyżej dwa skoki bezprzewodowe.' },
      { ic: P.lock, t: 'Jedna sieć dla wszystkiego', d: 'Goście, kamery i kasa w tej samej sieci to ryzyko i spowolnienie w sezonie.' }
    ];
    const portal = [
      { t: 'Vouchery na pobyt', d: 'Kod z limitem czasu, prędkości albo transferu, drukowany lub wysyłany gościom.' },
      { t: 'Twoje logo i regulamin', d: 'Ekran powitalny z nazwą obiektu i linkiem do oferty.' },
      { t: 'Izolacja gości', d: 'Urządzenia gości nie widzą siebie nawzajem ani Twoich sieci.' },
      { t: 'Płynne przechodzenie', d: 'Szybki roaming między punktami dostępowymi w budynku.' }
    ];
    const cab = [
      { ic: P.net, t: 'Okablowanie Cat6 i Cat6A', d: 'Gniazda w pokojach, przy telewizorach i w miejscach na punkty dostępowe.' },
      { ic: P.cpu, t: 'Szafa rack', d: 'Porządek w technice: router, switch PoE, rejestrator, UPS i opisane przewody.' },
      { ic: P.fiber, t: 'Światłowód między budynkami', d: 'Światłowody jedno- i wielomodowe: układanie, spawanie i pomiary. Pensjonat, domki i hala w jednej sieci.' },
      { ic: P.mountain, t: 'Mosty radiowe', d: 'Połączenie punkt–punkt tam, gdzie kabla nie da się przekopać.' },
      { ic: P.battery, t: 'Zasilanie awaryjne', d: 'UPS dla routera i kamer, żeby krótki zanik prądu nie wyłączał sieci.' },
      { ic: P.globe, t: 'Łącze zapasowe LTE', d: 'Gdy główne łącze padnie, router przełącza się na sieć komórkową.' }
    ];
    const pt = { code: ['7H2K', 'Q4M9', 'B8T3'][Math.floor(st.tick / 4) % 3], until: 'nd, 11:00' };
    // laboratorium
    const WL = [['Płyta g-k', 2.5, 3.5], ['Drzwi drewniane', 1.9, 3.2], ['Cegła, kamień', 4, 7.7], ['Lekki beton', 8, 16], ['Ciężki beton, strop', 22, 44], ['Okno z powłoką', 20, 40]];
    const w = WL[st.ww], db = st.wb === 0 ? w[1] : w[2];
    const lvl = db < 5 ? 5 : db < 10 ? 4 : db < 20 ? 3 : db < 35 ? 2 : 1;
    const SPD = [['1 Gb/s', 1], ['2,5 Gb/s', 2.5], ['10 Gb/s', 10]];
    const sp = SPD[st.cs][1], len = st.cl;
    const c6ok = sp < 10 || len <= 55;
    const DIST = ['do 100 m', '100–500 m', 'ponad 500 m'];
    let lnk, lnkS, lnkIc;
    // logika: kopać można → kabel/światłowód (most jako alternatywa, gdy budynki się widzą);
    // kopać nie można → most, gdy się widzą; gdy się nie widzą → wyższy punkt albo trasa napowietrzna
    const seeAlt = st.ls === 0;
    if (st.ld === 0 && st.lg === 0) { lnk = 'Skrętka zewnętrzna albo światłowód'; lnkS = 'Do 100 m wystarczy skrętka, ale między budynkami z osobnym zasilaniem bezpieczniejszy jest światłowód: nie przewodzi prądu, więc nie przeniesie przepięcia.' + (seeAlt ? ' Most radiowy też zadziała, ale na tak krótkim odcinku kabel jest pewniejszy.' : ''); lnkIc = P.fiber; }
    else if (st.ld === 0 && seeAlt) { lnk = 'Most radiowy'; lnkS = 'Kopać się nie da, a budynki się widzą: na krótki odcinek wystarczy mały most radiowy, np. 60 GHz, bez prac ziemnych. Anteny montujemy na ścianach albo na uchwytach.'; lnkIc = P.ant; }
    else if (st.ld === 0) { lnk = 'Wyższy punkt albo przewód napowietrzny'; lnkS = 'Most radiowy potrzebuje widoczności między antenami. Sprawdzamy, czy pomoże maszt albo punkt pośredni. Na krótkim odcinku można też poprowadzić przewód napowietrzny, np. światłowód na lince nośnej.'; lnkIc = P.eye; }
    else if (st.lg === 0) { lnk = 'Światłowód'; lnkS = 'Przy takiej odległości kładziemy światłowód w rurze osłonowej. Jednomodowy obsłuży nawet kilometry, a spawy mierzymy reflektometrem.' + (seeAlt ? ' Budynki się widzą, więc alternatywą bez wykopu jest most radiowy.' : ''); lnkIc = P.fiber; }
    else if (st.ls === 0) { lnk = st.ld === 1 ? 'Most radiowy 60 GHz' : 'Most radiowy 5 GHz'; lnkS = st.ld === 1 ? 'Szybkie łącze na setki metrów bez kopania. Mocny deszcz osłabia 60 GHz, dlatego dobre modele przełączają się wtedy na zapasowe 5 GHz.' : 'Na dłuższe odcinki 5 GHz, na zewnątrz w paśmie dopuszczonym bez pozwolenia, z mechanizmem DFS.'; lnkIc = P.ant; }
    else { lnk = 'Trzeba znaleźć wyższy punkt'; lnkS = 'Most radiowy potrzebuje widoczności między antenami, bez drzew i dachów na trasie. Sprawdzamy, czy pomoże maszt albo punkt pośredni. Jeśli nie, szukamy innej trasy dla światłowodu, np. istniejącej rury albo linii napowietrznej.'; lnkIc = P.eye; }
    const fo = st.fo;
    const opt = (arr, cur, key) => arr.map((n, i) => ({ n: n, on: cur === i ? 'true' : 'false', cls: cur === i ? 'on' : '', pick: () => self.setState({ [key]: i }) }));
    const lb = {
      bands: opt(['2,4 GHz', '5 GHz'], st.wb, 'wb'),
      walls: WL.map((x, i) => ({ n: x[0], on: st.ww === i ? 'true' : 'false', cls: 'chip' + (st.ww === i ? ' on' : ''), pick: () => self.setState({ ww: i }) })),
      db: String(db).replace('.', ','), bars: [1, 2, 3, 4, 5].map((i) => (i <= lvl ? 'on' : '') + (lvl <= 2 ? ' bad' : lvl === 3 ? ' mid' : '')), wallCls: 'wallw w' + st.ww,
      txt: st.ww === 2 ? 'Tyle tłumi typowa ściana. Gruby mur kamienny albo ceglany zabiera wyraźnie więcej. Przez dwie takie ściany sygnał już słabnie.' : db >= 20 ? 'Za taką przegrodą sygnał praktycznie znika. Potrzebny jest osobny punkt Wi-Fi po drugiej stronie, podłączony kablem.' : db >= 8 ? 'Przez jedną taką ścianę jeszcze działa, przez dwie już słabo. W pensjonacie to argument za punktem w pokoju, a nie w korytarzu.' : 'Lekka przegroda, sygnał przejdzie bez większych strat.',
      len: len, onLen: (e) => self.setState({ cl: +((e && e.target && e.target.value) || 70) }), sp: opt(SPD.map((x) => x[0]), st.cs, 'cs'),
      cat: c6ok ? 'Cat6 wystarczy' : 'Wybierz Cat6A', catS: c6ok ? (sp === 10 ? 'Przy ' + len + ' m Cat6 da jeszcze 10 Gb/s. Przy nowej budowie i tak warto rozważyć Cat6A na zapas.' : 'Do ' + SPD[st.cs][0] + ' na ' + len + ' m Cat6 w zupełności wystarcza.') : 'Na ' + len + ' m Cat6 nie da 10 Gb/s. Cat6A przenosi je na pełnych 100 m.', catCls: 'labres ' + (c6ok ? 'ok' : 'warn'),
      dist: opt(DIST, st.ld, 'ld'), dig: opt(['Tak', 'Nie'], st.lg, 'lg'), see: opt(['Tak', 'Nie'], st.ls, 'ls'), lnk: lnk, lnkS: lnkS, lnkIc: lnkIc,
      foCls: fo ? 'down' : '', foTog: () => self.setState({ fo: !fo }), foBtn: fo ? 'Przywróć łącze operatora' : 'Odetnij łącze operatora', foBtnCls: 'btn btn-s ' + (fo ? 'btn-p' : 'btn-g'), term: fo ? 'działa przez LTE' : 'działa',
      foTxt: fo ? 'Router sam przełączył się na zapasowe LTE/5G. Terminal płatniczy i kamery dalej mają internet. Na Podhalu zasięg komórkowy sprawdzamy na miejscu, a tam, gdzie go brakuje, rozważamy łącze satelitarne.' : 'Główne łącze działa. Router pilnuje go cały czas i w razie awarii przełączy ruch na łącze zapasowe.'
    };
    const MAT = [['Ciężki beton', 22, 44], ['Lekki beton', 8, 16], ['Cegła, kamień', 4, 7.7], ['Szkło', 3.6, 4.9], ['Płyta g-k', 2.5, 3.5], ['Drzwi drewniane', 1.9, 3.2], ['Okno z powłoką', 20, 40]];
    const mt = MAT[st.wlM], dB = st.wlB ? mt[2] : mt[1], keep = Math.pow(10, -dB / 10) * 100;
    const pctT = keep >= 10 ? Math.round(keep) + '%' : keep >= 1 ? keep.toFixed(1).replace('.', ',') + '%' : '<1%';
    const nb = keep > 50 ? 4 : keep > 15 ? 3 : keep > 3 ? 2 : keep > 0.5 ? 1 : 0;
    const wl = {
      mats: MAT.map((m, i) => ({ n: m[0], cls: 'zkc' + (st.wlM === i ? ' on' : ''), pick: () => self.setState({ wlM: i }) })),
      bands: [['2,4 GHz', 'dalej, wolniej'], ['5 GHz', 'szybciej, bliżej']].map((b, i) => ({ n: b[0], d: b[1], cls: 'zksg' + (st.wlB === i ? ' on' : ''), pick: () => self.setState({ wlB: i }) })),
      mat: mt[0], db: (st.wlM === 6 ? (st.wlB ? '20–40' : '20–40') : String(dB).replace('.', ',')) + ' dB', pct: st.wlM === 6 ? '0,01–1%' : pctT,
      wallCls: 'wlwall m' + st.wlM, st: '--keep:' + Math.max(0.06, keep / 100).toFixed(3),
      bars: [0, 1, 2, 3].map((i) => 'b' + (i < nb ? ' on' : '')),
      note: dB >= 20 ? 'Przez taką przeszkodę sygnał praktycznie nie przechodzi. Potrzebny jest osobny punkt Wi-Fi po drugiej stronie, podłączony kablem.' : dB >= 8 ? 'Zasięg wyraźnie spada. Jedna, dwie takie ściany i warto dodać punkt Wi-Fi w kolejnym pomieszczeniu.' : 'Niewielka strata. Kilka takich ścian po drodze już jednak sumuje się do odczuwalnego spadku.'
    };
    const wgen = [
      { g: 'Wi-Fi 6', t: 'Więcej urządzeń naraz', st: '--h:#5B8CF0', l: ['OFDMA: kanał dzielony między wiele urządzeń', 'MU-MIMO: kilka urządzeń obsługiwanych jednocześnie', 'TWT: dłużej działa bateria w telefonach i czujnikach'], n: 'Dziś rozsądne minimum w domu i firmie.' },
      { g: 'Wi-Fi 6E', t: 'Nowe pasmo 6 GHz', st: '--h:#B58CF0', l: ['Dodatkowe pasmo z wolnymi kanałami', 'Mniej zakłóceń od sąsiadów', 'Punkty dostępowe tylko wewnątrz budynków (moc LPI)'], n: 'Dobre tam, gdzie w okolicy jest dużo sieci.' },
      { g: 'Wi-Fi 7', t: 'Szybciej i stabilniej', st: '--h:#12B6D8', l: ['Kanały do 320 MHz; w Polsce pasmo 6 GHz (480 MHz) mieści jeden taki kanał', 'MLO: kilka pasm używanych naraz', '4K-QAM: ok. 20% więcej niż 1024-QAM'], n: 'Warto rozważyć przy nowej instalacji.' }
    ];
    const d = st.brD, los = st.brL === 0;
    const brO = [];
    if (d <= 300) brO.push({ k: 'Najlepiej', n: 'Światłowód wielomodowy OM3', d: '10 Gb/s do 300 m. Wymaga wykopu lub istniejącej rury.' });
    else if (d <= 400) brO.push({ k: 'Najlepiej', n: 'Światłowód wielomodowy OM4', d: '10 Gb/s do 400 m. Wymaga wykopu lub istniejącej rury.' });
    else brO.push({ k: 'Najlepiej', n: 'Światłowód jednomodowy', d: 'Do 10 km z modułem 10G LR. Wymaga wykopu lub istniejącej rury.' });
    if (los && d <= 500) brO.push({ k: 'Bez kopania', n: 'Most radiowy 60 GHz', d: 'Np. UniFi Building Bridge: do 500 m, ponad 1,7 Gb/s. Deszcz obniża sygnał, wtedy przełącza się na zapasowe 5 GHz.' });
    else if (los && d <= 1500) brO.push({ k: 'Bez kopania', n: 'Most radiowy 60 GHz dalekiego zasięgu', d: 'Np. MikroTik nRAY: ok. 1500 m, realnie ok. 1 Gb/s, obudowa odporna na śnieg.' });
    if (los) brO.push({ k: d > 1500 ? 'Bez kopania' : 'Alternatywa', n: 'Most radiowy 5 GHz', d: 'Na dłuższe dystanse. Na zewnątrz pasmo 5470–5725 MHz, do 1 W mocy, z DFS i TPC.' });
    else brO.push({ k: 'Uwaga', n: 'Brak linii widoczności', d: 'Drzewa lub budynek na trasie blokują most radiowy. Potrzebna wyższa antena, punkt pośredni albo światłowód.' });
    const br = {
      d: String(d), dTxt: d >= 1000 ? (d / 1000).toFixed(1).replace('.', ',') + ' km' : d + ' m', onD: (e) => self.setState({ brD: Number(e && e.target ? e.target.value : d) || d }),
      los: [['Widać budynek', 'czysta linia'], ['Drzewa po drodze', 'przeszkody']].map((b, i) => ({ n: b[0], d: b[1], cls: 'zksg' + (st.brL === i ? ' on' : ''), pick: () => self.setState({ brL: i }) })),
      trees: !los, fibCls: 'brfib' + (d <= 10000 ? ' on' : ''), radCls: 'brrad' + (los && d <= 3000 ? ' on' : ' off'),
      fibT: d <= 300 ? 'światłowód OM3 · 10 Gb/s' : d <= 400 ? 'światłowód OM4 · 10 Gb/s' : 'światłowód jednomodowy', radT: los ? (d <= 500 ? 'most 60 GHz' : d <= 1500 ? 'most 60 GHz dalekiego zasięgu' : 'most 5 GHz') : 'brak linii widoczności',
      opts: brO.map((o, i) => Object.assign({ cls: 'bro' + (i === 0 ? ' top' : '') + (o.k === 'Uwaga' ? ' warn' : '') }, o))
    };
    const bk = [
      { ic: P.wifi, t: 'Modem LTE lub 5G', d: 'Jako drugie łącze w routerze, z automatycznym przełączaniem.' },
      { ic: P.globe, t: 'Starlink', d: 'Tam, gdzie brak zasięgu i kabla. Od 22.05.2026: 135, 190 lub 265 zł miesięcznie.' },
      { ic: P.net, t: 'Dwóch operatorów', d: 'Światłowód i radiówka albo kabel, z równoważeniem ruchu.' }
    ];
    const hw = {
      roles: [
        [P.shield, 'Brama z zaporą', 'Łączy obiekt z internetem i pilnuje, kto i dokąd może się połączyć. Tu powstają osobne sieci dla gości, kas i kamer, VPN i łącze zapasowe.', 'domowy router nie rozdzieli sieci i nie przełączy się sam na drugie łącze.'],
        [P.net, 'Przełącznik PoE', 'Do niego schodzą kable z całego budynku. Jednym kablem daje urządzeniom internet i prąd, więc punkty Wi-Fi i kamery nie potrzebują gniazdek.', 'budżet mocy PoE musi wystarczyć na wszystkie punkty i kamery, z zapasem.'],
        [P.wifi, 'Punkty dostępowe', 'Sufitowe na korytarze i sale, ścienne w miejscu gniazdka w pokojach, zewnętrzne na taras i parking. Telefon sam przełącza się między nimi.', 'na kabel, nie mesh. Każdy skok radiowy obniża prędkość.'],
        [P.sliders, 'Panel i aplikacja', 'Cała sieć w jednym miejscu: kto jest podłączony, który punkt ma problem, aktualizacje. Jeśli masz u nas opiekę, widzimy awarię zdalnie, często zanim zadzwonisz.', 'konto administratora ma być na Ciebie, a nie na instalatora.']
      ].map((r, i) => ({ no: '0' + (i + 1), ic: r[0], t: r[1], d: r[2], w: r[3] }))
    };
    return Object.assign({ hw: hw }, this.sub(c, {
      hero: { crumb: 'Sieci i Wi-Fi', eye: 'Sieci komputerowe i Wi-Fi · Rabka-Zdrój, Zakopane, Podhale', h1a: 'Wi-Fi w każdym pokoju.', h1b: 'Bez wzmacniaczy z gniazdka.', lead: 'Projektujemy i budujemy sieci w pensjonatach, hotelach, domach i firmach. Punkty dostępowe podłączone kablem, osobna sieć dla gości, kamer i kasy, okablowanie, szafy rack i światłowody między budynkami.', kv: [['1 panel', 'cała sieć w jednym miejscu'], ['4 sieci', 'goście, kamery, kasa, smart'], ['0 zł', 'licencji za samo zarządzanie']], tags: ['Osobne sieci', 'Portal gościa', 'Światłowód', 'Mosty radiowe'] },
      anc: [['dlaczego', 'Dlaczego nie działa'], ['podzial', 'Osobne sieci'], ['portal', 'Wi-Fi dla gości'], ['okablowanie', 'Okablowanie'], ['narzedzia', 'Sprawdź sam'], ['sprzet', 'Jak zbudowana'], ['pakiety', 'Zestawy'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.home, n: 'Dom', d: 'Zasięg na wszystkich piętrach i w ogrodzie.', f: ['2–3 punkty dostępowe', 'Router z zaporą', 'Kabel do punktów zamiast mesh', 'Osobna sieć dla gości', 'Konfiguracja aplikacji'], pr: 'od [CENA] zł z montażem' },
        { ic: P.bed, n: 'Pensjonat i hotel', d: 'Sieć gości z portalem, osobne sieci dla techniki.', f: ['Punkty w korytarzach i salach', 'Portal gościa z logo', 'Sieci: goście, kamery, kasa, smart', 'Szafa rack i switch PoE', 'Przegląd przed sezonem'], pr: 'od [CENA] zł', hot: true },
        { ic: P.factory, n: 'Firma, hala, kilka budynków', d: 'Okablowanie, światłowód i Wi-Fi w hali.', f: ['Okablowanie strukturalne', 'Światłowód lub most radiowy', 'Wi-Fi w hali i na placu', 'Łącze zapasowe LTE', 'Opis gniazd; zakres dokumentacji ustalamy przed instalacją'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.home, t: 'Powierzchnia i piętra', d: 'Liczba punktów dostępowych zależy od układu ścian i stropów.' },
        { ic: P.ruler, t: 'Prowadzenie kabli', d: 'Korytka, listwy, przejścia między piętrami, kanały w ścianach.' },
        { ic: P.cpu, t: 'Szafa i urządzenia', d: 'Router, switch PoE, UPS, porządek w szafie.' },
        { ic: P.users, t: 'Portal gościa', d: 'Vouchery, ekran powitalny, regulamin, limity.' },
        { ic: P.fiber, t: 'Inne budynki', d: 'Światłowód w ziemi albo most radiowy.' },
        { ic: P.wrench, t: 'Opieka', d: 'Zdalny nadzór, aktualizacje, przegląd przed sezonem.' }
      ],
      faq: [
        ['Cat6 czy Cat6A?', 'Do domu i większości firm Cat6 wystarcza na 1 Gb/s. Cat6A daje 10 Gb/s na pełnych 100 metrach, a Cat6 tylko do około 55 metrów. Przy nowej budowie i dłuższych trasach polecamy Cat6A.'],
        ['Dlaczego światłowód między budynkami?', 'Bo nie przewodzi prądu. Przy burzy i różnych uziemieniach budynków skrętka może przenieść przepięcie i uszkodzić sprzęt w obu budynkach.'],
        ['Czy na most radiowy potrzebne jest pozwolenie?', 'Nie, jeśli sprzęt pracuje w paśmie dopuszczonym bez pozwolenia, np. 5470–5725 MHz na zewnątrz do 1 W EIRP z mechanizmem DFS. Dobieramy sprzęt i ustawienia zgodnie z przepisami.'],
        ['Czy płacę abonament za zarządzanie siecią?', 'Za samo oprogramowanie zwykle nie: popularne systemy, np. UniFi i podstawowa chmura Omada, działają bez licencji. Płatna jest rozszerzona wersja Omada. Osobno można wykupić naszą opiekę serwisową.'],
        ['Czy muszę zmieniać operatora internetu?', 'Zwykle nie. Router operatora zostaje jako modem, a za nim budujemy własną sieć z punktami dostępowymi. Jeśli łącze jest za słabe, doradzimy, jakie opcje są pod Twoim adresem.'],
        ['Dlaczego punkty dostępowe na kabel, a nie mesh?', 'Mesh bez kabla traci prędkość przy każdym skoku radiowym. Ubiquiti zaleca najwyżej dwa skoki. Kabel daje pełną prędkość w każdym pokoju i stabilność w sezonie.'],
        ['Czy Wi-Fi dla gości trzeba zgłaszać do UKE?', 'Zwykle nie. Według Prawa komunikacji elektronicznej udostępnianie internetu przez lokalne Wi-Fi jako dodatek do głównej działalności nie jest działalnością telekomunikacyjną.'],
        ['Czy goście widzą moje kamery albo komputer?', 'Nie, jeśli sieć jest podzielona. Tworzymy osobne sieci dla gości, kamer, recepcji i urządzeń smart. Goście są izolowani od siebie i od reszty.'],
        ['Czy da się zrobić Wi-Fi w drewnianym domu albo w kilku domkach?', 'Tak. Domki łączymy kablem w ziemi, światłowodem albo mostem radiowym, a w każdym stawiamy własny punkt dostępowy.']
      ],
      segRel: ['pens', 'hotel', 'rest', 'firma', 'szk'],
      rel: ['kam', 'tel', 'scr'],
      src: [['NHS England Digital, Building factors to consider (tłumienie materiałów)', 'https://digital.nhs.uk/services/networks-and-connectivity-dir/nhs-wi-fi/building-factors-to-consider'], ['Wi-Fi Alliance, Wi-Fi 6 i Wi-Fi 7', 'https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7'], ['Rozporządzenie MC, Dz.U. 2023 poz. 2567 (6 GHz, 5 GHz)', 'https://api.sejm.gov.pl/eli/acts/DU/2023/2567/text.html'], ['Decyzja UE 2021/1067 (6 GHz)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32021D1067'], ['Cisco, 10GBASE SFP+ (zasięgi OM3/OM4/SM)', 'https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/transceiver-modules/data_sheet_c78-455693.html'], ['MikroTik, Wireless Wire nRAY', 'https://mikrotik.com/product/wireless_wire_nray'], ['Dz.U. 2026 poz. 252 (nowelizacja ustawy o KSC, NIS2)', 'https://eli.gov.pl/eli/DU/2026/252/ogl'], ['UI Help, UniFi Hotspots and Captive Portals', 'https://help.ui.com/hc/articles/115000166827'], ['UI Help, Creating Virtual Networks (VLANs)', 'https://help.ui.com/hc/en-us/articles/9761080275607'], ['UI Help, Optimal Wireless Mesh Networks', 'https://help.ui.com/hc/articles/115002262328'], ['Prawo komunikacji elektronicznej (Dz.U. 2024 poz. 1221)', 'https://api.sejm.gov.pl/eli/acts/DU/2024/1221/text.pdf'], ['UKE, raport o stanie rynku telekomunikacyjnego w 2024 r. (83,6% gospodarstw z dostępem do 100 Mb/s)', 'https://uke.gov.pl/en/newsroom/report-on-the-state-of-the-telecommunications-market-in-2024,413.html'], ['Podatki.biz, kogo obejmuje nowelizacja ustawy o KSC (ok. 27 tys. podmiotów publicznych)', 'https://www.podatki.biz/artykuly/kogo-obejmuje-nowelizacja-ustawy-o-krajowym-systemie-cyberbezpieczenstwa-ksc_16_61861.htm']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Sieć dopasowana do budynku.', p: 'Zaczynamy od pomiaru zasięgu i planu punktów dostępowych.', note: 'To przykłady. Liczbę punktów i trasy kabli ustalamy po pomiarze na miejscu.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena sieci.', p: 'Najwięcej kosztuje praca przy kablach. Dlatego najlepiej zaplanować sieć razem z remontem albo budową.' }, relH: 'Na dobrej sieci działa reszta.' }
    }), { wl: wl, wgen: wgen, br: br, bk: bk, lb: lb, wf: wf, vl: vl, why: why, portal: portal, cab: cab, pt: pt, ctaEye: 'Sieci i Wi-Fi na Podhalu', ctaH: 'Zmierzymy zasięg i zaplanujemy sieć, która wytrzyma sezon.', ctaP: 'Pomiar, plan punktów dostępowych, okablowanie, montaż i konfiguracja. Potem zdalna opieka.' });
  }
