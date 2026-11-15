  initState() { return { mode: 'sat', az: 174, el: 25, mast: false, touched: false, ph: 0, q1: -1, q2: -1, flt: false }; }
  navKey() { return 'usl'; }
  rvIds() { return ['cr', 'gr', 'mx', 'flt', 'sat', 'htv', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, hold = 0;
    this.every(650, function () {
      var st = self.state;
      if (st.touched) return;
      var T = st.mode === 'sat' ? [189, 33] : [230, 0];
      var daz = T[0] - st.az, del = T[1] - st.el;
      if (Math.abs(daz) > 0 || (st.mode === 'sat' && Math.abs(del) > 0)) {
        self.setState({ az: st.az + Math.sign(daz) * Math.min(3, Math.abs(daz)), el: st.mode === 'sat' ? st.el + Math.sign(del) * Math.min(2, Math.abs(del)) : st.el });
        return;
      }
      if (st.mode === 'dvb' && !st.mast) { hold++; if (hold > 3) { hold = 0; self.setState({ mast: true }); } return; }
      hold++;
      if (hold > 6) { hold = 0; if (st.mode === 'sat') self.setState({ mode: 'dvb', az: 200, el: 0, mast: false }); else self.setState({ mode: 'sat', az: 172, el: 24, mast: false }); }
    });
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const sat = st.mode === 'sat';
    const tAz = sat ? 189 : 230, tEl = 33;
    const mastH = sat ? 34 : (st.mast ? 78 : 34);
    const ox = 470, oy = 172 - mastH;
    const R = Math.PI / 180;
    let q;
    if (sat) { const e = Math.hypot(st.az - tAz, st.el - tEl); q = Math.exp(-(e * e) / (2 * 2.6 * 2.6)); }
    else { const e = Math.abs(st.az - tAz); q = Math.exp(-(e * e) / (2 * 14 * 14)) * (st.mast ? 1 : 0.42); }
    const qp = Math.round(q * 100), lv = Math.round(22 + 74 * Math.pow(q, 0.6));
    const lock = q >= 0.7;
    let tx, ty, bx, by, yagiTr = '';
    if (sat) { tx = ox - 200 * Math.cos(tEl * R); ty = oy - 200 * Math.sin(tEl * R); bx = ox - 190 * Math.cos(st.el * R); by = oy - 190 * Math.sin(st.el * R); }
    else {
      tx = 70; ty = 218;
      const base = Math.atan2(ty - oy, tx - ox), off = (st.az - tAz) * R * 0.8;
      bx = ox + 260 * Math.cos(base + off); by = oy + 260 * Math.sin(base + off);
      yagiTr = 'translate(' + ox + ' ' + oy + ') rotate(' + ((base + off) / R).toFixed(1) + ')';
    }
    const cp = (a, r) => [(r * Math.sin(a * R)).toFixed(1), (-r * Math.cos(a * R)).toFixed(1)];
    const tc = cp(tAz, 38), nc = cp(st.az, 34);
    let note;
    if (sat) {
      if (lock) note = 'Złapane: Hot Bird 13°E, z którego nadaje m.in. CANAL+. Na Podhalu czasza patrzy na azymut ok. 189°, lekko na zachód od południa, i ok. 33° nad horyzont. Te kąty wyliczyliśmy dla Podhala, a na miejscu dokręcamy antenę według miernika.';
      else if (q > 0.15) note = 'Prawie. Antena satelitarna jest bardzo kierunkowa: kilka stopni obok i jakość spada, a obraz zaczyna się rwać.';
      else note = 'Brak sygnału. Kręć azymutem i elewacją albo kliknij „Ustaw jak instalator”. W praktyce robimy to miernikiem, nie na oko.';
    } else {
      if (!st.mast && Math.abs(st.az - tAz) < 8) note = 'Antena patrzy w dobrą stronę, ale stok zasłania nadajnik. Wyższy maszt albo inne miejsce na dachu zwykle rozwiązują problem. Włącz „Wyższy maszt”.';
      else if (lock) note = 'Odbiór stabilny. Antena kierunkowa ponad linią stoku, wycelowana w nadajnik. Kierunek zależy od miejscowości, dlatego zawsze ustawiamy go miernikiem.';
      else note = 'Słaby odbiór. Antena naziemna jest mniej kierunkowa niż satelitarna, ale w górach liczy się kierunek i wysokość montażu.';
    }
    const an = {
      modes: [['sat', 'Satelitarna', P.dish], ['dvb', 'Naziemna DVB-T2', P.ant]].map((m) => ({ n: m[1], ic: m[2], on: st.mode === m[0] ? 'true' : 'false', cls: st.mode === m[0] ? 'on' : '', pick: () => touch(m[0] === 'sat' ? { mode: 'sat', az: 175, el: 26, mast: false } : { mode: 'dvb', az: 205, el: 0, mast: false }) })),
      tag: sat ? 'Cel: Hot Bird 13°E' : 'Cel: nadajnik DVB-T2', sat: sat, dvb: !sat,
      ridge: 'M0 250 L80 205 L150 232 L230 176 L310 228 L400 200 L470 240 L640 214 V292 H0 Z',
      ox: ox, oy: oy, tx: tx.toFixed(1), ty: ty.toFixed(1), bx: bx.toFixed(1), by: by.toFixed(1), beamCls: 'anbeam' + (lock ? ' ok' : q > 0.15 ? ' mid' : ''),
      mx: ox - 2.5, my: oy, mh: 176 - oy, dishTr: 'translate(' + ox + ' ' + oy + ') rotate(' + (st.el - 180) + ')', satTr: 'translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')', yagiTr: yagiTr,
      tcx: tc[0], tcy: tc[1], ncx: nc[0], ncy: nc[1],
      lockCls: 'anmeter' + (lock ? ' lock' : ''), lockTxt: lock ? 'LOCK' : 'SZUKAM', lv: lv, q: qp, lvSt: 'width:' + lv + '%', qSt: 'width:' + qp + '%',
      az: st.az, el: st.el,
      azm: () => touch({ az: st.az - (sat ? 1 : 5) }), azp: () => touch({ az: st.az + (sat ? 1 : 5) }), elm: () => touch({ el: st.el - 1 }), elp: () => touch({ el: st.el + 1 }),
      mastCls: 'mstb' + (st.mast ? ' on' : ''), mastOn: st.mast ? 'true' : 'false', tMast: () => touch({ mast: !st.mast }),
      auto: () => touch(sat ? { az: 189, el: 33 } : { az: 230, mast: true }), note: note
    };
    const cr = [
      { ic: P.home, t: 'Dom jednorodzinny', d: 'Antena satelitarna i naziemna DVB-T2, rozprowadzenie do kilku telewizorów, pomiar sygnału przy każdym gnieździe.' },
      { ic: P.build, t: 'Instalacje zbiorcze w blokach', d: 'Jedna antena dla wszystkich mieszkańców zamiast lasu talerzy na balkonach. Multiswitche i rozprowadzenie do lokali.' },
      { ic: P.wrench, t: 'Modernizacja starych instalacji', d: 'Wymiana wzmacniaczy, przewodów i gniazd w istniejących instalacjach zbiorczych, z pomiarami po modernizacji.' },
      { ic: P.hotel, t: 'Telewizja hotelowa', d: 'Telewizja w każdym pokoju pensjonatu i hotelu, z jednego punktu odbioru. Razem z siecią i ekranami w recepcji.' },
      { ic: P.sliders, t: 'Pomiary miernikiem', d: 'Ustawiamy anteny profesjonalnym miernikiem poziomu i jakości sygnału. Wynik pokazujemy przy odbiorze.' },
      { ic: P.shield, t: 'Opieka po montażu', d: 'Konserwacja w gwarancji i opieka po gwarancji: przestawiona przez wiatr antena, zalane złącze, nowy telewizor.' }
    ];
    const dv = [
      { ic: P.tv, t: 'Sprawdzenie telewizora', d: 'Czy ma tuner DVB-T2/HEVC, czy potrzebny jest dekoder.' },
      { ic: P.ant, t: 'Dobór anteny', d: 'Kierunkowa albo dookólna, zależnie od odległości i ukształtowania terenu.' },
      { ic: P.sliders, t: 'Pomiar w gniazdach', d: 'Poziom i jakość sygnału w każdym gnieździe, nie tylko przy antenie.' },
      { ic: P.layers, t: 'Satelita i naziemna razem', d: 'Wspólna instalacja, żeby jeden przewód obsłużył oba źródła.' }
    ];
    const gr = [
      { ic: P.mountain, t: 'Zasłonięty nadajnik', d: 'Stok albo las między domem a nadajnikiem. Pomaga wyższy maszt, inne miejsce montażu albo antena kierunkowa.' },
      { ic: P.storm, t: 'Halny i wichury', d: 'Mocowania i maszty dobieramy z zapasem. W Zakopanem halny dawał porywy 33 m/s (grudzień 2013).', s: 'Druet, Wiśniewski, „Geography and Tourism”, 2021.' },
      { ic: P.snow, t: 'Śnieg i lód', d: 'Mokry śnieg na czaszy osłabia sygnał. Dobieramy miejsce montażu tak, żeby antenę dało się bezpiecznie odśnieżyć.' },
      { ic: P.bolt, t: 'Burze', d: 'Uziemienie i ochrona przepięciowa instalacji antenowej, żeby piorun nie trafił przez przewód do telewizora.' }
    ];
    const R0 = ['Odpowiedz na dwa pytania', 'Najprostszy test: wyszukaj kanały w telewizorze. Jeśli z anteny odbierasz TVP1 i Polsat z obrazem i dźwiękiem, telewizor jest gotowy.'];
    let res = R0, rk = '';
    if (st.q2 === 0) { res = ['Telewizor jest gotowy na DVB-T2/HEVC', 'TVP1 i Polsat nadają z anteny w DVB-T2/HEVC, więc skoro je odbierasz, sprzęt jest zgodny. Jeśli innych kanałów brakuje, problem leży raczej w antenie, kablu albo ustawieniu. To sprawdzimy miernikiem.']; rk = ' ok'; }
    else if (st.q2 === 1) { res = ['Sprawdź model albo zadzwoń', 'Brak obrazu może oznaczać telewizor bez HEVC (wtedy wystarczy niedrogi dekoder zewnętrzny) albo słaby sygnał z anteny. Sprawdzimy jedno i drugie, zwłaszcza pod kątem MUX-8 w VHF.']; rk = ' bad'; }
    else if (st.q1 === 0) { res = ['Telewizor powinien być gotowy', 'Telewizory sprzedawane od 1.12.2019 muszą dekodować HEVC. Potwierdzisz to, wyszukując kanały: TVP1 i Polsat z obrazem i dźwiękiem oznaczają, że wszystko gra.']; rk = ' ok'; }
    else if (st.q1 === 1) res = ['Sprawdź model albo zadzwoń', 'Wiele telewizorów z lat 2017–2019 też obsługuje HEVC. Sprawdź model w instrukcji albo wyszukaj kanały: jeśli z anteny odbierasz TVP1 i Polsat, telewizor jest gotowy.'];
    else if (st.q1 === 2 || st.q2 === 2) res = ['Sprawdź jednym testem', R0[1]];
    const am = {
      mux: [['MUX-1', 'DVB-T2', 'Kanały ogólnodostępne'], ['MUX-2', 'DVB-T2', 'M.in. Polsat i TVN'], ['MUX-3', 'DVB-T2', 'Główne kanały TVP, od grudnia 2023'], ['MUX-4', 'DVB-T2', 'Pakiet płatny'], ['MUX-6', 'DVB-T2', 'Od startu w DVB-T2/HEVC'], ['MUX-8', 'DVB-T · VHF', 'Czeka na zmianę standardu. Część osób potrzebuje anteny VHF.']].map((m) => ({ n: m[0], std: m[1], d: m[2], cls: 'mxc2' + (m[0] === 'MUX-8' ? ' old' : '') })),
      q1: ['Od grudnia 2019', 'Wcześniej', 'Nie wiem'].map((n, i) => ({ n: n, on: st.q1 === i ? 'true' : 'false', cls: 'zksg' + (st.q1 === i ? ' on' : ''), pick: () => self.setState({ q1: i, touched: true }) })),
      q2: ['Tak, obraz i dźwięk', 'Nie odbieram', 'Nie sprawdzałem'].map((n, i) => ({ n: n, on: st.q2 === i ? 'true' : 'false', cls: 'zksg' + (st.q2 === i ? ' on' : ''), pick: () => self.setState({ q2: i, touched: true }) })),
      resCls: 'tvres' + rk,
      resT: res[0],
      resD: res[1],
      fOn: st.flt ? 'true' : 'false', fCls: 'lkpw' + (st.flt ? ' on' : ''), fT: st.flt ? 'Filtr LTE/5G włączony' : 'Bez filtra', tF: () => self.setState({ flt: !st.flt, touched: true }),
      fD: st.flt ? 'Pasmo komórkowe jest tłumione, wzmacniacz pracuje tylko na sygnale telewizyjnym.' : 'Sygnał LTE/5G wchodzi do wzmacniacza razem z telewizją i może go przesterować.',
      specCls: 'spec' + (st.flt ? ' f' : ''),
      sat: [
        { k: '1–4 telewizory', t: 'Konwerter Quad', st: '--h:#5B8CF0', d: 'Cztery niezależne wyjścia, każde do osobnego tunera. Bez dodatkowych urządzeń.', n: 'Dom, mały pensjonat', p: 'M48 40 C80 40 90 70 32 70 M48 40 C90 40 110 70 58 70 M48 40 C100 40 130 70 84 70 M48 40 C110 40 150 70 110 70', tv: ['22', '48', '74', '100'] },
        { k: 'Wiele pokoi', t: 'Quattro + multiswitch', st: '--h:#B58CF0', d: 'Konwerter Quattro podaje wszystkie pasma do multiswitcha, a ten rozdziela sygnał do każdego gniazda. Można dodać naziemną.', n: 'Pensjonat, budynek wielorodzinny', p: 'M48 40 H110 V56 M110 56 L60 70 M110 56 L90 70 M110 56 L120 70 M110 56 L150 70 M110 56 L180 70', tv: ['50', '80', '110', '140', '170'] },
        { k: 'Jeden kabel', t: 'Unicable II / dCSS', st: '--h:#12B6D8', d: 'Do 32 tunerów na jednym przewodzie (norma EN 50607). Dobre przy remoncie, gdy nie ma jak dołożyć kabli. Odbiornik musi obsługiwać ten standard.', n: 'Remont, istniejące okablowanie', p: 'M48 40 C100 40 100 76 190 76', tv: ['70', '110', '150'] }
      ],
      htv: [
        { ic: P.dish, t: 'Satelita i naziemna razem', d: 'Wspólna antena na dachu, multiswitch i gniazda w pokojach. Jeden przewód do każdego telewizora.' },
        { ic: P.tv, t: 'Własny kanał z recepcji', d: 'Modulator zamienia sygnał HDMI, np. z komputera z informacjami o obiekcie, na kanał widoczny na każdym telewizorze.' },
        { ic: P.layers, t: 'Kanały satelitarne bez dekodera w pokoju', d: 'Transmodulator przerabia wybrane kanały SAT na DVB-T lub DVB-C w wewnętrznej sieci obiektu. Dotyczy to kanałów niekodowanych albo płatnych w ramach umowy hotelowej z operatorem (np. Polsat Box, CANAL+). Bez takiej umowy płatnych kanałów nie wolno rozprowadzać po pokojach.' }
      ]
    };
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Anteny RTV/SAT', eye: 'Anteny satelitarne i naziemne DVB-T2 · Podhale', h1a: 'Antena ustawiona miernikiem,', h1b: 'nie na oko.', lead: 'Montujemy anteny satelitarne i naziemne DVB-T2 w domach, pensjonatach i hotelach, instalacje zbiorcze w blokach i telewizję hotelową. Ustaw antenę sam w symulatorze, a zobaczysz, dlaczego robimy to z miernikiem.', kv: [['od 2004', 'PRO-KOM na Podhalu'], ['DVB-T2', 'standard telewizji naziemnej'], ['13°E', 'Hot Bird, m.in. CANAL+']], tags: ['Satelitarne', 'DVB-T2/HEVC', 'Zbiorcze', 'TV hotelowa'] },
      anc: [['co-robimy', 'Co robimy'], ['gory', 'Anteny w górach'], ['multipleksy', 'Multipleksy'], ['satelita', 'Satelita'], ['pensjonat-tv', 'TV w pensjonacie'], ['pakiety', 'Zestawy'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.home, n: 'Dom', d: 'Satelita i telewizja naziemna.', f: ['Antena satelitarna z konwerterem', 'Antena naziemna DVB-T2', 'Rozprowadzenie do 2–4 telewizorów', 'Pomiar w każdym gnieździe', 'Ustawienie dekoderów'], pr: 'od [CENA] zł z montażem' },
        { ic: P.hotel, n: 'Pensjonat i hotel', d: 'Telewizja w każdym pokoju.', f: ['Wspólny punkt odbioru', 'Multiswitch lub stacja czołowa', 'Gniazdo w każdym pokoju', 'Pomiary w gniazdach, opis według ustaleń', 'Opieka w sezonie'], pr: 'od [CENA] zł', hot: true },
        { ic: P.build, n: 'Blok i wspólnota', d: 'Instalacja zbiorcza lub modernizacja.', f: ['Jedna antena dla mieszkańców', 'Multiswitche w pionach', 'Wymiana starych wzmacniaczy', 'Pomiary w lokalach', 'Zakres dokumentacji ustalamy w ofercie'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.dish, t: 'Rodzaj anten', d: 'Satelitarna, naziemna, kierunkowa, z kilku satelitów.' },
        { ic: P.tv, t: 'Liczba telewizorów', d: 'Każde gniazdo to przewód, a czasem multiswitch.' },
        { ic: P.build, t: 'Miejsce montażu', d: 'Dach, ściana, maszt. Wysokość i dostęp.' },
        { ic: P.ruler, t: 'Długość przewodów', d: 'Trasa od anteny do telewizorów i przejścia przez ściany.' },
        { ic: P.shield, t: 'Uziemienie i ochrona', d: 'Ochrona przepięciowa i uziemienie instalacji.' },
        { ic: P.wrench, t: 'Modernizacja', d: 'Co da się zostawić z istniejącej instalacji.' }
      ],
      faq: [
        ['Czy mój telewizor odbierze DVB-T2?', 'Telewizory sprzed kilku lat często nie mają tunera DVB-T2/HEVC. Sprawdzimy model i podpowiemy, czy wystarczy dekoder.'],
        ['Czy antenę satelitarną można zamontować na balkonie?', 'Często tak, jeśli z balkonu widać południe bez przeszkód. Montaż w piwnicy czy wewnątrz budynku nie jest możliwy, bo antena musi „widzieć” satelitę.'],
        ['Czy jedna antena może obsłużyć kilka telewizorów?', 'Tak. Rozprowadzamy sygnał przewodami, a przy kilku dekoderach satelitarnych stosujemy multiswitch.'],
        ['Mieszkam w bloku. Czy da się zrobić instalację zbiorczą?', 'Tak, to częste zlecenie wspólnot. Jedna antena na dachu zastępuje talerze na balkonach, a sygnał trafia do każdego lokalu.'],
        ['Obraz rwie się przy złej pogodzie. Co robić?', 'Najczęściej antena jest lekko przestawiona albo złącze zawilgło. Sprawdzamy miernikiem i ustawiamy ponownie.'],
        ['Jaką gwarancję dostanę?', 'Na montaż dajemy 24 miesiące gwarancji PRO-KOM, a urządzenia mają gwarancję producenta. Na zgłoszenie odpowiadamy do 24 h w dni robocze: oddzwonimy albo odpiszemy.'],
        ['Satelita czy telewizja naziemna?', 'Naziemna DVB-T2 nie wymaga płatnego pakietu u operatora (abonament RTV obowiązuje niezależnie od sposobu odbioru) i daje kanały z multipleksów. Satelita daje więcej kanałów, zwykle w płatnym pakiecie Polsat Box albo CANAL+. W górach o wyborze często decyduje zasięg nadajnika, który sprawdzamy miernikiem.'],
        ['Czy antenę na dachu trzeba uziemić?', 'Tak. Maszt i instalację łączymy z uziemieniem i wyrównujemy potencjały zgodnie z normą PN-EN 60728-11. Na Podhalu, przy częstych burzach, to ochrona telewizorów i dekoderów.']
      ],
      segRel: ['pens', 'hotel', 'dom', 'dev'],
      rel: ['tel', 'scr', 'wifi'],
      src: [['Emitel, MUX-8', 'https://emitel.pl/telewizja/naziemna-telewizja-cyfrowa-dvb-t/mux-8'], ['wirtualnemedia.pl, lista kanałów i MUX-8 (06.2026)', 'https://www.wirtualnemedia.pl/naziemna-telewizja-cyfrowa-lista-kanalow-republika-hd-lepsza-jakosc-obrazu-mux-8,7292202935056768a'], ['hdtvpolska.com: MUX-8, zmiana standardu bez ogłoszonej daty (01.2026)', 'https://hdtvpolska.com/telewizja-naziemna-zmiany-mux-8-zmiana-standardu-nadawania-dvb-t2-kanaly/'], ['geekweek: multipleksy i standardy nadawania (2026)', 'https://geekweek.interia.pl/technologia/news-ile-jest-programow-w-telewizji-naziemnej-i-jak-je-wyszukac,nId,22425906'], ['Rozporządzenie, Dz.U. 2019 poz. 2125 (wymagania dla odbiorników, od 1.12.2019)', 'https://eli.gov.pl/eli/DU/2019/2125/ogl/pol/pdf'], ['Telmor, filtr FAR 48 5G LTE', 'https://www.telmor.pl/en/Products/RF-Passive-Components-Splitters-Filters-Wall-outlets/Filters-LTE-5G/FAR-48-5G-LTE-PROTECTED'], ['satkurier.pl, Polsat Box na Hot Bird (01.2026)', 'https://satkurier.pl/news/248894/hot-bird-nadal-dla-polsat-box-nowa-umowa-z-eutelsatem.html'], ['Inverto, multiswitch Unicable II (EN 50607)', 'https://inverto.tv/download/file/63b53b663cb86-1672821606.pdf'], ['TSUE C-306/05, telewizja w pokojach hotelowych', 'https://merlin.obs.coe.int/article/4084'], ['prawo.pl, abonament RTV w hotelach (NSA)', 'https://www.prawo.pl/podatki/abonament-rtv-placi-sie-za-domniemanie,510488.html'], ['telepolis.pl, stawki abonamentu RTV 2026', 'https://www.telepolis.pl/rozrywka/telewizja-i-vod/abonament-rtv-stawki-2026'], ['STOART, tabela dla obiektów noclegowych (audio), od 1.04.2026', 'https://stoart.org.pl/upload/2026/05/tabela-noclegi-audio-stoart-waloryzacja-2026.pdf'], ['hdtvpolska.com: CANAL+ na satelicie Hot Bird 13°E (04.2026)', 'https://hdtvpolska.com/uwaga-abonenci-canal-i-polsat-box-zmiany-na-liscie-kanalow/'], ['Druet, Wiśniewski: halny w Zakopanem (2021, PDF)', 'https://yadda.icm.edu.pl/yadda/element/bwmeta1.element.baztech-922374f2-1a62-4f83-8038-c35fb63282ae/c/Foehn_wind_as_a_factor_affecting_the_air.pdf']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Od domu po cały blok.', p: 'Zakres ustalamy po obejrzeniu dachu i miejsc na telewizory.', note: 'To przykłady. Rodzaj anten i rozprowadzenie dobieramy na miejscu, a cenę podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena instalacji antenowej.', p: 'Zrób zdjęcie dachu albo miejsca na antenę i napisz, ile telewizorów chcesz podłączyć.' }, relH: 'Telewizja, sieć i ekrany razem.' }
    }), { am: am,  an: an, cr: cr, dv: dv, gr: gr, ctaEye: 'Anteny RTV/SAT', ctaH: 'Obraz się rwie albo budujesz dom? Ustawimy antenę jak trzeba.', ctaP: 'Montaż, ustawienie miernikiem, rozprowadzenie do telewizorów i opieka po montażu.' });
  }
