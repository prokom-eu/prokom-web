  sceneState(k) {
    const R = ['sal', 'kuch', 'syp', 'hol', 'laz', 'gab', 'tar', 'gar'];
    const S = {
      rano: { l: { kuch: 70, hol: 40, laz: 60 }, b: {}, t: 21, gate: false, al: '' },
      wyj: { l: {}, b: { sal: 50, syp: 50 }, t: 17, gate: false, al: 'UZBR' },
      kino: { l: { sal: 15 }, b: { sal: 100 }, t: 21, gate: false, al: '' },
      noc: { l: { hol: 5 }, b: { sal: 100, kuch: 100, syp: 100, laz: 100, gab: 100 }, t: 20, gate: false, al: 'NOC' },
      przyj: { l: { hol: 80, sal: 60, kuch: 40, tar: 60, gar: 70 }, b: {}, t: 21, gate: true, al: '' }
    }[k];
    const rs = {};
    R.forEach((r) => { rs[r] = { l: S.l[r] || 0, b: S.b[r] || 0, t: r === 'laz' ? S.t + 2 : (k === 'noc' && r === 'syp' ? 19 : S.t) }; });
    return { rs: rs, gate: S.gate, al: S.al, scene: k };
  }
  initState() { return Object.assign({ ax: 'sw', fail: false, rbs: ['g', 'e', 'g', 'c', 'e', 'g'], mo: 1, ck: [0, 1], sel: 'sal', off: false, touched: false, glass: 0, size: 1, mk: [0, 3] }, this.sceneState('przyj')); }
  navKey() { return 'usl'; }
  rvIds() { return ['cs', 'why', 'pan', 'int', 'hot', 'mod', 'et', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, SC = ['przyj', 'kino', 'noc', 'rano', 'wyj'], i = 0, R = ['sal', 'kuch', 'syp', 'hol'];
    this.every(3200, function () {
      if (self.state.touched) return;
      i = (i + 1) % SC.length;
      self.setState(Object.assign({ sel: R[i % R.length], off: i === 2 }, self.sceneState(SC[i])));
    });
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const G = { sal: ['Salon', 20, 20, 280, 210], kuch: ['Kuchnia', 300, 20, 150, 150], syp: ['Sypialnia', 450, 20, 170, 190], hol: ['Hol', 300, 170, 150, 130], laz: ['Łazienka', 450, 210, 170, 90], gab: ['Gabinet', 20, 230, 160, 150], tar: ['Taras', 180, 230, 120, 150], gar: ['Garaż', 300, 300, 320, 80] };
    const rooms = Object.keys(G).map((k) => {
      const g = G[k], s = st.rs[k];
      return { n: g[0], x: g[1], y: g[2], w: g[3], h: g[4], cx: g[1] + g[3] / 2, cy: g[2] + g[4] / 2, rx: g[3] * .55, ry: g[4] * .55, lst: 'opacity:' + (s.l / 100 * .95).toFixed(2), tx: g[1] + 12, ty: g[2] + 22, vy: g[2] + 44, t: k === 'tar' || k === 'gar' ? '' : s.t + '°', cls: 'shr' + (k === 'tar' ? ' ext' : ''), gcls: 'shg' + (st.sel === k ? ' sel' : ''), pick: () => touch({ sel: k }) };
    });
    const W = [['sal', 60, 14, 80, 8], ['sal', 180, 14, 80, 8], ['sal', 14, 80, 8, 80], ['kuch', 340, 14, 70, 8], ['syp', 490, 14, 90, 8], ['syp', 626, 70, 8, 90], ['laz', 626, 230, 8, 50], ['gab', 14, 270, 8, 70], ['gab', 60, 386, 80, 8]];
    const wins = W.map((w) => { const b = st.rs[w[0]].b / 100, hz = w[3] > w[4]; return { x: w[1], y: w[2], w: w[3], h: w[4], bw: hz ? (w[3] * b).toFixed(1) : w[3], bh: hz ? w[4] : (w[4] * b).toFixed(1) }; });
    const SCN = [['rano', 'Dzień dobry', P.sun], ['wyj', 'Wyjście', P.door], ['kino', 'Kino', P.tv], ['noc', 'Noc', P.moon], ['przyj', 'Przyjazd', P.car]];
    const sel = st.rs[st.sel];
    const upd = (f, v) => () => { const rs = Object.assign({}, st.rs); rs[st.sel] = Object.assign({}, sel, { [f]: v }); touch({ rs: rs, scene: '' }); };
    const NOTES = { rano: 'Dzień dobry: rolety w górę, światło w kuchni i łazience, ogrzewanie na 21°.', wyj: 'Wyjście: jednym przyciskiem gasną światła, przymykają się rolety, ogrzewanie schodzi do 17°, a alarm się uzbraja.', kino: 'Kino: salon przyciemniony do 15%, rolety zasłonięte, w pozostałych pomieszczeniach światło zgaszone.', noc: 'Noc: rolety zamknięte, w holu delikatne światło nocne, w sypialni 19°, alarm w trybie nocnym.', przyj: 'Przyjazd: brama otwiera się, w holu, salonie i garażu zapala się światło, dom jest nagrzany.' };
    const sh = {
      scenes: SCN.map((s) => ({ n: s[1], ic: s[2], on: st.scene === s[0] ? 'true' : 'false', cls: 'scp' + (st.scene === s[0] ? ' on' : ''), pick: () => touch(self.sceneState(s[0])) })),
      offCls: 'offb' + (st.off ? ' on' : ''), offOn: st.off ? 'true' : 'false', tOff: () => touch({ off: !st.off }),
      rooms: rooms, wins: wins, gate: { x: st.gate ? 400 : 400, w: st.gate ? 24 : 160 }, alCls: 'shal' + (st.al ? ' arm' : ''), alT: st.al || 'ALARM',
      sel: { n: G[st.sel][0], l: sel.l, b: sel.b, t: sel.t, lm: upd('l', Math.max(0, sel.l - 20)), lp: upd('l', Math.min(100, sel.l + 20)), bm: upd('b', Math.max(0, sel.b - 25)), bp: upd('b', Math.min(100, sel.b + 25)), tm: upd('t', sel.t - 1), tp: upd('t', sel.t + 1) },
      netCls: st.off ? 'off' : '', appS: st.off ? 'działa w sieci domowej, zdalnie czeka na internet' : 'połączona',
      note: (st.scene ? NOTES[st.scene] : 'Zmieniasz ustawienia ręcznie, a dom zapamiętuje je jako nową scenę, jeśli chcesz.') + (st.off ? ' Internet nie działa, ale sceny, panele i czujniki pracują lokalnie w budynku.' : '')
    };
    const GL = ['Czarne', 'Białe', 'Grafitowe'];
    const SZ = [[6, 3], [9, 3], [12, 4]];
    const IC = [['Światło', P.light], ['Rolety', P.blind], ['Ogrzew.', P.thermo], ['Scena', P.star], ['Brama', P.gate], ['Alarm', P.shield], ['Muzyka', P.music], ['Noc', P.moon], ['Wyjście', P.door], ['Taras', P.sun2], ['Kino', P.tv], ['Wentyl.', P.cloud]];
    const sz = SZ[st.size];
    const pn = {
      glass: GL.map((g, i) => ({ n: g, on: st.glass === i ? 'true' : 'false', cls: st.glass === i ? 'on' : '', pick: () => self.setState({ glass: i }) })),
      size: SZ.map((s, i) => ({ n: s[0] + ' pól', on: st.size === i ? 'true' : 'false', cls: st.size === i ? 'on' : '', pick: () => self.setState({ size: i }) })),
      cls: 'mdp c' + st.glass, gst: 'grid-template-columns:repeat(' + sz[1] + ',minmax(0,1fr))', label: 'PRZYKŁADOWY UKŁAD PANELU',
      icons: IC.slice(0, sz[0]).map((x, i) => ({ n: x[0], ic: x[1], cls: 'mdk' + (st.mk.includes(i) ? ' on' : ''), press: () => self.setState({ mk: st.mk.includes(i) ? st.mk.filter((y) => y !== i) : st.mk.concat([i]) }) }))
    };
    const AX = [
      ['sw', 'Oświetlenie', P.light, 'Światło', 'Od zwykłego włącznika po setki opraw w biurze. Każdy obwód może mieć scenę, harmonogram i czujnik ruchu.', ['Włączanie, ściemnianie i sceny jednym przyciskiem', 'Taśmy LED, kolory RGBW i płynne ściemnianie punktów LED', 'DALI do 64 opraw, każda osobno, także z regulacją barwy bieli', 'Światło według obecności, pory dnia i jasności za oknem', 'Symulacja obecności, gdy wyjeżdżasz'], 'Wieczorem ktoś wchodzi na schody', 'Zapala się delikatne światło i samo gaśnie po chwili', ['M-REL', 'M-DIM', 'M-OC', 'M-LED + S-LED', 'M-CON-DL-s'], ['DALI', 'Philips', 'OSRAM', 'Shelly'], 'W biurach i szkołach DALI pozwala utrzymywać stałe natężenie światła w lux.'],
      ['heat', 'Ogrzewanie i chłodzenie', P.thermo, 'Klimat', 'Temperatura w każdym pomieszczeniu osobno, razem z pompą ciepła, kotłem i klimatyzacją.', ['Grzejniki, podłogówka, kocioł gazowy i pompa ciepła', 'Strefy od 1 do 32 z harmonogramem dzień i noc', 'Obniżenie temperatury przy otwartym oknie i pod nieobecność', 'Klimatyzacja sterowana razem z ogrzewaniem', 'Ochrona przed zamarznięciem w pustym domu'], 'Otwierasz okno w sypialni', 'Grzejnik w tym pokoju przechodzi w tryb ochrony, a po zamknięciu wraca do pracy', ['M-RT-s', 'M-CON-HVAC-p', 'M-CON-485-s', 'M-SENS'], ['Panasonic', 'Daikin', 'Viessmann', 'Buderus', 'LG', 'Danfoss'], 'Pompa ciepła i klimatyzator łączą się przez Modbus albo bramkę HVAC. Model sprawdzamy w projekcie.'],
      ['air', 'Wentylacja i powietrze', P.cloud, 'Powietrze', 'Rekuperacja i czujniki pracują razem, więc wentylacja reaguje na to, co dzieje się w pomieszczeniu.', ['Sterowanie rekuperatorem z aplikacji i paneli', 'Biegi wentylacji według wilgotności i harmonogramu', 'Czujniki temperatury, wilgotności i ciśnienia', 'Napędy i zawory sterowane sygnałem 0–10 V'], 'Rośnie wilgotność w łazience', 'Rekuperator przechodzi na wyższy bieg, a potem wraca do normalnego', ['M-SENS', 'M-SENS-LITE', 'M-OUT', 'M-CON-485-s'], ['Thessla Green', 'Zehnder', 'Komfovent', 'Brink', 'Pro-Vent'], 'M-SENS-LITE mierzy temperaturę, wilgotność i ciśnienie.'],
      ['bl', 'Rolety, markizy i okna', P.blind, 'Osłony', 'Rolety, żaluzje i markizy chodzą według słońca i scen. Okna dachowe też da się podpiąć.', ['Harmonogram według wschodu i zachodu słońca', 'Wszystkie rolety naraz albo każda osobno', 'Zamknięcie rolet po wyjściu z domu', 'Markizy na tych samych wyjściach co rolety', 'Okna dachowe Velux i Fakro, stacja pogodowa'], 'Zachodzi słońce', 'Rolety na parterze zjeżdżają w dół, a w salonie zapala się światło', ['M-REL', 'WL-REL-ROL1p', 'M-IN'], ['Somfy', 'Selve', 'Fakro', 'Velux', 'Davis', 'Netatmo'], 'Według producenta automatyka rolet pomaga też utrzymać ciepło w domu.'],
      ['gate', 'Brama, furtka i zamki', P.gate, 'Wjazd', 'Brama i furtka otwierają się z telefonu, panelu albo same, gdy wracasz do domu.', ['Brama z aplikacji, panelu i pilota', 'Otwarcie przy podjeździe dzięki geolokalizacji telefonu', 'Powiadomienie, gdy brama zostanie otwarta', 'Zamki Gerda, Tedee i Shelly'], 'Zbliżasz się autem do domu', 'Otwiera się brama, a w garażu i na podjeździe zapala się światło', ['M-REL', 'M-IN', 'M-SERV'], ['Hörmann', 'Somfy', 'Gerda', 'Tedee', 'Shelly'], 'Geolokalizację ustawia się w aplikacji Ampio UNI jako strefę na mapie.'],
      ['al', 'Alarm i czujki', P.shield, 'Bezpieczeństwo', 'Alarm uzbraja się razem ze sceną Wyjście, a czujki zalania i dymu same reagują.', ['Własna centrala Ampio z 8 wejściami albo integracja z Satel Integra i Jablotron', 'Uzbrajanie i rozbrajanie z panelu kodem PIN i z aplikacji', 'Czujki zalania z zamknięciem zaworu wody', 'Czujki dymu i gazu z powiadomieniem na telefon (nie zastępują certyfikowanych czujek ani systemu sygnalizacji pożarowej)', 'Uzbrojenie razem ze sceną Wyjście'], 'Czujka zalania wykryje wodę', 'Zawór wody się zamyka, a Ty dostajesz powiadomienie na telefon', ['M-ALARM-8s', 'M-CON-232-s', 'M-CON-485-s', 'M-IN'], ['Satel', 'Jablotron', 'Bosch', 'DSC'], 'Centrala Ampio nie ma podanej klasy według normy EN 50131. Gdy wymaga jej ubezpieczyciel, montujemy alarm Satel i łączymy go z Ampio.'],
      ['acc', 'Dostęp i wideodomofon', P.key, 'Wejście', 'Karta albo kod zamiast klucza, a wideodomofon odbierasz w tej samej aplikacji.', ['Czytniki kart i klawiatury kodowe', 'Szklane panele z czytnikiem kart RFID', 'Wideodomofon w aplikacji Ampio UNI', 'Wejście do pokoju kartą lub kodem, bez recepcji'], 'Gość przykłada kartę do panelu', 'Zamek się otwiera, a w pokoju włącza się światło powitalne i ogrzewanie', ['M-CON-KEY-p', 'M-DOT-R14', 'M-DOT-R PRO', 'M-SERV-MINI-s'], ['Akuvox', 'DoorBird', 'Dahua', 'Vidiline'], 'Dla bezpieczeństwa zaczepem drzwi steruje moduł lokalnie, kartą lub kodem, a nie zdalnie z aplikacji.'],
      ['cam', 'Kamery w aplikacji', P.cam, 'Podgląd', 'Obraz z kamer widzisz w tej samej aplikacji, w której sterujesz domem.', ['Podgląd kamer w aplikacji Ampio UNI', 'Integracja z kamerami Hikvision, Dahua i TP-Link', 'Zdarzenie z alarmu może włączyć światło na posesji', 'Powiadomienia o ruchu i naruszeniu strefy'], 'Alarm wykryje ruch na posesji', 'Zapalają się lampy ogrodowe, a powiadomienie prowadzi do obrazu z kamery', ['M-SERV-s', 'M-SERV-MINI-s'], ['Hikvision', 'Dahua', 'TP-Link', 'Tiandy'], 'Nagrania zostają w rejestratorze. Ampio pokazuje obraz, nie zastępuje monitoringu.'],
      ['en', 'Energia i fotowoltaika', P.bolt, 'Energia', 'Zużycie prądu, wody i gazu na żywo, a urządzenia pracują wtedy, gdy panele dają nadwyżkę.', ['Pomiar prądu, wody i gazu z liczników', 'Dane z falownika i magazynu energii w aplikacji', 'Włączanie urządzeń przy nadwyżce z fotowoltaiki', 'W biurach osobne liczniki do rozliczania najemców'], 'Panele dają nadwyżkę prądu', 'Włącza się grzałka bojlera albo inne urządzenie, zamiast oddawać prąd do sieci', ['M-IN-IMP4s', 'M-CON-485-s', 'M-REL'], ['Huawei', 'Fronius', 'SMA', 'GoodWe', 'Eastron', 'F&F'], 'Ładowarek do aut na liście integracji producenta nie ma. Konkretny model sprawdzamy osobno.'],
      ['gar', 'Ogród, podlewanie i basen', P.leaf, 'Na zewnątrz', 'Podlewanie według pogody i wilgotności ziemi, oświetlenie ogrodu i obsługa basenu.', ['Strefy podlewania z czasem i intensywnością', 'Prognoza pogody, czujnik deszczu i wilgotności gleby', 'Oświetlenie ogrodu i podjazdu', 'Basen: filtracja, podgrzewanie, światło i pomiar wody'], 'Prognoza zapowiada deszcz', 'Podlewanie przesuwa się na inny dzień', ['M-REL', 'M-IN', 'M-IN-AD8s'], ['Festo', 'Danfoss', 'Bosch', 'Davis', 'Elsner'], 'Elektrozawory i czujniki są innych producentów. Ampio steruje nimi i zbiera dane.'],
      ['av', 'Muzyka i kino domowe', P.music, 'Multimedia', 'Scena Kino gasi światło i zasłania rolety, a muzyka gra w wybranych pomieszczeniach.', ['Scena Kino: światło, rolety, telewizor lub projektor jednym przyciskiem', 'Muzyka w kilku pomieszczeniach przez Sonos, HEOS albo MusicCast', 'Wzmacniacz Ampio z radiem FM do jednej strefy', 'Telewizory i projektory w scenach'], 'Włączasz scenę Kino', 'Światło schodzi do 15%, rolety zjeżdżają, a projektor i dźwięk się włączają', ['M-AV-AMP-s', 'M-CON-IR', 'M-CON-232-s'], ['Sonos', 'HEOS', 'MusicCast', 'Chromecast', 'LG', 'Epson'], 'Muzyka w wielu strefach idzie przez systemy audio tych marek. Sam wzmacniacz Ampio nie ma Bluetooth.'],
      ['app', 'Aplikacja, głos i sceny', P.star, 'Sterowanie', 'Jedna aplikacja dla domu i wszystkich obiektów, sceny, harmonogramy i sterowanie głosem.', ['Aplikacja Ampio UNI na telefon i tablet, z widżetami', 'Kilka obiektów w jednym telefonie, dostęp dla gości na czas', 'Sceny według godziny, słońca, obecności i zdarzeń', 'Głos przez standard Matter: Google, Amazon Alexa, Apple', 'Home Assistant, Node-RED, MQTT i REST API dla zaawansowanych'], 'Mówisz asystentowi „dobranoc”', 'Uruchamia się scena Noc: rolety w dół, światła gasną, alarm w trybie nocnym', ['M-SERV-s', 'M-SERV-MINI-s'], ['Matter', 'Home Assistant', 'Node-RED', 'MQTT'], 'Zakres urządzeń sterowanych głosem ustalamy w projekcie, bo zależy od Matter.']
    ];
    const ax0 = AX.find((a) => a[0] === st.ax) || AX[0];
    const ax = { areas: AX.map((a) => ({ n: a[1], ic: a[2], on: st.ax === a[0] ? 'true' : 'false', cls: 'axc' + (st.ax === a[0] ? ' on' : ''), pick: () => self.setState({ ax: a[0] }) })),
      k: 'ax' + ax0[0], n: ax0[1], ic: ax0[2], g: ax0[3], d: ax0[4], f: ax0[5], when: ax0[6], then: ax0[7], m: ax0[8], i: ax0[9], note: ax0[10] };
    const axb = [
      { ic: P.hotel, n: 'Hotel i pensjonat', f: ['Karta w kieszeni przy drzwiach włącza zasilanie pokoju', 'Panele M-DOT PRO z grawerem numeru pokoju i logo', 'Wejście kartą lub kodem, funkcje dla obsługi w aplikacji', 'Sceny dla sal: kolacja, konferencja, SPA'], s: 'Panele PRO zamawia się od 10 sztuk jednego wzoru.' },
      { ic: P.office, n: 'Biuro i firma', f: ['Klimat w strefach, który nadąża za zmianą aranżacji', 'Sala konferencyjna jednym przyciskiem: światło, rolety, ekran', 'Połączenie z kontrolą dostępu, alarmem i kamerami', 'Liczniki mediów do rozliczania najemców'], s: '' },
      { ic: P.town, n: 'Obiekt publiczny', f: ['Od jednej sali po kompleks budynków', 'Światło według obecności, pory dnia i natężenia w lux', 'Harmonogramy i tryby oszczędne po godzinach', 'Ampio steruje m.in. salą sesyjną Rady Miasta w Szczecinie'], s: 'To nie jest system przeciwpożarowy.' }
    ];
    const ints = [
      { n: 'Standardy', t: ['KNX', 'DALI', 'Modbus', 'Z-Wave', 'ZigBee', 'EnOcean', 'MQTT', 'REST API', 'Matter'] },
      { n: 'Alarmy i kamery', t: ['Satel', 'Jablotron', 'Dahua', 'Hikvision'] },
      { n: 'Domofony i zamki', t: ['Akuvox', 'DoorBird', 'Gerda', 'Tedee', 'Shelly'] },
      { n: 'Klimatyzacja', t: ['Daikin', 'LG', 'Samsung', 'Mitsubishi', 'Gree'] },
      { n: 'Rekuperacja', t: ['Thessla Green', 'Zehnder', 'Komfovent', 'Brink', 'Pro-Vent'] },
      { n: 'Pompy ciepła i kotły', t: ['Panasonic', 'LG', 'Daikin', 'Viessmann', 'Buderus', 'Stiebel'] },
      { n: 'Fotowoltaika', t: ['Huawei', 'Fronius', 'SMA', 'GoodWe', 'Sofar'] },
      { n: 'Audio', t: ['Sonos', 'Denon', 'HEOS', 'MusicCast', 'Chromecast'] },
      { n: 'Rolety, okna, bramy', t: ['Somfy', 'Selve', 'Fakro', 'Velux', 'Hörmann'] },
      { n: 'Liczniki i pogoda', t: ['Eastron', 'F&F', 'Apator', 'Davis', 'Netatmo'] },
      { n: 'Głos (przez Matter) i platformy', t: ['Apple', 'Google', 'Amazon Alexa', 'Home Assistant', 'Node-RED'] }
    ];
    const why = [
      { t: 'Polski producent', d: 'Ampio projektuje i produkuje system w Polsce. Marka działa od 1997 roku, system na magistrali CAN rozwija od 2007.' },
      { t: 'Działa w domu bez internetu', d: 'W sieci domowej aplikacja Ampio UNI steruje domem także wtedy, gdy nie ma internetu. Z zewnątrz potrzebny jest internet.' },
      { t: 'Przewodowa magistrala', d: 'Jedna skrętka łączy moduły, panele i czujniki. Przewód jest pewniejszy niż radio i nie potrzebuje baterii.' },
      { t: 'Rozbudowa w każdej chwili', d: 'Nowe moduły dokładamy do tej samej magistrali, bez wymiany tego, co już działa.' },
      { t: 'Bez abonamentu', d: 'Za sterowanie lokalne producent nie pobiera dziś opłat od właścicieli (stan na październik 2026). Zastrzega, że może się to zmienić.' }
    ];
    const fa = st.fail;
    const fl = { btn: fa ? 'Przywróć zasilanie' : 'Symuluj awarię', btnCls: 'btn btn-s ' + (fa ? 'btn-p' : 'btn-g'), toggle: () => self.setState({ fail: !fa }), cc: 'flc' + (fa ? ' bad' : ''),
      aTxt: fa ? 'Sterownik nie działa, więc stoją wszystkie pomieszczenia.' : 'Wszystko zależy od jednego urządzenia.', bTxt: fa ? 'Nie działa jeden moduł. Reszta domu pracuje normalnie.' : 'Każdy moduł działa samodzielnie.' };
    for (let i = 0; i < 6; i++) { fl['a' + i] = 'flrm' + (fa ? ' off' : ''); fl['b' + i] = 'flrm' + (fa && i === 4 ? ' off bad' : ''); }
    const RBS = { g: ['Gość w pokoju', '21°', 'wg gościa', 'komfort'], e: ['Pokój pusty', '17°', 'zgaszone', 'tryb eko'], c: ['Do sprzątania', '19°', 'włączone', 'obsługa'] };
    const NX = { g: 'e', e: 'c', c: 'g' };
    const rbs = st.rbs;
    const nE = rbs.filter((x) => x === 'e').length;
    const rb = { sum: nE + (nE === 1 ? ' pokój' : nE < 5 && nE > 1 ? ' pokoje' : ' pokoi') + ' w trybie eko',
      rooms: rbs.map((x, i) => ({ n: 'Pokój ' + (101 + i), st: RBS[x][0], t: RBS[x][1], l: RBS[x][2], x: RBS[x][3], cls: 'rbr ' + x, pick: () => { const a = rbs.slice(); a[i] = NX[x]; self.setState({ rbs: a }); } })) };
    const MO = [
      { n: 'Dom', title: 'Dom w Rabce', note: 'Wszyscy w domu · alarm rozbrojony', t: [['Salon', P.thermo, '21°', 'ogrzewanie', 1], ['Światło', P.light, '4', 'włączone', 1], ['Rolety', P.blind, 'Otwarte', 'parter', 0], ['Brama', P.gate, 'Zamknięta', 'wjazd', 0], ['Alarm', P.shield, 'Rozbrojony', 'dom', 0], ['Energia', P.bolt, '3,2 kW', 'z paneli PV', 1]] },
      { n: 'Zakopane 1', title: 'Apartament Zakopane 1', note: 'Gość przyjeżdża o 16:00 · ogrzewanie włączone', t: [['Salon', P.thermo, '21°', 'na przyjazd', 1], ['Sypialnia', P.thermo, '20°', 'na przyjazd', 1], ['Światło', P.light, 'Wył.', 'czeka na gościa', 0], ['Woda', P.drop, 'OK', 'czujnik zalania', 0], ['Drzwi', P.lock, 'Kod aktywny', '16:00–11:00', 1], ['Rolety', P.blind, 'Otwarte', 'salon', 0]] },
      { n: 'Zakopane 2', title: 'Apartament Zakopane 2', note: 'Pusty od 3 dni · tryb eko', t: [['Salon', P.thermo, '16°', 'tryb eko', 0], ['Sypialnia', P.thermo, '16°', 'tryb eko', 0], ['Światło', P.light, 'Wył.', 'symulacja obecności', 0], ['Woda', P.drop, 'OK', 'czujnik zalania', 0], ['Drzwi', P.lock, 'Zamknięte', 'brak rezerwacji', 0], ['Mróz', P.snow, '−9°', 'na zewnątrz', 1]] }
    ];
    const M = MO[st.mo];
    const mo = { title: M.title, note: M.note, k: 'mo' + st.mo, tabs: MO.map((o, i) => ({ n: o.n, cls: 'objb' + (st.mo === i ? ' on' : ''), pick: () => self.setState({ mo: i }) })), tiles: M.t.map((t) => ({ n: t[0], ic: t[1], v: t[2], s: t[3], cls: 'tile' + (t[4] ? ' on' : '') })) };
    const refs = [
      { n: 'Hotel Taaka Ryba, Sumina', d: 'Kiosk w lobby, sterowanie pokojem z panelu i aplikacji, puste pokoje w trybie oszczędnym (2023).' },
      { n: 'Citadines, Berlin', d: 'Czujniki obecności, alarmy o wyciekach i hałasie dla obsługi, montaż bez zamykania hotelu (2024).' },
      { n: 'Hotel Arche, Piła', d: 'Oświetlenie korytarzy i wentylacja sali konferencyjnej.' }
    ];
    const mods = [
      { ic: P.cpu, n: 'Serwer i aplikacja', d: 'Brama dla aplikacji Ampio UNI w domu i przez chmurę, integracje IP i wideodomofony.', m: ['M-SERV-s', 'M-SERV-MINI-s'] },
      { ic: P.light, n: 'Oświetlenie', d: 'Ściemniacze, taśmy LED, kolory RGBW i integracja z DALI.', m: ['M-DIM', 'M-OC', 'M-LED', 'M-CON-DL-s'] },
      { ic: P.blind, n: 'Rolety, żaluzje, brama', d: 'Wyjścia przekaźnikowe do napędów, także bezprzewodowy sterownik rolety.', m: ['M-REL', 'WL-REL-ROL1p'] },
      { ic: P.thermo, n: 'Ogrzewanie i chłodzenie', d: 'Regulacja w strefach (od 1 do 32), harmonogramy dzień i noc, klimatyzatory i Modbus.', m: ['M-RT-s', 'M-CON-HVAC-p', 'M-CON-485-s'] },
      { ic: P.cloud, n: 'Czujniki', d: 'Temperatura, wilgotność, światło, jakość powietrza, ruch i wejścia na kontaktrony lub czujki zalania.', m: ['M-SENS', 'WZ-PIR', 'M-IN'] },
      { ic: P.bolt, n: 'Energia', d: 'Wejścia impulsowe dla liczników prądu, wody i gazu, integracje falowników PV.', m: ['M-IN-IMP4s'] },
      { ic: P.grid, n: 'Panele szklane', d: 'Od 2 do 18 pól, z wyświetlaczem, z ekranem dotykowym, z czytnikiem RFID albo gestami.', m: ['M-DOT', 'M-DOT-T6', 'M-DOT-R14', 'M-DOT-GEST'] },
      { ic: P.layers, n: 'Integracje i alarm', d: 'Bramki do KNX, Z-Wave, EnOcean i podczerwieni, własna centrala alarmowa.', m: ['M-CON-KNX-s', 'M-CON-ZWAVE-s', 'M-ALARM-8s'] }
    ];
    const ET = [
      ['01', 'Rozmowa i potrzeby', 'Co ma się dziać w domu, kto w nim mieszka, co już jest.', 'Ty i my'],
      ['02', 'Projekt i dobór modułów', 'Rozmieszczenie paneli, czujników i odbiorników, schemat rozdzielnicy.', 'PRO-KOM'],
      ['03', 'Okablowanie przed tynkami', 'Magistrala do paneli, czujników i urządzeń do integracji.', 'PRO-KOM z elektrykiem'],
      ['04', 'Rozdzielnica i montaż', 'Moduły na szynie DIN, zasilacze z redundancją, panele i czujniki.', 'PRO-KOM'],
      ['05', 'Programowanie i sceny', 'Sceny, harmonogramy, automatyki i integracje.', 'PRO-KOM'],
      ['06', 'Szkolenie i aplikacja', 'Uczymy obsługi aplikacji. Zakres przekazania dostępów i uprawnień ustalamy w umowie.', 'Ty i my'],
      ['07', 'Serwis zdalny i rozbudowa', 'Zmiany scen zdalnie, nowe moduły w dowolnym momencie.', 'PRO-KOM']
    ];
    const et = ET.map((e) => ({ n: e[0], t: e[1], d: e[2], w: e[3] }));
    const CK = [
      ['Skrętka magistrali do każdego panelu', 'I do urządzeń, które chcesz połączyć: rekuperator, klimatyzacja, falownik.'],
      ['Głębsze puszki pod panele', 'Korpus panelu chowa się w ścianie na 22 mm, dlatego pod panel montuje się głęboką puszkę. Typ puszki podajemy w projekcie.'],
      ['Przewód do czujnika temperatury', 'Dwużyłowy, do najbliższego panelu lub modułu, czujnik na 120–150 cm.'],
      ['Większa rozdzielnica', 'Moduły Ampio montuje się na szynie DIN, potrzeba na nie miejsca.'],
      ['Dwa zasilacze z redundancją', 'Osobne zabezpieczenia, jeden buforowy, połączone modułem redundancji.'],
      ['Przewody do rolet i bramy', 'Każdy napęd osobno, żeby sterować nim z systemu.'],
      ['Zapasowy kabel magistrali', 'Opcjonalnie, na późniejszą rozbudowę.'],
      ['Miejsce na serwer i router', 'Serwer Ampio łączy się z siecią domową.']
    ];
    const ck = { items: CK.map((x, i) => ({ t: x[0], d: x[1], on: st.ck.includes(i) ? 'true' : 'false', cls: 'cki' + (st.ck.includes(i) ? ' on' : ''), pick: () => self.setState({ ck: st.ck.includes(i) ? st.ck.filter((y) => y !== i) : st.ck.concat([i]) }) })),
      bar: 'width:' + Math.round(st.ck.length / CK.length * 100) + '%', txt: st.ck.length === CK.length ? 'Komplet. Jesteś gotowy na smart home.' : 'Zaplanowane: ' + st.ck.length + ' z ' + CK.length };
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Smart home Ampio', eye: 'Inteligentny dom i automatyka budynku · Ampio · Podhale', h1a: 'Inteligentny dom, który działa', h1b: 'także bez internetu.', lead: 'Montujemy polski system Ampio w domach, apartamentach, pensjonatach i firmach. Światło, ogrzewanie, rolety, brama, alarm, kamery i energia w jednej aplikacji i na szklanych panelach. Sceny i czujniki działają lokalnie w budynku.', kv: [['1 aplikacja', 'Ampio UNI'], ['Bez abonamentu', 'za sterowanie lokalne (stan na 10.2026)'], ['Matter', 'Apple, Google, Alexa']], tags: ['Ampio', 'Pompa ciepła', 'Fotowoltaika', 'Nowy dom i remont'] },
      anc: [['co-sterujesz', 'Co sterujesz'], ['dlaczego', 'Dlaczego Ampio'], ['panele', 'Panele'], ['integracje', 'Integracje'], ['obiekty', 'Pensjonaty'], ['moduly', 'Moduły'], ['etapy', 'Kiedy zacząć'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.home, n: 'Start', d: 'Mieszkanie lub mały dom.', f: ['Oświetlenie i sceny', 'Rolety', 'Ogrzewanie w pomieszczeniach', 'Aplikacja Ampio UNI', 'Kilka paneli szklanych'], pr: 'od [CENA] zł' },
        { ic: P.home, n: 'Dom', d: 'Pełna automatyka nowego domu.', f: ['Wszystko z pakietu Start', 'Brama, furtka, alarm, kamery', 'Pompa ciepła i rekuperacja', 'Fotowoltaika i energia', 'Sceny Wyjście, Noc, Przyjazd'], pr: 'od [CENA] zł', hot: true },
        { ic: P.hotel, n: 'Pensjonat i apartamenty', d: 'Oszczędność w pustych pokojach.', f: ['Czujniki obecności', 'Ogrzewanie według rezerwacji', 'Powiadomienia o wyciekach', 'Panele z czytnikiem RFID', 'Zdalna obsługa'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.home, t: 'Wielkość budynku', d: 'Liczba pomieszczeń, obwodów oświetlenia i rolet.' },
        { ic: P.cpu, t: 'Moduły w rozdzielnicy', d: 'Ich liczba wynika z liczby odbiorników i czujników.' },
        { ic: P.grid, t: 'Panele i czujniki', d: 'Szklane panele M-DOT, czujniki ruchu, temperatury, obecności.' },
        { ic: P.layers, t: 'Integracje', d: 'Pompa ciepła, rekuperacja, alarm, kamery, brama, fotowoltaika.' },
        { ic: P.ruler, t: 'Etap budowy', d: 'Na etapie elektryki taniej niż w wykończonym domu.' },
        { ic: P.tool, t: 'Programowanie', d: 'Sceny, automatyki, aplikacja, późniejsze zmiany.' }
      ],
      faq: [
        ['Czy Ampio działa bez internetu?', 'Tak. Moduły, panele i czujniki pracują lokalnie w budynku, więc sceny i automatyki działają dalej. Internet jest potrzebny do sterowania z telefonu spoza domu.'],
        ['Czy smart home da się zrobić w domu, który już stoi?', 'Tak, w zakresie zależnym od instalacji elektrycznej. Moduły montujemy w rozdzielnicy, a tam, gdzie nie ma przewodów, łączymy urządzenia bezprzewodowe w standardach obsługiwanych przez Ampio, np. Z-Wave czy ZigBee.'],
        ['Czy jest abonament?', 'Sterowanie lokalne w budynku nie wymaga żadnych opłat. Czy i które usługi chmurowe producenta są płatne, potwierdzamy przy projekcie, zanim podpiszesz umowę.'],
        ['Czy połączę Ampio z Apple Home albo Google Home?', 'Tak, przez standard Matter na serwerze Ampio. Producent testował integrację z produktami Google, Amazon i Apple.'],
        ['Kiedy najlepiej planować smart home?', 'Przed rozpoczęciem instalacji elektrycznej. Wtedy przewody do paneli, czujników i rolet kładzie się razem z resztą, a rozdzielnica od razu ma miejsce na moduły.'],
        ['Co się stanie, gdy zepsuje się jeden moduł?', 'Przestają działać tylko funkcje tego modułu, a reszta domu pracuje normalnie, bo Ampio nie ma jednego centralnego sterownika.'],
        ['A gdy zabraknie prądu?', 'System wyłącza się jak zwykła instalacja i sam startuje po powrocie prądu. Jeśli ma działać przy awarii sieci, dokładamy zasilanie awaryjne.'],
        ['Czy zostaną zwykłe włączniki?', 'Można je zostawić w prostszych układach. Przy większej liczbie funkcji wygodniejsze są szklane panele dotykowe.'],
        ['Mam kilka apartamentów. Obsłużę je z jednego telefonu?', 'Tak. Aplikacja Ampio UNI przełącza się między instalacjami, a gościom albo obsłudze możesz dać dostęp na określony czas. Po zmianie obsługi zmieniamy też hasła lokalne.'],
        ['Czy alarm Ampio wystarczy dla ubezpieczyciela?', 'Nie zawsze. Producent nie podaje klasy centrali Ampio według normy EN 50131. Gdy ubezpieczyciel wymaga certyfikowanego alarmu, montujemy centralę Satel albo Jablotron i łączymy ją z Ampio, żeby alarm uzbrajał się razem ze sceną Wyjście.'],
        ['Kto zmieni scenę, gdy będę chciał coś inaczej?', 'My, często zdalnie. Proste zmiany, np. godziny harmonogramów, zrobisz sam w aplikacji.']
      ],
      segRel: ['dom', 'apt', 'hotel', 'pens'],
      rel: ['alarm', 'kam', 'ev'],
      src: [['Ampio, integracje', 'https://www.ampio.com/integracje'], ['Ampio Help, aplikacja Ampio UNI', 'https://help.ampio.com/en/guides/ampio-uni-mobile-application/'], ['Ampio Help, integracja z Matter', 'https://help.ampio.com/en/installer-tutorials/guide-to-integration-with-the-matter-standard/'], ['Ampio Help, Kreator Paneli', 'https://help.ampio.com/en/guides/ampio-panel-creator/'], ['Ampio, warunki gwarancji', 'https://help.ampio.com/en/legal-documents/warranty/'], ['Ampio, realizacja Citadines Berlin', 'https://ampio.com/projects/citadines-hotel-in-berlin'], ['Ampio, funkcje systemu', 'https://www.ampio.com/en/for-home/functionalities'], ['Ampio, hotele i restauracje', 'https://www.ampio.com/en/for-partners/industries/hotels-and-restaurants'], ['Ampio, biura', 'https://www.ampio.com/en/for-partners/industries/commercial-spaces'], ['Ampio, sektor publiczny', 'https://www.ampio.com/en/for-partners/industries/public-sector'], ['Ampio Help, M-ALARM-8s', 'https://help.ampio.com/en/modules/m-alarm-8s/'], ['Ampio Help, M-CON-KEY-p', 'https://help.ampio.com/en/modules/m-con-key-p/'], ['Ampio Help, M-CON-DL-s (DALI)', 'https://help.ampio.com/en/modules/m-con-dl-s/'], ['Ampio Help, M-DOT PRO', 'https://help.ampio.com/en/modules/m-dot-pro/'], ['Ampio Help, M-AV-AMP-s', 'https://help.ampio.com/en/modules/m-av-amp-s/']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Od kilku scen do pełnej automatyki.', p: 'Zakres rośnie razem z potrzebami. System da się rozbudować później.', note: 'To przykłady. Liczbę modułów, paneli i integracji ustalamy w projekcie, a cenę podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena smart home.', p: 'Najtaniej jest zaplanować automatykę razem z elektryką. Wyślij projekt domu albo rzut (albo zdjęcia, jeśli dom już stoi), a przygotujemy wstępną wycenę.', btn: 'Wyślij projekt lub rzut' }, relH: 'Ampio łączy się z resztą instalacji.' }
    }), { sh: sh, pn: pn, ax: ax, axb: axb, ints: ints, et: et, why: why, fl: fl, rb: rb, mo: mo, refs: refs, mods: mods, ck: ck, ctaEye: 'Smart home Ampio', ctaH: 'Budujesz albo remontujesz? Zaplanujmy automatykę razem z elektryką.', ctaP: 'Projekt, rozdzielnica, montaż, programowanie scen i szkolenie. Potem opieka i zmiany zdalnie.' });
  }
