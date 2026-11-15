  initState() { return { path: 0, bat: 60, rg: 1, pw: 2, obc: 1, winter: true, touched: false, anim: 0, sh: 0, shT: false, cm: 1, hp: 1, ho: 0, wp: 1, wk: 1, wo: 0, wm: 0, wc: 1, cp: 1, ck: 1, co: 0 }; }
  navKey() { return 'usl'; }
  rvIds() { return ['of', 'model', 'dev', 'kalk', 'form', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this;
    this.every(900, function () { self.setState({ anim: (self.state.anim + 1) % 12 }); });
    this.every(4600, function () { if (self.state.shT) return; self.setState({ sh: (self.state.sh + 1) % 3 }); });
    this.every(5200, function () { if (self.state.touched) return; var p = (self.state.path + 1) % 3; self.setState({ path: p, pw: [2, 3, 3][p], obc: [1, 1, 2][p] }); });
  }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ touched: true }, o));
    const nf = (x) => String(x).replace('.', ',');
    const IMG = ['ev/home.webp', 'ev/wall.webp', 'ev/city.webp'];
    const M = [
      { n: 'CC Home', k: 'Dom i garaż', who: 'Dom, garaż, wiata', alt: 'Ładowarka Elzab EcoPower CC Home, okrągła, naścienna, z przewodem', d: 'Okrągła ładowarka do garażu. Podłączasz auto i ładujesz, bez kart i aplikacji.', pw: '3,7–11 kW', pwS: '1 punkt ładowania', sp: [['Moc', '3,7 / 7,4 / 11 kW'], ['Obudowa', 'IP44, IK08'], ['Wyjście', 'gniazdo lub przewód 5 m']], f: ['1 faza 3,7 lub 7,4 kW albo 3 fazy 11 kW', 'Montaż na ścianie w garażu lub pod wiatą', 'Tryb domowy: bez autoryzacji, status na diodzie LED', 'Średnica 361 mm, masa 5 kg'], v: ['3,7 kW', '7,4 kW', '11 kW'], ic2: 'evi evi-h' },
      { n: 'CC Wall', k: 'Firma i obiekt', who: 'Pensjonat, hotel, firma, flota', alt: 'Ładowarka Elzab EcoPower CC Wall, biała obudowa z czarnym frontem', d: 'Ładowarka ścienna na jedno albo dwa auta. Dostęp na kartę RFID lub w aplikacji, na ścianę albo na podstawę.', pw: 'do 2×22 kW', pwS: '1 lub 2 punkty ładowania', sp: [['Moc', 'od 1×11 do 2×22 kW'], ['Obudowa', 'IP54, IK10'], ['Dostęp', 'RFID, aplikacja']], f: ['Od 1×11 do 2×22 kW, gniazdo lub wtyk Typ 2', 'Na ścianę albo na dedykowaną podstawę', 'Karty RFID, aplikacja, OCPP, dzielenie mocy', 'Osobne zabezpieczenia każdego punktu'], v: ['1×11 kW', '2×22 kW', '6 kolorów'], ic2: 'evi evi-w' },
      { n: 'CC City', k: 'Parking', who: 'Parking hotelu, firmy, sklepu', alt: 'Wolnostojąca stacja ładowania Elzab EcoPower CC City', d: 'Wolnostojąca stacja na parking. Dwa auta naraz, licznik MID i połączenie z systemem rozliczeń.', pw: 'do 2×22 kW', pwS: '1 lub 2 punkty ładowania', sp: [['Moc', 'od 1×11 do 2×22 kW'], ['Licznik', 'MID'], ['Łączność', 'GSM, OCPP']], f: ['Od 1×11 do 2×22 kW, gniazdo lub przewód Typ 2', 'Stal ocynkowana, malowana proszkowo, IP54, IK10', 'RFID, aplikacja albo plug & charge', 'Licznik MID, łączność GSM, OCPP 1.5/1.6'], v: ['1 punkt', '2 punkty', 'MID'], ic2: 'evi evi-c' }
    ];
    const shTo = (i) => self.setState({ sh: i, shT: true });
    const cfgTo = (i) => self.setState({ cm: i, sh: i, shT: true });
    const S = M[st.sh];
    const sh = {
      tabs: M.map((m, i) => ({ n: m.n, on: st.sh === i ? 'true' : 'false', cls: st.sh === i ? 'on' : '', pick: () => shTo(i) })),
      items: M.map((m, i) => ({ src: IMG[i], alt: m.alt, cls: m.ic2 + (st.sh === i ? ' on' : '') })),
      k: S.k, n: S.n, d: S.d, pw: S.pw, pwS: S.pwS, sp: S.sp.map((x) => ({ k: x[0], v: x[1] })), go: () => cfgTo(st.sh)
    };
    const prods = M.map((m, i) => ({ n: m.n, k: m.k, who: m.who, d: m.d, pw: m.pw, pwS: m.pwS, f: m.f, v: m.v, src: IMG[i], alt: m.alt, ic2: m.ic2, cls: 'card evcard ri' + (i === 1 ? ' hot' : ''), go: () => cfgTo(i) }));
    const extras = [
      { ic: P.build, t: 'Podstawa do CC Wall', d: 'Ładowarka ścienna staje na parkingu bez ściany.' },
      { ic: P.plug, t: 'Przewód 7,5 m', d: 'Do CC Wall, w wersji 1- lub 3-fazowej.' },
      { ic: P.card, t: 'Karty RFID', d: 'Dla gości, pracowników i floty.' },
      { ic: P.cloud, t: 'Rozliczanie ładowania', d: 'OCPP i aplikacja, gdy ładowanie ma być płatne.' }
    ];
    // Konfigurator
    const PH = { 3.7: ['1 faza', 16], 7.4: ['1 faza', 32], 11: ['3 fazy', 16], 22: ['3 fazy', 32] };
    const opt = (l, key, arr) => ({ l: l, ch: arr.map((n, i) => ({ n: n, on: st[key] === i ? 'true' : 'false', cls: st[key] === i ? 'on' : '', pick: () => self.setState({ [key]: i }) })) });
    const COLS = [['Czarny', '#1E2224'], ['Biały', '#F4F5F2'], ['Szary', '#8E9599'], ['Niebieski', '#2F5E9E'], ['Zielony', '#5D9E46'], ['Brązowy', '#7A5638']];
    let cf;
    if (st.cm === 0) {
      const kw = [3.7, 7.4, 11][st.hp], ph = PH[kw];
      cf = { opts: [opt('Moc', 'hp', ['3,7 kW', '7,4 kW', '11 kW']), opt('Wyjście', 'ho', ['Gniazdo Typ 2', 'Przewód 5 m'])],
        title: 'CC Home · ' + nf(kw) + ' kW · ' + ['gniazdo Typ 2', 'przewód 5 m'][st.ho],
        out: [['Moc ładowania', nf(kw) + ' kW'], ['Zasilanie', ph[0] + ', ' + ph[1] + ' A'], ['Montaż', 'na ścianie, wewnątrz lub pod wiatą'], ['Obudowa', 'IP44, IK08, −25 do +40°C'], ['Dostęp', 'tryb domowy, bez autoryzacji'], ['Wymiary', 'Ø361 mm, 5 kg']],
        inst: kw === 11 ? 'Potrzebne zasilanie trójfazowe. Sprawdzimy, czy przyłącze ma zapas ok. 16 A na każdej fazie.' : 'Wystarczy zasilanie jednofazowe. Sprawdzimy, czy przyłącze ma zapas ok. ' + ph[1] + ' A na fazie, z której zasilimy ładowarkę.',
        href: 'Zaplanuj.dc.html#obiekt=dom&uslugi=ev' };
    } else if (st.cm === 1) {
      const n = st.wp + 1, kw = [11, 22][st.wk], ph = PH[kw];
      cf = { opts: [opt('Punkty ładowania', 'wp', ['1 auto', '2 auta naraz']), opt('Moc na punkt', 'wk', ['11 kW', '22 kW']), opt('Wyjście', 'wo', ['Gniazdo Typ 2', 'Przewód 7,5 m']), opt('Montaż', 'wm', ['Na ścianę', 'Na podstawie'])],
        title: 'CC Wall · ' + n + '×' + kw + ' kW · ' + ['gniazdo', 'przewód 7,5 m'][st.wo] + ' · ' + ['na ścianę', 'na podstawie'][st.wm],
        out: [['Moc ładowania', n + '×' + kw + ' kW'], ['Zasilanie', '3 fazy, ' + (n > 1 ? '2×' : '') + ph[1] + ' A'], ['Montaż', ['na ścianie', 'na dedykowanej podstawie'][st.wm]], ['Obudowa', 'IP54, IK10, −25 do +40°C'], ['Dostęp', 'karta RFID, aplikacja'], ['Wymiary', '688×452×238 mm, 39 kg']],
        inst: 'Do pełnej mocy przyłącze potrzebuje zapasu ok. ' + ph[1] * n + ' A na fazę. ' + (n > 1 ? 'Gdy go brakuje, dzielenie mocy rozkłada prąd między oba auta.' : 'Gdy go brakuje, ustawiamy niższą moc ładowania.'),
        href: 'Zaplanuj.dc.html#obiekt=firma&uslugi=ev' };
      cf.cols = COLS.map((x, i) => ({ n: x[0], st: 'background:' + x[1], on: st.wc === i ? 'true' : 'false', cls: 'evswb' + (st.wc === i ? ' on' : ''), pick: () => self.setState({ wc: i }) }));
      cf.colN = COLS[st.wc][0]; cf.colSt = 'background:' + COLS[st.wc][1];
    } else {
      const n = st.cp + 1, kw = [11, 22][st.ck], ph = PH[kw];
      cf = { opts: [opt('Punkty ładowania', 'cp', ['1 auto', '2 auta naraz']), opt('Moc na punkt', 'ck', ['11 kW', '22 kW']), opt('Wyjście', 'co', ['Gniazdo Typ 2', 'Przewód Typ 2'])],
        title: 'CC City · ' + n + '×' + kw + ' kW · ' + ['gniazdo', 'przewód'][st.co],
        out: [['Moc ładowania', n + '×' + kw + ' kW'], ['Zasilanie', '3 fazy, ' + (n > 1 ? '2×' : '') + ph[1] + ' A'], ['Montaż', 'wolnostojąca, na fundamencie'], ['Licznik', 'MID'], ['Łączność', 'GSM, OCPP 1.5/1.6, Modbus RS485'], ['Wymiary', '1360×262×217 mm, 60 kg']],
        inst: 'Do stacji prowadzimy zasilanie w ziemi i robimy fundament. Do pełnej mocy przyłącze potrzebuje zapasu ok. ' + ph[1] * n + ' A na fazę, a przy kilku stacjach ustawiamy dzielenie mocy.',
        href: 'Zaplanuj.dc.html#obiekt=pens&uslugi=ev' };
    }
    Object.assign(cf, {
      models: M.map((m, i) => ({ n: m.n, on: st.cm === i ? 'true' : 'false', cls: st.cm === i ? 'on' : '', pick: () => self.setState({ cm: i }) })),
      opts: cf.opts, out: cf.out.map((x) => ({ k: x[0], v: x[1] })), src: IMG[st.cm], alt: M[st.cm].alt, icls: M[st.cm].ic2 + ' on', n: M[st.cm].n,
      wall: st.cm === 1, cols: cf.cols || [], colN: cf.colN || '', colSt: cf.colSt || ''
    });
    // Kalkulator
    const PATHS = [['Dom', P.home, 'Elzab CC Home'], ['Obiekt z gośćmi', P.bed, 'Elzab CC Wall'], ['Parking obiektu', P.car, 'Elzab CC City']];
    const RG = [[20, 80, '20 → 80%'], [10, 100, '10 → 100%'], [40, 80, '40 → 80%']];
    const PW = [[3.7, '3,7 kW'], [7.4, '7,4 kW'], [11, '11 kW'], [22, '22 kW']];
    const OBC = [[7.4, '7,4 kW'], [11, '11 kW'], [22, '22 kW']];
    const PHT = { 3.7: '1 faza, 16 A', 7.4: '1 faza, 32 A', 11: '3 fazy, 16 A', 22: '3 fazy, 32 A' };
    if (st.path === 0 && st.pw > 2) st.pw = 2;
    const r = RG[st.rg], pw = PW[st.pw][0], ob = OBC[st.obc][0];
    const eff = Math.min(pw, ob);
    const kwh = st.bat * (r[1] - r[0]) / 100;
    const hrs = kwh / eff;
    const hh = Math.floor(hrs), mm = Math.round((hrs - hh) * 60);
    const prog = st.anim / 11;
    const pct = Math.round(r[0] + (r[1] - r[0]) * prog);
    const flakes = [];
    for (let i = 0; i < 26; i++) flakes.push({ x: (i * 53) % 640, y: (i * 37) % 120, r: 1.2 + (i % 3) * .6, st: 'animation-duration:' + (5 + (i % 5)) + 's;animation-delay:-' + (i % 7) + 's' });
    let note = 'Czas liczymy jako energia ÷ moc. W praktyce bywa trochę dłużej: auto zwalnia ładowanie pod koniec, a część energii idzie na straty. Auto pobiera tyle, ile pozwala jego ładowarka pokładowa.';
    if (st.path === 0) note = 'Elzab CC Home ładuje z mocą do 11 kW (3 fazy). Do 22 kW potrzebna jest ładowarka CC Wall. ' + note;
    if (pw > ob) note = 'Twoje auto przyjmie najwyżej ' + nf(ob) + ' kW prądu przemiennego, więc mocniejsza ładowarka nie przyspieszy ładowania. Przyda się za to przy kolejnym aucie albo dwóch autach naraz. ' + note;
    const ev = {
      paths: PATHS.map((p, i) => ({ n: p[0], ic: p[1], on: st.path === i ? 'true' : 'false', cls: st.path === i ? 'on' : '', pick: () => touch({ path: i, pw: [2, 3, 3][i], obc: [1, 1, 2][i] }) })),
      dev: PATHS[st.path][2], scls: 'evs', winter: st.winter, flakes: flakes,
      kwTxt: nf(eff) + ' kW', pct: pct, fillSt: 'width:' + (178 * pct / 100).toFixed(0) + 'px',
      bat: st.bat, onBat: (e) => touch({ bat: +((e && e.target && e.target.value) || 60) }),
      ranges: RG.map((x, i) => ({ n: x[2], on: st.rg === i ? 'true' : 'false', cls: st.rg === i ? 'on' : '', pick: () => touch({ rg: i }) })),
      pw: PW.map((x, i) => { const dis = st.path === 0 && i > 2; return { n: x[1], on: st.pw === i ? 'true' : 'false', dis: dis ? 'true' : '', tip: dis ? 'CC Home: maks. 11 kW' : '', cls: (st.pw === i ? 'on' : '') + (dis ? ' xc-dis' : ''), pick: () => { if (!dis) touch({ pw: i }); } }; }),
      obc: OBC.map((x, i) => ({ n: x[1], on: st.obc === i ? 'true' : 'false', cls: st.obc === i ? 'on' : '', pick: () => touch({ obc: i }) })),
      time: hh + ' h ' + String(mm).padStart(2, '0') + ' min', kwh: kwh.toFixed(1).replace('.', ','), eff: nf(eff), phase: PHT[pw], note: note
    };
    const kTips = ['Do ładowania nocą w domu zwykle wystarcza 7,4 albo 11 kW.', 'Mocniejsza ładowarka nie przyspieszy auta, które przyjmuje mniej.', '22 kW ma sens przy dwóch autach, flocie albo krótkich postojach gości.'];
    const devt = [
      { k: 'Dla kogo', a: 'dom, garaż, wiata', b: 'firma, pensjonat, hotel, flota', c: 'parking hotelu, firmy, sklepu' },
      { k: 'Moc', a: '3,7 / 7,4 kW (1 faza) lub 11 kW (3 fazy)', b: 'od 1×11 do 2×22 kW', c: 'od 1×11 do 2×22 kW' },
      { k: 'Punkty ładowania', a: '1', b: '1 lub 2', c: '1 lub 2' },
      { k: 'Wyjście', a: 'gniazdo Typ 2 lub przewód 5 m', b: 'gniazdo lub wtyk Typ 2, opcja przewód 7,5 m', c: 'gniazdo lub przewód Typ 2' },
      { k: 'Montaż', a: 'naścienny, wewnątrz lub pod wiatą', b: 'ściana lub dedykowana podstawa', c: 'wolnostojąca, na fundamencie' },
      { k: 'Szczelność i odporność', a: 'IP44, IK08', b: 'IP54, IK10', c: 'IP54, IK10' },
      { k: 'Dostęp', a: 'tryb domowy, bez autoryzacji', b: 'karta RFID, aplikacja', c: 'karta RFID, aplikacja, plug & charge' },
      { k: 'Łączność i OCPP', a: '—', b: 'OCPP, praca offline lub online', c: 'GSM, OCPP 1.5/1.6, Modbus RS485' },
      { k: 'Dzielenie mocy', a: '—', b: 'tak (DLM)', c: 'tak' },
      { k: 'Licznik MID', a: '—', b: 'zależnie od wersji', c: 'tak' },
      { k: 'Wymiary i masa', a: 'Ø361 mm, 5 kg', b: '688×452×238 mm, 39 kg', c: '1360×262×217 mm, 60 kg' },
      { k: 'Obudowa', a: 'poliwęglan i metal', b: 'kilka kolorów do wyboru', c: 'stal ocynkowana, malowana proszkowo' },
      { k: 'Temperatura pracy', a: '−25 do +40°C', b: '−25 do +40°C', c: '−25 do +40°C' }
    ];
    const form = [
      { ic: P.bolt, t: 'Moc przyłącza', d: 'Sprawdzamy rozdzielnicę i moc umowną. 11 kW wymaga trzech faz. Gdy mocy jest mało, ustawiamy niższą moc albo dzielenie mocy między stacje.', s: 'Wycenę zaczynamy od zdjęcia rozdzielnicy i licznika.' },
      { ic: P.shield, t: 'Badanie UDT', d: 'Ustawa o elektromobilności (art. 16) przewiduje badanie UDT przed oddaniem stacji do eksploatacji, także po naprawie lub modernizacji. Czy dotyczy Twojej ładowarki, zależy m.in. od tego, kto z niej korzysta. Sprawdzamy to przy projekcie i pomagamy w zgłoszeniu.', s: '' },
      { ic: P.users, t: 'Ładowarka w bloku i we wspólnocie', d: 'W budynku z więcej niż trzema lokalami mieszkalnymi potrzebna jest zgoda zarządcy. Zarządca w 30 dni od wniosku zleca ekspertyzę (nie trzeba jej, gdy budynek ma instalację pod ładowarki), a wniosek rozpatruje w 30 dni od jej otrzymania. We wspólnocie mieszkaniowej zgoda na punkt ładowania o mocy mniejszej niż 11 kW jest czynnością zwykłego zarządu.', s: '' },
      { ic: P.globe, t: 'Stacja ogólnodostępna', d: 'Stację dostępną dla wszystkich kierowców realizujemy na zapytanie, z partnerem, który zostaje operatorem stacji, rejestruje ją w Ewidencji Infrastruktury Paliw Alternatywnych (EIPA) i rozlicza ładowanie.', s: '' }
    ];
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Ładowarki samochodów', eye: 'Elzab EcoPower · dom, firma, parking · Podhale', h1a: 'Ładowarki Elzab EcoPower.', h1b: 'Od garażu po parking.', lead: 'Cała oferta ładowarek polskiego producenta Elzab: CC Home do garażu, CC Wall dla firm i obiektów z gośćmi, CC City na parking. Dobieramy moc do przyłącza, montujemy, uruchamiamy i pomagamy w formalnościach.', cta: 'Dobierz ładowarkę', ctaHref: '#model', kv: [['3,7–22 kW', 'moc ładowania AC'], ['1 lub 2', 'auta ładowane naraz'], ['24 mies.', 'gwarancji PRO-KOM na montaż']], tags: ['CC Home', 'CC Wall', 'CC City', 'Produkcja w Polsce'] },
      anc: [['oferta', 'Oferta'], ['model', 'Dobór wersji'], ['urzadzenia', 'Porównanie'], ['kalkulator', 'Kalkulator'], ['formalnosci', 'Formalności'], ['pakiety', 'Zestawy'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.home, n: 'Dom', d: 'Ładowarka w garażu lub pod wiatą.', f: ['Elzab CC Home 3,7, 7,4 lub 11 kW', 'Przewód z rozdzielnicy i zabezpieczenia', 'Dobór mocy do przyłącza', 'Uruchomienie i test', 'Porada w sprawie taryfy'], pr: 'od [CENA] zł z montażem' },
        { ic: P.bed, n: 'Pensjonat, hotel, firma', d: 'Ładowanie dla gości lub floty.', f: ['Elzab CC Wall, 1 lub 2 punkty', 'Karty RFID dla gości', 'Dzielenie mocy przy kilku stacjach', 'Pomoc w sprawie UDT', 'Oznakowanie miejsc'], pr: 'od [CENA] zł z montażem', hot: true },
        { ic: P.car, n: 'Parking obiektu', d: 'Stacja dla gości i klientów hotelu lub firmy.', f: ['Elzab CC City z licznikiem MID', 'Fundament i zasilanie', 'Rozliczanie w aplikacji (OCPP), jeśli ładowanie ma być płatne', 'Pomoc w sprawie badania UDT', 'Serwis'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.bolt, t: 'Model i moc', d: 'CC Home, CC Wall czy CC City, liczba punktów i moc na punkt.' },
        { ic: P.ruler, t: 'Odległość od rozdzielnicy', d: 'Długość i przekrój przewodu, trasa, przekopy.' },
        { ic: P.cpu, t: 'Rozdzielnica', d: 'Nowe zabezpieczenia, ewentualnie rozbudowa rozdzielnicy.' },
        { ic: P.plug, t: 'Moc przyłącza', d: 'Zwiększenie mocy u operatora albo dzielenie mocy.' },
        { ic: P.build, t: 'Montaż', d: 'Ściana, podstawa albo fundament pod stację wolnostojącą.' },
        { ic: P.doc, t: 'Formalności', d: 'Zgłoszenie do UDT, uzgodnienia ze wspólnotą.' }
      ],
      faq: [
        ['Którą ładowarkę Elzab wybrać?', 'Do domu zwykle CC Home: prosta, bez kart i aplikacji. Gdy z ładowarki korzystają goście, pracownicy albo dwa auta naraz, lepsza jest CC Wall z kartami RFID. Na otwarty parking hotelu czy firmy najlepiej pasuje wolnostojąca CC City z licznikiem MID.'],
        ['Jaką moc ładowarki wybrać do domu?', 'Zależy od auta i przyłącza. Do ładowania nocą zwykle wystarcza 7,4 albo 11 kW. Nie ma sensu płacić za 22 kW, jeśli auto przyjmuje 11 kW, chyba że planujesz dwa auta albo zmianę samochodu.'],
        ['Czy montujecie samą ładowarkę?', 'Tak. Możesz zamówić u nas samą ładowarkę Elzab EcoPower z montażem, bez innych instalacji. Jeśli planujesz też okablowanie, kamery czy smart home, przewód do ładowarki poprowadzimy przy okazji.'],
        ['Czy ładowanie dla gości da się rozliczać?', 'Tak. CC City i wersje CC Wall z OCPP można połączyć z systemem operatora, który rozlicza ładowanie w aplikacji. Prostsza opcja to karty RFID tylko dla Twoich gości, a koszt ładowania doliczasz do pobytu.'],
        ['Czy ładowarka dla gości pensjonatu wymaga UDT?', 'Ustawa przewiduje badanie UDT dla stacji ładowania przed oddaniem do eksploatacji, a nie ma jednoznacznego stanowiska, jak traktować ładowarki dla gości. Sprawdzamy to przy projekcie i pomagamy w zgłoszeniu.'],
        ['Czy ładowarka działa w mróz?', 'Ładowarki Elzab EcoPower mają zakres pracy od −25°C. Zimą auto ładuje się wolniej przy zimnej baterii, a zasięg wyraźnie spada, zwłaszcza w mrozie.'],
        ['Mieszkam w bloku. Mogę mieć ładowarkę?', 'Tak, ale w budynku z więcej niż trzema lokalami mieszkalnymi trzeba złożyć wniosek do zarządcy. We wspólnocie mieszkaniowej zgoda na punkt ładowania o mocy mniejszej niż 11 kW jest czynnością zwykłego zarządu. Pomożemy przygotować dokumenty.'],
        ['Jaką gwarancję dostanę?', 'Na montaż dajemy 24 miesiące gwarancji PRO-KOM, a ładowarki mają gwarancję producenta. Na zgłoszenie odpowiadamy do 24 h w dni robocze: oddzwonimy albo odpiszemy.'],
        ['Czy ładowarka współpracuje z fotowoltaiką?', 'Ładowanie można zaplanować na godziny produkcji z paneli. Czy ładowarka sama dopasuje moc do nadwyżki prądu, zależy od modelu i falownika. Sprawdzamy to przy doborze.']
      ],
      segRel: ['dom', 'pens', 'hotel', 'firma'],
      rel: ['smart', 'wifi', 'tel'],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Ładowarka z montażem i formalnościami.', p: 'Cena zależy głównie od modelu, odległości od rozdzielnicy i stanu przyłącza.', note: 'Do wyceny wystarczą zdjęcia rozdzielnicy, licznika i miejsca montażu. Ostateczną cenę podajemy na piśmie.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena ładowarki.', p: 'Sama ładowarka to tylko część kosztu. Resztę robi przewód, rozdzielnica i formalności.' }, relH: 'Ładowarka w systemie budynku.' }
    }), { ev: ev, sh: sh, prods: prods, extras: extras, cf: cf, kTips: kTips, devt: devt, form: form, ctaEye: 'Ładowarki Elzab EcoPower na Podhalu', ctaH: 'Wyślij zdjęcie rozdzielnicy. Powiemy, którą ładowarkę da się podłączyć.', ctaP: 'Dobór modelu i mocy, montaż, uruchomienie i pomoc w formalnościach. W domu, pensjonacie, hotelu i firmie.' });
  }
