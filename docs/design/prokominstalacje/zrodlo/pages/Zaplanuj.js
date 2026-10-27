  mountPage() {
    // Stan z innych stron: #obiekt=pens&uslugi=kam,wifi (hero strony głównej, mini-formularz, strony usług)
    try {
      var h = decodeURIComponent(window.location.hash || '').replace(/^#/, ''), o = {};
      var M = { dom: 'dom', apt: 'apt', pens: 'pens', hotel: 'hotel', rest: 'rest', sklep: 'sklep', firma: 'firma', biuro: 'firma', hala: 'firma', kosc: 'gmina', szk: 'gmina', gmina: 'gmina', inst: 'gmina', dev: 'dew', dew: 'dew', bud: 'dew' };
      var SVK = ['kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev'];
      var mo = /(?:^|&)obiekt=([a-z]+)/.exec(h); if (mo && M[mo[1]]) o.obj = M[mo[1]];
      var mu = /(?:^|&)uslugi=([a-z,]+)/.exec(h);
      if (mu) { var L = mu[1].split(',').filter(function (k, i, a) { return SVK.indexOf(k) >= 0 && a.indexOf(k) === i; }); if (L.length) { o.svc = SVK.filter(function (k) { return L.indexOf(k) >= 0; }); o.fromLink = true; } }
      if (o.obj || o.svc) this.setState(o);
    } catch (e) {}
  }
  // Po zmianie kroku: przewiń do początku karty kreatora i przenieś fokus na nagłówek kroku
  focusStep() {
    setTimeout(function () {
      try {
        var card = document.querySelector('.zkcard'); if (!card) return;
        var hd = document.querySelector('.hdr'), off = (hd ? hd.getBoundingClientRect().height : 0) + 12;
        var top = card.getBoundingClientRect().top;
        if (top < off || top > (window.innerHeight || 800) * 0.4) window.scrollTo({ top: Math.max(0, (window.scrollY || 0) + top - off), behavior: 'smooth' });
        var h = card.querySelector('[data-zkh]'); if (h) h.focus({ preventScroll: true });
      } catch (e) {}
    }, 90);
  }
  initState() { return { step: 1, svc: [], uns: false, pre: -1, obj: '', size: -1, stage: -1, ans: {}, ph: 0, town: '', via: 0, when: -1, cons: false, name: '', phone: '', err: '', email: '', fromLink: false }; }
  navKey() { return ''; }
  zoneOf(t) {
    const tw = this.norm(t);
    if (!tw) return '';
    if (/rabk|chabow|jordan|mszan|raba|spytk|lubien|skomiel|niedzwi|ponic|olszow/.test(tw)) return 'Rabka-Zdrój i okolice';
    if (/zakop|poron|koscieli|bukow|bialk|bialy dun|murzas/.test(tw)) return 'Zakopane i Tatry';
    if (/nowy targ|nowy tar|szaflar|czarny dun|jablon|czorszt|szczawn|kroscien|orawa|spisz/.test(tw)) return 'Podhale';
    return tw.length > 2 ? 'Małopolska · dojazd ustalimy' : '';
  }
  page(P, c) {
    const st = this.state, self = this;
    const SV = c.SV;
    const HUE = { kam: '#12B6D8', alarm: '#F07A6A', kd: '#F2B84B', wifi: '#5B8CF0', tel: '#9AA8AD', ant: '#B58CF0', smart: '#7BD36A', snd: '#F29A4B', scr: '#E86FB0', ev: '#5FD0B0' };
    const OB = [['dom', 'Dom', P.home], ['pens', 'Pensjonat', P.bed], ['apt', 'Apartament', P.key], ['hotel', 'Hotel', P.hotel], ['rest', 'Restauracja', P.food], ['sklep', 'Sklep', P.shop], ['firma', 'Biuro lub hala', P.factory], ['gmina', 'Szkoła, gmina, kościół', P.school], ['dew', 'Deweloper, wspólnota', P.crane]];
    const SZ = [['Mały', 'dom, lokal'], ['Średni', 'pensjonat, firma'], ['Duży', 'kilka budynków']];
    const SG = [['Budowa', 'stan surowy'], ['Remont', 'w trakcie'], ['Działa', 'obiekt gotowy']];
    const PRE = [
      ['Nowy dom', 'smart home, alarm, kamery, Wi-Fi', P.home, ['smart', 'alarm', 'kam', 'wifi'], 'dom'],
      ['Pensjonat, apartamenty', 'kamery, Wi-Fi gości, zamki, alarm', P.bed, ['kam', 'wifi', 'kd', 'alarm'], 'pens'],
      ['Firma, sklep, biuro', 'kamery, alarm, sieć, dostęp', P.shop, ['kam', 'alarm', 'wifi', 'kd'], 'firma'],
      ['Restauracja, hotel, sala', 'nagłośnienie, ekrany, Wi-Fi', P.food, ['snd', 'scr', 'wifi'], 'rest']
    ];
    const Q = {
      kam: ['Ile miejsc chcesz obserwować?', ['1–4', '5–8', '9–16', 'Więcej']],
      alarm: ['Jaki alarm?', ['Przewodowy', 'Bezprzewodowy']],
      vd: ['Czy dołożyć wideodomofon?', ['Tak', 'Nie']],
      kd: ['Ile drzwi lub wejść?', ['1', '2–5', '6–20', 'Więcej']],
      wifi: ['Jak duży jest obiekt?', ['1 kondygnacja', '2–3 kondygnacje', 'Kilka budynków']],
      tel: ['Masz przedmiar lub projekt?', ['Tak', 'W przygotowaniu']],
      ev: ['Jakie masz przyłącze?', ['1 faza', '3 fazy']],
      smart: ['Na jakim etapie jest elektryka?', ['Przed elektryką', 'W trakcie', 'Dom wykończony']],
      ant: ['Co chcesz odbierać?', ['Satelita', 'Naziemna', 'Obie', 'Instalacja zbiorcza']],
      snd: ['Jakie wnętrze?', ['Lokal', 'Sala do 200 osób', 'Kościół lub hala']],
      scr: ['Ile ekranów?', ['1', '2–3', 'Więcej']]
    };
    const TIPS = { kam: 'miejsca do obserwacji: wjazd, parking, wejścia', alarm: 'drzwi wejściowe i okna parteru', kd: 'drzwi z obu stron i bok skrzydła z zamkiem', wifi: 'router i szafkę, w której stoi', tel: 'rzuty albo przedmiar', ev: 'rozdzielnicę i miejsce na ładowarkę', smart: 'rozdzielnicę i projekt elektryki', ant: 'dach i liczbę telewizorów', snd: 'wnętrze z kilku stron i sufit', scr: 'ścianę lub witrynę pod ekran' };
    const STEPS = ['Instalacje', 'Obiekt', 'Szczegóły', 'Kontakt'];
    const set = (o) => self.setState(Object.assign({ err: '' }, o));
    const has = (k) => st.svc.includes(k);
    const svcN = (k) => (SV.find((s) => s.k === k) || {}).n || k;
    const digits = (st.phone || '').replace(/\D/g, '').length;
    const zone = this.zoneOf(st.town);
    const QK = [].concat.apply([], st.svc.map((k) => (k === 'alarm' ? ['alarm', 'vd'] : [k])));
    const nAns = QK.filter((k) => st.ans[k] !== undefined).length;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((st.email || '').trim());
    // progress (completion of the request)
    const parts = [st.svc.length || st.uns, st.obj, st.size >= 0, st.stage >= 0, st.town, (st.svc.length > 0 && nAns === QK.length) || (st.uns && st.step > 3), st.name, digits >= 9, st.cons];
    const pct = st.step === 5 ? 100 : Math.round(parts.filter(Boolean).length / parts.length * 100);
    // validation per step
    const check = (s) => {
      if (s === 1 && !st.svc.length && !st.uns) return 'Zaznacz przynajmniej jedną instalację albo „Nie wiem, doradźcie mi”.';
      if (s === 4 && digits < 9) return 'Podaj numer telefonu, żebyśmy mogli oddzwonić.';
      if (s === 4 && st.via === 2 && !emailOk) return 'Wybrałeś kontakt e-mailem: wpisz poprawny adres e-mail.';
      if (s === 4 && !st.cons) return 'Zaznacz zgodę na kontakt, wtedy wyślemy zgłoszenie.';
      return '';
    };
    const goStep = (n) => { set({ step: n }); self.focusStep(); };
    const goNext = () => { const e = check(st.step); if (e) return set({ err: e }); goStep(Math.min(5, st.step + 1)); };
    // smart hints
    const H = [];
    if (st.step === 1 && st.fromLink && st.svc.length) H.push('Zaznaczyliśmy instalacje wybrane na poprzedniej stronie. Możesz je zmienić.');
    if (st.step === 1 && !st.svc.length && !st.uns) H.push('Nie wiesz, od czego zacząć? Kliknij szybki wybór, a zaznaczymy typowy zestaw. Potem możesz go zmienić.');
    if (st.uns) H.push('Nie musisz znać się na technice. Opisz w szczegółach, co Cię martwi, a zaproponujemy rozwiązanie.');
    if (st.stage === 0) H.push('Najtaniej teraz: kable i puszki kładziemy w stanie surowym, a osprzęt montujemy po wykończeniu.');
    if (has('kam')) H.push('Kamery na zewnątrz dobieramy do mrozu i śniegu. Do rejestratora warto dodać zasilacz UPS, żeby kamery nagrywały także przy krótkim zaniku prądu.');
    if (has('wifi') && ['pens', 'hotel', 'apt', 'rest'].includes(st.obj)) H.push('Robimy osobną sieć dla gości i osobną dla kamer. Goście nie widzą Twoich urządzeń.');
    if (has('kd') && ['pens', 'apt', 'hotel'].includes(st.obj)) H.push('Zamki na kod lub kartę: gość wchodzi bez odbierania kluczy, a kod wygasa po wyjeździe.');
    if (has('smart')) H.push('Ampio działa lokalnie, bez internetu. Najwięcej da się zrobić, gdy zaplanujemy go przed elektryką.');
    if (has('snd')) H.push('Przy nagłośnieniu przyjedziemy posłuchać wnętrza. W kościele czy sali pogłos decyduje o doborze głośników.');
    if (has('ev')) H.push('Ładowarkę dobieramy do przyłącza. Czasem trzeba zwiększyć moc przyłączeniową (wniosek do operatora sieci).');
    if (st.step === 4) H.unshift('Zostaw numer, a resztę dopytamy przez telefon. Nie wysyłamy reklam. Dane służą tylko do kontaktu w sprawie zgłoszenia.');
    if (!H.length) H.push('Wycena po wizji lokalnej, na piśmie, zwykle w wariantach do wyboru.');
    const pick = (cur, i) => cur === i;
    const tile = (on) => (on ? ' on' : '');
    const zk = {
      trust: [{ ic: P.clock, t: '2 minuty', d: 'klikasz zamiast pisać' }, { ic: P.shield, t: 'Bez zobowiązań', d: 'wycena po wizji lokalnej' }, { ic: P.doc, t: 'Na piśmie', d: 'zakres i cena przed montażem' }],
      k: 'zk' + st.step, barSt: 'width:' + Math.round((Math.min(st.step, 5) - 1) / 4 * 100) + '%',
      steps: STEPS.map((t, i) => ({ n: i + 1 < st.step ? '✓' : String(i + 1), t: t, cur: i + 1 === st.step ? 'step' : 'false', cls: 'zkst' + (i + 1 === st.step ? ' on' : i + 1 < st.step ? ' done' : ''), go: () => { if (i + 1 > st.step) { for (let s = st.step; s < i + 1; s++) { const e = check(s); if (e) { set({ err: e, step: s }); self.focusStep(); return; } } } goStep(i + 1); } })),
      s1: st.step === 1, s2: st.step === 2, s3: st.step === 3, s4: st.step === 4, s5: st.step === 5, nav: st.step < 5,
      pre: PRE.map((p, i) => ({ n: p[0], d: p[1], ic: p[2], cls: 'zkpb' + tile(st.pre === i), pick: () => set({ pre: i, svc: p[3].slice(), uns: false, fromLink: false, obj: st.obj || p[4] }) })),
      svc: SV.map((s) => { const on = has(s.k); return { n: s.n, s: s.s, ic: s.ic, on: on ? 'true' : 'false', st: '--h:' + HUE[s.k], cls: 'zksb' + tile(on), toggle: () => set({ pre: -1, uns: false, fromLink: false, svc: on ? st.svc.filter((x) => x !== s.k) : st.svc.concat([s.k]) }) }; }),
      uns: () => set({ uns: !st.uns, svc: st.uns ? st.svc : [], pre: -1 }), unsCls: 'zkuns' + tile(st.uns),
      obj: OB.map((o) => ({ n: o[1], ic: o[2], on: st.obj === o[0] ? 'true' : 'false', cls: 'zkob' + tile(st.obj === o[0]), pick: () => set({ obj: o[0] }) })),
      size: SZ.map((s, i) => ({ n: s[0], d: s[1], on: pick(st.size, i) ? 'true' : 'false', cls: 'zksg' + tile(pick(st.size, i)), pick: () => set({ size: i }) })),
      stage: SG.map((s, i) => ({ n: s[0], d: s[1], on: pick(st.stage, i) ? 'true' : 'false', cls: 'zksg' + tile(pick(st.stage, i)), pick: () => set({ stage: i }) })),
      town: st.town, onTown: (e) => set({ town: e && e.target ? e.target.value : '' }), zone: zone || 'strefa dojazdu', zoneCls: 'zkzone' + (zone ? ' on' : ''),
      towns: ['Rabka-Zdrój', 'Nowy Targ', 'Zakopane', 'Jordanów', 'Mszana Dolna', 'Limanowa'].map((t) => ({ n: t, cls: 'zkc' + tile(st.town === t), pick: () => set({ town: t }) })),
      qs: QK.map((k) => { const sk = k === 'vd' ? 'alarm' : k; return { svc: svcN(sk), q: Q[k][0], ic: (SV.find((s) => s.k === sk) || {}).ic, st: '--h:' + HUE[sk], cls: 'zkqc' + (st.ans[k] !== undefined ? ' ok' : ''), a: Q[k][1].concat(['Nie wiem']).map((n, i) => ({ n: n, on: st.ans[k] === i ? 'true' : 'false', cls: 'zkc' + tile(st.ans[k] === i), pick: () => set({ ans: Object.assign({}, st.ans, { [k]: i }) }) })) }; }),
      noQ: !st.svc.length,
      addPh: () => set({ ph: Math.min(10, st.ph + 1) }), thumbs: Array.from({ length: st.ph }, (x, i) => 'zdjęcie ' + (i + 1)),
      tips: st.svc.map((k) => TIPS[k]).concat(['budynek z zewnątrz, z dwóch stron']).slice(0, 5),
      name: st.name, onName: (e) => set({ name: e && e.target ? e.target.value : '' }),
      email: st.email, onEmail: (e) => set({ email: e && e.target ? e.target.value : '' }), emailReq: st.via === 2, emailLab: st.via === 2 ? 'wymagany przy kontakcie e-mailem' : 'opcjonalnie', emailCls: 'zkin' + (st.via === 2 && st.email && !emailOk ? ' xa-bad' : ''),
      phone: st.phone, onPhone: (e) => set({ phone: e && e.target ? e.target.value : '' }), phOkCls: 'zkok2' + (digits >= 9 ? ' on' : ''),
      via: [['Telefon', P.phone], ['WhatsApp', P.chat], ['E-mail', P.mail]].map((v, i) => ({ n: v[0], ic: v[1], on: st.via === i ? 'true' : 'false', cls: 'zksg' + tile(st.via === i), pick: () => set({ via: i }) })),
      when: ['Rano', 'Po południu', 'Obojętnie'].map((n, i) => ({ n: n, on: st.when === i ? 'true' : 'false', cls: 'zksg' + tile(st.when === i), pick: () => set({ when: i }) })),
      cons: st.cons, consOn: st.cons ? 'true' : 'false', consCls: 'zkcons' + tile(st.cons), tCons: () => set({ cons: !st.cons }),
      err: !!st.err, errT: st.err,
      back: () => goStep(Math.max(1, st.step - 1)), backSt: st.step === 1 ? 'visibility:hidden' : '',
      next: goNext, nextT: st.step === 4 ? 'Wyślij zgłoszenie' : 'Dalej →', nextCls: 'btn btn-p zknext' + (check(st.step) ? ' dim' : ''),
      navHint: st.step === 1 ? (st.svc.length ? 'Wybrano: ' + st.svc.length : st.uns ? 'Doradzimy' : 'Krok 1 z 4') : st.step === 3 ? (st.svc.length ? nAns + ' z ' + QK.length + ' odpowiedzi' : 'Krok 3 z 4') : 'Krok ' + st.step + ' z 4',
      stepNo: 'Krok ' + Math.min(st.step, 4) + ' z 4',
      doneVia: ['telefonem', 'na WhatsAppie', 'e-mailem'][st.via] || 'telefonem', side: st.step < 5,
      nameC: st.name ? ', ' + st.name.split(' ')[0] : '',
      pct: String(pct), ringSt: '--p:' + pct,
      sumSvc: st.svc.map((k) => ({ n: svcN(k), ic: (SV.find((s) => s.k === k) || {}).ic, st: '--h:' + HUE[k] })), sumNone: !st.svc.length, sumNoneT: st.uns ? 'Do doradzenia' : 'Nic jeszcze nie wybrano',
      sumObj: st.obj ? (OB.find((o) => o[0] === st.obj) || [0, '—'])[1] + (st.size >= 0 ? ' · ' + SZ[st.size][0].toLowerCase() : '') : '—',
      sumStage: st.stage >= 0 ? SG[st.stage][0] : '—',
      sumQ: st.svc.length ? nAns + ' z ' + QK.length : '—', sumPh: st.ph ? st.ph + (st.ph === 1 ? ' zdjęcie' : st.ph < 5 ? ' zdjęcia' : ' zdjęć') : 'brak',
      sumTown: st.town ? st.town + (zone ? ' · ' + zone : '') : '—',
      hints: H.slice(0, 2), hintK: 'h' + st.step + st.svc.join('') + st.obj + st.stage,
      after: [{ n: '1', t: 'Odezwiemy się', d: 'Do 24 h w dni robocze. Dopytamy o szczegóły i umówimy termin.' }, { n: '2', t: 'Wizja lokalna', d: 'Oglądamy obiekt, mierzymy, sprawdzamy kable.' }, { n: '3', t: 'Wycena na piśmie', d: 'Zwykle w wariantach do wyboru.' }]
    };
    return { zk: zk };
  }
