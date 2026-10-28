  initState() { return { obj: 'pens', mode: 'night', layers: ['kam', 'wifi'], touched: false, kSvc: [], kObj: '', kTown: '', kPh: '', kCons: false, kDone: false, kErr: '', nw: false, gAll: false, oAll: false, arT: false, arM: 'in', arHs: 0, arOff: [] }; }
  navKey() { return 'home'; }
  railIds() { return ['start', 'dla-kogo', 'uslugi', 'architekci', 'realizacje', 'gory', 'proces', 'serwis', 'faq', 'zaplanuj']; }
  rvIds() { return ['dla', 'uslugi', 'arch', 'realizacje', 'gory', 'proces', 'serwis', 'faq', 'zaplanuj']; }
  mountPage() {
    var self = this;
    var SEQ = ['kam', 'wifi', 'alarm', 'smart', 'snd', 'scr', 'kd', 'ev'];
    var OBJS = ['pens', 'dom', 'rest', 'hotel', 'sklep', 'firma'];
    var MODES = ['night', 'winter', 'day'];
    var hold = 0, oi = 0;
    this.every(2300, function () {
      if (self.state.touched) return;
      var L = self.state.layers;
      if (L.length < SEQ.length) { self.setState({ layers: SEQ.slice(0, L.length + 1) }); return; }
      if (hold < 2) { hold++; return; }
      hold = 0; oi = (oi + 1) % OBJS.length;
      self.setState({ obj: OBJS[oi], mode: MODES[oi % 3], layers: SEQ.slice(0, 2) });
    });
    var fit = function () { try { var n = (window.innerWidth || 1440) < 1100; if (n !== self.state.nw) self.setState({ nw: n }); } catch (e) {} };
    fit(); try { window.addEventListener('resize', fit); } catch (e) {}
  }

  page(P, c) {
    const st = this.state, self = this;
    const ceny = this.props.ceny ?? false;
    const U = 11, CC = 0.866 * U, SS = 0.5 * U, OX = 880, OY = 400;
    const pr = (x, y, z) => [(x - y) * CC + OX, (x + y) * SS - z * U + OY];
    const pp = (a) => a.map((p) => { const q = pr(p[0], p[1], p[2]); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
    const cl = (v, a, b) => Math.max(a, Math.min(b, v));
    const OBJ = {
      dom: { n: 'Dom', ic: P.home,
        boxes: [{ x: 9, y: 6, w: 12, d: 9, h: 5.9, roof: 'gable', R: 5.6, o: 1.3, m: 'wood', win: 'res', gw: 1 }, { x: 22, y: 8, w: 6, d: 6.5, h: 3, m: 'plas', win: 'gar' }, { x: 17, y: 9.9, z: 10.4, w: .9, d: .9, h: 2.2, m: 'chim' }],
        pav: [[22, 14.5, 6, 13.5], [15.6, 15, 2.4, 13]], lines: [],
        cars: [{ x: 23.8, y: 18.5, o: 'y', c: 'k1' }], posts: [{ x: 27.5, y: 15.1 }],
        trees: [[3, 3, 1.1], [32, 3, 1], [2.5, 13, .9], [33.5, 25, 1], [5, 25.5, 1.1]],
        cam: [{ x: 21.02, y: 14.6, z: 4.9, a: 0.85, s: 0.4, L: 11 }, { x: 9.02, y: 15.02, z: 4.9, a: 1.95, s: 0.4, L: 10 }, { x: 28.02, y: 14.5, z: 2.7, a: 1.5, s: 0.36, L: 12, ptz: 1 }],
        sir: [{ x: 21.02, y: 7.5, z: 5.2 }], ap: [{ x: 15, y: 10.5, z: 3.2, r: 9.5 }],
        zones: [[7.5, 4.5, 15, 12], [21, 7, 8, 8.5]], snd: [{ x: 11.5, y: 20.5, z: 0.9 }],
        scr: [{ x: 17.6, y: 15.03, z: 1.2, w: 1.3, h: 0.9, f: 'fl' }], kd: [{ x: 16.8, y: 27.6, z: 1.2 }],
        smart: [{ x: 21.03, y: 11.5, z: 3.6 }], ev: [{ x: 27.8, y: 15.4, z: 2.1 }],
        temps: [[12, 15.02, 2.4, '21°'], [21.02, 8.6, 4.2, '20°']], wk: [[16.8, 27], [16.8, 16.4]], pipCam: 'KAM 3 · Podjazd',
        t: { kam: '3 kamery · podgląd w telefonie, nagrania zostają w domu', kamN: 'Tryb nocny · furtka, podjazd i ogród pod okiem', alarm: 'Rozbrojony · dom i garaż', alarmN: 'Uzbrojony na noc · parter i garaż', kd: 'Wideodomofon przy furtce · otwierasz z telefonu', wifi: 'Wi-Fi w całym domu i w ogrodzie, jedna sieć', smart: 'Ogrzewanie, światło i rolety w jednej aplikacji', smartW: 'Na zewnątrz −12°, w środku 21° · ogrzewanie z telefonu', ev: 'Elzab CC Home · ładujesz w nocy w garażu', snd: 'Muzyka w salonie i na tarasie', scr: 'Panel przy wejściu: kamery, alarm, ogrzewanie' },
        e: { n: ['Ruch przy furtce', '02:14 · zdjęcie na telefonie'], w: ['Na zewnątrz −12°', 'w domu 21° · ogrzewanie OK'], d: ['Kurier przy furtce', 'otworzyć z telefonu?'] } },
      pens: { n: 'Pensjonat', ic: P.bed,
        boxes: [{ x: 5, y: 5, w: 18, d: 10, h: 8.8, roof: 'gable', R: 6.2, o: 1.5, m: 'wood', win: 'res', balk: 1, gw: 1 }, { x: 24.5, y: 6, w: 6.5, d: 7, h: 3.2, roof: 'gable', R: 2.2, o: 0.6, m: 'wood', win: 'gar' }, { x: 18, y: 9.4, z: 13.9, w: 1, d: 1, h: 2.4, m: 'chim' }],
        pav: [[20, 18, 15.5, 9.5], [14.4, 15, 2.4, 13]], lines: [[23, 18, .14, 5.5], [26, 18, .14, 5.5], [29, 18, .14, 5.5], [32, 18, .14, 5.5]],
        cars: [{ x: 20.6, y: 19, o: 'y', c: 'k2' }, { x: 23.6, y: 19, o: 'y', c: 'k3' }, { x: 26.6, y: 19, o: 'y', c: 'k4' }, { x: 32.6, y: 19, o: 'y', c: 'k1' }], posts: [{ x: 27.4, y: 17.3 }],
        trees: [[2, 2, 1.1], [33, 2, 1], [1.6, 14, .95], [3, 25.5, 1.1], [34, 15.5, .9]],
        cam: [{ x: 23.02, y: 14.6, z: 7.8, a: 0.75, s: 0.42, L: 13 }, { x: 31.02, y: 12.6, z: 2.8, a: 1.45, s: 0.38, L: 12, ptz: 1 }, { x: 5.02, y: 15.02, z: 7.8, a: 1.95, s: 0.38, L: 10 }, { x: 27.5, y: 13.03, z: 2.7, a: 1.65, s: 0.3, L: 7 }],
        sir: [{ x: 31.03, y: 8, z: 3 }], ap: [{ x: 10, y: 10, z: 6.2, r: 9 }, { x: 18.5, y: 10, z: 3.2, r: 9 }],
        zones: [[3.5, 3.5, 21, 13], [23.5, 5, 8.5, 9]], snd: [{ x: 8, y: 19.5, z: 0.9 }],
        scr: [{ x: 10.3, y: 15.03, z: 1.2, w: 1.4, h: 0.95, f: 'fl' }], kd: [{ x: 16.6, y: 15.03, z: 1.3 }],
        smart: [{ x: 23.03, y: 9, z: 5.6 }], ev: [{ x: 27.7, y: 17.6, z: 2.1 }],
        temps: [[8, 15.02, 4.6, '21°'], [19, 15.02, 7.4, '16°'], [23.02, 6.6, 3.2, '19°']], wk: [[15.6, 27.2], [15.6, 16.4]], pipCam: 'KAM 2 · Parking',
        t: { kam: '4 kamery · parking, wejście, narciarnia. Bez pokoi i sauny', kamN: 'Tryb nocny · parking i narciarnia pod okiem', alarm: 'Rozbrojony · narciarnia i zaplecze', alarmN: 'Narciarnia uzbrojona · goście śpią spokojnie', kd: 'Kod do pokoju wysłany gościowi · przyjazd bez recepcji', wifi: 'Osobna sieć dla gości, osobna dla kamer i kasy', smart: 'Ogrzewanie tylko w zajętych pokojach', smartW: 'Mróz −14° · pokoje nagrzane przed przyjazdem', ev: 'Elzab CC Wall dla gości · karta RFID, licznik MID', snd: 'Muzyka w jadalni i komunikaty dla gości', scr: 'Ekran w recepcji: pogoda, stoki, atrakcje' },
        e: { n: ['Osoba przy narciarni', '02:14 · powiadomienie na telefon'], w: ['Mróz −14°', 'pokój 4 nagrzany na przyjazd'], d: ['Gość z rezerwacji', 'kod do pokoju wysłany SMS-em'] } },
      hotel: { n: 'Hotel', ic: P.hotel,
        boxes: [{ x: 5, y: 3, w: 22, d: 10, h: 14, m: 'plas', win: 'res', door: false }, { x: 5, y: 13.5, w: 12, d: 7, h: 4.2, m: 'gla', win: 'shop' }, { x: 9, y: 5, z: 14, w: 4, d: 3, h: 1.4, m: 'met' }],
        pav: [[20, 17, 15.5, 10.5], [17, 14, 3, 14]], lines: [[23, 17, .14, 5.5], [26, 17, .14, 5.5], [29, 17, .14, 5.5], [32, 17, .14, 5.5]],
        cars: [{ x: 20.6, y: 18, o: 'y', c: 'k3' }, { x: 23.6, y: 18, o: 'y', c: 'k4' }, { x: 26.6, y: 18, o: 'y', c: 'k2' }, { x: 29.6, y: 18, o: 'y', c: 'k1' }], posts: [{ x: 24.4, y: 16.4 }, { x: 27.4, y: 16.4 }],
        trees: [[1.5, 2, 1], [33.5, 2.5, 1.05], [1.5, 24, 1.1], [33.5, 13.5, .9]],
        cam: [{ x: 27.02, y: 12.6, z: 12.5, a: 0.7, s: 0.45, L: 15 }, { x: 17.02, y: 20.2, z: 3.8, a: 1.3, s: 0.4, L: 9 }, { x: 27.02, y: 3.4, z: 12.5, a: 0.2, s: 0.35, L: 9, ptz: 1 }, { x: 5.02, y: 20.52, z: 3.8, a: 1.9, s: 0.35, L: 8 }],
        sir: [{ x: 27.03, y: 8, z: 4 }], ap: [{ x: 12, y: 8, z: 9.6, r: 8 }, { x: 21, y: 8, z: 4, r: 8 }, { x: 11, y: 17, z: 2.2, r: 7 }],
        zones: [[3.5, 1.5, 25, 20.5]], snd: [{ x: 11, y: 20.55, z: 3.3 }],
        scr: [{ x: 7.2, y: 20.53, z: 1.2, w: 2.4, h: 1.4, f: 'fl' }, { x: 27.03, y: 5.6, z: 9.4, w: 2.2, h: 1.2, f: 'fr' }], kd: [{ x: 17.03, y: 16.6, z: 1.3 }],
        smart: [{ x: 27.03, y: 9.6, z: 7.4 }], ev: [{ x: 24.7, y: 16.7, z: 2.1 }, { x: 27.7, y: 16.7, z: 2.1 }],
        temps: [[10, 13.02, 10.6, '21°'], [22, 13.02, 7.8, '17°']], wk: [[18.5, 27.2], [18.5, 16]], pipCam: 'KAM 1 · Podjazd',
        t: { kam: '4 kamery · podjazd, parking i wejścia', kamN: 'Tryb nocny · parking i podjazd nagrywane', alarm: 'Strefy: zaplecze, magazyn, technika', alarmN: 'Zaplecze uzbrojone · lobby czynne całą noc', kd: 'Karty do pokoi · SPA i siłownia tylko dla gości', wifi: 'Sieć dla gości, kamery i recepcja w osobnych sieciach', smart: 'Pokój wie, że gość wyszedł · ogrzewanie w trybie eko', smartW: 'Mróz −14° · pokoje grzeją się według rezerwacji', ev: '2 ładowarki Elzab CC Wall dla gości · RFID i OCPP', snd: 'Strefy: lobby, restauracja, SPA · osobna głośność', scr: 'Ekrany w lobby i w sali konferencyjnej' },
        e: { n: ['Ruch na parkingu', '03:40 · nagranie zapisane'], w: ['Mróz −14°', 'pokoje w trybie eko do przyjazdu'], d: ['Check-in 15:00', 'karta aktywna dla pokoju 214'] } },
      rest: { n: 'Restauracja', ic: P.food,
        boxes: [{ x: 7, y: 5, w: 17, d: 11, h: 4.6, roof: 'gable', R: 6, o: 1.6, m: 'wood', win: 'res', gw: 1 }, { x: 12, y: 9.8, z: 9.5, w: 1, d: 1, h: 2.4, m: 'chim' }],
        pav: [[8, 17.5, 13, 5, 'deck'], [26, 8, 9.5, 18], [15.8, 16, 2.4, 12]], lines: [[26, 12, 5.2, .14], [26, 15, 5.2, .14], [26, 18, 5.2, .14], [26, 21, 5.2, .14]],
        cars: [{ x: 26.6, y: 9, o: 'x', c: 'k4' }, { x: 26.6, y: 15.5, o: 'x', c: 'k1' }, { x: 26.6, y: 21.8, o: 'x', c: 'k3' }],
        posts: [{ x: 9.5, y: 18.8, w: 1, d: 1, h: .8 }, { x: 13, y: 18.8, w: 1, d: 1, h: .8 }, { x: 16.5, y: 18.8, w: 1, d: 1, h: .8 }, { x: 9.5, y: 21, w: 1, d: 1, h: .8 }, { x: 13, y: 21, w: 1, d: 1, h: .8 }, { x: 18.6, y: 16.8, w: 1.4, d: .3, h: 2.1 }, { x: 32.2, y: 24.3 }],
        trees: [[2, 2, 1.1], [32, 2, 1], [2, 25, 1.1], [23.5, 26, .9]],
        cam: [{ x: 24.02, y: 15.6, z: 3.9, a: 0.6, s: 0.42, L: 12 }, { x: 7.02, y: 16.02, z: 3.9, a: 1.85, s: 0.4, L: 9 }, { x: 24.02, y: 5.4, z: 3.9, a: 0.1, s: 0.35, L: 10, ptz: 1 }],
        sir: [{ x: 24.03, y: 13, z: 3.9 }], ap: [{ x: 15, y: 10, z: 2.4, r: 10 }],
        zones: [[5.5, 3.5, 20, 14]], snd: [{ x: 11, y: 21, z: 1.6 }, { x: 18, y: 21, z: 1.6 }],
        scr: [{ x: 18.65, y: 17.13, z: 0.65, w: 1.3, h: 1.35, f: 'fl' }], kd: [{ x: 24.03, y: 8.5, z: 1.3 }],
        smart: [{ x: 24.03, y: 11, z: 2.8 }], ev: [{ x: 32.5, y: 24.6, z: 2.1 }],
        temps: [[10, 16.02, 2.4, '22°']], wk: [[17, 27.3], [17, 17.2]], pipCam: 'KAM 1 · Parking',
        t: { kam: '3 kamery · sala, kasa, parking', kamN: 'Lokal zamknięty · zaplecze i parking nagrywane', alarm: 'Rozbrojony · lokal otwarty', alarmN: 'Lokal uzbrojony po zamknięciu kasy', kd: 'Drzwi dostaw z wideodomofonem · zaplecze na kartę', wifi: 'Wi-Fi dla gości i osobna sieć dla kasy i terminala', smart: 'Sceny światła: obiad, kolacja, zamknięte', smartW: 'Mróz −12° · sala nagrzana na otwarcie o 11:00', ev: 'Ładowarka dla gości przy parkingu', snd: 'Muzyka na sali i na tarasie · osobna głośność', scr: 'Menu board przy wejściu · menu zmieniasz z telefonu' },
        e: { n: ['Ruch przy zapleczu', '01:20 · alarm powiadomił'], w: ['Mróz −12°', 'sala nagrzana na 11:00'], d: ['Dostawa przy drzwiach', 'otworzyć z telefonu?'] } },
      sklep: { n: 'Sklep', ic: P.shop,
        boxes: [{ x: 5, y: 4, w: 21, d: 11, h: 5.2, m: 'plas', win: 'shop' }],
        pav: [[4, 17, 31.5, 10.5]], lines: [[7, 17, .14, 5.5], [10, 17, .14, 5.5], [13, 17, .14, 5.5], [16, 17, .14, 5.5], [19, 17, .14, 5.5], [22, 17, .14, 5.5], [25, 17, .14, 5.5], [28, 17, .14, 5.5]],
        cars: [{ x: 7.5, y: 18, o: 'y', c: 'k1' }, { x: 13.5, y: 18, o: 'y', c: 'k3' }, { x: 16.5, y: 18, o: 'y', c: 'k2' }, { x: 25.5, y: 18, o: 'y', c: 'k4' }], posts: [{ x: 29.8, y: 16.4 }, { x: 27, y: 15.6, w: .9, d: .5, h: 2.4 }],
        trees: [[2, 1.5, 1], [32, 1.5, 1.05], [33.5, 12, .9]],
        cam: [{ x: 26.02, y: 14.6, z: 4.6, a: 0.8, s: 0.45, L: 14 }, { x: 5.02, y: 15.02, z: 4.6, a: 1.8, s: 0.4, L: 12 }, { x: 26.02, y: 4.4, z: 4.6, a: 0.15, s: 0.35, L: 9, ptz: 1 }],
        sir: [{ x: 26.03, y: 12, z: 4.6 }], ap: [{ x: 15, y: 9, z: 2.6, r: 10 }],
        zones: [[3.5, 2.5, 24, 14]], snd: [{ x: 11, y: 15.03, z: 4.3 }],
        scr: [{ x: 27.05, y: 16.13, z: 0.6, w: .8, h: 1.6, f: 'fl' }, { x: 8.2, y: 15.04, z: 1.2, w: 2.2, h: 1.3, f: 'fl' }], kd: [{ x: 26.03, y: 7, z: 1.3 }],
        smart: [{ x: 26.03, y: 9.5, z: 3.2 }], ev: [{ x: 30.1, y: 16.7, z: 2.1 }],
        temps: [[14, 15.02, 3.9, '20°']], wk: [[11.5, 26.8], [11.5, 16]], pipCam: 'KAM 1 · Parking',
        t: { kam: '3 kamery · sala, kasa, parking', kamN: 'Sklep zamknięty · zaplecze i parking nagrywane', alarm: 'Rozbrojony · sklep otwarty', alarmN: 'Uzbrojony · czujki w sali i w magazynie', kd: 'Zaplecze i magazyn na kartę pracownika', wifi: 'Sieć dla kas i terminali, osobna dla klientów', smart: 'Światło i ogrzewanie według godzin otwarcia', smartW: 'Mróz −12° · ogrzewanie włącza się przed otwarciem', ev: 'Ładowarka dla klientów na parkingu', snd: 'Muzyka i komunikaty w sklepie', scr: 'Ekrany w witrynie i totem przy wejściu' },
        e: { n: ['Ruch przy zapleczu', '23:50 · nagranie zapisane'], w: ['Mróz −12°', 'ogrzewanie przed otwarciem'], d: ['Pracownik na zapleczu', 'wejście 07:52 · karta'] } },
      firma: { n: 'Firma', ic: P.factory,
        boxes: [{ x: 3, y: 2.5, w: 22, d: 13, h: 8, m: 'met', win: 'hall' }, { x: 26, y: 5, w: 7.5, d: 8, h: 6.6, m: 'gla', win: 'res' }],
        pav: [[3, 17, 31.5, 10.5]], lines: [],
        cars: [{ x: 26.5, y: 18, o: 'y', c: 'k2' }, { x: 29.5, y: 18, o: 'y', c: 'k3' }],
        trucks: [{ x: 6, y: 19.5 }], posts: [{ x: 32.6, y: 16.5 }],
        trees: [[1, 25.5, 1.1], [35, 1.5, 1], [34.5, 14.5, .9]],
        cam: [{ x: 25.02, y: 15.1, z: 7.2, a: 0.75, s: 0.45, L: 14 }, { x: 3.02, y: 15.52, z: 7.2, a: 1.9, s: 0.4, L: 11 }, { x: 33.52, y: 12.6, z: 5.6, a: 1.3, s: 0.4, L: 12, ptz: 1 }, { x: 25.02, y: 2.9, z: 7.2, a: 0.05, s: 0.35, L: 9 }],
        sir: [{ x: 25.03, y: 9, z: 7.4 }], ap: [{ x: 12, y: 8, z: 4, r: 11 }, { x: 29.5, y: 9, z: 3.6, r: 6 }],
        zones: [[1.5, 1, 33.5, 16]], snd: [{ x: 9, y: 15.53, z: 6 }],
        scr: [{ x: 16.6, y: 15.53, z: 4.8, w: 2.6, h: 1.5, f: 'fl' }], kd: [{ x: 34.2, y: 27.5, z: 1.3 }, { x: 28.6, y: 13.03, z: 1.3 }],
        smart: [{ x: 33.53, y: 9, z: 4.6 }], ev: [{ x: 32.9, y: 16.8, z: 2.1 }],
        temps: [[12, 15.52, 3.2, '16°'], [30, 13.02, 4.2, '21°']], wk: [[21, 26.6], [30, 24.8]], pipCam: 'KAM 3 · Brama',
        t: { kam: '4 kamery · plac, brama, rampa, biuro', kamN: 'Tryb nocny · plac i brama pod okiem', alarm: 'Rozbrojony · zmiana dzienna', alarmN: 'Hala i biuro uzbrojone · plac czuwa', kd: 'Brama i biuro na karty · historia wejść', wifi: 'Wi-Fi w hali i biurze · światłowód między budynkami', smart: 'Oświetlenie hali strefami · harmonogram ogrzewania', smartW: 'Mróz −12° · hala nagrzana przed pierwszą zmianą', ev: 'Ładowarka dla aut firmowych · rozliczanie kart', snd: 'Komunikaty i sygnały przerw w hali', scr: 'Ekran w hali: plan dnia i informacje BHP' },
        e: { n: ['Ruch na placu', '03:05 · powiadomienie do szefa'], w: ['Mróz −12°', 'hala nagrzana na 6:00'], d: ['Brama otwarta 06:58', 'karta kierowcy · dostawa'] } }
    };
    const LAY = [['kam', 'Kamery', P.cam], ['alarm', 'Alarm', P.bell], ['kd', 'Domofon i dostęp', P.lock], ['wifi', 'Wi-Fi i sieć', P.wifi], ['smart', 'Smart home Ampio', P.home], ['ev', 'Ładowarka EV', P.bolt], ['snd', 'Nagłośnienie', P.spk], ['scr', 'Ekrany', P.scr]];
    const cfg = OBJ[st.obj] || OBJ.pens;
    const L = st.layers, has = (k) => L.includes(k);
    const night = st.mode === 'night', winter = st.mode === 'winter', lit = st.mode !== 'day';
    const smartOn = has('smart');
    const quad = (r, z) => [[r[0], r[1], z], [r[0] + r[2], r[1], z], [r[0] + r[2], r[1] + r[3], z], [r[0], r[1] + r[3], z]];
    const gnd = [
      { p: pp([[0, 0, 0], [36, 0, 0], [36, 28, 0], [0, 28, 0]]), c: 'gnd' },
      { p: pp([[0, 28, 0], [36, 28, 0], [36, 28, -1.4], [0, 28, -1.4]]), c: 'gEL' },
      { p: pp([[36, 0, 0], [36, 28, 0], [36, 28, -1.4], [36, 0, -1.4]]), c: 'gER' }
    ];
    cfg.pav.forEach((r) => gnd.push({ p: pp(quad(r, 0.01)), c: r[4] || 'pav' }));
    (cfg.lines || []).forEach((r) => gnd.push({ p: pp(quad(r, 0.02)), c: 'pline' }));
    const zones = has('alarm') ? cfg.zones.map((r) => ({ p: pp(quad(r, 0.03)), c: 'zone' + (night ? ' arm' : '') })) : [];
    let wi = 0;
    const mk = (b, bi) => {
      const x = b.x, y = b.y, z0 = b.z || 0, w = b.w, d = b.d, h = b.h, h1 = z0 + h, m = b.m || 'plas';
      const out = [];
      const W = (pts, cc) => out.push({ p: pp(pts), c: cc });
      W([[x + w, y, z0], [x + w, y + d, z0], [x + w, y + d, h1], [x + w, y, h1]], 'fR ' + m);
      W([[x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, h1], [x, y + d, h1]], 'fL ' + m);
      const wc = () => { wi++; const on = lit && (((wi * 7 + bi * 3 + (smartOn ? Math.floor(st.tick / 2) : 0)) % 5) < (smartOn ? 3 : 2)); return 'win' + (on ? ' lit' : ''); };
      const yf = y + d + 0.02, xf = x + w + 0.02;
      if (b.win === 'res') {
        const fl = Math.max(1, Math.floor((h - 0.3) / 2.8));
        const n = Math.max(1, Math.floor(w / 2.7)), g = w / n, nm = Math.max(1, Math.floor(d / 2.8)), g2 = d / nm;
        for (let f = 0; f < fl; f++) {
          const z = z0 + f * 2.8 + 0.9;
          for (let i = 0; i < n; i++) {
            const xi = x + g * (i + 0.5) - 0.55;
            if (f === 0 && i === Math.floor(n / 2) && b.door !== false) W([[xi - .15, yf, z0], [xi + 1.25, yf, z0], [xi + 1.25, yf, z0 + 2.2], [xi - .15, yf, z0 + 2.2]], 'door');
            else W([[xi, yf, z], [xi + 1.1, yf, z], [xi + 1.1, yf, z + 1.35], [xi, yf, z + 1.35]], wc());
          }
          for (let j = 0; j < nm; j++) { const yi = y + g2 * (j + 0.5) - 0.55; W([[xf, yi, z], [xf, yi + 1.1, z], [xf, yi + 1.1, z + 1.35], [xf, yi, z + 1.35]], wc()); }
          if (b.balk && f > 0) { const zb = z0 + f * 2.8; W([[x + .4, y + d, zb], [x + w - .4, y + d, zb], [x + w - .4, y + d + .8, zb], [x + .4, y + d + .8, zb]], 'balkT'); W([[x + .4, y + d + .8, zb], [x + w - .4, y + d + .8, zb], [x + w - .4, y + d + .8, zb + .85], [x + .4, y + d + .8, zb + .85]], 'balk'); }
        }
      } else if (b.win === 'shop') {
        const pw = (w - 2) / 3, top = Math.min(h - .8, 3.4);
        for (let i = 0; i < 3; i++) { const xi = x + 1 + i * pw + 0.2; W([[xi, yf, .35], [xi + pw - .4, yf, .35], [xi + pw - .4, yf, top], [xi, yf, top]], 'win big' + (lit ? ' lit' : '')); }
        W([[xf, y + 2, 1], [xf, y + 3.3, 1], [xf, y + 3.3, 2.4], [xf, y + 2, 2.4]], wc());
        W([[xf, y + 5, 1], [xf, y + 6.3, 1], [xf, y + 6.3, 2.4], [xf, y + 5, 2.4]], wc());
      } else if (b.win === 'hall') {
        const n = Math.floor(w / 3.2), sw = (w - 2) / n;
        for (let i = 0; i < n; i++) { const xi = x + 1 + i * sw; W([[xi, yf, h - 2.3], [xi + sw - .5, yf, h - 2.3], [xi + sw - .5, yf, h - 1.3], [xi, yf, h - 1.3]], wc()); }
        W([[x + 2, yf, 0], [x + 6.5, yf, 0], [x + 6.5, yf, 4.4], [x + 2, yf, 4.4]], 'gate');
        W([[x + 8, yf, 0], [x + 12.5, yf, 0], [x + 12.5, yf, 4.4], [x + 8, yf, 4.4]], 'gate');
        const nm = Math.floor(d / 3.2), sd = (d - 2) / nm;
        for (let j = 0; j < nm; j++) { const yi = y + 1 + j * sd; W([[xf, yi, h - 2.3], [xf, yi + sd - .5, h - 2.3], [xf, yi + sd - .5, h - 1.3], [xf, yi, h - 1.3]], wc()); }
      } else if (b.win === 'gar') {
        const gh = Math.min(2.4, h - .5);
        W([[x + 1, yf, 0], [x + w - 1, yf, 0], [x + w - 1, yf, gh], [x + 1, yf, gh]], 'gdoor');
      }
      if (b.roof === 'gable') {
        const o = b.o || 1, R = b.R || 4, ym = y + d / 2;
        W([[x - o, y - o, h1], [x + w + o, y - o, h1], [x + w + o, ym, h1 + R], [x - o, ym, h1 + R]], 'rB');
        W([[x + w, y, h1], [x + w, y + d, h1], [x + w, ym, h1 + R]], 'fR ' + m);
        if (b.gw) W([[xf, ym - .7, h1 + .6], [xf, ym + .7, h1 + .6], [xf, ym + .7, h1 + 2], [xf, ym - .7, h1 + 2]], wc());
        W([[x + w + o, y - o, h1], [x + w + o, ym, h1 + R], [x + w + o, ym, h1 + R - .45], [x + w + o, y - o, h1 - .45]], 'rE');
        W([[x - o, y + d + o, h1], [x + w + o, y + d + o, h1], [x + w + o, ym, h1 + R], [x - o, ym, h1 + R]], 'rF');
        W([[x - o, y + d + o, h1], [x + w + o, y + d + o, h1], [x + w + o, y + d + o, h1 - .45], [x - o, y + d + o, h1 - .45]], 'rE');
        W([[x + w + o, y + d + o, h1], [x + w + o, ym, h1 + R], [x + w + o, ym, h1 + R - .45], [x + w + o, y + d + o, h1 - .45]], 'rE2');
      } else {
        W([[x, y, h1], [x + w, y, h1], [x + w, y + d, h1], [x, y + d, h1]], 'top ' + m);
        if (w > 3 && d > 3) W([[x + .45, y + .45, h1], [x + w - .45, y + .45, h1], [x + w - .45, y + d - .45, h1], [x + .45, y + d - .45, h1]], 'topIn ' + m);
      }
      return { dep: x + w / 2 + y + d / 2 + z0 * 0.05, out: out };
    };
    const items = [];
    cfg.boxes.forEach((b) => items.push(b));
    (cfg.cars || []).forEach((cc) => {
      const ky = cc.o === 'y';
      items.push(ky ? { x: cc.x, y: cc.y, w: 2, d: 4.2, h: 1.05, m: 'car ' + cc.c } : { x: cc.x, y: cc.y, w: 4.2, d: 2, h: 1.05, m: 'car ' + cc.c });
      items.push(ky ? { x: cc.x + .15, y: cc.y + 1.1, z: 1.05, w: 1.7, d: 2.1, h: .75, m: 'cab' } : { x: cc.x + 1, y: cc.y + .15, z: 1.05, w: 2.1, d: 1.7, h: .75, m: 'cab' });
    });
    (cfg.trucks || []).forEach((t) => { items.push({ x: t.x, y: t.y, w: 8.5, d: 2.6, h: 3.1, m: 'car tr' }); items.push({ x: t.x + 8.7, y: t.y, w: 2.6, d: 2.6, h: 2.5, m: 'car k2' }); });
    (cfg.posts || []).forEach((p) => items.push({ x: p.x, y: p.y, w: p.w || .6, d: p.d || .5, h: p.h || 1.7, m: 'post' }));
    const built = items.map((b, i) => mk(b, i)).sort((a, b) => a.dep - b.dep);
    const body = [];
    built.forEach((b) => b.out.forEach((f) => body.push(f)));
    const trees = cfg.trees.map((t) => { const q = pr(t[0], t[1], 0); return { x: q[0].toFixed(1), y: q[1].toFixed(1), s: String(t[2] || 1) }; });
    const cones = has('kam') ? cfg.cam.map((k) => {
      let a = k.a; if (k.ptz) a += 0.38 * Math.sin(st.tick * 0.8);
      const far = [];
      for (let i = -2; i <= 2; i++) { const aa = a + k.s * i / 2; far.push([cl(k.x + k.L * Math.cos(aa), 0, 36), cl(k.y + k.L * Math.sin(aa), 0, 28), 0]); }
      return { p: pp([[k.x, k.y, k.z]].concat(far)), c: 'cone' + (night ? ' ir' : '') };
    }) : [];
    const rings = [];
    if (has('wifi')) cfg.ap.forEach((a) => { const q = pr(a.x, a.y, a.z), X = q[0].toFixed(1), Y = q[1].toFixed(1), rx = (a.r * 1.2247 * U).toFixed(1), ry = (a.r * 0.707 * U).toFixed(1); rings.push({ x: X, y: Y, rx: rx, ry: ry, c: 'cov' }); ['r1', 'r2', 'r3'].forEach((rc) => rings.push({ x: X, y: Y, rx: rx, ry: ry, c: 'ring ' + rc })); });
    const arcs = [];
    if (has('snd')) cfg.snd.forEach((s) => { const q = pr(s.x, s.y, s.z); [9, 15, 21].forEach((r, i) => arcs.push({ d: 'M' + (q[0] + 7).toFixed(1) + ' ' + (q[1] - r * .7).toFixed(1) + ' a ' + r + ' ' + r + ' 0 0 1 0 ' + (r * 1.4).toFixed(1), c: 'arc a' + (i + 1) })); });
    const scrP = [];
    if (has('scr')) cfg.scr.forEach((s) => {
      const fr = s.f === 'fr';
      const Q = (u0, u1, v0, v1) => fr ? [[s.x, s.y + u0, s.z + v0], [s.x, s.y + u1, s.z + v0], [s.x, s.y + u1, s.z + v1], [s.x, s.y + u0, s.z + v1]] : [[s.x + u0, s.y, s.z + v0], [s.x + u1, s.y, s.z + v0], [s.x + u1, s.y, s.z + v1], [s.x + u0, s.y, s.z + v1]];
      scrP.push({ p: pp(Q(0, s.w, 0, s.h)), c: 'scrn' });
      scrP.push({ p: pp(Q(.12, s.w - .12, .12, s.h * .55)), c: 'scrc s' + (st.tick % 3) });
      scrP.push({ p: pp(Q(.12, s.w * .6, s.h * .66, s.h - .12)), c: 'scrc s' + ((st.tick + 1) % 3) });
    });
    const dv = [];
    const D = (k, arr, ic, extra) => { if (!has(k)) return; (arr || []).forEach((a) => { const q = pr(a.x, a.y, a.z); dv.push({ x: q[0].toFixed(1), y: q[1].toFixed(1), ic: ic, cls: 'dv' + (extra || '') }); }); };
    D('alarm', cfg.sir, P.bell, night ? ' arm' : '');
    D('kd', cfg.kd, P.lock); D('wifi', cfg.ap, P.wifi); D('smart', cfg.smart, P.home); D('ev', cfg.ev, P.bolt); D('snd', cfg.snd, P.spk); D('kam', cfg.cam, P.cam);
    const temps = (smartOn && lit) ? cfg.temps.map((t) => { const q = pr(t[0], t[1], t[2]); return { x: q[0].toFixed(1), y: q[1].toFixed(1), t: t[3] }; }) : [];
    const smoke = [];
    if (lit) cfg.boxes.filter((b) => b.m === 'chim').forEach((b) => { const q = pr(b.x + b.w / 2, b.y + b.d / 2, (b.z || 0) + b.h); ['smk', 'smk sm2', 'smk sm3'].forEach((cc) => smoke.push({ x: q[0].toFixed(1), y: (q[1] - 3).toFixed(1), c: cc })); });
    let ev = null;
    if (night && has('kam')) ev = { t: cfg.e.n[0], s: cfg.e.n[1], a: cfg.cam[0] };
    else if (winter && has('smart')) ev = { t: cfg.e.w[0], s: cfg.e.w[1], a: cfg.smart[0] };
    else if (has('kd')) ev = { t: cfg.e.d[0], s: cfg.e.d[1], a: cfg.kd[0] };
    else if (has('ev')) ev = { t: 'Ładowanie 64%', s: 'koniec ok. 18:40', a: cfg.ev[0] };
    let bub = { x: 0, y: 0, w: 10, fw: 10, t: '', s: '', lx: 0, ly: 0, ly2: 0 };
    if (ev) {
      const q = pr(ev.a.x, ev.a.y, ev.a.z);
      const bw = Math.round(Math.max(ev.t.length * 7.3, ev.s.length * 6) + 34);
      let bx = Math.max(620, Math.min(q[0] + 18, 1330 - bw)); const by = Math.max(q[1] - 26, 250);
      if (bx + bw > 1080 && by < 570) bx = Math.max(560, q[0] - bw - 18);
      bub = { x: bx.toFixed(1), y: by.toFixed(1), w: bw, fw: bw - 30, t: ev.t, s: ev.s, lx: q[0].toFixed(1), ly: q[1].toFixed(1), ly2: (by - 13).toFixed(1) };
    }
    const w0 = pr(cfg.wk[0][0], cfg.wk[0][1], 0), w1 = pr(cfg.wk[1][0], cfg.wk[1][1], 0);
    const wk = { style: '--x0:' + w0[0].toFixed(0) + 'px;--y0:' + w0[1].toFixed(0) + 'px;--x1:' + w1[0].toFixed(0) + 'px;--y1:' + w1[1].toFixed(0) + 'px' };
    const stars = [];
    for (let i = 0; i < 46; i++) stars.push({ x: ((i * 131) % 1420 + 10).toFixed(0), y: ((i * 53) % 260 + 10).toFixed(0), r: (0.7 + (i % 3) * 0.5).toFixed(2), d: ((i % 7) * 0.4).toFixed(1) });
    const flakes = [];
    if (winter) for (let i = 0; i < 90; i++) flakes.push({ x: ((i * 61) % 1460).toFixed(0), y: ((i * 37) % 200 - 60).toFixed(0), r: (1 + (i % 3) * 0.7).toFixed(1), t: (7 + (i % 5) * 1.6).toFixed(1), d: (-(i % 11) * 0.9).toFixed(1) });
    const allLines = L.slice().reverse().map((k) => LAY.find((l) => l[0] === k)).filter(Boolean).map((l) => {
      const k = l[0];
      let t = cfg.t[k];
      if (k === 'kam' && night) t = cfg.t.kamN;
      if (k === 'alarm' && night) t = cfg.t.alarmN;
      if (k === 'smart' && winter) t = cfg.t.smartW;
      return { n: l[1], t: t, ic: l[2], ic2: (k === 'alarm' && night) ? 'arm' : '' };
    });
    const lines = allLines.slice(0, 2), more = Math.max(0, allLines.length - 2);

    const modeName = night ? 'Noc' : winter ? 'Zima' : 'Dzień';
    const sc = { cls: 'hxsvg scene ' + st.mode, vb: st.nw ? '600 200 650 600' : '0 0 1440 1000', name: cfg.n, modeName: modeName, gnd: gnd, zones: zones, trees: trees, body: body, cones: cones, rings: rings, arcs: arcs, scr: scrP, dv: dv, temps: temps, smoke: smoke, hasBub: !!ev, bub: bub, wk: wk, det: has('kam'), stars: stars, flakes: flakes, lines: lines, empty: lines.length === 0, moreOn: more > 0, more: more, moreTxt: more === 1 ? 'instalacja' : more < 5 ? 'instalacje' : 'instalacji', aria: 'Ilustracja: ' + cfg.n + ', ' + modeName.toLowerCase() + '. Włączone: ' + (lines.map((l) => l.n).join(', ') || 'nic') };
    const now = new Date(), pad = (n) => String(n).padStart(2, '0');
    const pip = { k: st.obj + st.mode, cam: cfg.pipCam, time: night ? '02:14:' + pad(st.tick % 60) : pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()), cls: 'pipv' + (night ? ' ir' : ''), gnd: winter ? '#E6ECEE' : '#5E6B66', win: night ? '#FFD27A' : '#9FC6D2', det: night ? 'Osoba w strefie · powiadomienie wysłane' : 'Wykrywanie ludzi i aut · mniej fałszywych alarmów' };
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const otabs = ['dom', 'pens', 'hotel', 'rest', 'sklep', 'firma'].map((k) => ({ n: OBJ[k].n, ic: OBJ[k].ic, sel: st.obj === k ? 'true' : 'false', cls: 'hotab' + (st.obj === k ? ' on' : ''), pick: () => touch({ obj: k }) }));
    const modes = [['day', 'Dzień', P.sun], ['night', 'Noc', P.moon], ['winter', 'Zima', P.snow]].map((m) => ({ n: m[1], ic: m[2], on: st.mode === m[0] ? 'true' : 'false', cls: 'hmode' + (st.mode === m[0] ? ' on' : ''), pick: () => touch({ mode: m[0] }) }));
    const chips = LAY.map((l) => ({ n: l[1], ic: l[2], on: has(l[0]) ? 'true' : 'false', k: has(l[0]) ? '✓' : '+', cls: 'hchip' + (has(l[0]) ? ' on' : ''), toggle: () => touch({ layers: has(l[0]) ? L.filter((x) => x !== l[0]) : L.concat([l[0]]) }) }));
    const allOn = L.length === LAY.length;

    // services
    const SVX = {
      kam: { d: 'Kamery, które widzą w nocy i w śniegu, z nagraniami u Ciebie, nie w obcej chmurze. Projektujemy cały system, nie tylko miejsca na kamery.', parts: 'kamery · rejestrator NVR · dyski 24/7 · switch PoE · UPS · aplikacja', hl: ['Cztery wersje instalacji: od domu po duży obiekt', 'Kolor w nocy i wykrywanie ludzi oraz aut', 'Maski prywatności i czas nagrań ustawione pod RODO'], pr: 'od [CENA] zł za 4 kamery z montażem', go: ['bez', 'zdal'] },
      smart: { d: 'Polski system Ampio: światło, ogrzewanie, rolety, brama, alarm i kamery w jednej aplikacji. Gdy padnie internet, dom dalej działa.', parts: 'moduły Ampio · panele M-DOT · aplikacja UNI · sceny · integracje', hl: ['Nowy dom i remont, projekt przed tynkami', 'Ogrzewanie strefowe, pompa ciepła, fotowoltaika', 'Apple, Google i Alexa przez Matter'], pr: 'od [CENA] zł za projekt', go: ['kom', 'en', 'zdal'] },
      snd: { d: 'Stałe nagłośnienie APART i innych marek: muzyka w tle, komunikaty, strefy z osobną głośnością i mowa zrozumiała w ostatniej ławce.', parts: 'głośniki · wzmacniacz strefowy · mikrofony · panel ścienny · komunikaty', hl: ['Restauracje, hotele, kościoły, sale obrad', 'Każda strefa z osobną głośnością'], pr: 'od [CENA] zł za salę', go: ['gos', 'kom'] },
      alarm: { d: 'Czujki, syreny i powiadomienia na telefon. Wideodomofon przy furtce, który odbierasz z drugiego końca Polski.', parts: 'centrala · czujki · syrena · moduł GSM · wideodomofon', hl: ['Przewodowe lub bezprzewodowe, z aplikacją', 'Wideodomofon odbierany w telefonie'], pr: 'od [CENA] zł za zestaw do domu', go: ['bez', 'zdal'] },
      wifi: { d: 'Wi-Fi bez martwych stref, osobna sieć dla gości i dla kamer. Okablowanie, szafy rack i światłowody.', parts: 'punkty Wi-Fi · router · switch · szafa rack · światłowód', hl: ['Osobne sieci: goście, kamery, kasa', 'Pomiar zasięgu przed i po montażu'], pr: 'od [CENA] zł za punkt dostępowy', go: ['gos', 'kom'] },
      scr: { d: 'Ekrany w witrynie, menu board, recepcja i ściany wideo. Treść zmieniasz z komputera na wszystkich ekranach naraz.', parts: 'ekrany profesjonalne · odtwarzacz w ekranie · uchwyty · zarządzanie treścią · szablony', hl: ['Wdrażamy to w naszych salonach w Rabce i Zakopanem', 'Harmonogram: rano śniadania, wieczorem kolacje'], pr: 'od [CENA] zł za ekran z montażem', go: ['gos'] },
      kd: { d: 'Karty, kody i zamki do apartamentów. Gość albo pracownik wchodzi sam, a Ty wiesz, kto i kiedy.', parts: 'zamki z kodem · czytniki kart · harmonogramy', hl: ['Kody czasowe dla gości apartamentów', 'Historia wejść: kto i kiedy'], pr: 'od [CENA] zł za drzwi', go: ['bez', 'gos', 'zdal'] },
      tel: { d: 'Dla deweloperów i wykonawców: okablowanie, światłowód do lokali, RTV/SAT i domofony. Z pomiarami.', parts: 'okablowanie · światłowód · RTV/SAT · pomiary', hl: ['Od przedmiaru do odbioru z protokołami', 'Pomiar i opis każdego gniazda'], pr: 'wycena z przedmiaru', go: [] },
      ant: { d: 'Anteny satelitarne i DVB-T2, instalacje zbiorcze i telewizja w pokojach. Ustawiane miernikiem.', parts: 'antena · konwerter · multiswitch · gniazda', hl: ['Ustawiane miernikiem sygnału', 'Ta sama telewizja w każdym pokoju'], pr: 'od [CENA] zł z montażem', go: ['kom', 'gos'] },
      ev: { d: 'Ładowarki Elzab EcoPower: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Moc dobrana do przyłącza.', parts: 'CC Home · CC Wall · CC City · RFID · OCPP', hl: ['Od 3,7 do 2×22 kW, polski producent', 'Montaż i pomoc w formalnościach'], pr: 'od [CENA] zł z montażem', go: ['en'] }
    };
    const u = {};
    c.SV.forEach((s) => {
      const x = SVX[s.k], big = ['kam', 'smart', 'snd', 'scr'].includes(s.k);
      const sz = { kam: ' w2', smart: ' w2', scr: ' w2' }[s.k] || '';
      u[s.k] = { n: s.n, g: s.k === 'ev' ? 'E-mobilność' : ({ 'Sieci i technika': 'Łączność' }[s.g] || s.g), ic: s.ic, href: s.href, d: x.d, parts: x.parts, hl: (x.hl || []).slice(0, big ? 3 : 2), pl: x.parts.split(' · ').slice(0, big ? 6 : 4), big: big, pr: ceny ? x.pr : 'Wycena po wizji lokalnej', rec: false, badge: '', why: '', cls: 'ut2 ri ut-' + s.k + sz };
    });
    const brandSet = {}; this.offer().forEach((a) => a.b.forEach((b) => { brandSet[b] = 1; }));
    const DOTS = ['#12B6D8', '#7BD36A', '#F07A6A', '#F2B84B', '#5B8CF0', '#F29A4B', '#E86FB0', '#8C9CF5', '#B58CF0', '#5FD0B0'];
    const us = {
      dots: DOTS.map((c, i) => 'background:' + c + ';animation-delay:-' + (i * 0.4).toFixed(1) + 's'),
      nBrands: Object.keys(brandSet).length, nBrandsW: this.plw(Object.keys(brandSet).length, 'marka', 'marki', 'marek')
    };
    const brands = [['Dahua', 'kamery'], ['Hikvision', 'kamery'], ['BCS', 'kamery'], ['Satel', 'alarmy'], ['Ubiquiti', 'sieci Wi-Fi'], ['Ampio', 'smart home'], ['Elzab EcoPower', 'ładowarki'], ['Samsung', 'ekrany'], ['APART', 'nagłośnienie'], ['RCF', 'nagłośnienie'], ['MikroTik', 'sieci']].map((b, i) => ({ n: b[0], k: b[1], cls: 'brand' + (i > 8 ? ' hm' : '') }));
    const gory = [
      { n: 'Mróz i śnieg', ic: P.snow, d: 'Dobieramy kamery i obudowy do górskiej zimy i montujemy je tak, żeby jak najmniej zbierały śnieg. Obraz ustawiamy pod odblask od śniegu i wieczorne światło.' },
      { n: 'Burze i przepięcia', ic: P.storm, d: 'Ochrona przepięciowa zmniejsza ryzyko uszkodzeń po burzy, a zasilacz UPS podtrzymuje kamery i alarm przy krótkich zanikach prądu.' },
      { n: 'Słabe łącze', ic: P.off, d: 'Nagrania zapisują się w obiekcie, a Ampio steruje domem lokalnie. Gdy internet zniknie, instalacja działa dalej, a podgląd z telefonu wraca razem z łączem.' },
      { n: 'Domy na wynajem i letnie', ic: P.home, d: 'Podgląd z daleka, nagrzanie domu przed przyjazdem, ochrona przed zamarzaniem i zalaniem. Dla domów, w których nikogo nie ma przez kilka miesięcy.' },
      { n: 'Przegląd przed sezonem', ic: P.cal, d: 'Przed zimą i przed latem: czyszczenie kamer, test dysków, akumulatorów, Wi-Fi i ładowarki. Zanim przyjadą goście, a nie po pierwszej awarii.' },
      { n: 'Dwa salony blisko Ciebie', ic: P.pin, d: 'Rabka-Zdrój i Zakopane. Dużo usterek naprawiamy zdalnie, a gdy trzeba przyjechać, nie jedziemy z Krakowa.' }
    ];
    const goObj = (k) => () => self.setState({ obj: k, touched: true });
    const objs = [
      { n: 'Dom i domek letniskowy', d: 'Kamery przy furtce, alarm z czujkami mrozu i zalania, smart home i wideodomofon.', ic: P.home, k: 'dom', h: 'oh1 big', set: ['Kamery', 'Alarm', 'Smart home'], href: 'SegDom.dc.html' },
      { n: 'Pensjonat', d: 'Monitoring bez pokoi gości, Wi-Fi w każdym pokoju, telewizja i przegląd przed sezonem.', ic: P.bed, k: 'pens', h: 'oh2 big', set: ['Wi-Fi gości', 'Kamery RODO', 'TV w pokojach'], href: 'Noclegowe.dc.html' },
      { n: 'Apartament na wynajem', d: 'Przyjazd z kodem bez przekazywania kluczy, czujka zalania i Wi-Fi bez haseł na kartce.', ic: P.key, k: '', h: 'oh3', set: ['Zamek z kodem', 'Czujki', 'Wi-Fi'], href: 'SegApartament.dc.html' },
      { n: 'Hotel', d: 'Karty do pokoi, sieć na setki urządzeń, nagłośnienie sal i ekrany w recepcji.', ic: P.hotel, k: 'hotel', h: 'oh4', set: ['Karty', 'Sieć', 'Nagłośnienie'], href: 'SegHotel.dc.html' },
      { n: 'Restauracja i sala weselna', d: 'Muzyka na sali i tarasie, mikrofony na przemówienia, menu board i kamery przy kasie.', ic: P.food, k: 'rest', h: 'oh5', set: ['Nagłośnienie', 'Menu board', 'Kamery'], href: 'SegRestauracja.dc.html' },
      { n: 'Sklep i salon', d: 'Kamery sali i kas, alarm, ekran w witrynie i muzyka z komunikatami.', ic: P.shop, k: 'sklep', h: 'oh1', set: ['Kamery', 'Alarm', 'Witryna'], href: 'SegSklep.dc.html' },
      { n: 'Firma, biuro i hala', d: 'Sieć firmowa, karty dla pracowników, kamery placu i rampy, brama na karty.', ic: P.factory, k: 'firma', h: 'oh2', set: ['Sieć', 'Karty', 'Kamery placu'], href: 'SegFirma.dc.html' },
      { n: 'Kościół i parafia', d: 'Mowa zrozumiała w ostatniej ławce, transmisja mszy i ochrona zabytkowego wnętrza.', ic: P.church, k: '', h: 'oh3', set: ['Nagłośnienie', 'Transmisja', 'Monitoring'], href: 'SegKosciol.dc.html' },
      { n: 'Szkoła i przedszkole', d: 'Bezpieczne wejścia, dzwonki i komunikaty, sieć dla uczniów i monitory interaktywne.', ic: P.school, k: '', h: 'oh4', set: ['Wejścia', 'Dzwonki', 'Sieć'], href: 'SegSzkola.dc.html' },
      { n: 'Gmina i urząd', d: 'Sala obrad z transmisją i nagrywaniem sesji, monitoring budynków i przestrzeni.', ic: P.town, k: '', h: 'oh5', set: ['Sala obrad', 'Transmisja', 'Monitoring'], href: 'SegGmina.dc.html' },
      { n: 'Deweloper', d: 'Teletechnika budynku: światłowód do lokali, RTV/SAT, domofony, dokumentacja do odbioru.', ic: P.build, k: '', h: 'oh4 big', set: ['Światłowód', 'Domofony', 'Odbiory'], href: 'SegDeweloper.dc.html' },
      { n: 'Budowa', d: 'Kamery na placu bez przyłącza prądu i kabla (zasilanie z akumulatora lub panelu słonecznego), ochrona maszyn i podgląd postępu prac.', ic: P.crane, k: '', h: 'oh1 big', set: ['Kamery LTE', 'Alarm', 'Timelapse'], href: 'SegBudowa.dc.html' }
    ].map((o) => ({ n: o.n, d: o.d, ic: o.ic, set: o.set, href: o.href, more: 'Zobacz rozwiązania', live: !!o.k, go: o.k ? goObj(o.k) : () => {}, cls: 'obc ri ' + o.h }));
    const steps = [
      { n: '01', t: 'Rozmowa', d: 'Telefon albo formularz. Mówisz, co chcesz zabezpieczyć lub usprawnić, wysyłasz zdjęcia.' },
      { n: '02', t: 'Wizja lokalna', d: 'Przyjeżdżamy, mierzymy, sprawdzamy kable, zasięg i rozdzielnicę.' },
      { n: '03', t: 'Projekt i wycena', d: 'Plan rozmieszczenia urządzeń i wycena na piśmie, zwykle w wariantach do wyboru.' },
      { n: '04', t: 'Montaż', d: 'W ustalonym terminie, czysto, z zabezpieczeniem mebli i podłóg.' },
      { n: '05', t: 'Odbiór', d: 'Sprawdzamy działanie razem z Tobą i pokazujemy, jak korzystać z aplikacji.' },
      { n: '06', t: 'Serwis', d: 'Przegląd przed sezonem, zdalna pomoc i naprawy pod jednym numerem.' }
    ];
    const ART = { snd: 'M60 120v-40h28l34-26v92l-34-26zM150 70a40 40 0 0 1 0 60M175 50a70 70 0 0 1 0 100M200 30a100 100 0 0 1 0 140', ch: 'M150 30v26M138 42h24M100 160V96l50-40 50 40v64M136 160v-34h28v34M60 160h180', cf: 'M80 80h100v44a36 36 0 0 1-36 36h-28a36 36 0 0 1-36-36zM180 92h16a18 18 0 0 1 0 36h-16M110 40c-8 10 8 18 0 28M140 40c-8 10 8 18 0 28', nw: 'M150 55v80M110 95h80' };
    const ART2 = { conf: 'M60 150h180M90 150V70h120v80M110 90h80v40h-80zM150 150v20M120 170h60', wed: 'M150 40l20 30h-40zM150 70v90M110 160h80M100 100c20-20 80-20 100 0'};
    const rl = [
      { k: 'Audio, projekcja, IT', n: 'Blachotrapez', m: 'Rabka-Zdrój · sala konferencyjna', z: 'Nagłośnienie, sprzęt projekcyjny i przyłącza IT', ph: '', art: ART2.conf },
      { k: 'Nagłośnienie', n: 'Parafia św. Teresy', m: 'Rabka-Zdrój · kościół', z: 'Instalacja audiowizualna i nagłośnienie chóru', ph: '', art: ART.ch },
      { k: 'Nagłośnienie', n: 'Empik Zakopane', m: 'Zakopane · salon sprzedaży', z: 'Nagłośnienie sali sprzedaży', ph: '', art: ART.snd },
      { k: 'Audio i wideo', n: 'Restauracja i dom weselny „Aleksandra”', m: 'Mszana Dolna · sala bankietowa', z: 'Instalacja audiowizualna', ph: '', art: ART2.wed }
    ];

    const faq = this.faqList([
      ['Ile kosztuje monitoring albo cała instalacja?', 'Zależy od obiektu: liczby urządzeń, długości kabli, wysokości montażu i tego, czy trzeba kuć ściany. Po wizji lokalnej dostajesz wycenę na piśmie, zwykle w wariantach do wyboru.'],
      ['Czy wizja lokalna jest płatna?', '[SZEF: zasady wizji lokalnej i dojazdu]. Zanim przyjedziemy, możesz wysłać zdjęcia obiektu. Często już na ich podstawie powiemy, jakiego zakresu się spodziewać.'],
      ['Czy kamery działają bez internetu?', 'Tak. Kamery nagrywają na rejestrator w obiekcie. Internet jest potrzebny tylko do podglądu z telefonu i powiadomień.'],
      ['Czy monitoring w pensjonacie albo firmie jest zgodny z RODO?', 'Pomagamy od strony technicznej: ustawiamy strefy i maski prywatności, czas przechowywania nagrań i miejsca na tabliczki informacyjne. Obowiązki administratora danych, np. regulamin monitoringu, zostają po Twojej stronie. Podpowiemy, co przygotować.'],
      ['Mam instalację od innej firmy. Przejmiecie serwis?', 'Tak. Sprawdzamy, co jest zamontowane, i pomagamy odzyskać dostęp do urządzeń (za zgodą właściciela, także procedurą producenta). Potem proponujemy naprawę albo rozbudowę zamiast wymiany wszystkiego.'],
      ['Czy smart home da się zrobić w domu, który już stoi?', 'Tak, w zakresie zależnym od instalacji elektrycznej. Moduły Ampio montujemy w rozdzielnicy, a tam, gdzie nie ma przewodów, łączymy urządzenia bezprzewodowe w standardach, które Ampio obsługuje, np. Z-Wave. Najwięcej możliwości daje instalacja zaplanowana razem z elektryką na etapie budowy.'],
      ['Czy mogę zlecić kilka instalacji naraz?', 'Tak, i to najczęściej się opłaca. Kamery, Wi-Fi, alarm czy nagłośnienie projektujemy razem: wspólne trasy kabli, jedna szafa techniczna, jedna wizja lokalna i jedna umowa serwisowa. Wycenę dostajesz dla całości, z podziałem na instalacje.'],
      ['Na jakim terenie działacie?', 'Podhale i okolice: Rabka-Zdrój, Nowy Targ, Zakopane, Jordanów, Mszana Dolna. Dalej w Małopolsce (np. Limanowa, Nowy Sącz) dojazd ustalamy indywidualnie, zwykle przy większych inwestycjach. [SZEF: strefa i zasady dojazdu]']
    ], true);
    const KS = c.SV.map((s) => [s.k, s.n, s.ic]);
    const KO = [['dom', 'Dom'], ['pens', 'Pensjonat lub apartamenty'], ['hotel', 'Hotel'], ['rest', 'Restauracja'], ['sklep', 'Sklep'], ['biuro', 'Biuro lub firma'], ['hala', 'Hala lub magazyn'], ['gmina', 'Gmina, szkoła, kościół'], ['dew', 'Deweloper, wspólnota']];
    const kSvc = st.kSvc;
    const tw = this.norm(st.kTown);
    let zone = '—';
    if (tw) {
      if (/rabk|chabow|jordan|mszan|raba|spytk|lubien|skomiel|niedzwi|ponic|olszow/.test(tw)) zone = 'Rabka-Zdrój i okolice';
      else if (/zakop|poron|koscieli|bukow|bialk|bialy dun|murzas/.test(tw)) zone = 'Zakopane i Tatry';
      else if (/nowy targ|nowy tar|szaflar|czarny dun|jablon|czorszt|szczawn|kroscien|orawa|spisz/.test(tw)) zone = 'Podhale';
      else zone = 'Małopolska · dojazd ustalimy';
    }
    const HZ = { kam: '#12B6D8', alarm: '#F07A6A', kd: '#F2B84B', wifi: '#5B8CF0', tel: '#8C9CF5', ant: '#B58CF0', smart: '#7BD36A', snd: '#F29A4B', scr: '#E86FB0', ev: '#5FD0B0' };
    const KOI = { dom: P.home, pens: P.bed, hotel: P.hotel, rest: P.food, sklep: P.shop, biuro: P.office, hala: P.factory, gmina: P.school, dew: P.crane };
    const kDig = (st.kPh || '').replace(/\D/g, '').length;
    const kParts = [kSvc.length, st.kObj, st.kTown, kDig >= 9, st.kCons];
    const kPct = Math.round(kParts.filter(Boolean).length / kParts.length * 100);
    const kz = {
      form: !st.kDone, done: !!st.kDone,
      n1: kSvc.length ? 'ok' : '', n2: st.kObj ? 'ok' : '', n3: st.kTown && kDig >= 9 ? 'ok' : '',
      svc: KS.map((k) => ({ n: k[1], ic: k[2], st: '--h:' + HZ[k[0]], on: kSvc.includes(k[0]) ? 'true' : 'false', cls: 'hzkb' + (kSvc.includes(k[0]) ? ' on' : ''), toggle: () => self.setState({ kErr: '', kSvc: kSvc.includes(k[0]) ? kSvc.filter((x) => x !== k[0]) : kSvc.concat([k[0]]) }) })),
      obj: KO.map((o) => ({ n: o[1], ic: KOI[o[0]], on: st.kObj === o[0] ? 'true' : 'false', cls: 'hzko' + (st.kObj === o[0] ? ' on' : ''), pick: () => self.setState({ kObj: o[0] }) })),
      town: st.kTown, onTown: (e) => self.setState({ kTown: e && e.target ? e.target.value : '' }), zoneS: zone === '—' ? 'strefa' : zone.split(' · ')[0], zoneCls: 'hzkz' + (zone !== '—' ? ' on' : ''),
      towns: ['Rabka-Zdrój', 'Nowy Targ', 'Zakopane', 'Jordanów', 'Mszana Dolna', 'Limanowa'].map((t) => ({ n: t, cls: 'hzkt' + (st.kTown === t ? ' on' : ''), pick: () => self.setState({ kTown: t }) })),
      phone: st.kPh || '', onPhone: (e) => self.setState({ kErr: '', kPh: e && e.target ? e.target.value : '' }), phCls: 'hzkok' + (kDig >= 9 ? ' on' : ''),
      consCls: 'hzkcons' + (st.kCons ? ' on' : ''), tCons: () => self.setState({ kErr: '', kCons: !st.kCons }),
      sendCls: 'hzksend' + (kSvc.length && kDig >= 9 && st.kCons ? ' ready' : ''),
      send: () => { const e = !kSvc.length ? 'Zaznacz przynajmniej jedną instalację.' : kDig < 9 ? 'Podaj numer telefonu, żebyśmy mogli oddzwonić.' : !st.kCons ? 'Zaznacz zgodę na kontakt.' : ''; if (e) return self.setState({ kErr: e }); self.setState({ kDone: true, kErr: '' }); },
      reset: () => self.setState({ kDone: false, kSvc: [], kPh: '', kCons: false }),
      fullHref: (function () { const OM = { biuro: 'firma', hala: 'firma' }; const q = []; if (st.kObj) q.push('obiekt=' + (OM[st.kObj] || st.kObj)); if (kSvc.length) q.push('uslugi=' + kSvc.join(',')); return 'Zaplanuj.dc.html' + (q.length ? '#' + q.join('&') : ''); })(),
      err: !!st.kErr, errT: st.kErr || '',
      pct: String(kPct), ringSt: '--p:' + kPct,
      sum: KS.filter((k) => kSvc.includes(k[0])).map((k) => ({ n: k[1], st: '--h:' + HZ[k[0]] })), sumNone: !kSvc.length,
      sumObj: (KO.find((o) => o[0] === st.kObj) || ['', '—'])[1], sumTown: st.kTown || '—', zone: zone, sumPh: kDig >= 9 ? st.kPh : '—'
    };
    const RL = [['start', 'Start', P.home], ['dla-kogo', 'Dla kogo', P.users], ['uslugi', 'Usługi', P.net], ['architekci', 'Architekci', P.ruler], ['realizacje', 'Realizacje', P.eye], ['gory', 'Góry i zima', P.snow], ['proces', 'Jak pracujemy', P.check], ['serwis', 'Serwis', P.wrench], ['faq', 'Pytania', P.chat], ['zaplanuj', 'Zaplanuj', P.plane]];
    const zapHref = 'Zaplanuj.dc.html#obiekt=' + st.obj + (L.length ? '&uslugi=' + L.join(',') : '');
    const arAuto = !st.arT, arTk = Math.floor((st.tick || 0) / 3);
    const arsc = this.arScene(c, arAuto ? { m: ['kl', 'ty', 'in'][arTk % 3], hs: Math.floor(arTk / 3) % 17, off: [] } : { m: st.arM, hs: st.arHs, off: st.arOff }, (o) => self.setState({ arT: true, arM: o.m || (arAuto ? ['kl', 'ty', 'in'][arTk % 3] : st.arM), arHs: o.hs !== undefined ? o.hs : (arAuto ? Math.floor(arTk / 3) % 17 : st.arHs), arOff: o.off || st.arOff }));
    const arhm = { news: 'Głośniki pod gładzią: dźwięk w salonie bez żadnej maskownicy na suficie.', pts: [
      { ic: P.ruler, t: 'Plan urządzeń na rzutach', d: 'Kamery, czujki, głośniki, Wi-Fi, panele i trasy kabli.' },
      { ic: P.eye, t: 'Technika, której nie widać', d: 'Głośniki w suficie, szklane panele, TV w zabudowie.' },
      { ic: P.users, t: 'Jeden opiekun', d: 'Od koncepcji, przez budowę, do serwisu po odbiorze.' },
      { ic: P.chat, t: 'Zawsze pomożemy', d: 'Nawet jeśli to jedno pytanie do projektu.' }] };
    return {
      arsc: arsc, arhm: arhm,
      railCls: 'rail' + (st.railOn ? ' on' : ''), railItems: RL.map((r) => ({ href: '#' + r[0], n: r[1], ic: r[2], cls: st.rail === r[0] ? 'act' : '' })),
      hxCls: 'hx ' + st.mode, zapHref: zapHref, sc: sc, pip: pip, pipOn: has('kam'), otabs: otabs, modes: modes, chips: chips,
      allLayers: () => touch({ layers: allOn ? [] : LAY.map((l) => l[0]) }), allLabel: allOn ? 'Wyłącz wszystko' : 'Pokaż wszystko',
      brands: brands, us: us, u: u, gAll: { cls: 'g3 gorg' + (st.gAll ? ' all' : ''), btn: st.gAll ? 'Zwiń' : 'Pokaż wszystkie 6 wyzwań', go: () => self.setState({ gAll: !st.gAll }) }, oAll: { cls: 'obg' + (st.oAll ? ' all' : ''), btn: st.oAll ? 'Zwiń listę' : 'Pokaż wszystkie 12 obiektów', go: () => self.setState({ oAll: !st.oAll }) }, srv: [{ ic: P.cal, t: 'Przegląd przed sezonem', d: 'Kamery, dyski, akumulatory, Wi-Fi.' }, { ic: P.chat, t: 'Pomoc zdalna', d: 'Wiele usterek naprawiamy bez dojazdu.' }, { ic: P.wrench, t: 'Naprawy i rozbudowa', d: 'Jeden numer do całej instalacji.' }, { ic: P.layers, t: 'Przejęcie serwisu', d: 'Instalacje po firmach, które zniknęły.' }], gory: gory, objs: objs, steps: steps, rl: rl, faq: faq, kz: kz
    };
  }
