  initState() { return { q: '', topic: 0, fName: '', fPh: '', fMsg: '', fCons: false, fErr: '', fSent: false }; }
  navKey() { return 'kt'; }
  rvIds() { return ['nap']; }
  page(P, c) {
    const st = this.state, self = this;
    const pr = (lat, lon) => [Math.round((lon - 19.55) * 500 + 20), Math.round((49.92 - lat) * 750 + 20)];
    const T = [['Rabka-Zdrój', 49.61, 19.96, 'r', 1], ['Zakopane', 49.30, 19.95, 'z', 1], ['Nowy Targ', 49.48, 20.03, 'p', 0], ['Jordanów', 49.65, 19.83, 'r', 0], ['Mszana Dolna', 49.68, 20.08, 'r', 0], ['Chabówka', 49.59, 19.92, 'r', 0], ['Limanowa', 49.70, 20.42, 'm', 0], ['Szczawnica', 49.43, 20.49, 'p', 0], ['Krościenko', 49.44, 20.43, 'p', 0], ['Czarny Dunajec', 49.44, 19.85, 'p', 0], ['Białka Tatrzańska', 49.39, 20.10, 'z', 0], ['Bukowina Tatrzańska', 49.34, 20.11, 'z', 0], ['Poronin', 49.34, 20.00, 'z', 0], ['Kościelisko', 49.29, 19.89, 'z', 0], ['Maków Podhalański', 49.73, 19.68, 'm', 0], ['Myślenice', 49.83, 19.94, 'm', 0], ['Nowy Sącz', 49.62, 20.69, 'm', 0]];
    const ZN = { r: 'Rabka-Zdrój i okolice', z: 'Zakopane i Tatry', p: 'Podhale', m: 'Małopolska · dojazd ustalimy' };
    // te same strefy co w kreatorze (Zaplanuj.zoneOf) — docelowo jedna funkcja w common.js
    const zoneKey = (tw) => /rabk|chabow|jordan|mszan|raba|spytk|lubien|skomiel|niedzwi|ponic|olszow/.test(tw) ? 'r' : /zakop|poron|koscieli|bukow|bialk|bialy dun|murzas/.test(tw) ? 'z' : /nowy targ|nowy tar|szaflar|czarny dun|jablon|czorszt|szczawn|kroscien|orawa|spisz/.test(tw) ? 'p' : 'm';
    const ZD = { r: 'Najbliżej salonu w Rabce. Wizja lokalna zwykle w kilka dni. [SZEF]', z: 'Obsługa z salonu w Zakopanem. [SZEF: zasady dojazdu]', p: 'Dojazd z Rabki albo Zakopanego. [SZEF: zasady dojazdu]', m: 'Przy większych inwestycjach jedziemy dalej. Dojazd ustalamy indywidualnie.' };
    const qn = this.norm(st.q);
    const hit = qn.length > 2 ? T.find((t) => this.norm(t[0]).startsWith(qn) || this.norm(t[0]).includes(qn)) : null;
    let zk = hit ? hit[3] : '';
    if (!hit && qn.length > 2) zk = zoneKey(qn);
    const SH = [['Rabka-Zdrój', 49.61, 19.96], ['Zakopane', 49.30, 19.95]];
    const zc = { p: 'kz2' + (zk === 'p' ? ' on' : ''), r: 'kz2' + (zk === 'r' ? ' on' : ''), z: 'kz2' + (zk === 'z' ? ' on' : '') };
    const LEFT = ['Chabówka', 'Kościelisko', 'Czarny Dunajec', 'Krościenko', 'Poronin', 'Nowy Sącz', 'Jordanów'];
    const MINOR = ['Chabówka', 'Kościelisko', 'Poronin', 'Bukowina Tatrzańska', 'Krościenko', 'Maków Podhalański'];
    const towns = T.map((t) => { const p = pr(t[1], t[2]); const L = LEFT.includes(t[0]); const hq = !!t[4]; return { n: t[0], x: p[0], y: p[1], r: hq ? 4 : (hit && hit[0] === t[0] ? 6 : 4), tx: p[0] + (L ? -9 : (hq ? 14 : 8)), ty: p[1] - (hq ? 25 : 3) + (t[0] === 'Chabówka' ? 8 : 0), fc: L ? 'fo-r' : 'fo-l', cls: 'ktg2' + (hq ? ' hq' : '') + (MINOR.includes(t[0]) ? ' mn' : '') + (t[0] === 'Poronin' ? ' nl' : '') + (hit && hit[0] === t[0] ? ' on' : ''), pick: () => self.setState({ q: t[0] }) }; });
    const fDig = (st.fPh || '').replace(/\D/g, '').length;
    const pins = SH.map((s) => { const p = pr(s[1], s[2]); return { tr: 'translate(' + p[0] + ' ' + p[1] + ')' }; });
    let route = '', near = null;
    if (hit) {
      const hp = pr(hit[1], hit[2]);
      near = SH.map((s) => { const p = pr(s[1], s[2]); return { n: s[0], p: p, d: Math.hypot((p[0] - hp[0]) * 0.1448, (p[1] - hp[1]) * 0.1483) }; }).sort((a, b) => a.d - b.d)[0];
      if (near.d > 1) {
        const sp = near.p, mx = (sp[0] + hp[0]) / 2, my = (sp[1] + hp[1]) / 2, dx = hp[0] - sp[0], dy = hp[1] - sp[1];
        route = 'M' + sp[0] + ' ' + (sp[1] - 2) + ' Q' + Math.round(mx - dy * 0.18) + ' ' + Math.round(my + dx * 0.18) + ' ' + hp[0] + ' ' + hp[1];
      }
    }
    const kt = {
      q: st.q, onQ: (e) => self.setState({ q: e && e.target ? e.target.value : '' }),
      zc: zc, towns: towns, pins: pins, route: route, hasRoute: !!route,
      zt: zk ? ZN[zk] : 'Wpisz miejscowość (min. 3 litery)', zd: zk ? (hit ? hit[0] + (near && near.d > 1 ? ' · najbliżej z salonu: ' + near.n : '') + '. ' : '') + ZD[zk] : 'Pokażemy strefę dojazdu i najbliższy salon.',
      cards: [{ ic: P.phone, t: 'Telefon', v: 'Instalacje i serwis', ph: c.K.tel, href: c.K.telH }, { ic: P.chat, t: 'WhatsApp', v: 'Zdjęcia obiektu i pytania', ph: c.K.wa, href: c.K.waH + '?text=' + encodeURIComponent('Dzień dobry, mam pytanie o instalację w obiekcie: ') }, { ic: P.mail, t: 'E-mail', v: 'Zapytania i dokumenty', ph: c.K.mail, href: c.K.mailH + '?subject=' + encodeURIComponent('Pytanie o instalację') }, { ic: P.plane, t: 'Kreator', v: 'Zaplanuj instalację w 2 minuty', ph: '', href: 'Zaplanuj.dc.html' }],
      hours: [{ d: 'Rabka-Zdrój, pn–pt', v: '9:00–17:00' }, { d: 'Zakopane, pn–pt', v: '[SZEF: godziny]' }, { d: 'Soboty', v: '[SZEF]' }, { d: 'Niedziela', v: 'nieczynne' }],
      topic: ['Nowa instalacja', 'Awaria lub serwis', 'Współpraca dla firm budowlanych', 'Inne'].map((n, i) => ({ n: n, on: st.topic === i ? 'true' : 'false', cls: 'chip' + (st.topic === i ? ' on' : ''), pick: () => self.setState({ topic: i }) })),
      shops: [{ n: 'Rabka-Zdrój', a: 'ul. Orkana 16B, 34-700 Rabka-Zdrój', ph: '[SZEF: parking przy salonie]', route: true, rh: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('PRO-KOM, ul. Orkana 16B, 34-700 Rabka-Zdrój') }, { n: 'Zakopane', a: 'Adres salonu', ph: c.K.adrZ, route: false, rh: '' }],
      fName: st.fName, onName: (e) => self.setState({ fErr: '', fName: e && e.target ? e.target.value : '' }),
      fPh: st.fPh, onPh: (e) => self.setState({ fErr: '', fPh: e && e.target ? e.target.value : '' }),
      fMsg: st.fMsg, onMsg: (e) => self.setState({ fMsg: e && e.target ? e.target.value : '' }),
      fCons: st.fCons ? 'true' : 'false', tCons: () => self.setState({ fErr: '', fCons: !st.fCons }), consCls: 'consent xa-cons' + (st.fCons ? ' on' : ''),
      phCls: 'zin' + (st.fErr && fDig < 9 ? ' xa-bad' : ''),
      err: !!st.fErr, errT: st.fErr, form: !st.fSent, sent: !!st.fSent,
      send: () => { const e = fDig < 9 ? 'Podaj numer telefonu (9 cyfr), żebyśmy mogli oddzwonić.' : !st.fCons ? 'Zaznacz zgodę na kontakt w sprawie wiadomości.' : ''; if (e) return self.setState({ fErr: e }); self.setState({ fSent: true, fErr: '' }); },
      reset: () => self.setState({ fSent: false, fName: '', fPh: '', fMsg: '', fCons: false })
    };
    return { kt: kt, ctaEye: 'Zaplanuj instalację', ctaH: 'Wolisz, żebyśmy to my zadzwonili?', ctaP: 'Zostaw numer w kreatorze. Odezwiemy się do 24 h w dni robocze, w godzinach pracy.' };
  }
