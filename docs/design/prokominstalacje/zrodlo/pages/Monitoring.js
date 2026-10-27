  initState() { return { sv: 2, se: 'nvr', mode: 'col', sel: -1, ai: true, mask: true, deter: true, touched: false, typ: 0, res: 1, lens: 0, dist: 12, n: 8, br: 1, tb: 1 }; }
  navKey() { return 'usl'; }
  rvIds() { return ['co', 'sys', 'typy', 'dori', 'rec', 'rodo', 'br', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, M = ['col', 'ir', 'day'], i = 0;
    this.every(4200, function () { if (self.state.touched) return; i = (i + 1) % 3; self.setState({ mode: M[i] }); });
    // klawiatura: Enter/Spacja na elemencie schematu (role="button" w SVG) działa jak kliknięcie
    try { window.addEventListener('keydown', function (e) { var el = document.activeElement; if (!el || !el.classList || !el.classList.contains('sye')) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); } }); } catch (e) {}
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const night = st.mode !== 'day';
    const pad = (n) => String(n).padStart(2, '0');
    const sec = pad((st.tick * 1) % 60);
    const time = night ? '02:14:' + sec : '13:' + pad(20 + Math.floor(st.tick / 60) % 30) + ':' + sec;
    const MODES = [['day', 'Dzień', P.sun], ['ir', 'Noc · IR', P.moon], ['col', 'Noc · kolor', P.light]];
    const sel = st.sel;
    const camCls = (k) => 'cam' + (sel === k ? ' sel' : '');
    const pick = (k) => () => touch({ sel: sel === k ? -1 : k });
    const EV = [[8, 'c', 'A'], [27, 'p', 'C'], [41, 'c', 'A'], [55, 'p', 'C'], [68, 'p', 'C'], [80, 'c', 'A'], [91, 'p', 'C']];
    const FA = [[14, 'f', '!'], [33, 'f', '!'], [47, 'f', '!'], [61, 'f', '!'], [74, 'f', '!'], [86, 'f', '!'], [96, 'f', '!']];
    const ev = (st.ai ? EV : EV.concat(FA)).map((e) => ({ cls: 'tlev ' + e[1], st: 'left:' + e[0] + '%', k: e[2], t: e[1] === 'p' ? 'Człowiek' : e[1] === 'c' ? 'Auto' : 'Fałszywy alarm: ruch drzewa, śnieg, zwierzę' }));
    let note;
    if (!st.ai) note = 'Bez analizy obrazu każdy ruch to alarm: drzewo na wietrze, padający śnieg, kot. Na osi czasu przybywa czerwonych zdarzeń, a Ty przestajesz czytać powiadomienia.';
    else if (st.mode === 'col') note = 'Kolor w nocy: jasny obiektyw i ciepłe doświetlenie (Hikvision ColorVu, Dahua Full-color). Widać kolor kurtki i auta, co pomaga przy zgłoszeniu.';
    else if (st.mode === 'ir') note = 'Podczerwień: obraz czarno-biały, niewidoczny dla gości. Kamera hybrydowa może włączyć białe światło dopiero wtedy, gdy wykryje człowieka.';
    else note = 'Wykrywanie ludzi i aut: powiadomienie przychodzi tylko wtedy, gdy na parkingu albo przy wejściu pojawi się człowiek lub samochód.';
    if (st.mask) note += ' Posesja sąsiada na kamerze 4 jest zamaskowana i nie trafia do nagrań.';
    const T = (on) => 'tgl' + (on ? ' on' : '');
    const nv = {
      day: night ? 'NOC · −9°C' : 'DZIEŃ · −4°C', time: time, scn: 'cs ' + st.mode,
      modes: MODES.map((m) => ({ n: m[1], ic: m[2], on: st.mode === m[0] ? 'true' : 'false', cls: st.mode === m[0] ? 'on' : '', pick: () => touch({ mode: m[0] }) })),
      big: sel >= 0, grid: () => touch({ sel: -1 }), gcls: 'nvrg' + (sel >= 0 ? ' one' : ''),
      s1: sel < 0 || sel === 0, s2: sel < 0 || sel === 1, s3: sel < 0 || sel === 2, s4: sel < 0 || sel === 3,
      c1: camCls(0), c2: camCls(1), c3: camCls(2), c4: camCls(3), p1: pick(0), p2: pick(1), p3: pick(2), p4: pick(3),
      ai: st.ai, noai: !st.ai, night: night, dayv: !night, deter: st.deter, mask: st.mask, mcls: 'pmask' + (night ? '' : ' day'),
      ev: ev, note: note,
      aiCls: T(st.ai), aiOn: st.ai ? 'true' : 'false', tAi: () => touch({ ai: !st.ai }),
      mkCls: T(st.mask), mkOn: st.mask ? 'true' : 'false', tMask: () => touch({ mask: !st.mask }),
      dtCls: T(st.deter), dtOn: st.deter ? 'true' : 'false', tDet: () => touch({ deter: !st.deter, mode: st.deter ? st.mode : (night ? st.mode : 'ir') })
    };
    const feats = [
      { ic: P.home, t: 'Nagrania zostają u Ciebie', d: 'Rejestrator stoi w Twoim obiekcie. Nie płacisz abonamentu za chmurę, a nagrania nie wyjeżdżają na cudze serwery.' },
      { ic: P.phone, t: 'Podgląd w telefonie', d: 'Aplikacja producenta (np. Hik-Connect, DMSS albo aplikacja BCS): obraz na żywo, powiadomienia, przewijanie nagrań. Konfigurujemy ją razem z Tobą.' },
      { ic: P.eye, t: 'Wykrywanie ludzi i aut', d: 'Analiza obrazu (Hikvision AcuSense, Dahua WizSense) odróżnia człowieka i samochód od liści, śniegu i zwierząt. Mniej fałszywych powiadomień.' },
      { ic: P.moon, t: 'Kolor także w nocy', d: 'Kamery z jasnym obiektywem F1.0 i ciepłym doświetleniem pokazują kolory po zmroku. Albo dyskretna podczerwień, gdy światło przeszkadza gościom.' },
      { ic: P.bell, t: 'Odstraszanie', d: 'Kamera z białym światłem, syreną i własnym komunikatem głosowym reaguje, zanim ktoś wejdzie do narciarni czy garażu.' },
      { ic: P.snow, t: 'Na górską zimę', d: 'Dobieramy kamery do mrozu: przykładowo Dahua IPC-HDBW3441R-AS-P pracuje od −40 do +60°C, ma szczelność IP67 i odporność na uderzenia IK10.', src: 'Według karty producenta.' }
    ];
    const TY = [
      { n: 'Kopułkowa', d: 'Mała, dyskretna, montowana pod okapem lub na suficie. Trudno ją przestawić albo zasłonić.', ok: 'Wejścia, recepcja, korytarze, sala sklepu, okap nad drzwiami.', no: 'Kopułka zbiera krople i szron, jeśli nie jest pod daszkiem. Montujemy ją pod okapem.' },
      { n: 'Tubowa', d: 'Klasyczna kamera zewnętrzna z daszkiem. Łatwo ją wycelować daleko, np. na wjazd.', ok: 'Parking, podjazd, brama, plac, ściana szczytowa.', no: 'Widoczna z daleka. Tam, gdzie liczy się wygląd elewacji, lepsza bywa kopułka.' },
      { n: 'Obrotowa PTZ', d: 'Obraca się i przybliża. Może sama śledzić człowieka albo auto na dużym terenie.', ok: 'Duże parkingi, place, hale, tereny gminne i osiedlowe.', no: 'Patrzy tam, gdzie jest obrócona. Zwykle łączymy ją ze stałymi kamerami.' },
      { n: 'Z odstraszaniem', d: 'Ma białe światło, syrenę i głośnik. Odtwarza komunikat albo pozwala odezwać się z telefonu.', ok: 'Narciarnia, garaż, zaplecze, tereny bez ruchu nocą.', no: 'Syrenę ustawiamy z harmonogramem, żeby nie budziła gości przy każdym wyjściu po narty.' },
      { n: 'Panoramiczna', d: 'Kilka obiektywów w jednej obudowie daje szeroki obraz bez martwych pól.', ok: 'Duże parkingi, place, hale, wejścia z kilku stron.', no: 'Szeroki kadr to mniej szczegółów w oddali. Do tablic rejestracyjnych lepsza osobna kamera.' }
    ];
    const ti = st.typ;
    const typ = Object.assign({ k: 'ty' + ti, d0: ti === 0, d1: ti === 1, d2: ti === 2, d3: ti === 3, d4: ti === 4 }, TY[ti], {
      tabs: TY.map((t, i) => ({ n: t.n, on: ti === i ? 'true' : 'false', cls: 'typb' + (ti === i ? ' on' : ''), pick: () => self.setState({ typ: i }) }))
    });
    // DORI
    const RES = [['2 MP', 1920], ['4 MP', 2560], ['8 MP', 3840]];
    const LENS = [['2,8 mm · ok. 100°', 100], ['4 mm · ok. 85°', 85], ['6 mm · ok. 55°', 55], ['12 mm · ok. 30°', 30]];
    const hres = RES[st.res][1], fov = LENS[st.lens][1], d = st.dist;
    const w = 2 * d * Math.tan(fov / 2 * Math.PI / 180);
    const ppm = Math.round(hres / w);
    const LV = [['Wykrycie', 25], ['Obserwacja', 62], ['Rozpoznanie', 125], ['Identyfikacja', 250]];
    let lvI = -1; LV.forEach((l, i) => { if (ppm >= l[1]) lvI = i; });
    const TX = ['Za mało, żeby pewnie wykryć człowieka. Potrzebna kamera bliżej albo węższy obiektyw.', 'Widać, że ktoś jest. Nie rozpoznasz, kto to.', 'Widać sylwetkę, ubiór i to, co robi.', 'Rozpoznasz znajomą osobę po twarzy i sylwetce.', 'Twarz wyraźna na tyle, żeby wskazać konkretną osobę.'];
    const dmax = (t) => (hres / t) / (2 * Math.tan(fov / 2 * Math.PI / 180));
    const span = 40;
    const zx = [dmax(250), dmax(125), dmax(62), dmax(25)].map((v) => Math.min(100, Math.max(0, v / span * 100)));
    const zoneN = ['Identyfikacja', 'Rozpoznanie', 'Obserwacja', 'Wykrycie'], zoneS = ['Id.', 'Roz.', 'Obs.', 'Wyk.'];
    let prev = 0;
    const zones = zx.map((x, i) => { const z = { n: x - prev > 14 ? zoneN[i] : x - prev > 5 ? zoneS[i] : '', st: 'left:' + prev.toFixed(1) + '%;width:' + Math.max(0, x - prev).toFixed(1) + '%' }; prev = x; return z; });
    const mx = Math.min(94, Math.max(6, d / span * 100));
    const dori = {
      res: RES.map((r, i) => ({ n: r[0], on: st.res === i ? 'true' : 'false', cls: st.res === i ? 'on' : '', pick: () => self.setState({ res: i }) })),
      lens: LENS.map((r, i) => ({ n: r[0], on: st.lens === i ? 'true' : 'false', cls: st.lens === i ? 'on' : '', pick: () => self.setState({ lens: i }) })),
      d: d, onD: (e) => self.setState({ dist: +((e && e.target && e.target.value) || 12) }), ppm: ppm, w: w.toFixed(1).replace('.', ','),
      zones: zones, manSt: 'left:calc(' + mx.toFixed(1) + '% - 11px);transform:scale(' + (1.25 - d / 60).toFixed(2) + ')',
      lv: LV.map((l, i) => ({ n: l[0], cls: i <= lvI ? 'on' : '' })), txt: TX[lvI + 1]
    };
    // nagrania
    const BR = [['2 Mb/s', 2], ['4 Mb/s', 4], ['8 Mb/s', 8]];
    const TB = [['2 TB', 2], ['4 TB', 4], ['8 TB', 8], ['16 TB', 16]];
    const daily = st.n * BR[st.br][1] * 86400 / 8 / 1e6; // TB na dobę (Mb/s × s ÷ 8 = MB, ÷ 1e6 = TB)
    const daysF = TB[st.tb][1] * 0.95 / daily; // 95% pojemności, jak w schemacie „Wersje instalacji”
    const days = Math.floor(daysF), hrs = Math.floor(daysF * 24);
    const few = (k) => k % 10 >= 2 && k % 10 <= 4 && (k % 100 < 12 || k % 100 > 14);
    const camW = st.n === 1 ? 'kamera zapisuje' : few(st.n) ? 'kamery zapisują' : 'kamer zapisuje';
    const hrW = hrs === 1 ? 'godzina' : few(hrs) ? 'godziny' : 'godzin';
    const rec = {
      n: st.n, nm: () => self.setState({ n: Math.max(1, st.n - 1) }), np: () => self.setState({ n: Math.min(32, st.n + 1) }),
      br: BR.map((r, i) => ({ n: r[0], on: st.br === i ? 'true' : 'false', cls: st.br === i ? 'on' : '', pick: () => self.setState({ br: i }) })),
      tb: TB.map((r, i) => ({ n: r[0], on: st.tb === i ? 'true' : 'false', cls: st.tb === i ? 'on' : '', pick: () => self.setState({ tb: i }) })),
      days: days, big: String(days >= 1 ? days : hrs), unit: days >= 1 ? (days === 1 ? 'dzień' : 'dni') : hrW,
      bar: 'width:' + Math.min(100, daysF / 90 * 100).toFixed(0) + '%',
      txt: st.n + ' ' + camW + ' ok. ' + daily.toFixed(2).replace('.', ',') + ' TB na dobę. ' + (days > 90 ? 'To więcej niż potrzeba: czas przechowywania i tak ustawiamy krócej, zgodnie z celem monitoringu.' : days < 1 ? 'To mniej niż doba. Przy takiej liczbie kamer potrzebny jest większy dysk albo nagrywanie przy ruchu.' : days < 7 ? 'To mało. Przy takiej liczbie kamer warto większy dysk albo nagrywanie przy ruchu.' : 'Czas przechowywania ustawiamy w rejestratorze, a starsze nagrania nadpisują się same.')
    };
    const rodo = {
      ok: ['Parking i podjazd', 'Wejście do budynku i recepcja', 'Narciarnia, wózkownia, garaż', 'Kasa, zaplecze, magazyn', 'Teren wokół obiektu, bez posesji sąsiadów'],
      no: ['Pokoje gości i apartamenty', 'Łazienki, toalety, szatnie', 'Sauna, strefa SPA, przebieralnie', 'Stołówka, palarnia i pokój związków zawodowych (Kodeks pracy dopuszcza tylko wąskie wyjątki)', 'Okna, ogrody i działki sąsiadów'],
      we: [
        { ic: P.layers, t: 'Strefy i maski', d: 'Zaczerniamy w obrazie to, czego kamera nie powinna nagrywać.' },
        { ic: P.clock, t: 'Czas nagrań', d: 'Ustawiamy nadpisywanie po tylu dniach, ile wynika z celu.' },
        { ic: P.lock, t: 'Hasła i konta', d: 'Zmieniamy hasła fabryczne, konta tylko dla upoważnionych.' },
        { ic: P.doc, t: 'Tabliczki', d: 'Pokazujemy, gdzie powiesić oznaczenia i co na nich wpisać.' }
      ]
    };
    const brandsM = [
      { n: 'Hikvision', k: 'detekcja i noc w kolorze', f: ['AcuSense: alarm tylko od ludzi i aut, mniej fałszywych powiadomień', 'ColorVu: kolorowy obraz w nocy dzięki jasnemu obiektywowi i światłu białemu', 'Aplikacja Hik-Connect: podgląd, nagrania i powiadomienia'], s: 'Opisy technologii według materiałów producenta i dystrybutorów.' },
      { n: 'Dahua', k: 'odstraszanie i mróz', f: ['WizSense: wykrywanie ludzi i pojazdów, ochrona linii i strefy', 'TiOC: odstrasza światłem i komunikatem głosowym, rozmowa przez kamerę', 'Wybrane modele pracują od −40 °C. Aplikacja DMSS'], s: 'Według karty kamery z serii WizSense 3 (2025).' },
      { n: 'BCS', k: 'polska marka', f: ['Marka polskiej firmy BCS Sp. z o.o., która jest też importerem', 'BCS Point łączy kamery IP z analogowymi HD, więc rozbudujesz starą instalację', 'Kilka linii produktów i własne aplikacje do podglądu'], s: 'Według materiałów producenta.' }
    ];
    const brD = [
      { ic: P.snow, t: 'Mróz i wiatr', d: 'Zakres pracy różni się między modelami. Na Podhalu sprawdzamy go w karcie każdej kamery.' },
      { ic: P.moon, t: 'Noc', d: 'Kolor ze światłem białym tam, gdzie liczą się szczegóły, podczerwień tam, gdzie światło przeszkadza.' },
      { ic: P.eye, t: 'Odległość i szczegóły', d: 'Obiektyw i rozdzielczość liczymy z tego, czy ma być widać sylwetkę, twarz czy tablicę.' },
      { ic: P.cpu, t: 'Rejestrator i dysk', d: 'NVR z zasilaniem PoE dla kamer i dyski do zapisu przez całą dobę, np. WD Purple albo Seagate SkyHawk.' }
    ];
    // wersje instalacji
    const SYE = [
      ['cam', 'Kamery IP', P.cam, 'Teren i elewacja', 'Widzą w nocy i odróżniają ludzi oraz auta od liści, śniegu i zwierząt. Każdą ustawiamy pod konkretne miejsce.', 'Dobieramy modele z zakresem pracy co najmniej do −30°C i obudową IP67, a zakres sprawdzamy w karcie każdego modelu. Na Podhalu to ma znaczenie.'],
      ['srg', 'Ochrona przepięciowa', P.bolt, 'Na trasie kabla', 'Ogranicznik przy kamerze i przy wejściu kabla do budynku, oba uziemione. Chroni rejestrator i switch przed skokiem napięcia.', 'W górach burze zdarzają się częściej niż na nizinach. Ograniczniki zmniejszają ryzyko uszkodzenia, ale przy bezpośrednim uderzeniu pioruna żaden sprzęt nie daje pełnej gwarancji.'],
      ['sw', 'Switch PoE', P.net, 'Rozdzielnia sieci', 'Zasila i łączy kamery, gdy jest ich dużo albo są daleko od rejestratora. Jeden kabel daje kamerze prąd i przesyła obraz.', 'Zwykły switch pracuje od ok. −10°C. W nieogrzewanej skrzynce stosujemy switch przemysłowy, który znosi −40°C.'],
      ['nvr', 'Rejestrator NVR', P.cpu, 'Serce systemu', 'Nagrywa wszystkie kamery naraz i trzyma nagrania w budynku, a nie w obcej chmurze. Analizuje obraz i wysyła powiadomienia.', 'Dobieramy go po przepustowości, a nie tylko po liczbie kanałów. Suma strumieni ze wszystkich kamer musi się w niej zmieścić z zapasem.'],
      ['hdd', 'Dyski do monitoringu', P.layers, 'W rejestratorze', 'Dyski zaprojektowane do zapisu przez całą dobę, 7 dni w tygodniu, np. WD Purple albo Seagate SkyHawk. Zwykły dysk komputerowy szybciej się zużywa.', 'Pojemność liczymy z liczby kamer, rozdzielczości i czasu przechowywania nagrań, który wynika z celu monitoringu. Sprawdzamy też, jaki maksymalny dysk obsługuje rejestrator.'],
      ['ups', 'Zasilacz awaryjny UPS', P.battery, 'Pod rejestratorem', 'Gdy zabraknie prądu, rejestrator, switch i router pracują dalej, a nagrywanie się nie urywa.', 'Mały UPS to zwykle około godziny pracy. Kilka godzin wymaga UPS-a z dodatkową baterią. Akumulatory słabną z wiekiem i w zimnie, dlatego sprawdzamy je przy przeglądzie.'],
      ['rack', 'Szafa rack', P.build, 'Porządek w technice', 'Rejestrator, router, UPS i opisane kable w jednym zamykanym miejscu. Serwisant od razu wie, co jest czym.', 'Szafę montujemy w ogrzewanym pomieszczeniu. Gdy stoi w niej kilka urządzeń PoE, dokładamy wentylację.'],
      ['rtr', 'Router i osobna sieć', P.wifi, 'Bezpieczeństwo', 'Kamery mają własną sieć (VLAN), oddzieloną od Wi-Fi gości, kas i komputerów. Goście korzystają z internetu, ale nie zobaczą kamer.', 'Zmieniamy hasła fabryczne, aktualizujemy oprogramowanie i nie wystawiamy rejestratora wprost do internetu. Podatności w kamerach to realny problem, a nie straszak.'],
      ['app', 'Aplikacja i powiadomienia', P.phone, 'W Twoim telefonie', 'Podgląd na żywo, nagrania i powiadomienia o człowieku lub samochodzie w aplikacji producenta, np. Hik-Connect, DMSS albo aplikacji BCS.', 'Każdy domownik albo pracownik dostaje własne konto z uprawnieniami, które ustawimy przy odbiorze. Pokazujemy, jak szybko znaleźć i zapisać nagranie.'],
      ['lnk', 'Światłowód lub most radiowy', P.fiber, 'Między budynkami', 'Drugi budynek, parking albo brama dalej niż 100 metrów. Bez kopania rowu przez całą działkę.', 'Na dłuższe odcinki kładziemy światłowód. Tam, gdzie nie da się kopać, stawiamy most radiowy, który potrzebuje widoczności między punktami.'],
      ['lpr', 'Odczyt tablic rejestracyjnych', P.car, 'Wjazd i brama', 'Kamera przy wjeździe zapisuje numery aut. Znane auta mogą otwierać bramę albo szlaban.', 'Skuteczność zależy od kąta, odległości, światła i prędkości auta. Kamerę ustawiamy na miejscu i testujemy na prawdziwych autach.'],
      ['ptz', 'Kamera obrotowa PTZ', P.eye, 'Duży plac', 'Obraca się i przybliża obraz, żeby z jednego miejsca obejrzeć cały plac albo parking.', 'Kamera PTZ pobiera więcej prądu niż zwykła, dlatego przy jej montażu liczymy budżet mocy switcha.']
    ];
    const SYV = [
      { n: 'Dom', ic: P.home, sub: '2–4 kamery', cams: 4, camN: '4 × 4 MP', nvrN: '4 kanały', disks: 1, upsN: 'ok. 1 h', st: [['Kamery', '4'], ['Rejestrator', '4 kanały'], ['Dyski', '1 × 4 TB'], ['Zapis ciągły', 'ok. 3–6 tyg.'], ['Bez prądu', 'ok. 1 h']],
        sp: { cam: '4 kamery 4 MP z wykrywaniem ludzi i aut', srg: 'Przy kamerach na maszcie albo daleko od domu', nvr: '4 kanały, zasilanie PoE wbudowane w rejestrator', hdd: '1 dysk 4 TB do pracy 24/7', ups: 'Mały UPS, około godziny pracy', rtr: 'Twój router, skonfigurowany dostęp z telefonu', app: 'Konta dla domowników, powiadomienia o ruchu przy furtce' } },
      { n: 'Firma', ic: P.shop, sub: '6–8 kamer', cams: 8, camN: '8 × 4 MP', nvrN: '8 kanałów', disks: 2, upsN: 'ok. 1 h', st: [['Kamery', '8'], ['Rejestrator', '8 kanałów'], ['Dyski', '2 × 4 TB'], ['Zapis ciągły', 'ok. 3–6 tyg.'], ['Bez prądu', 'ok. 1 h']],
        sp: { cam: '8 kamer 4 MP, w tym szeroki kąt na salę i kamera nad kasą', srg: 'Przy kamerach zewnętrznych', nvr: '8 kanałów, wbudowane PoE, miejsce na 2 dyski', hdd: '2 dyski po 4 TB', ups: 'UPS 900–1500 VA, około godziny pracy', rack: 'Szafka wisząca 9–12U z panelem krosowym', rtr: 'Router firmowy z osobną siecią dla kamer', app: 'Konto właściciela i kierownika, podgląd na monitorze w sklepie' } },
      { n: 'Obiekt noclegowy', ic: P.bed, sub: '10–16 kamer', cams: 8, camN: '12 × 4 MP', nvrN: '16 kanałów', disks: 2, upsN: '2–4 h', st: [['Kamery', '12'], ['Rejestrator', '16 kanałów'], ['Dyski', '2 × 8 TB'], ['Zapis ciągły', 'ok. 4–8 tyg.'], ['Bez prądu', 'cel 2–4 h']],
        sp: { cam: '12 kamer 4 MP: wejścia, parking, teren, bez pokoi gości', srg: 'Na wejściach kabli do budynków, z uziemieniem', sw: 'Dodatkowy switch PoE w drugim budynku', nvr: '16 kanałów, wbudowane PoE', hdd: '2 dyski po 8 TB', ups: 'UPS z dodatkową baterią, cel 2–4 godziny', rack: 'Szafa 12U z wentylacją w ogrzewanym pomieszczeniu', rtr: 'Osobno kamery, osobno Wi-Fi gości', app: 'Właściciel i obsługa, powiadomienia z parkingu w nocy', lnk: 'Światłowód albo most radiowy do drugiego budynku', lpr: 'Na wjeździe, opcjonalnie otwiera bramę' } },
      { n: 'Duży obiekt', ic: P.factory, sub: '20–32 kamery', cams: 8, camN: '24 kamery', nvrN: '32 kanały', disks: 4, upsN: 'wg projektu', st: [['Kamery', '24'], ['Rejestrator', '32 kanały'], ['Dyski', '4 × 8 TB'], ['Zapis ciągły', 'ok. 3–7 tyg.'], ['Bez prądu', 'wg projektu']],
        sp: { cam: '24 kamery: 20 × 4 MP i 4 × 8 MP (4K) na wjazdy i place', srg: 'Na każdej trasie zewnętrznej, z uziemieniem', sw: 'Switche zarządzalne, na zewnątrz przemysłowe do −40°C', nvr: '32 kanały, 4 dyski', hdd: '4 dyski po 8 TB', ups: 'UPS w szafie i osobne UPS-y przy switchach', rack: 'Szafa rack 19 cali, 12U lub większa', rtr: 'Firewall, VPN i osobne sieci', app: 'Stanowisko podglądu przy portierni, eksport nagrań', lnk: 'Światłowód między budynkami, mosty radiowe do bramy', lpr: 'Na bramie wjazdowej', ptz: '1–2 kamery obrotowe na plac' } }
    ];
    const V = SYV[st.sv];
    const onK = (k) => k === 'cam' || k === 'nvr' || k === 'hdd' || !!V.sp[k];
    const seK = onK(st.se) ? st.se : 'nvr';
    const SE = SYE.find((e) => e[0] === seK);
    const sye = {}; SYE.forEach((e) => { sye[e[0]] = { cls: 'sye sy-' + e[0] + (onK(e[0]) ? ' on' : '') + (seK === e[0] ? ' sel' : ''), pick: () => self.setState({ se: e[0] }) }; });
    const ci = {}; for (let i = 0; i < 8; i++) ci['c' + i] = 'syc' + (i < V.cams ? ' on' : '');
    const sy = {
      tabs: SYV.map((v, i) => ({ n: v.n, ic: v.ic, on: st.sv === i ? 'true' : 'false', cls: st.sv === i ? 'on' : '', pick: () => self.setState({ sv: i }) })),
      name: V.n, sub: V.sub, camN: V.camN, nvrN: V.nvrN, upsN: V.upsN, flow: 'fl' + st.sv, e: sye, ci: ci,
      d0: 'syd' + (V.disks > 0 ? ' on' : ''), d1: 'syd' + (V.disks > 1 ? ' on' : ''), d2: 'syd' + (V.disks > 2 ? ' on' : ''), d3: 'syd' + (V.disks > 3 ? ' on' : ''),
      stats: V.st.map((x) => ({ k: x[0], v: x[1] })),
      foot: 'Czas zapisu orientacyjnie: kamery 4 MP, kompresja H.265, zapis ciągły 2–4 Mb/s na kamerę, 95% pojemności dysku. Noc, śnieg i drzewa na wietrze zwiększają strumień. Dokładnie liczymy w projekcie.',
      info: { k: 'i' + seK + st.sv, ic: SE[2], n: SE[1], st: SE[3], d: SE[4], tip: SE[5], spec: V.sp[seK] || (seK === 'hdd' ? '' : '') },
      list: SYE.filter((e) => onK(e[0])).map((e, i) => ({ n: e[1], ic: e[2], s: V.sp[e[0]] || '', no: String(i + 1).padStart(2, '0'), cls: 'syli' + (seK === e[0] ? ' on' : ''), pick: () => self.setState({ se: e[0] }) })),
      ...(function () { const ks = SYE.filter((e) => onK(e[0])).map((e) => e[0]); const ix = Math.max(0, ks.indexOf(seK)); return { cnt: String(ks.length), pos: String(ix + 1), prev: () => self.setState({ se: ks[(ix - 1 + ks.length) % ks.length] }), next: () => self.setState({ se: ks[(ix + 1) % ks.length] }) }; })()
    };
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Monitoring i kamery', eye: 'Monitoring CCTV · Rabka-Zdrój, Zakopane, Podhale', h1a: 'Monitoring na Podhalu, który widzi w nocy, w śniegu', h1b: 'i tylko to, co trzeba.', lead: 'Projektujemy, montujemy i serwisujemy kamery dla domów, pensjonatów, firm i gmin. Wykrywanie ludzi i aut, kolor w nocy, podgląd w telefonie i nagrania w Twoim obiekcie, ustawione tak, żeby ułatwić Ci spełnienie RODO.', kv: [['od 2004', 'na Podhalu'], ['−40°C', 'zakres pracy wybranych kamer'], ['0 zł', 'abonamentu za chmurę']], tags: ['Dahua', 'Hikvision', 'BCS', 'Maski prywatności'] },
      anc: [['co-dostajesz', 'Co dostajesz'], ['system', 'Wersje instalacji'], ['typy', 'Rodzaje kamer'], ['ile-widac', 'Ile widać'], ['nagrania', 'Ile dni nagrań'], ['rodo', 'RODO'], ['cena', 'Cena'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.home, n: 'Dom', d: 'Podjazd, furtka, ogród i wejście.', f: ['4 kamery z wykrywaniem ludzi i aut', 'Rejestrator z dyskiem', 'Podgląd i powiadomienia w telefonie', 'Maska na posesję sąsiada', 'Szkolenie z aplikacji'], pr: 'od [CENA] zł z montażem' },
        { ic: P.bed, n: 'Mały pensjonat, restauracja, sklep', d: 'Parking, wejścia, narciarnia, kasa i zaplecze.', f: ['6–8 kamer, w tym kolor w nocy', 'Kamera z odstraszaniem w narciarni lub garażu', 'Strefy i maski RODO, czas nagrań', 'Osobna sieć dla kamer', 'Przegląd przed sezonem'], pr: 'od [CENA] zł z montażem', hot: true },
        { ic: P.factory, n: 'Firma, hala, gmina', d: 'Plac, brama, rampa, teren i budynki.', f: ['Kamery stałe i obrotowe PTZ', 'Odczyt tablic na wjeździe', 'Światłowód między budynkami', 'Zasilanie awaryjne UPS', 'Umowa serwisowa z terminami przyjazdu'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.cam, t: 'Liczba i rodzaj kamer', d: 'Kamera z AI, kolorem w nocy czy odstraszaniem kosztuje więcej niż podstawowa.' },
        { ic: P.ruler, t: 'Trasy kabli', d: 'Długość przewodów, przejścia przez ściany, korytka, kucie lub praca w gotowych wnękach.' },
        { ic: P.build, t: 'Wysokość montażu', d: 'Kamery na ścianie szczytowej albo maszcie mogą wymagać podnośnika.' },
        { ic: P.cpu, t: 'Rejestrator i dysk', d: 'Liczba kanałów i pojemność dobrane do kamer i czasu nagrań.' },
        { ic: P.battery, t: 'Zasilanie awaryjne', d: 'UPS podtrzymuje nagrywanie podczas zaniku prądu.' },
        { ic: P.wifi, t: 'Sieć i zdalny dostęp', d: 'Osobna sieć dla kamer, łącze w obiekcie, ewentualnie most radiowy.' }
      ],
      faq: [
        ['Czy kamery działają bez internetu?', 'Tak. Kamery nagrywają na rejestrator w obiekcie. Internet jest potrzebny tylko do podglądu z telefonu i powiadomień.'],
        ['Ile kosztuje monitoring?', 'Zależy od liczby kamer, tras kabli, wysokości montażu i rodzaju kamer. Po wizji lokalnej dostajesz wycenę na piśmie, zwykle w wariantach. Zdjęcia obiektu możesz wysłać wcześniej.'],
        ['Czy mogę mieć kamerę w pensjonacie?', 'Tak, na parkingu, przy wejściu czy w narciarni. Nie w pokojach, łazienkach ani w saunie. Ustawiamy strefy, maski i czas nagrań, a Ty przygotowujesz informację dla gości. Podpowiemy, co w niej ująć.'],
        ['Jak długo przechowywać nagrania?', 'Tyle, ile wynika z celu monitoringu. EROD zaleca, by nagrania co do zasady usuwać automatycznie po kilku dniach, a dłuższy czas, zwłaszcza ponad 72 godziny, uzasadnić celem. Przy monitoringu pracowników Kodeks pracy pozwala najwyżej na 3 miesiące, chyba że nagranie jest dowodem w postępowaniu.'],
        ['Czy kamera może patrzeć na ulicę albo na sąsiada?', 'Lepiej nie. Kamera, która obejmuje drogę lub posesję sąsiada, podlega RODO. Ustawiamy kadr na Twoją posesję, a resztę maskujemy w obrazie.'],
        ['Mam stare kamery analogowe. Trzeba wszystko wymieniać?', 'Nie zawsze. Często da się zostawić część okablowania albo podłączyć istniejące kamery do nowego rejestratora. Sprawdzamy to na miejscu i proponujemy rozsądny wariant.'],
        ['Co się stanie, gdy zabraknie prądu?', 'Z zasilaczem awaryjnym UPS system nagrywa dalej: od około godziny w małym zestawie do kilku godzin z dodatkową baterią. Bez UPS-a nagrywanie stanie razem z prądem.'],
        ['Kamera ma stać daleko, przy bramie albo na parkingu. Da się?', 'Tak. Do około 90 metrów wystarcza kabel sieciowy. Dalej stawiamy dodatkowy switch, kładziemy światłowód albo łączymy radiowo, bez kopania przez całą działkę.'],
        ['Czy ktoś może się włamać do moich kamer przez internet?', 'Każde urządzenie w sieci da się zaatakować, jeśli jest źle skonfigurowane. Dlatego zmieniamy hasła fabryczne, aktualizujemy oprogramowanie, dajemy kamerom osobną sieć i nie wystawiamy rejestratora wprost do internetu.'],
        ['Jaki dysk montujecie?', 'Dysk przeznaczony do monitoringu, np. WD Purple albo Seagate SkyHawk, zaprojektowany do zapisu przez całą dobę. Pojemność dobieramy do liczby kamer i czasu przechowywania nagrań.'],
        ['Co z serwisem po montażu?', 'Robimy przeglądy przed sezonem: czyszczenie kamer, test dysku i nagrań, aktualizacje. Wiele rzeczy sprawdzimy zdalnie, a do obiektu na Podhalu dojeżdżamy z Rabki albo Zakopanego.']
      ],
      segRel: ['dom', 'pens', 'sklep', 'firma', 'bud', 'gmina'],
      rel: ['alarm', 'kd', 'wifi'],
      relX: [{ href: 'Serwis.dc.html', ic: P.wrench, n: 'Serwis i przeglądy', s: 'Przegląd przed sezonem, naprawy, przejęcie instalacji' }],
      src: [['Kodeks pracy, art. 22² (t.j. Dz.U. 2026 poz. 1245)', 'https://api.sejm.gov.pl/eli/acts/DU/2026/1245/text.pdf'], ['EROD, Wytyczne 3/2019 dotyczące przetwarzania danych przez urządzenia wideo', 'https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_201903_video_devices_pl_0.pdf'], ['UODO, Poradnik: monitoring wizyjny', 'https://uodo.gov.pl/pl/file/1200'], ['TSUE, wyrok C-212/13 (Ryneš)', 'https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:62013CJ0212'], ['Dahua, karta IPC-HDBW3441R-AS-P', 'https://www.dahuasecurity.com/ph/products/network-products/network-cameras/wizsense-3-series/ir/ipc-hdbw3441r-as-p'], ['Hikvision, ColorVu Smart Hybrid Light', 'https://info.hikvision.com/colorvu-smart-hybrid-light-cameras'], ['App Store, Hik-Connect', 'https://apps.apple.com/us/app/hik-connect-for-end-user/id1087803190'], ['Dahua, WizSense 3 TiOC', 'https://www.dahuasecurity.com/mena/Products/All-Products/Network-Cameras/WizSense-3-Series/TiOC'], ['BCS, linia BCS Point', 'https://www.bcscctv.pl/category/en/bcs-point-1159'], ['WD Purple', 'https://www.westerndigital.com/products/internal-drives/wd-purple-sata-hdd'], ['Samorząd.gov.pl, KSC: procedura dotycząca dostawców wysokiego ryzyka (2026)', 'https://samorzad.gov.pl/web/gov/nowelizacja-ustawy-o-krajowym-systemie-cyberbezpieczenstwa-ksc---procedura-dot-listy-dostawcow-wysokiego-ryzyka']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Od czego zwykle zaczynamy.', p: 'Trzy typowe punkty startu. Każdy dopasowujemy do obiektu po wizji lokalnej.', note: 'To przykłady. Liczbę kamer, ich rodzaj i miejsca montażu ustalamy na miejscu, a cenę podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena monitoringu.', p: 'Nie podajemy ceny „za kamerę” w ciemno, bo dwie takie same kamery na różnych budynkach to zupełnie inna praca. Wyślij zdjęcia, a powiemy, czego się spodziewać.' }, relH: 'Monitoring działa najlepiej w zestawie.' }
    }), { sy: sy, nv: nv, feats: feats, typ: typ, dori: dori, rec: rec, rodo: rodo, brandsM: brandsM, brD: brD, ctaEye: 'Monitoring na Podhalu', ctaH: 'Pokaż nam obiekt. Zaproponujemy, gdzie i jakie kamery.', ctaP: 'Wizja lokalna, plan rozmieszczenia kamer i wycena na piśmie. Potem montaż, konfiguracja aplikacji i serwis.' });
  }
