  initState() { return { apk: 'cm', lm: 0, ann: false, kv: 60, kr: 4, kc: false, ia: 120, ih: 30, im: 0, ven: 'rest', lv: [70, 55, 60, 35], mu: [false, false, false, false], src: 0, pri: -99, touched: false }; }
  navKey() { return 'usl'; }
  rvIds() { return ['ob', 'ap', 'ch', 'ko', 'ig', 'so', 'dso', 'lic', 'rn', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, V = ['rest', 'hotel', 'kos', 'szk', 'hala'], i = 0, n = 0;
    this.every(1300, function () {
      if (self.state.touched) return;
      n++;
      if (n % 4 === 0) { var lv = self.state.lv.map(function (x, k) { return Math.max(20, Math.min(95, x + ((n + k) % 3 - 1) * 10)); }); self.setState({ lv: lv }); }
      if (n % 9 === 0) self.setState({ pri: self.state.tick });
      if (n % 14 === 0) { i = (i + 1) % V.length; self.setState({ ven: V[i] }); }
    });
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const V = {
      rest: ['Restauracja', P.food, ['Sala', 'Taras', 'Bar', 'Toalety']],
      hotel: ['Hotel', P.hotel, ['Lobby', 'Restauracja', 'SPA', 'Sala konferencyjna']],
      kos: ['Kościół', P.church, ['Prezbiterium', 'Nawa', 'Chór', 'Przedsionek']],
      szk: ['Szkoła', P.school, ['Korytarze', 'Sala gimnastyczna', 'Stołówka', 'Boisko']],
      obr: ['Sala obrad', P.users, ['Stół prezydialny', 'Sala', 'Galeria', 'Hol']],
      hala: ['Hala', P.factory, ['Trybuny', 'Płyta', 'Hol', 'Szatnie']]
    };
    const v = V[st.ven];
    const pri = st.tick - st.pri >= 0 && st.tick - st.pri < 4;
    const eff = st.lv.map((l, i) => st.mu[i] ? 0 : pri ? 85 : l);
    const dbOf = (l) => l <= 0 ? '−∞' : l >= 100 ? '0 dB' : '−' + Math.round((100 - l) * 0.4) + ' dB';
    const zz = {};
    v[2].forEach((n, i) => {
      const l = eff[i];
      zz['z' + i] = { n: n, db: st.mu[i] ? 'wycisz.' : dbOf(l), cls: 'm_zg' + (st.mu[i] ? ' m_mute' : ''), st: '--lv:' + Math.max(0.12, l / 100).toFixed(2) };
    });
    const ch = v[2].map((n, i) => {
      const l = eff[i], lit = st.mu[i] ? 0 : Math.round(l / 100 * 12);
      return {
        n: n, db: st.mu[i] ? 'MUTE' : dbOf(l), l: String(st.lv[i]), aria: 'Głośność strefy ' + n,
        onLv: (e) => { const lv = st.lv.slice(); lv[i] = Math.max(0, Math.min(100, Number(e && e.target ? e.target.value : lv[i]) || 0)); touch({ lv: lv }); },
        seg: Array.from({ length: 12 }, (_, k) => 'ms' + (k >= 10 ? ' r' : k >= 8 ? ' y' : '') + (k < lit ? ' on' : '') + (k === lit - 1 ? ' pkk' : '')),
        cls: 'cch' + (st.mu[i] ? ' mute' : ''), mcls: 'cmu' + (st.mu[i] ? ' on' : ''), mOn: st.mu[i] ? 'true' : 'false', mtxt: st.mu[i] ? 'Wyciszona' : 'Wycisz',
        mute: () => { const mu = st.mu.slice(); mu[i] = !mu[i]; touch({ mu: mu }); }
      };
    });
    const SRC = [['Muzyka w tle', P.music], ['Mikrofon', P.spk], ['Telewizor, AUX', P.tv]];
    const vv = {}; Object.keys(V).forEach((k) => { vv[k] = st.ven === k; });
    const mx = Object.assign({
      venues: Object.keys(V).map((k) => ({ n: V[k][0], ic: V[k][1], on: st.ven === k ? 'true' : 'false', cls: st.ven === k ? 'on' : '', pick: () => touch({ ven: k }) })),
      v: vv, ch: ch, pri: pri, cls: 'mxp src' + st.src + (pri ? ' mpri' : ''),
      src: SRC.map((s, i) => ({ n: s[0], ic: s[1], on: st.src === i ? 'true' : 'false', cls: 'csb' + (st.src === i ? ' on' : ''), pick: () => touch({ src: i }) })),
      ann: () => touch({ pri: st.tick }), annCls: 'cann' + (pri ? ' on' : ''),
      note: pri ? 'Komunikat ma pierwszeństwo: muzyka ścisza się we wszystkich strefach, a po komunikacie wraca do poprzednich ustawień.' : 'Przesuń suwak albo wycisz strefę i zobacz, jak zmienia się zasięg głośników na planie. Muzykę w strefie ' + v[2][0].toLowerCase() + ' możesz podgłośnić, a w ' + v[2][3].toLowerCase() + ' wyciszyć z panelu na ścianie (z telefonu w systemach z aplikacją).'
    }, zz);
    const ob = [
      { ic: P.food, t: 'Restauracje i karczmy', d: 'Muzyka w tle na sali, osobno na tarasie i w toaletach. Głośność, której nie trzeba poprawiać co godzinę.', k: ['strefy', 'taras', 'panel ścienny'] },
      { ic: P.hotel, t: 'Hotele i pensjonaty', d: 'Lobby, restauracja, SPA, sala konferencyjna. Komunikaty do wybranych stref.', k: ['strefy', 'komunikaty', 'sala konf.'] },
      { ic: P.church, t: 'Kościoły', d: 'Zrozumiałość mowy w całej nawie, mikrofony bezprzewodowe, prosta obsługa dla zakrystianina.', k: ['zrozumiałość mowy', 'mikrofony'] },
      { ic: P.school, t: 'Szkoły', d: 'Dzwonki, komunikaty, apel na sali gimnastycznej i boisku.', k: ['dzwonki', 'komunikaty', 'apel'] },
      { ic: P.factory, t: 'Hale i obiekty sportowe', d: 'Komunikaty na trybunach i płycie, muzyka na wydarzenia.', k: ['komunikaty', 'wydarzenia'] },
      { ic: P.users, t: 'Sale obrad i rady gmin', d: 'Mikrofony dyskusyjne dobrane tak, żeby ograniczyć sprzężenia, z nagrywaniem obrad i sygnałem do transmisji internetowej.', k: ['mikrofony', 'nagrywanie', 'transmisje'] },
      { ic: P.shop, t: 'Sklepy i salony', d: 'Muzyka i komunikaty marketingowe, sterowanie z zaplecza. Między innymi salony Empik w Zakopanem i Krakowie. [SZEF: potwierdź zgodę klienta na podanie nazwy]', k: ['muzyka', 'reklamy audio'] },
      { ic: P.car, t: 'Nagłośnienie na pojazdach', d: 'Nagłośnienie zewnętrzne na samochodzie reklamowym albo na wydarzenia plenerowe.', k: ['pojazd', 'plener'] }
    ];
    const dso = [
      { ic: P.hotel, t: 'budynki zamieszkania zbiorowego z ponad 200 miejscami noclegowymi albo budynki wysokie i wysokościowe' },
      { ic: P.tv, t: 'kina i teatry z ponad 600 miejscami' },
      { ic: P.users, t: 'sale widowiskowe i sportowe z ponad 1500 miejscami' },
      { ic: P.shop, t: 'budynki handlowe ze strefą ZL I powyżej 8000 m² (jedna kondygnacja) lub 5000 m² (więcej kondygnacji)' },
      { ic: P.plus, t: 'szpitale i sanatoria z ponad 200 łóżkami oraz inne obiekty wymienione w rozporządzeniu' }
    ];
    const lic = [
      { ic: P.music, t: 'Radio w lokalu to też publiczne odtwarzanie', d: 'Prawo autorskie pozwala odbierać radio i telewizję w miejscu ogólnodostępnym bez opłat tylko wtedy, gdy nie łączy się to z korzyścią majątkową (art. 24 ust. 2).' },
      { ic: P.users, t: 'Organizacje zbiorowego zarządzania', d: 'Opłaty pobierają m.in. ZAiKS, STOART, SAWP i ZPAV. Według Ministerstwa Kultury można też licencjonować muzykę bezpośrednio.' },
      { ic: P.play, t: 'Muzyka licencjonowana do lokali', d: 'Serwisy muzyki dla firm mają własne licencje. Podłączamy je do systemu tak samo jak każde inne źródło.' }
    ];
    const ART = { snd: 'M30 120v-40h28l34-26v92l-34-26zM120 70a40 40 0 0 1 0 60M145 50a70 70 0 0 1 0 100M170 30a100 100 0 0 1 0 140', ch: 'M120 30v26M108 42h24M70 160V96l50-40 50 40v64M106 160v-34h28v34M30 160h180', cf: 'M50 80h100v44a36 36 0 0 1-36 36H86a36 36 0 0 1-36-36zM150 92h16a18 18 0 0 1 0 36h-16M80 40c-8 10 8 18 0 28M110 40c-8 10 8 18 0 28' };
    const rn = [
      { k: 'Sklep', n: 'Empik Zakopane i Kraków', m: 'Nagłośnienie sal sprzedaży [SZEF: zgoda klienta na nazwę]', ph: '', art: ART.snd },
      { k: 'Kościół', n: 'Parafia św. Teresy', m: 'Rabka-Zdrój · instalacja audiowizualna i nagłośnienie chóru', ph: '', art: ART.ch },
      { k: 'Kościół', n: 'Jasna Górka, Ślemień', m: 'Parafia Narodzenia św. Jana Chrzciciela · nagłośnienie', ph: '', art: ART.ch },
      { k: 'Kaplica', n: 'Kaplica Sióstr Nazaretanek', m: 'Rabka-Zdrój · nagłośnienie', ph: '', art: ART.ch },
      { k: 'Gastronomia', n: 'Restauracja „Aleksandra”', m: 'Mszana Dolna · instalacja audiowizualna', ph: '', art: ART.cf },
      { k: 'Gastronomia', n: 'Caffe Europa i FitBar', m: 'Nowy Sącz · nagłośnienie lokali', ph: '', art: ART.cf }
    ];

    // APART
    const AP = {
      cm: ['Głośniki sufitowe', 'CM · CMX · CMS', 'Do sufitu', 'Najczęstszy wybór do restauracji, sklepów, hoteli i szkół. Równy dźwięk w całym pomieszczeniu, a z sufitu widać tylko maskownicę. Są wersje okrągłe, kwadratowe do sufitów podwieszanych, bezramkowe i sufitowy subwoofer CMSUB8.', [['Pasmo', 'od 50–60 Hz do 20 kHz'], ['Szczelność', 'do IP54'], ['Podłączenie', 'linia 100 V lub 16 Ω']], ['Restauracja', 'Sklep', 'Hotel', 'Szkoła'], ['CM6T', 'CMX20T', 'CMSQ108', 'CM20DTS (bezramkowy)']],
      cmar: ['Do łazienek i SPA', 'CMAR', 'Wilgoć', 'Sufitowe głośniki w wersji Marine do miejsc z parą i wilgocią: łazienki, SPA, baseny i zadaszone tarasy. Wyglądają jak zwykłe sufitowe, więc nie psują wnętrza.', [['CMAR8-W', 'IP65'], ['Wersje', 'z transformatorem 100 V (T) i bez'], ['Rozmiary', 'CMAR5, CMAR6, CMAR8']], ['SPA', 'Basen', 'Łazienka', 'Taras'], ['CMAR5T-W', 'CMAR6T-W', 'CMAR8-W']],
      mask: ['Głośniki naścienne', 'MASK · OVO · SDQ', 'Na ścianę', 'Na ścianę albo pod zadaszenie tarasu. MASK ma obudowę odporną na pogodę, OVO pasuje do sal i restauracji, a aktywny SDQ z pilotem przewodowym wystarcza do małej sali bez szafy z elektroniką.', [['Szczelność MASK', 'IP64'], ['MASK6CT', 'do 60 W w linii 100 V'], ['Sterowanie SDQ', 'pilot ACPL lub ACPR']], ['Taras', 'Sala', 'Bar', 'Klasa'], ['MASK6CT', 'OVO5', 'SDQ5PIR']],
      sph: ['Głośniki wiszące', 'SPH', 'Wysokie stropy', 'Kula na linkach dla wysokich stropów i otwartych przestrzeni: hale, sklepy z wysokim sufitem, lobby. Gra dookoła, w 360 stopniach.', [['Promieniowanie', '360°'], ['Szczelność SPH20', 'IP63'], ['Linia', '100 V']], ['Lobby', 'Hala', 'Sklep'], ['SPH16', 'SPH20']],
      col: ['Kolumny głośnikowe', 'COLS · COLW', 'Kościoły i hale', 'Wąskie kolumny do wnętrz z pogłosem: kościoły, hale sportowe, aule i sale konferencyjne. Według producenta poprawiają zrozumiałość mowy i ograniczają sprzężenia.', [['Szczelność', 'IP66'], ['COLS41', '180° poziomo, 110° pionowo'], ['Linia', '100 V']], ['Kościół', 'Aula', 'Hala', 'Dziedziniec'], ['COLS41', 'COLS81', 'COLW41']],
      rock: ['Ogród i teren', 'ROCK · MASK · COLW', 'Na zewnątrz', 'Głośnik w kształcie kamienia znika wśród roślin. Na tarasy pod zadaszeniem MASK, na dziedzińce kolumny COLW.', [['ROCK608', '60 W, IP64'], ['COLW', 'IP66'], ['MASK', 'IP64']], ['Ogród', 'Taras', 'Basen', 'Dziedziniec'], ['ROCK608', 'MASK6CT', 'COLW41']],
      sub: ['Subwoofer', 'SUBA', 'Pełny bas', 'Dokłada bas tam, gdzie muzyka ma mieć pełniejsze brzmienie: restauracje, showroomy, sale konferencyjne. Sam się włącza, gdy gra muzyka.', [['SUBA165', '70 W'], ['Pasmo', '30–180 Hz'], ['Tryb', 'samoczynne wł./wył.']], ['Restauracja', 'Showroom', 'Sala'], ['SUBA165']],
      amp: ['Wzmacniacze', 'REVAMP · CONCEPT · MA', 'Szafa techniczna', 'Do pracy przez cały dzień, część modeli chłodzona bez wentylatora. Wzmacniacze miksujące MA mają wbudowany mikser, priorytet mikrofonu, gong i wejście zasilania awaryjnego 24 V.', [['REVAMP2120T', '2 × 120 W, także 100 V'], ['MA247MR', '5+1 stref, 240 W'], ['CONCEPT1', 'praca 24/7']], ['Zaplecze', 'Szafa rack'], ['REVAMP2120T', 'REVAMP4100', 'CONCEPT1', 'MA247MR']],
      zone: ['Strefy i panele ścienne', 'ZONE4 · PM1122', 'Sterowanie', 'Mikser strefowy daje każdej strefie własne źródło i głośność. Panel na ścianie łączymy skrętką, a obsługa ma tylko pokrętło i wybór muzyki.', [['ZONE4', '4 strefy stereo'], ['Panele ZONE4R', 'do 8 na skrętce CAT5'], ['Panel PM1122RL', 'do 300 m na skrętce']], ['Restauracja', 'Hotel', 'Sklep'], ['ZONE4 + ZONE4R', 'PM1122 + PM1122RL']],
      mic: ['Mikrofony do komunikatów', 'MICPAT', 'Komunikaty', 'Mikrofon stołowy z przyciskiem do komunikatów: przy kasie, w recepcji, w sekretariacie szkoły. Wersje wielostrefowe wybierają, gdzie trafi komunikat, a cyfrowa stacja DIMIC12 obsługuje więcej stref.', [['MICPAT-D', 'dynamiczny, z przyciskiem'], ['MICPAT-4', 'do 4 stacji z priorytetem'], ['DIMIC12', 'cyfrowa, z wyborem stref']], ['Kasa', 'Recepcja', 'Szkoła'], ['MICPAT-D', 'MICPAT-2', 'MICPAT-4', 'DIMIC12']],
      src: ['Źródła muzyki', 'PCR · PR', 'Muzyka w tle', 'Muzyka grająca cały dzień bez komputera i telefonu: radio, płyty, pendrive, Bluetooth. Tuner z czterema radiami pozwala puścić inną stację w każdej strefie.', [['PCR3000RMKIII', 'DAB+/FM, CD, USB, SD, Bluetooth'], ['PR4000R', '4 tunery FM RDS'], ['Montaż', 'w szafie rack']], ['Restauracja', 'Sklep', 'Hotel'], ['PCR3000RMKIII', 'PR4000R', 'PC1000RMKII']],
      dsp: ['Matryce audio', 'AUDIOCONTROL · AUDIOSYSTEM', 'Duże obiekty', 'Dla obiektów z wieloma źródłami i strefami: hotel z salami, centrum handlowe, szkoła. Matryca kieruje dowolne źródło do dowolnej strefy. To jedyne modele APART produkowane w Belgii.', [['AUDIOSYSTEM8.8', 'matryca 8 × 8'], ['AUDIOCONTROL12.8', 'matryca z DSP'], ['Produkcja', 'Belgia']], ['Hotel', 'Galeria', 'Szkoła'], ['AUDIOCONTROL12.8', 'AUDIOSYSTEM8.8']]
    };
    const apc = {}; Object.keys(AP).forEach((k) => { apc[k] = { n: AP[k][0], s: AP[k][1], on: st.apk === k ? 'true' : 'false', cls: 'apc' + (st.apk === k ? ' on' : ''), pick: () => self.setState({ apk: k }) }; });
    const A0 = AP[st.apk];
    const apy = [
      { ic: P.layers, t: 'Cały system od jednego producenta', d: 'Głośniki, wzmacniacze, strefy, mikrofony i źródła muzyki są do siebie dopasowane.' },
      { ic: P.spk, t: '100 V i niska impedancja', d: 'Te same modele głośników w wersji na linię 100 V i w wersji niskoimpedancyjnej: wiele głośników na długim kablu albo pełniejsze brzmienie w barze.' },
      { ic: P.clock, t: 'Do pracy przez cały dzień', d: 'Wzmacniacze do pracy ciągłej, część modeli bez wentylatora, a we wzmacniaczach miksujących wejście zasilania awaryjnego.' },
      { ic: P.shield, t: 'Gwarancja producenta', d: 'Biamp daje 5 lat gwarancji na nowe produkty kupione u autoryzowanego dealera. Na montaż dajemy 24 miesiące. [SZEF: potwierdź u dystrybutora, że 5 lat obejmuje APART i nasz kanał zakupu]' }
    ];
    const ap = { c: apc, sel: { k: 'ap' + st.apk, n: A0[0], g: A0[2], d: A0[3], kv: A0[4].map((x) => ({ k: x[0], v: x[1] })), w: A0[5], m: A0[6] } };
    // tor sygnału
    const L100 = st.lm === 0, ann = st.ann;
    const ZN = L100 ? [['Sala', 6], ['Bar', 3], ['Taras', 4], ['Toalety', 2]] : [['Sala', 4], ['Bar', 2], ['Taras', 2], ['Sala konferencyjna', 2]];
    const chn = {
      tabs: ['Linia 100 V', 'Niska impedancja'].map((n, i) => ({ n: n, on: st.lm === i ? 'true' : 'false', cls: st.lm === i ? 'on' : '', pick: () => self.setState({ lm: i }) })),
      annCls: 'btn btn-s ' + (ann ? 'btn-p' : 'btn-g'), annT: ann ? 'Koniec komunikatu' : 'Nadaj komunikat', ann: () => self.setState({ ann: !ann }), priCls: ann ? 'on' : '',
      src: [['Muzyka i radio', P.music, 0], ['Mikrofon przy kasie', P.chat, 1], ['Gong', P.bell, 1], ['Wejście alarmowe', P.shield, 0]].map((x) => ({ n: x[0], ic: x[1], cls: 'chs' + (ann ? (x[2] ? ' on' : ' dim') : (x[0] === 'Muzyka i radio' ? ' on' : '')) })),
      mix: L100 ? 'Wzmacniacz miksujący, np. MA247MR' : 'Mikser strefowy, np. ZONE4', mixS: L100 ? 'Do 6 poziomów priorytetu i VOX' : '4 strefy stereo, panele ZONE4R',
      amp: L100 ? 'np. REVAMP2120T w linii 100 V' : 'np. REVAMP4100, 4 × 110 W', ampS: L100 ? 'Wiele głośników na jednej linii, długie kable' : 'Kilka głośników blisko wzmacniacza, pełniejsze brzmienie',
      zones: ZN.map((z, i) => ({ n: z[0], sp: Array.from({ length: z[1] }, () => 'chp' + (L100 ? ' t' : '') + (ann ? ' a' : '')), v: ann ? 'komunikat' : 'muzyka ' + [60, 45, 50, 30][i] + '%' })),
      note: L100 ? 'W linii 100 V każdy głośnik ma transformator z odczepami mocy, np. 1,5 / 3 / 6 W. Na jedną linię wpinamy wiele głośników i każdemu dobieramy głośność. Dobre do sklepów, hoteli, kościołów i szkół.' : 'W niskiej impedancji na kanał wzmacniacza przypada kilka głośników, np. do czterech 16-omowych na kanał 4 Ω. Dobre do baru, sali konferencyjnej i tam, gdzie liczy się brzmienie muzyki.'
    };
    // kościół
    const kv = st.kv, kr = st.kr, kc = st.kc;
    let cl = 1 - (kr - 1) * 0.17 + (kc ? (kr - 1) * 0.12 : 0);
    if (kv < 40) cl -= (40 - kv) / 70;
    if (kv > 70) cl -= (kv - 70) / 100 * kr * (kc ? 0.08 : 0.22);
    cl = Math.max(0.08, Math.min(0.95, cl));
    const clT = cl < 0.45 ? 'Słowa się zlewają. Głośniej nie pomoże.' : cl < 0.6 ? 'Da się zrozumieć, ale trzeba się wsłuchać.' : cl < 0.75 ? 'Dobrze słychać każde słowo.' : 'Bardzo wyraźnie, także w ostatniej ławce.';
    const nref = kc ? 1 : 3;
    const ko = {
      vol: kv, rev: kr, revT: ['krótki', 'umiarkowany', 'średni', 'długi', 'bardzo długi'][kr - 1],
      onVol: (e) => self.setState({ kv: +((e && e.target && e.target.value) || 60) }), onRev: (e) => self.setState({ kr: +((e && e.target && e.target.value) || 3) }),
      colCls: 'chip' + (kc ? ' on' : ''), colOn: kc ? 'true' : 'false', tCol: () => self.setState({ kc: !kc }),
      beam: kc ? 'M48 100 L390 160 L390 196 L48 114 Z' : 'M48 90 L400 18 L400 200 L48 126 Z',
      refl: [0, 1, 2].slice(0, nref).map((i) => ({ d: ['M120 60 Q210 120 300 60', 'M90 74 Q210 150 330 74', 'M150 46 Q210 96 270 46'][i], st: 'opacity:' + Math.min(0.9, (kr / 5) * (kv / 100) * 1.4).toFixed(2) })),
      blur: 'filter:blur(' + ((1 - cl) * 3.2).toFixed(1) + 'px);opacity:' + (0.45 + cl * 0.55).toFixed(2), bar: 'width:' + Math.round(cl * 100) + '%', txt: clT,
      pts: [
        { t: 'Kolumny zamiast zwykłych głośników', d: 'Kierują dźwięk na ławki, a mniej na sklepienie, więc pogłos mniej przeszkadza.' },
        { t: 'Mikrofony przy ołtarzu i ambonie', d: 'Dobrane tak, żeby nie było sprzężeń i dudnienia.' },
        { t: 'Pętla indukcyjna', d: 'Przesyła mowę prosto do aparatu słuchowego. Podmioty publiczne muszą zapewnić wsparcie słyszenia, np. pętlę indukcyjną. Dla parafii to wybór dobrowolny.' },
        { t: 'Nagłośnienie przed kościołem', d: 'Na odpusty i uroczystości, gdy wierni stoją na zewnątrz.' }
      ]
    };
    // ile głośników: rozstaw ok. 2 × wysokość (muzyka) albo 1 × wysokość (mowa); przy wysokich stropach wiszące/kolumny
    const ar = st.ia, hm = st.ih / 10, high = hm > 4.5, hc = high ? 4 : hm;
    const cnt = (k) => { const x = ar / Math.pow(k * hc, 2); const lo = Math.max(1, Math.round(x)); return [lo, Math.max(lo, Math.ceil(x * 1.2))]; };
    const cM = cnt(2), cS = cnt(1), cur = st.im === 0 ? cM : cS;
    const glos = (n) => { const d = n % 10, dd = n % 100; return n === 1 ? 'głośnik' : (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) ? 'głośniki' : 'głośników'; };
    const form = glos(cur[1]);
    const unit = high ? form + (form === 'głośnik' ? ' wiszący' : form === 'głośniki' ? ' wiszące' : ' wiszących') + ' albo kolumny' : form + (form === 'głośnik' ? ' sufitowy' : form === 'głośniki' ? ' sufitowe' : ' sufitowych');
    const tot = Math.min(Math.max(cS[1], cur[1]), 60);
    const ig = {
      a: ar, h: st.ih, hT: hm.toFixed(1).replace('.', ','),
      onA: (e) => self.setState({ ia: +((e && e.target && e.target.value) || 120) }), onH: (e) => self.setState({ ih: +((e && e.target && e.target.value) || 30) }),
      modes: ['Muzyka w tle', 'Mowa i komunikaty'].map((n, i) => ({ n: n, on: st.im === i ? 'true' : 'false', cls: st.im === i ? 'on' : '', pick: () => self.setState({ im: i }) })),
      res: cur[0] === cur[1] ? String(cur[0]) : cur[0] + '–' + cur[1], unit: unit,
      dots: Array.from({ length: tot }, (x, i) => (i < Math.min(cur[1], 60) ? 'on' : '') + (st.im === 1 ? ' sp' : '')),
      note: (st.im === 0 ? 'Muzyka w tle: głośniki co około dwie wysokości sufitu. ' : 'Mowa i komunikaty: głośniki co około jedną wysokość sufitu, bo zrozumiałość wymaga gęstszego rozmieszczenia. ') + (high ? 'Przy suficie wyższym niż ok. 4,5 m głośniki sufitowe są za daleko od słuchaczy, dlatego liczymy głośniki wiszące zawieszone na ok. 4 m albo kolumny, jak w kościołach i halach. ' : '') + (cur[1] > 60 ? 'Na planie pokazujemy najwyżej 60 kropek. ' : '') + 'To szacunek z reguł branżowych. Dokładnie liczymy po oględzinach, bo dużo zależy od pogłosu i wyposażenia sali.'
    };
    const so = [
      { ic: P.spk, t: 'Nagłośnienie sali', d: 'Mikrofony dla radnych i prowadzącego, głośniki dobrane do akustyki sali.', s: 'Mikrofony konferencyjne m.in. Audio-Technica' },
      { ic: P.camera2, t: 'Nagrywanie i transmisja', d: 'Obrady rady gminy są transmitowane i utrwalane, a nagrania trafiają do BIP i na stronę gminy.', s: 'Art. 20 ust. 1b ustawy o samorządzie gminnym' },
      { ic: P.check, t: 'Imienny wykaz głosowań', d: 'Głosowania jawne odbywają się za pomocą urządzeń, które utrwalają imienny wykaz głosów radnych.', s: 'Art. 14 ust. 2–4 u.s.g. · system głosowania z partnerem [SZEF]' },
      { ic: P.users, t: 'Pętla indukcyjna', d: 'Podmioty publiczne muszą zapewnić urządzenia wspierające słyszenie, np. pętle indukcyjne, systemy FM albo inne rozwiązania techniczne.', s: 'Ustawa o zapewnianiu dostępności, art. 6 pkt 3 lit. b' }
    ];
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Nagłośnienie', eye: 'Nagłośnienie · restauracje, hotele, kościoły, szkoły · Podhale', h1a: 'Muzyka tam, gdzie trzeba.', h1b: 'Cisza tam, gdzie ma być cicho.', lead: 'Projektujemy i montujemy nagłośnienie stref w restauracjach, hotelach, kościołach, szkołach, sklepach i halach. Każda strefa z osobną głośnością, komunikaty z priorytetem i obsługa, którą zrozumie każdy pracownik.', kv: [['Strefy', 'każda z osobną głośnością'], ['1 przycisk', 'do komunikatu'], ['od 2004', 'PRO-KOM na Podhalu']], tags: ['APART Audio', 'JBL', 'RCF', 'Audio-Technica'] },
      anc: [['obiekty', 'Gdzie nagłaśniamy'], ['apart', 'APART'], ['jak-dziala', 'Jak działa'], ['kosciol', 'Kościół'], ['ile-glosnikow', 'Kalkulator'], ['sala-obrad', 'Sale obrad'], ['dso', 'DSO'], ['licencje', 'Muzyka w lokalu'], ['realizacje-n', 'Realizacje'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.food, n: 'Lokal', d: 'Restauracja, kawiarnia, sklep.', f: ['2–4 strefy z osobną głośnością', 'Głośniki dobrane do wnętrza', 'Wzmacniacz strefowy', 'Panel na ścianie lub aplikacja', 'Ustawienie i szkolenie'], pr: 'od [CENA] zł z montażem' },
        { ic: P.hotel, n: 'Hotel i obiekt', d: 'Kilka stref i komunikaty.', f: ['Strefy: lobby, restauracja, SPA, sale', 'Komunikaty z priorytetem', 'Mikrofon na recepcji', 'Integracja z ekranami', 'Serwis'], pr: 'od [CENA] zł', hot: true },
        { ic: P.church, n: 'Kościół, szkoła, hala', d: 'Zrozumiałość mowy i duże przestrzenie.', f: ['Analiza wnętrza', 'Kolumny dobrane do akustyki', 'Mikrofony bezprzewodowe', 'Dzwonki i komunikaty', 'Prosta obsługa'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.home, t: 'Wielkość i akustyka wnętrza', d: 'Wysokie, twarde wnętrza potrzebują innych głośników niż mała sala.' },
        { ic: P.layers, t: 'Liczba stref', d: 'Każda strefa to osobna regulacja i okablowanie.' },
        { ic: P.spk, t: 'Rodzaj głośników', d: 'Sufitowe, naścienne, zewnętrzne, kolumny.' },
        { ic: P.music, t: 'Źródła i mikrofony', d: 'Odtwarzacz, mikrofony przewodowe i bezprzewodowe, wejścia TV.' },
        { ic: P.ruler, t: 'Okablowanie', d: 'Trasy przewodów, praca w gotowym wnętrzu lub w remoncie.' },
        { ic: P.sliders, t: 'Sterowanie', d: 'Panel ścienny, aplikacja, integracja ze smart home.' }
      ],
      faq: [
        ['Linia 100 V czy niska impedancja?', 'Linię 100 V stosujemy przy wielu głośnikach i dłuższych kablach: sklep, hotel, kościół, szkoła. Niską impedancję przy kilku głośnikach blisko wzmacniacza: bar, sala konferencyjna. Dobieramy to w projekcie.'],
        ['Czy da się sterować z panelu na ścianie?', 'Tak. Panel w strefie ma głośność i wybór źródła, a łączymy go z mikserem zwykłą skrętką. Obsługa nie musi wchodzić do zaplecza.'],
        ['Czy APART zagra z radia albo z telefonu przez Bluetooth?', 'Tak. Odtwarzacz PCR3000RMKIII ma radio DAB+ i FM, CD, USB, kartę SD i Bluetooth, więc muzyka gra bez komputera. Tuner PR4000R ma cztery radia, więc każda strefa może grać inną stację.'],
        ['Czy da się sterować z telefonu?', 'W linii APART nie ma aplikacji. Jeśli sterowanie z telefonu jest ważne, dobieramy inne rozwiązanie. Muzykę z telefonu podłączamy zwykle przez odbiornik wpięty do wejścia miksera.'],
        ['Czy gmina musi nagrywać i transmitować sesje rady?', 'Tak. Art. 20 ust. 1b ustawy o samorządzie gminnym nakazuje transmisję i utrwalanie obrad, a art. 14 wymaga urządzeń do imiennego wykazu głosowań. Nagłośnienie jest częścią takiego systemu.'],
        ['Czy głośniki nadają się do łazienki, SPA albo na taras?', 'Tak, są modele o podwyższonej odporności: sufitowe do wilgotnych pomieszczeń, naścienne IP64 i kolumny IP66. Dobieramy je do miejsca.'],
        ['Czy w pensjonacie potrzebny jest DSO?', 'Zwykle nie. Rozporządzenie wymaga DSO m.in. w budynkach zamieszkania zbiorowego z ponad 200 miejscami noclegowymi albo w budynkach wysokich. Typowy pensjonat na Podhalu jest mniejszy. O wymaganiach dla konkretnego budynku decyduje projekt i rzeczoznawca ppoż.'],
        ['Czy muszę płacić za muzykę w restauracji?', 'Zwykle tak, bo to publiczne odtwarzanie utworów. Opłaty pobierają organizacje zbiorowego zarządzania, można też korzystać z serwisów muzyki licencjonowanej do lokali.'],
        ['Czy można mieć inną muzykę na tarasie i na sali?', 'Tak. W systemie strefowym każda strefa może mieć własne źródło i głośność.'],
        ['Czy obsługa poradzi sobie z mikserem?', 'Nie dajemy obsłudze miksera. Montujemy prosty panel albo aplikację z kilkoma przyciskami, a ustawienia akustyczne blokujemy.'],
        ['Czy nagłośnienie kościoła da się poprawić bez wymiany wszystkiego?', 'Często tak. Zaczynamy od odsłuchu i sprawdzenia, co działa. Czasem wystarczy zmiana ustawień, mikrofonów albo części kolumn.']
      ],
      segRel: ['kosc', 'rest', 'gmina', 'szk', 'hotel'],
      rel: ['scr', 'smart', 'wifi'],
      relX: [{ href: 'Realizacje.dc.html', ic: P.eye, n: 'Realizacje', s: 'Empik, kościół, kawiarnia i inne' }],
      src: [['Rozporządzenie MSWiA w sprawie ochrony przeciwpożarowej, § 29 (t.j. Dz.U. 2023 poz. 822)', 'https://api.sejm.gov.pl/eli/acts/DU/2023/822/text.pdf'], ['CNBOP-PIB, dokument 0021:2015', 'https://cnbop.pl/app/uploads/2024/12/cnbop-pib-0021-2015.pdf'], ['Prawo autorskie, art. 24 (t.j. Dz.U. 2025 poz. 24)', 'https://api.sejm.gov.pl/eli/acts/DU/2025/24/text.pdf'], ['MKiDN, odpowiedź na interpelację nr 13026', 'https://api.sejm.gov.pl/sejm/term10/interpellations/attachment/ATTDNCK3Y/i13026-o1.pdf'], ['Ustawa o samorządzie gminnym (ISAP, tekst jednolity)', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19900160095'], ['Ustawa o zapewnianiu dostępności osobom ze szczególnymi potrzebami (ISAP)', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20190001696'], ['Biamp, deklaracja pochodzenia produktów (09.2025, PDF)', 'https://downloads.biamp.com/assets/docs/default-source/legal/biamp_declaration_of_origin_sep25.pdf'], ['Biamp, warunki gwarancji', 'https://www.biamp.com/warranty'], ['Biamp, Commercial Loudspeakers', 'https://www.biamp.com/products/families/commercial-loudspeakers'], ['APART ZONE4, instrukcja (PDF)', 'https://im.static-thomann.de/pics/atg/atgdata/document/manual/253494.pdf']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Od kawiarni do kościoła.', p: 'Sprzęt dobieramy po odsłuchu i obejrzeniu wnętrza.', note: 'To przykłady. Liczbę stref i rodzaj głośników ustalamy na miejscu, a cenę podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena nagłośnienia.', p: 'Największy wpływ ma wnętrze: jego wielkość, wysokość i to, jak bardzo pogłosowe jest.' }, relH: 'Dźwięk i obraz w jednym projekcie.' }
    }), { apy: apy, ap: ap, chn: chn, ko: ko, ig: ig, so: so, mx: mx, ob: ob, dso: dso, lic: lic, rn: rn, ctaEye: 'Nagłośnienie na Podhalu', ctaH: 'Przyjedziemy, posłuchamy wnętrza i zaproponujemy rozwiązanie.', ctaP: 'Odsłuch, projekt stref, montaż, ustawienie i szkolenie obsługi. Potem serwis.' });
  }
