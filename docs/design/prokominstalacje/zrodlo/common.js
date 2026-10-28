  constructor(props) {
    super(props);
    var theme = null;
    try { var th = localStorage.getItem('pk-theme'); if (th === 'dark' || th === 'light') theme = th; } catch (e) {}
    this.state = Object.assign({ theme: theme, menu: false, mega: false, seen: {}, allSeen: false, rail: '', railOn: false, tick: 0, fold: {} }, this.initState ? this.initState() : {});
  }

  componentDidMount() {
    var self = this;
    this._iv = [];
    this._iv.push(setInterval(function () { if (document.hidden) return; self.setState({ tick: (self.state.tick + 1) % 100000 }); }, 1300));
    try {
      var io = new IntersectionObserver(function (es) {
        var add = {}, any = false;
        es.forEach(function (e) { if (e.isIntersecting) { add[e.target.getAttribute('data-rv')] = true; any = true; io.unobserve(e.target); } });
        if (any) self.setState({ seen: Object.assign({}, self.state.seen, add) });
      }, { threshold: 0.06 });
      setTimeout(function () { try { document.querySelectorAll('[data-rv]').forEach(function (el) { io.observe(el); }); } catch (e) {} }, 150);
    } catch (e) {}
    this._ts = setTimeout(function () { self.setState({ allSeen: true }); }, 900);
    var IDS = this.railIds ? this.railIds() : [];
    this._onS = function () {
      try {
        var sy = window.scrollY || 0, y = sy + (window.innerHeight || 800) * 0.35, act = IDS.length ? IDS[0] : '';
        IDS.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top + sy <= y) act = id; });
        var on = sy > 400;
        var ly = self._ly || 0, d = sy - ly, hide = self.state.hdrHide;
        if ((window.innerWidth || 1440) <= 760 && !self.state.menu) { if (sy < 90) hide = false; else if (d > 8) hide = true; else if (d < -8) hide = false; } else hide = false;
        if (Math.abs(d) > 8 || sy < 90) self._ly = sy;
        if (act !== self.state.rail || on !== self.state.railOn || hide !== !!self.state.hdrHide) self.setState({ rail: act, railOn: on, hdrHide: hide });
      } catch (e) {}
    };
    try { window.addEventListener('scroll', this._onS, { passive: true }); } catch (e) {}
    this._onK = function (e) { if ((e.key === 'Escape' || e.key === 'Esc') && (self.state.mega || self.state.menu)) { try { document.documentElement.classList.remove('pk-lock'); } catch (e2) {} self.setState({ mega: false, menu: false }); } };
    try { window.addEventListener('keydown', this._onK); } catch (e) {}
    if (this.mountPage) this.mountPage();
  }

  componentWillUnmount() {
    (this._iv || []).forEach(function (t) { clearInterval(t); });
    clearTimeout(this._ts);
    try { window.removeEventListener('scroll', this._onS); window.removeEventListener('keydown', this._onK); } catch (e) {}
  }

  every(ms, fn) { var self = this; this._iv.push(setInterval(function () { if (!document.hidden) fn.call(self); }, ms)); }

  icons() {
    return {
      cam: 'M3 9l13-5 2.5 6L5.5 15zM16 4l3-1 1.8 4.4-2.3 1.2M8 14l1.5 5H5M5 19v2',
      bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',
      lock: 'M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5zM12 15v2',
      wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
      home: 'M3 11l9-7 9 7v9H3zM9 20v-6h6v6',
      bolt: 'M13 2L5 13h6l-1 9 8-12h-6z',
      spk: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12',
      scr: 'M3 4h18v12H3zM8 20h8M12 16v4',
      net: 'M5 3h14v6H5zM5 15h14v6H5zM8 9v6M16 9v6',
      build: 'M4 21V8l6-4v17M10 21V10h10v11M14 14h2M14 17h2M6 11h2M6 15h2',
      sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
      moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
      snow: 'M12 2v20M4.9 6l14.2 12M19.1 6L4.9 18M9 4l3 2 3-2M9 20l3-2 3 2',
      bed: 'M3 18V8M3 14h18v4M21 18v-6a3 3 0 0 0-3-3h-7v5M7 11h.01',
      hotel: 'M4 21V3h16v18M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3',
      food: 'M5 3v8a3 3 0 0 0 6 0V3M8 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9',
      shop: 'M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6M3 9h18',
      office: 'M4 21V4h10v17M14 9h6v12M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1',
      factory: 'M3 21V10l6 4V10l6 4V7l6 4v10zM7 17h2M13 17h2',
      school: 'M12 3L2 8l10 5 10-5zM6 10v5c2 2 10 2 12 0v-5M22 8v6',
      crane: 'M5 21V5h12M5 5l4-3M17 5v4M15 9h4v3h-4zM3 21h8',
      users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
      storm: 'M17 18a5 5 0 1 0-1-9.9A6 6 0 0 0 4 10a4 4 0 0 0 1 8M13 12l-3 5h4l-2 4',
      off: 'M2 9a15 15 0 0 1 6-3.6M22 9a15 15 0 0 0-9.5-4M5 12.5a10 10 0 0 1 4-2.4M19 12.5a10 10 0 0 0-3-2M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M3 3l18 18',
      cal: 'M4 5h16v16H4zM4 10h16M9 3v4M15 3v4',
      pin: 'M12 21s-7-6.4-7-12a7 7 0 0 1 14 0c0 5.6-7 12-7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      shield: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z',
      key: 'M15 7a4 4 0 1 1-3.9 5H9v2H7v2H4v-3l6.1-6.1A4 4 0 0 1 15 7zM16 8h.01',
      coffee: 'M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 9h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2',
      car: 'M3 13l2-5h14l2 5v5H3zM6 18v2M18 18v2M7 14h.01M17 14h.01',
      door: 'M6 3h10l2 2v16H6zM13 12h.01M4 21h16',
      thermo: 'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0zM12 18h.01',
      light: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z',
      blind: 'M4 3h16M5 3v11h14V3M5 7h14M5 11h14M12 14v5M10 21h4',
      gate: 'M3 21V9M21 21V9M3 13h18M3 17h18M7 9v12M11 9v12M15 9v12M19 9v12',
      check: 'M5 12l5 5L20 7', x: 'M6 6l12 12M18 6L6 18', plus: 'M12 5v14M5 12h14', arrow: 'M5 12h14M13 6l6 6-6 6', arrowL: 'M19 12H5M11 6l-6 6 6 6',
      wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
      chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z', doc: 'M6 2h9l5 5v15H6zM14 2v6h6M9 14h6M9 18h4',
      eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', plane: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
      church: 'M12 2v4M10 4h4M6 21V11l6-5 6 5v10M10 21v-5h4v5', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
      mail: 'M3 5h18v14H3zM3 7l9 6 9-6', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', camera2: 'M4 7h3l2-3h6l2 3h3v13H4zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      cpu: 'M7 7h10v10H7zM10 2v5M14 2v5M10 17v5M14 17v5M2 10h5M2 14h5M17 10h5M17 14h5', layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
      fiber: 'M3 12c3-6 6-6 9 0s6 6 9 0M3 7c3-4 6-4 9 0s6 4 9 0M3 17c3 4 6 4 9 0s6-4 9 0', star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z',
      ruler: 'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2', battery: 'M3 8h16v8H3zM21 11v2M6 11h6', music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      tv: 'M3 6h18v12H3zM7 21h10M10 3l2 3 2-3', sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
      leaf: 'M5 21c0-9 6-15 16-16-1 10-7 16-16 16zM5 21l8-8', euro: 'M17 5a7 7 0 1 0 0 14M4 10h10M4 14h10', file: 'M6 2h9l5 5v15H6zM14 2v6h6',
      play: 'M6 4l14 8-14 8z', ant: 'M12 21V10M7 3l5 7 5-7M4 7l8 3 8-3M9 21h6', dish: 'M5 9a9 9 0 0 0 10 10zM9 15l6-6M17 7a1.5 1.5 0 1 0 .01 0M8 21h8', book: 'M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z', drop: 'M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z', fire: 'M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 2-5 5-5 8a7 7 0 0 0 7 7z', card: 'M3 6h18v12H3zM3 10h18M7 15h4', finger: 'M12 11v4M8 8a4 4 0 0 1 8 0v6a8 8 0 0 1-1 4M5 11a7 7 0 0 1 14-1M9 21a10 10 0 0 0 1-5v-4', grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', upload: 'M12 16V4M7 9l5-5 5 5M4 20h16', send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z', globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18', cloud: 'M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z', plug: 'M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4', sun2: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', mountain: 'M3 20l6-11 4 6 3-4 5 9z', tool: 'M4 20l7-7M14 4l6 6-3 3-6-6zM9 9l6 6', town: 'M3 21h18M5 21V11M9.5 21V11M14.5 21V11M19 21V11M2 11l10-7 10 7zM12 7.5h.01', apt: 'M5 21V3h14v18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M17 21v-3', stroller: 'M6 4l3 8h9M6 4H3M18 12a6 6 0 0 0-6-6v6M8 20a2 2 0 1 0 0-.01M17 20a2 2 0 1 0 0-.01'
    };
  }

  arHotspots() {
    // x,y w układzie sceny 1000x600; k = usługa; e = etap; v = co widzi klient; p = co zaplanować; s = klucz liczb do projektu (arSpecs)
    return [
      { x: 194, y: 250, k: 'kam', e: 'Projekt', t: 'Kamera pod okapem', v: 'Mała kamera w kolorze elewacji. Bez kabla na wierzchu i bez puszki na ociepleniu.', p: 'Miejsce uzgodnione z detalem okapu i element montażowy w warstwie ocieplenia. Kabel sieciowy do szafy rack.', s: 'kam' },
      { x: 33, y: 472, k: 'alarm', e: 'Projekt', t: 'Wideodomofon przy furtce', v: 'Panel w słupku ogrodzenia. Gość dzwoni, Ty odbierasz w telefonie.', p: 'Rura osłonowa w ziemi od furtki do budynku, wnęka w słupku na panel.', s: 'dom' },
      { x: 158, y: 470, k: 'kd', e: 'Przed tynkami', t: 'Zamek z kodem przy drzwiach', v: 'Drzwi otwierane kodem, kartą albo telefonem. Bez szukania kluczy.', p: 'Przewód do ościeżnicy (elektrozaczep albo zamek silnikowy) i zasilanie z szafy.', s: 'kd' },
      { x: 277, y: 451, k: 'alarm', e: 'Przed tynkami', t: 'Manipulator alarmu', v: 'Płaska klawiatura przy wejściu, w linii z włącznikami.', p: 'Puszka na wysokości włączników przy drzwiach i przewód do centrali w pomieszczeniu technicznym.', s: 'alm' },
      { x: 631, y: 451, k: 'smart', e: 'Przed tynkami', t: 'Szklany panel Ampio', v: 'Jeden szklany panel zamiast rzędu włączników: światło, rolety, ogrzewanie, sceny.', p: 'Głęboka puszka przy drzwiach. Kolor szkła i ikony dobrane do wnętrza.', s: 'panel' },
      { x: 482, y: 404, k: 'snd', e: 'Projekt', t: 'Głośniki w suficie', v: 'Maskownice w kolorze sufitu albo głośniki całkiem pod gładzią. Muzyka bez kolumn na podłodze.', p: 'Sufit podwieszany z miejscem na korpus, ramki montażowe przed płytą g-k, przewód do wzmacniacza.', s: 'spk' },
      { x: 352, y: 406, k: 'wifi', e: 'Przed tynkami', t: 'Punkt Wi-Fi w suficie', v: 'Płaski krążek na suficie. Zasięg w całym domu bez routerów na półce.', p: 'Kabel sieciowy z każdego punktu do szafy, zasilanie przez ten sam kabel (PoE).', s: 'ap' },
      { x: 478, y: 468, k: 'scr', e: 'Projekt', t: 'Telewizor w zabudowie', v: 'Ekran w lamelach, bez kabli pod spodem. Sprzęt schowany w szafce albo w szafie rack.', p: 'Wnęka z wentylacją, rura pod przewody za ekranem, gniazdo zasilania i sieci.', s: 'tv' },
      { x: 560, y: 518, k: 'smart', e: 'Przed tynkami', t: 'Ogrzewanie strefowe', v: 'Każdy pokój ma swoją temperaturę, ustawianą z panelu albo telefonu.', p: 'Czujnik temperatury w każdej strefie i przewody do siłowników przy rozdzielaczu.', s: 'heat' },
      { x: 262, y: 254, k: 'smart', e: 'Projekt', t: 'Roleta w nadprożu', v: 'Nie widać kasety. Roleta zjeżdża sama, gdy słońce grzeje albo gdy wyjeżdżasz.', p: 'Wnęka w nadprożu na kasetę i przewód do sterowania przed tynkami.', s: 'rol' },
      { x: 490, y: 254, k: 'snd', e: 'Projekt', t: 'Głośnik w łazience', v: 'Głośnik w suficie odporny na wilgoć. Muzyka albo radio rano.', p: 'Model do wilgotnych pomieszczeń i przewód do wzmacniacza strefy.', s: 'bath' },
      { x: 728, y: 470, k: 'wifi', e: 'Projekt', t: 'Szafa rack', v: 'Klient jej nie widzi. Wszystkie kable kończą się w jednym, opisanym miejscu.', p: 'Miejsce w pomieszczeniu technicznym: wentylacja, osobny obwód zasilania, dostęp z przodu.', s: 'rack' },
      { x: 946, y: 451, k: 'ev', e: 'Projekt', t: 'Ładowarka w garażu', v: 'Ładowarka na ścianie garażu. Auto ładuje się w nocy.', p: 'Moc przyłącza z zapasem i przewód zasilający do garażu, uzgodnione z projektantem elektrycznym.', s: 'ev' },
      { x: 943, y: 394, k: 'kam', e: 'Projekt', t: 'Kamera wjazdu', v: 'Widać podjazd i bramę, także w nocy.', p: 'Miejsce nad bramą garażową i kabel do szafy przez ścianę garażu.', s: 'kam2' },
      { x: 690, y: 118, k: 'ant', e: 'Projekt', t: 'Antena na dachu', v: 'Antena od strony ogrodu, nie na głównej elewacji.', p: 'Miejsce na maszt, przepust przez dach, uziemienie i przewód do szafy.', s: 'ant' },
      { x: 161, y: 498, k: 'snd', e: 'Projekt', t: 'Głośnik ogrodowy', v: 'Głośnik udający kamień albo schowany w zieleni. Muzyka na tarasie.', p: 'Przewód w rurze w ziemi od tarasu do budynku.', s: 'gard' },
      { x: 92, y: 566, k: 'tel', e: 'Projekt', t: 'Rura pod światłowód', v: 'Niewidoczna. Internet światłowodowy bez kopania podjazdu.', p: 'Rura osłonowa od granicy działki do pomieszczenia technicznego, z pilotem do przeciągnięcia.', s: 'fib' }
    ];
  }

  arScene(c, o, set) {
    // o: { m: 'kl'|'ty'|'in', hs, off: [] }
    const HU = c.HU, P = c.P, HS = this.arHotspots(), off = o.off || [], SP = this.arSpecs();
    const vis = HS.map((h, i) => i).filter((i) => !off.includes(HS[i].k));
    const hs = vis.includes(o.hs) ? o.hs : (vis[0] || 0);
    const cur = HS[hs] || HS[0];
    const SN = { kam: 'Monitoring', alarm: 'Alarm i domofon', kd: 'Kontrola dostępu', wifi: 'Sieć i Wi-Fi', smart: 'Smart home', snd: 'Dźwięk', scr: 'Ekrany i TV', ant: 'Anteny', ev: 'Ładowarka EV', tel: 'Teletechnika' };
    const M = [['kl', 'Gotowy dom', P.home], ['ty', 'Przed tynkami', P.tool], ['in', 'Wszystkie instalacje', P.layers]];
    const LB = { kl: 'Tak widzi to klient. Ile instalacji tu jest?', ty: 'Przed tynkami: puszki, ramki, rury i trasy kabli', in: 'Wszystkie instalacje i trasy do szafy rack' };
    const step = (d) => { const k = vis.indexOf(hs); const n = vis[(k + d + vis.length) % vis.length]; set({ m: o.m === 'kl' ? 'in' : o.m, hs: n }); };
    return {
      m: o.m, cls: 'ars m-' + o.m + off.map((k) => ' off-' + k).join(''),
      modes: M.map((x) => ({ n: x[1], ic: x[2], cls: 'armode' + (o.m === x[0] ? ' on' : ''), on: o.m === x[0] ? 'true' : 'false', go: () => set({ m: x[0] }) })),
      lbl: LB[o.m],
      hs: HS.map((h, i) => ({ n: i + 1, tr: 'translate(' + h.x + ' ' + h.y + ')', st: '--hc:' + HU[h.k], cls: 'arhs L-' + h.k + (i === hs ? ' on' : ''), t: h.t, go: () => set({ m: o.m === 'kl' ? 'in' : o.m, hs: i }) })),
      layers: Object.keys(SN).map((k) => { const on = !off.includes(k); return { n: SN[k], st: '--hc:' + HU[k], cls: 'arsys sm' + (on ? ' on' : ''), on: on ? 'true' : 'false', go: () => set({ off: on ? off.concat([k]) : off.filter((x) => x !== k) }) }; }),
      allL: () => set({ off: [] }),
      cur: { n: hs + 1, t: cur.t, v: cur.v, p: cur.p, s: SP[cur.s] || 'Parametry dobieramy do projektu.', svc: SN[cur.k], etap: 'Etap: ' + cur.e, st: '--hc:' + HU[cur.k] },
      prev: () => step(-1), next: () => step(1)
    };
  }

  arSpecs() {
    // wartości z kart katalogowych i norm (źródła: docs/strony/prokominstalacje-architekci-zrodla.md)
    return {
      kam: 'Kamera IP pobiera zwykle ok. 6–12 W (np. Hikvision ColorVu 8 MP: maks. 6,5 W). Mieści się w PoE 802.3af (13 W dla urządzenia). Kabel do 90 m od szafy.',
      dom: 'Panel furtki i monitor zasilane zwykle z PoE. Rura w ziemi z zapasem, bez łączenia kabli po drodze.',
      kd: 'Zamek albo elektrozaczep zasilany z szafy, przewód do ościeżnicy przed montażem drzwi. Model zamka dobieramy z producentem drzwi.',
      alm: 'Manipulator i czujki na przewodzie albo bezprzewodowe. Przewód do centrali w szafie lub obok niej.',
      panel: 'Panele Ampio M-DOT: 90×90 albo 90×160 mm, od 2 do 18 pól. Puszka osadzona głębiej niż standardowo. Szkło, ikony i podpisy ustawiasz w kreatorze Ampio.',
      spk: 'Głośnik 6–6,5": otwór ok. 200–210 mm, głębokość 92–120 mm. 8": otwór ok. 257 mm, głębokość ok. 135 mm. Para stereo w odstępie 1,8–3 m.',
      ap: 'Punkt Wi-Fi na środku sufitu, kolejne co 10–12 m (wytyczne TP-Link Omada). Zasilanie PoE+ do 25,5 W (np. UniFi U7 Pro maks. 21 W).',
      tv: 'Kąt widzenia 30–40°: z 2,1 m to ekran ok. 55–70". Środek ekranu na wysokości oczu: dla 65" ok. 100–120 cm od podłogi.',
      heat: 'Czujnik temperatury w każdej strefie i przewód do siłownika przy rozdzielaczu. Strefy ustalamy z projektantem instalacji grzewczej.',
      rol: 'Napęd sterowany z modułu Ampio. Przewód do każdej rolety i wnęka w nadprożu na kasetę.',
      bath: 'Głośnik do wilgotnych pomieszczeń (model łazienkowy), przewód do wzmacniacza strefy.',
      rack: '19": 1U = 44,45 mm. Szafa wisząca 600×450 mm daje ok. 39 cm użytecznej głębokości. Wentylacja, osobny obwód zasilania i dostęp z przodu.',
      ev: 'Elzab CC Home: 3,7 kW (1 faza 16 A), 7,4 kW (1 faza 32 A) albo 11 kW (3 fazy 16 A). 22 kW wymaga 3 faz 32 A.',
      kam2: 'Ta sama zasada co przy elewacji: kabel PoE do szafy (do 90 m), uchwyt nad bramą, bez mostka termicznego w ociepleniu.',
      ant: 'Satelita Hot Bird 13°E. Przewód 75 Ω z ekranowaniem klasy A, osobny do każdego odbiornika z multiswitcha.',
      gard: 'Przewód głośnikowy w rurze w ziemi. Głośniki zewnętrzne odporne na wodę i mróz.',
      fib: 'Rura osłonowa od granicy działki do szafy. W budynkach wielorodzinnych: punkt styku, skrzynka w każdym lokalu, światłowód jednomodowy.'
    };
  }

  svcList(P) {
    return [
      { k: 'kam', n: 'Monitoring i kamery', g: 'Bezpieczeństwo', href: 'Monitoring.dc.html', ic: P.cam, s: 'Kompletny system: kamery, rejestrator, dyski, PoE' },
      { k: 'alarm', n: 'Alarmy i wideodomofony', g: 'Bezpieczeństwo', href: 'Alarmy.dc.html', ic: P.bell, s: 'Czujki, syreny, domofon z aplikacją' },
      { k: 'kd', n: 'Kontrola dostępu i zamki', g: 'Bezpieczeństwo', href: 'Dostep.dc.html', ic: P.lock, s: 'Karty, kody, apartamenty' },
      { k: 'wifi', n: 'Sieci i Wi-Fi', g: 'Sieci i technika', href: 'Sieci.dc.html', ic: P.wifi, s: 'Okablowanie, światłowód, Wi-Fi gości' },
      { k: 'tel', n: 'Teletechnika w budownictwie', g: 'Sieci i technika', href: 'Teletechnika.dc.html', ic: P.build, s: 'Dla deweloperów i wykonawców' },
      { k: 'ant', n: 'Anteny RTV/SAT', g: 'Sieci i technika', href: 'Anteny.dc.html', ic: P.dish, s: 'Satelitarne, DVB-T2, zbiorcze, TV hotelowa' },
      { k: 'smart', n: 'Smart home Ampio', g: 'Komfort i obraz', href: 'SmartHome.dc.html', ic: P.home, s: 'Polski system, działa bez internetu' },
      { k: 'snd', n: 'Nagłośnienie', g: 'Komfort i obraz', href: 'Naglosnienie.dc.html', ic: P.spk, s: 'APART: restauracje, hotele, kościoły, sale' },
      { k: 'scr', n: 'Ekrany i digital signage', g: 'Komfort i obraz', href: 'Multimedia.dc.html', ic: P.scr, s: 'Witryny, menu board, recepcja, ściany wideo' },
      { k: 'ev', n: 'Ładowarki samochodów', g: 'Sieci i technika', href: 'Ladowarki.dc.html', ic: P.bolt, s: 'Elzab EcoPower: dom, firma, parking' }
    ];
  }

  hues() { return { kam: '#12B6D8', alarm: '#F07A6A', kd: '#F2B84B', wifi: '#5B8CF0', tel: '#8C9CF5', ant: '#B58CF0', smart: '#7BD36A', snd: '#F29A4B', scr: '#E86FB0', ev: '#5FD0B0' }; }

  segList(P) {
    return [
      { k: 'dom', g: 'Dom i noclegi', n: 'Dom i domek letniskowy', s: 'Bezpieczny, gdy Cię nie ma', page: 'SegDom', href: 'SegDom.dc.html', ic: P.home, h: '#7BD36A' },
      { k: 'apt', g: 'Dom i noclegi', n: 'Apartament na wynajem', s: 'Gość wchodzi sam, Ty widzisz wszystko', page: 'SegApartament', href: 'SegApartament.dc.html', ic: P.key, h: '#F2B84B' },
      { k: 'pens', g: 'Dom i noclegi', n: 'Pensjonat', s: 'Wi-Fi i TV w pokojach, kamery na zewnątrz', page: 'Noclegowe', href: 'Noclegowe.dc.html', ic: P.bed, h: '#F29A4B' },
      { k: 'hotel', g: 'Dom i noclegi', n: 'Hotel', s: 'Recepcja 24/7, sale, SPA', page: 'SegHotel', href: 'SegHotel.dc.html', ic: P.hotel, h: '#E86FB0' },
      { k: 'rest', g: 'Firmy', n: 'Restauracja i sala weselna', s: 'Muzyka w strefach, menu na ekranach', page: 'SegRestauracja', href: 'SegRestauracja.dc.html', ic: P.food, h: '#F07A6A' },
      { k: 'sklep', g: 'Firmy', n: 'Sklep i salon', s: 'Kasa, witryna, komunikaty', page: 'SegSklep', href: 'SegSklep.dc.html', ic: P.shop, h: '#12B6D8' },
      { k: 'firma', g: 'Firmy', n: 'Firma, biuro i hala', s: 'Wejścia, rampa, sieć firmowa', page: 'SegFirma', href: 'SegFirma.dc.html', ic: P.factory, h: '#5B8CF0' },
      { k: 'kosc', g: 'Instytucje', n: 'Kościół i parafia', s: 'Zrozumiała mowa, transmisja mszy', page: 'SegKosciol', href: 'SegKosciol.dc.html', ic: P.church, h: '#B58CF0' },
      { k: 'szk', g: 'Instytucje', n: 'Szkoła i przedszkole', s: 'Bezpieczne wejścia, dzwonki, sieć', page: 'SegSzkola', href: 'SegSzkola.dc.html', ic: P.school, h: '#5FD0B0' },
      { k: 'gmina', g: 'Instytucje', n: 'Gmina i urząd', s: 'Sala obrad, transmisja sesji', page: 'SegGmina', href: 'SegGmina.dc.html', ic: P.town, h: '#8C9CF5' },
      { k: 'dev', g: 'Budownictwo', n: 'Deweloper', s: 'Teletechnika budynku do odbioru', page: 'SegDeweloper', href: 'SegDeweloper.dc.html', ic: P.build, h: '#4CCBE6' },
      { k: 'bud', g: 'Budownictwo', n: 'Budowa', s: 'Monitoring placu bez prądu i kabla', page: 'SegBudowa', href: 'SegBudowa.dc.html', ic: P.crane, h: '#E8A23A' }
    ];
  }

  offer() {
    const A = 'dom apt pens rest sklep firma inst dev';
    return [
      { k: 'kam', fam: 'Bezpieczeństwo', d: 'Kompletny system, a nie same kamery: rejestrator, dyski do pracy 24/7, zasilanie PoE, UPS i aplikacja w telefonie.', b: ['Hikvision', 'Dahua', 'BCS', 'Ubiquiti'], items: [
        ['Monitoring domu i posesji', 'Podjazd, furtka i ogród. Podgląd i nagrania w telefonie.', 'dom apt'],
        ['Monitoring pensjonatu i hotelu', 'Parking, wejścia i narciarnia, bez zaglądania do pokoi gości.', 'pens apt'],
        ['Monitoring firmy, hali i placu', 'Wjazd, rampa, magazyn i kasy. Nagrania jako dowód.', 'firma sklep rest'],
        ['Kamery z kolorem w nocy i detekcją AI', 'Odróżniają człowieka i auto od kota, liści i śniegu.', A],
        ['Rejestratory NVR i dyski do monitoringu', 'Dysk dobrany do liczby kamer i czasu przechowywania nagrań.', A],
        ['Switche PoE, UPS i szafa rack', 'Kamera zasilana tym samym kablem, którym przesyła obraz. Działa też przy zaniku prądu.', A],
        ['Rozpoznawanie tablic rejestracyjnych', 'Wjazd na parking, brama albo szlaban i historia aut.', 'firma pens inst dev'],
        ['Kamery tam, gdzie nie ma kabla', 'Most radiowy do odległej bramy albo łącze komórkowe na budowę.', 'firma dev dom'],
        ['Monitoring zgodny z zasadami RODO', 'Maski prywatności, czas przechowywania i oznakowanie terenu.', A],
        ['Przejęcie i modernizacja starego monitoringu', 'Wymiana kamer analogowych, pomoc w odzyskaniu dostępu, nowy rejestrator.', A]] },
      { k: 'alarm', fam: 'Bezpieczeństwo', d: 'Czujki, syreny i powiadomienia na telefon, a przy furtce wideodomofon, który odbierasz z dowolnego miejsca.', b: ['Satel', 'Ajax', 'Hikvision', 'Dahua', 'BCS'], items: [
        ['Alarm do domu i mieszkania', 'Czujki ruchu i otwarcia, syrena, sterowanie z aplikacji.', 'dom apt'],
        ['Alarm bezprzewodowy bez kucia ścian', 'Do wykończonego domu, apartamentu i biura.', 'dom apt firma'],
        ['Ochrona domu letniskowego', 'Czujki zalania, dymu i spadku temperatury działające całą dobę.', 'dom apt pens'],
        ['Alarm dla firmy i sklepu', 'Strefy, harmonogram uzbrojenia i opcjonalnie agencja ochrony.', 'firma sklep rest inst'],
        ['Wideodomofon z aplikacją', 'Widzisz, kto stoi przy furtce, i otwierasz z telefonu.', 'dom apt pens'],
        ['Wideodomofon na starych dwóch przewodach', 'Modernizacja bez kucia, jeśli przewód się nada.', 'dom firma'],
        ['Domofony dla wspólnot i budynków', 'Panel z listą lokatorów, kody, breloki i aplikacja.', 'dev firma'],
        ['Brama i furtka sterowane z telefonu', 'Otwieranie z aplikacji wideodomofonu albo z panelu.', 'dom pens firma']] },
      { k: 'kd', fam: 'Bezpieczeństwo', d: 'Kody, karty i zamki elektroniczne. Gość albo pracownik wchodzi sam, a Ty wiesz, kto i kiedy.', b: [], items: [
        ['Zamki z kodem do apartamentów', 'Kod ważny tylko w czasie pobytu, wysyłany z systemu rezerwacji.', 'apt pens'],
        ['Hotelowe zamki na karty', 'Koder kart na recepcji i rejestr otwarć.', 'pens'],
        ['Karty i breloki dla pracowników', 'Strefy, godziny wejść, blokada zgubionej karty w minutę.', 'firma sklep inst'],
        ['Kontrola wjazdu', 'Brama i szlaban na pilota, kartę albo aplikację.', 'firma dev pens'],
        ['Kontrola dostępu we wspólnocie', 'Karty do klatek, garaży i śmietników.', 'dev'],
        ['Harmonogramy i historia wejść', 'Kto, kiedy i którymi drzwiami. Z zasadami RODO.', 'firma inst pens']] },
      { k: 'wifi', fam: 'Łączność', d: 'Sieć, która działa w każdym pokoju i nie pada w sezonie: okablowanie, szafy, światłowód, Wi-Fi i łącze zapasowe.', b: ['Ubiquiti', 'MikroTik', 'TP-Link', 'Cisco'], items: [
        ['Wi-Fi w całym domu i ogrodzie', 'Bez martwych stref, jedna nazwa sieci.', 'dom apt'],
        ['Wi-Fi dla gości z portalem logowania', 'Osobna sieć gości, logo obiektu, vouchery na czas pobytu.', 'pens apt rest'],
        ['Sieć firmowa i bezpieczeństwo', 'Router, firewall i osobne sieci dla kas, kamer i gości.', 'firma sklep rest inst'],
        ['Okablowanie strukturalne', 'Gniazda, patchpanele i pomiary każdego toru z protokołem.', 'firma dev inst'],
        ['Szafy rack i porządek w kablach', 'Opisane porty, zasilanie awaryjne, wentylacja.', 'firma pens inst'],
        ['Światłowód i spawanie', 'Między budynkami i na dłuższych odcinkach, odporny na przepięcia.', 'firma pens dev inst'],
        ['Mosty radiowe między budynkami', 'Internet i kamery w drugim budynku bez kopania rowu.', 'pens firma dom'],
        ['Łącze zapasowe', 'Gdy padnie główne łącze, sieć przełącza się na zapasowe.', 'firma pens sklep'],
        ['Zdalny nadzór nad siecią', 'Widzimy awarię, zanim zadzwonisz, wiele rzeczy naprawiamy zdalnie.', A]] },
      { k: 'tel', fam: 'Łączność', d: 'Dla deweloperów, wykonawców i inwestorów: instalacje słaboprądowe budynku z pomiarami i dokumentacją do odbioru.', b: [], items: [
        ['Instalacja telekomunikacyjna w nowym budynku', 'Gotowa na internet, telefon i telewizję, zgodnie z megaustawą.', 'dev'],
        ['Światłowód do lokali', 'Od punktu styku do każdego mieszkania i lokalu.', 'dev'],
        ['RTV/SAT zbiorcza', 'Jedna antena, sygnał w każdym lokalu.', 'dev pens'],
        ['Domofony i wideodomofony w klatkach', 'Panele wejściowe, unifony i monitory.', 'dev'],
        ['Okablowanie biur i lokali usługowych', 'Gniazda, szafa, punkty dostępowe.', 'firma sklep rest'],
        ['Pomiary i dokumentacja powykonawcza', 'Protokoły pomiarów i opis tras do odbioru.', 'dev firma inst']] },
      { k: 'ant', fam: 'Łączność', d: 'Anteny ustawiane miernikiem i montowane z zapasem na halny. Od domu po telewizję w każdym pokoju pensjonatu.', b: [], items: [
        ['Anteny satelitarne', 'Ustawienie miernikiem na Hot Bird 13°E.', 'dom apt pens'],
        ['Anteny naziemne DVB-T2', 'Dobór kierunku i nadajnika na Podhalu.', 'dom apt'],
        ['Instalacje zbiorcze', 'Multiswitch i rozprowadzenie w budynku.', 'dev pens'],
        ['Telewizja w pensjonacie i hotelu', 'Ten sam zestaw kanałów w każdym pokoju.', 'pens'],
        ['Serwis po halnym i burzy', 'Ponowne ustawienie, wymiana konwertera i okablowania.', 'dom pens']] },
      { k: 'smart', fam: 'Komfort i obraz', d: 'Polski system Ampio. Światło, ogrzewanie, rolety, brama, alarm i kamery w jednej aplikacji. Działa także bez internetu.', b: ['Ampio'], items: [
        ['Smart home w nowym domu', 'Projekt przed tynkami, okablowanie i rozdzielnica.', 'dom'],
        ['Smart home w remoncie', 'Modernizacja bez przebudowy całego domu.', 'dom apt'],
        ['Oświetlenie i sceny', 'Jednym dotknięciem: przyjazd, wyjście, noc, kino.', 'dom apt pens rest'],
        ['Ogrzewanie strefowe i pompa ciepła', 'Każdy pokój osobno, harmonogramy i tryb oszczędny.', 'dom apt pens'],
        ['Rolety, żaluzje i markizy', 'Według godziny, słońca i wiatru.', 'dom apt pens'],
        ['Fotowoltaika i zarządzanie energią', 'Prąd ze słońca tam, gdzie się opłaca.', 'dom firma pens'],
        ['Szklane panele Ampio M-DOT', 'Własne ikony, podpisy i kolor szkła.', 'dom apt pens'],
        ['Integracja z alarmem, kamerami i bramą', 'Jedna aplikacja zamiast pięciu.', 'dom pens firma'],
        ['Smart apartament i pensjonat', 'Puste pokoje w trybie oszczędnym, nagrzanie przed przyjazdem.', 'apt pens'],
        ['Sterowanie głosem i Matter', 'Apple, Google i Alexa, jeśli lubisz mówić do domu.', 'dom apt']] },
      { k: 'snd', fam: 'Komfort i obraz', d: 'Stałe nagłośnienie APART i innych marek: muzyka w tle, komunikaty i mowa zrozumiała w ostatniej ławce.', b: ['APART', 'JBL', 'Mackie', 'RCF', 'Electro-Voice', 'LDM', 'EAW', 'Alto', 'Audio-Technica'], items: [
        ['Muzyka w restauracji i kawiarni', 'Sala, bar, taras i toalety z osobną głośnością.', 'rest pens'],
        ['Nagłośnienie hotelu i pensjonatu', 'Jadalnia, recepcja, SPA i sala, komunikaty do wybranych stref.', 'pens'],
        ['Nagłośnienie kościoła', 'Zrozumiała mowa, a nie tylko głośniej.', 'inst'],
        ['Sale konferencyjne i sale obrad', 'Mikrofony, nagrywanie i transmisja.', 'inst firma pens'],
        ['Sklepy: muzyka i komunikaty', 'Tło dla klientów i komunikaty dla obsługi.', 'sklep'],
        ['Szkoły i hale sportowe', 'Dzwonki, komunikaty i nagłośnienie apeli.', 'inst'],
        ['Ogrody, tarasy i baseny', 'Głośniki zewnętrzne odporne na pogodę.', 'dom pens rest'],
        ['Mikrofony i systemy konferencyjne', 'Przewodowe, bezprzewodowe i stołowe.', 'inst firma']] },
      { k: 'scr', fam: 'Komfort i obraz', d: 'Ekrany profesjonalne do pracy wiele godzin dziennie i treść zmieniana zdalnie. Sami używamy tego w naszych salonach.', b: ['Samsung', 'Avtek', 'Sharp/NEC'], items: [
        ['Ekrany w witrynie', 'Jasne ekrany czytelne w słońcu, sterowane harmonogramem.', 'sklep rest pens'],
        ['Menu board w gastronomii', 'Ceny i menu zmieniane z komputera, bez drukowania.', 'rest'],
        ['Ekran w recepcji hotelu', 'Pogoda, stoki, atrakcje i oferta obiektu.', 'pens'],
        ['Ściany wideo', 'Kilka ekranów jako jeden obraz.', 'firma sklep inst'],
        ['Monitory interaktywne', 'Do szkół i sal spotkań.', 'inst firma'],
        ['Totemy informacyjne', 'Wolnostojące ekrany przy wejściu.', 'sklep pens inst'],
        ['Zarządzanie treścią na wielu ekranach', 'Jedna zmiana trafia na ekrany w kilku lokalizacjach.', 'sklep rest pens firma'],
        ['Projektory i ekrany projekcyjne', 'Sale konferencyjne, szkoły, kościoły.', 'inst firma pens']] },
      { k: 'ev', fam: 'E-mobilność', d: 'Pełna oferta ładowarek Elzab EcoPower produkowanych w Polsce: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Z doborem mocy do przyłącza i montażem.', b: ['Elzab EcoPower'], items: [
        ['Ładowarka w domu', 'Elzab CC Home w garażu: 3,7, 7,4 albo 11 kW.', 'dom'],
        ['Ładowarka ścienna z dwoma punktami', 'Elzab CC Wall, do 2×22 kW, na ścianę albo podstawę.', 'firma pens'],
        ['Ładowarki dla firm i floty', 'Karty RFID, aplikacja, dzielenie mocy przyłącza.', 'firma'],
        ['Stacja wolnostojąca na parking', 'Elzab CC City z licznikiem MID, dwa auta naraz.', 'pens rest sklep firma'],
        ['Rozliczanie ładowania', 'OCPP i aplikacja, gdy ładowanie dla gości ma być płatne.', 'pens rest firma'],
        ['Pomoc w formalnościach', 'Dozór techniczny, zgoda wspólnoty, moc przyłącza.', 'dom firma pens dev']] }
    ];
  }

  common() {
    const st = this.state, self = this, P = this.icons();
    const theme = st.theme || this.props.theme || 'dark';
    const SV = this.svcList(P);
    const HU = this.hues();
    const megaCols = ['Bezpieczeństwo', 'Sieci i technika', 'Komfort i obraz'].map((g) => ({ n: g, items: SV.filter((s) => s.g === g).map((s) => Object.assign({}, s, { hs: '--mh:' + HU[s.k] })) }));
    const SG = this.segList(P).map((s) => Object.assign({}, s, { hs: '--mh:' + s.h, cls: '' }));
    const segCols = ['Dom i noclegi', 'Firmy', 'Instytucje', 'Budownictwo'].map((g) => ({ n: g, items: SG.filter((s) => s.g === g) }));
    const now = new Date(), dow = now.getDay(), hr = now.getHours() + now.getMinutes() / 60;
    const open = dow >= 1 && dow <= 5 && hr >= 9 && hr < 17;
    const hours = { cls: open ? 'live' : 'live off', txt: open ? 'Otwarte teraz, do 17:00' : ((dow >= 1 && dow <= 4 && hr >= 17) || (dow >= 1 && dow <= 5 && hr < 9)) ? 'Zamknięte · otwieramy o 9:00' : 'Zamknięte · otwieramy w poniedziałek o 9:00' };
    const nk = this.navKey ? this.navKey() : '';
    const nav = { noc: nk === 'noc' ? 'on' : '', rl: nk === 'rl' ? 'on' : '', srw: nk === 'srw' ? 'on' : '', of: nk === 'of' ? 'on' : '', kt: nk === 'kt' ? 'on' : '', pr: nk === 'pr' ? 'on' : '', ar: nk === 'ar' ? 'on arn' : 'arn' };
    // Telefon jak aplikacja: dolny pasek kart; Usługi, Dla kogo i Więcej otwierają arkusz od dołu
    const openSheet = (t) => { const on = !(st.menu && st.mtab === t); try { document.documentElement.classList.toggle('pk-lock', on); } catch (e) {} self.setState({ menu: on, mtab: t, mega: false, hdrHide: false }); };
    const curTab = st.menu ? st.mtab : ({ usl: 'u', seg: 'o', noc: 'o', ar: 'm', rl: 'm', kt: 'm', of: 'm', pr: 'm', srw: 'm' }[nk] || '');
    const BN = [['Start', P.home, 'link', 'Main.dc.html', nk === 'home' && !st.menu], ['Usługi', P.net, 'u'], ['Zaplanuj', P.plane, 'mid', 'Zaplanuj.dc.html'], ['Dla kogo', P.users, 'o'], ['Więcej', 'M4 7h16M4 12h16M4 17h10', 'm']];
    const bnav = BN.map((b) => b[2] === 'link' || b[2] === 'mid'
      ? { link: true, btn: false, href: b[3], n: b[0], ic: b[1], cls: b[2] === 'mid' ? 'mid' : (b[4] ? 'act' : ''), cur: b[4] ? 'page' : 'false', go: null, exp: 'false' }
      : { link: false, btn: true, href: '', n: b[0], ic: b[1], cls: (curTab === b[2] ? 'act' : '') + (st.menu && st.mtab === b[2] ? ' open' : ''), cur: 'false', go: () => openSheet(b[2]), exp: st.menu && st.mtab === b[2] ? 'true' : 'false' });
    const mmore = [['Architekci.dc.html', 'Dla architektów', 'Współpraca, wytyczne do projektu, nowości', P.ruler], ['Realizacje.dc.html', 'Realizacje', 'Przykłady naszych montaży', P.eye], ['Serwis.dc.html', 'Serwis i przeglądy', 'Zgłoś awarię, przegląd, przejęcie instalacji', P.wrench], ['Poradnik.dc.html', 'Poradnik', 'Monitoring a RODO i inne', P.book], ['OFirmie.dc.html', 'O firmie', 'PRO-KOM od 2004 r., Rabka i Zakopane', P.shield], ['Kontakt.dc.html', 'Kontakt i dojazd', 'Telefon, e-mail, salony', P.pin], ['Oferta.dc.html', 'Pełna oferta', 'Wszystkie rozwiązania w jednym miejscu', P.layers]].map((m) => ({ href: m[0], n: m[1], s: m[2], ic: m[3] }));
    const ids = this.rvIds ? this.rvIds() : [];
    const rv = {}; ids.forEach((id) => { rv[id] = 'rv' + (st.allSeen || st.seen[id] ? ' on' : ''); });
    const FI = this.foldIds ? this.foldIds() : [], fold = {}, foldT = {}, foldTg = {};
    FI.forEach((k) => { const o = !!(st.fold || {})[k]; fold[k] = o ? '1' : '0'; foldT[k] = o ? 'Zwiń sekcję' : 'Pokaż całą sekcję'; foldTg[k] = () => { const f = Object.assign({}, st.fold); f[k] = !o; self.setState({ fold: f }); }; });
    return {
      K: { tel: '[TELEFON]', telH: 'tel:+48TELEFON', mail: '[E-MAIL]', mailH: 'mailto:E-MAIL', wa: '[WHATSAPP]', waH: 'https://wa.me/48WHATSAPP', adrZ: '[ADRES ZAKOPANE]', gw: '24 miesiące', re: 'do 24 h' }, pkSt: '', ctaBtn: 'Zaplanuj instalację · 2 minuty', ctaBtnHref: 'Zaplanuj.dc.html', P: P, SV: SV, offerN: (function () { const O = self.offer(); const i = O.reduce((n, a) => n + a.items.length, 0); return { a: O.length, i: i, iW: self.plw(i, 'rozwiązanie', 'rozwiązania', 'rozwiązań'), iWg: self.plw(i, 'rozwiązania', 'rozwiązań', 'rozwiązań') }; })(), theme: theme, isDark: theme === 'dark', isLight: theme === 'light',
      themeLabel: theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw',
      toggleTheme: () => { const t = theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('pk-theme', t); } catch (e) {} self.setState({ theme: t }); },
      mg: { uOn: st.mega === 'u', oOn: st.mega === 'o', uExp: st.mega === 'u' ? 'true' : 'false', oExp: st.mega === 'o' ? 'true' : 'false', uBtn: 'nbtn' + (st.mega === 'u' ? ' on' : '') + (nk === 'usl' ? ' cur' : ''), oBtn: 'nbtn' + (st.mega === 'o' ? ' on' : '') + (nk === 'seg' || nk === 'noc' ? ' cur' : ''), uOpen: () => { clearTimeout(self._mgT); if (st.mega !== 'u') self._mgAt = Date.now(); self.setState({ mega: 'u' }); }, oOpen: () => { clearTimeout(self._mgT); if (st.mega !== 'o') self._mgAt = Date.now(); self.setState({ mega: 'o' }); }, uTog: () => { clearTimeout(self._mgT); if (st.mega === 'u' && Date.now() - (self._mgAt || 0) > 600) self.setState({ mega: false }); else { self._mgAt = Date.now(); self.setState({ mega: 'u' }); } }, oTog: () => { clearTimeout(self._mgT); if (st.mega === 'o' && Date.now() - (self._mgAt || 0) > 600) self.setState({ mega: false }); else { self._mgAt = Date.now(); self.setState({ mega: 'o' }); } } },
      megaClose: () => { clearTimeout(self._mgT); self._mgT = setTimeout(() => self.setState({ mega: false }), 280); }, megaKeep: () => clearTimeout(self._mgT), megaShut: () => { clearTimeout(self._mgT); self.setState({ mega: false }); }, segCols: segCols, SG: SG, HU: HU,
      mtU: st.mtab !== 'o' && st.mtab !== 'm', mtO: st.mtab === 'o', mtM: st.mtab === 'm', mmore: mmore,
      mtabs: [['u', 'Usługi'], ['o', 'Dla kogo'], ['m', 'Więcej']].map((t) => { const on = (st.mtab === 'o' || st.mtab === 'm' ? st.mtab : 'u') === t[0]; return { n: t[1], on: on ? 'true' : 'false', cls: 'mtab' + (on ? ' on' : ''), pick: () => self.setState({ mtab: t[0] }) }; }),
      hdrCls: 'hdr' + (st.hdrHide && !st.menu ? ' hdrh' : ''), bnavCls: 'bnav' + (st.menu ? ' bnsh' : ''),
      fold: fold, foldT: foldT, foldTg: foldTg, megaCols: megaCols, svcNav: SV, nav: nav, hours: hours, bnav: bnav, rv: rv,
      menuOn: st.menu, menuExp: st.menu ? 'true' : 'false', toggleMenu: () => openSheet(st.menu ? st.mtab : (curTab && curTab !== 'm' ? curTab : 'u')), closeMenu: () => { try { document.documentElement.classList.remove('pk-lock'); } catch (e) {} self.setState({ menu: false }); },
      ctaEye: 'Zaplanuj instalację', ctaH: 'Powiedz, co planujesz. Przyjedziemy i wszystko policzymy.', ctaP: 'Wizja lokalna, projekt i wycena na piśmie. Potem montaż, szkolenie i serwis pod jednym numerem.'
    };
  }

  renderVals() {
    const c = this.common();
    const p = this.page(c.P, c);
    return Object.assign({}, c, p);
  }

  plw(n, a, b, c) { const d = n % 10, h = n % 100; return n === 1 ? a : (d >= 2 && d <= 4 && !(h >= 12 && h <= 14)) ? b : c; }

  norm(s) { const M = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' }; return (s || '').toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => M[c]).replace(/[^a-z0-9 ]+/g, ' ').trim(); }

  sub(c, o) {
    const ceny = this.props.ceny ?? false;
    const HU = this.hues();
    const sv = c.SV.find((s) => s.n === (o.hero || {}).crumb);
    const hue = sv ? HU[sv.k] : ((o.hero || {}).crumb === 'Obiekty noclegowe' ? '#F2B84B' : '#12B6D8');
    return {
      pkSt: '--h:' + hue,
      hero: Object.assign({ mid: true, midT: 'Usługi', midH: 'Main.dc.html#uslugi', cta: 'Zaplanuj instalację', ctaHref: 'Zaplanuj.dc.html' }, o.hero, { kv: (o.hero.kv || []).map((k) => ({ b: k[0], s: k[1] })), tags: (o.hero.tags || []).map((t) => ({ n: t })) }),
      anc: (o.anc || []).map((a) => ({ href: '#' + a[0], n: a[1] })),
      pkgs: (o.pkgs || []).map((p) => Object.assign({}, p, { pr: ceny ? p.pr : 'Cena po wizji lokalnej', hot: !!p.hot, badge: p.badge || 'Najczęściej wybierany', cls: 'card pkg ri' + (p.hot ? ' hot' : '') })),
      cena: o.cena || [], faq: this.faqList(o.faq || [], true),
      rel: c.SV.filter((s) => (o.rel || []).includes(s.k)).concat(o.relX || []),
      segRel: (o.segRel || []).map((k) => c.SG.find((g) => g.k === k)).filter(Boolean), hasSegRel: !!(o.segRel && o.segRel.length), segRelH: o.segRelH || 'Dla kogo robimy tę instalację',
      src: (o.src || []).map((s) => ({ t: s[0], href: s[1] })), hasSrc: !!(o.src && o.src.length),
      sx: (function (x) { x.cena = Object.assign({ btn: 'Wyślij zdjęcia do wyceny' }, x.cena || {}); return x; })(Object.assign({ faqA: { t: 'Masz inne pytanie?', d: 'Wyślij zdjęcie obiektu albo obecnej instalacji. Powiemy, od czego zacząć i czego się spodziewać.', cta: 'Zaplanuj instalację', href: 'Zaplanuj.dc.html' }, faqH: 'Zanim zadzwonisz.', relH: 'Połącz w jeden system.', pkg: { eye: 'Przykładowe zestawy', h: 'Od czego zwykle zaczynamy.', p: '', note: 'To przykłady. Ostateczny zakres i cenę ustalamy po wizji lokalnej i podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Co wpływa na cenę.', p: '' } }, o.sx || {}))
    };
  }

  faqList(arr, openFirst) { return arr.map((f, i) => ({ n: String(i + 1).padStart(2, '0'), q: f[0], a: f[1], open: !!openFirst && i === 0 })); }
