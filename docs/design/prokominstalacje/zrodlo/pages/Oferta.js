  initState() { return { q: '', o: '', open: {} }; }
  navKey() { return 'usl'; }
  rvIds() { return ['ofl', 'zaw']; }
  page(P, c) {
    const st = this.state, self = this;
    const OB = [['dom', 'Dom', P.home], ['apt', 'Apartament', P.key], ['pens', 'Pensjonat i hotel', P.bed], ['rest', 'Restauracja', P.food], ['sklep', 'Sklep', P.shop], ['firma', 'Firma i hala', P.factory], ['inst', 'Kościół, szkoła, gmina', P.church], ['dev', 'Deweloper', P.crane]];
    const OBN = {}; OB.forEach((o) => { OBN[o[0]] = o[1]; });
    // wyszukiwarka: bez polskich znaków i myślników, rdzenie słów i synonimy (kamera ~ kamery ~ monitoring, wifi ~ wi-fi ~ internet)
    const norm = (x) => (x || '').toLowerCase().replace(/[ąćęłńóśźż]/g, (ch) => ({ 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' })[ch]).replace(/[-‐–\/]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    const SYN = { wifi: ['wifi', 'siec', 'internet'], internet: ['internet', 'wifi', 'siec', 'lacze'], siec: ['siec', 'wifi'], kamera: ['kamer', 'monitoring'], kamery: ['kamer', 'monitoring'], monitoring: ['monitoring', 'kamer'], cctv: ['monitoring', 'kamer'], alarm: ['alarm', 'czujk'], domofon: ['domofon', 'wideodomofon'], zamek: ['zamk', 'zamek', 'kod'], tv: ['tv', 'telewiz', 'anten'], telewizja: ['telewiz', 'anten'], ekran: ['ekran', 'monitor'], muzyka: ['muzyk', 'naglosn'], glosniki: ['glosnik', 'naglosn'], ladowarka: ['ladowar'], smart: ['smart', 'ampio'] };
    const stem = (w) => (w.length > 5 ? w.slice(0, w.length - 2) : w.length > 4 ? w.slice(0, 4) : w);
    const qT = norm(st.q).split(' ').filter((w) => w.length > 1), o = st.o, q = qT.join(' ');
    const match = (hay) => qT.every((w) => (SYN[w] || [stem(w)]).some((x) => hay.includes(x)));
    // brzmienia do czasu poprawki danych w common.js (offer) — patrz raport fix-A
    const FIX = {
      'Kamery z kolorem w nocy i detekcją AI': [null, 'Rozpoznają ludzi i auta, dzięki czemu jest mniej fałszywych alarmów od zwierząt, liści i śniegu.'],
      'Switche PoE, UPS i szafa rack': [null, 'Kamera zasilana tym samym kablem, którym przesyła obraz. Z zasilaczem UPS system działa jeszcze przez pewien czas po zaniku prądu.'],
      'Monitoring zgodny z zasadami RODO': ['Monitoring ustawiony pod RODO', 'Maski prywatności, czas nagrań i miejsca na tabliczki.'],
      'Zamki z kodem do apartamentów': [null, 'Kod ważny tylko w czasie pobytu, wysyłany automatycznie, jeśli Twój system rezerwacji to obsługuje.'],
      'Karty i breloki dla pracowników': [null, 'Strefy, godziny wejść, blokada zgubionej karty od ręki.'],
      'Harmonogramy i historia wejść': [null, 'Kto, kiedy i którymi drzwiami. Ustawione pod RODO.'],
      'Okablowanie strukturalne': [null, 'Gniazda, patchpanele i pomiary torów. Zakres dokumentacji ustalamy przed instalacją.'],
      'Zdalny nadzór nad siecią': [null, 'Przy umowie z nadzorem często widzimy awarię, zanim zadzwonisz. Wiele rzeczy naprawiamy zdalnie.'],
      'Instalacja telekomunikacyjna w nowym budynku': [null, 'Gotowa na internet, telefon i telewizję, zgodnie z przepisami o instalacji telekomunikacyjnej w nowych budynkach (tzw. megaustawa).'],
      'Pomiary i dokumentacja powykonawcza': [null, 'Protokoły pomiarów i opis tras do odbioru budynku. W firmach i instytucjach zakres dokumentacji ustalamy przed instalacją.']
    };
    const AFIX = { scr: 'Ekrany profesjonalne do pracy wiele godzin dziennie i treść zmieniana zdalnie. Wdrażamy to w naszych salonach.' };
    const O = this.offer().map((a) => Object.assign({}, a, { d: AFIX[a.k] || a.d, items: a.items.map((it) => { const f = FIX[it[0]]; return f ? [f[0] || it[0], f[1] || it[1], it[2]] : it; }) }));
    const LIM = 3;
    let nAll = 0, nShow = 0;
    const areas = O.map((a) => {
      const s = c.SV.find((v) => v.k === a.k);
      const hay = norm(s.n + ' ' + a.d + ' ' + a.b.join(' '));
      const all = a.items.filter((it) => {
        nAll++;
        const tags = it[2].split(' ');
        const okO = !o || tags.includes(o);
        const okQ = !q || match(norm(it[0] + ' ' + it[1]) + ' ' + hay);
        return okO && okQ;
      }).map((it) => { const tags = it[2].split(' '); return { n: it[0], d: it[1], t: tags.length >= 7 ? ['każdy obiekt'] : tags.map((t) => OBN[t]) }; });
      nShow += all.length;
      const isOpen = !!(q || o) || !!st.open[a.k], more = !isOpen && all.length > LIM;
      return { id: 'o-' + a.k, k: a.k, n: s.n, ic: s.ic, href: s.href, fam: a.fam, d: a.d, b: a.b, hasB: a.b.length > 0, items: more ? all.slice(0, LIM) : all, nItems: all.length, more: more, moreT: 'Pokaż wszystkie (' + all.length + ')', less: !!st.open[a.k] && !(q || o) && all.length > LIM, tog: () => self.setState({ open: Object.assign({}, st.open, { [a.k]: !st.open[a.k] }) }), cls: 'ofa ri' + (a.k === 'ev' ? ' extra' : '') + (all.length ? '' : ' hide') };
    });
    const filtered = !!(q || o);
    const of = {
      q: st.q, hasQ: !!st.q, onQ: (e) => self.setState({ q: e.target.value }), clrQ: () => self.setState({ q: '' }),
      objs: [['', 'Wszystkie', P.layers]].concat(OB).map((x) => ({ n: x[1], ic: x[2], on: o === x[0] ? 'true' : 'false', cls: 'uchip' + (o === x[0] ? ' on' : ''), pick: () => self.setState({ o: x[0] }) })),
      nA: O.length, nAll: nAll, nShow: nShow, filtered: filtered, reset: () => self.setState({ q: '', o: '' }),
      nav: areas.map((a) => ({ n: a.n, ic: a.ic, href: '#' + a.id, c: a.nItems, cls: 'ofn' + (a.nItems ? '' : ' off') })),
      areas: areas, empty: nShow === 0,
      always: ['Wizja lokalna i doradztwo', 'Projekt i wycena na piśmie, zwykle w wariantach do wyboru', 'Montaż czysto i w ustalonym terminie', 'Konfiguracja aplikacji i kont użytkowników', 'Sprawdzenie działania przy Tobie', 'Pokazujemy obsługę i aplikację', 'Serwis, przeglądy i pomoc zdalna']
    };
    return { of: of, ctaEye: 'Pełna oferta', ctaH: 'Nie wiesz, co wybrać? Pomożemy ułożyć zestaw.', ctaP: 'Opisz obiekt albo wyślij zdjęcia. Zaproponujemy, od czego zacząć, i wycenimy na piśmie.' };
  }
