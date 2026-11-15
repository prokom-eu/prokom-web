  initState() { return { fs: 'all', fo: 'all', more: false }; }
  navKey() { return 'rl'; }
  page(P, c) {
    const st = this.state, self = this;
    const A = { snd: 'M30 120v-40h28l34-26v92l-34-26zM120 70a40 40 0 0 1 0 60M145 50a70 70 0 0 1 0 100M170 30a100 100 0 0 1 0 140', ch: 'M120 30v26M108 42h24M70 160V96l50-40 50 40v64M106 160v-34h28v34M30 160h180', cf: 'M50 80h100v44a36 36 0 0 1-36 36H86a36 36 0 0 1-36-36zM150 92h16a18 18 0 0 1 0 36h-16M80 40c-8 10 8 18 0 28M110 40c-8 10 8 18 0 28', prj: 'M30 60h130v60H30zM160 75l60-30v90l-60-30M60 120l-10 40M130 120l10 40M95 90a14 14 0 1 0 .1 0', it: 'M40 40h160v40H40zM40 100h160v40H40zM70 60h.1M70 120h.1M120 80v20', dish: 'M40 70a90 90 0 0 0 100 100zM80 130l60-60M160 50a12 12 0 1 0 .1 0M70 180h90', car: 'M20 120l20-50h130l30 50v40H20zM55 160v14M175 160v14M60 70v-30h30v30M150 95a20 20 0 0 1 0 30M165 85a36 36 0 0 1 0 50', school: 'M120 30L20 80l100 50 100-50zM60 100v40c30 25 90 25 120 0v-40' };
    // [nazwa, miejscowość, obiekt, zakres prac, instalacja, kategorie, typ obiektu, rysunek, etykieta]
    const R = [
      ['Blachotrapez', 'Rabka-Zdrój i Ponice', 'Firma: sale i biuro', 'Sprzedaż, montaż i wykonanie', 'Sala konferencyjna, szkoleniowa i marketingowa (nagłośnienie, projekcja), przyłącza IT stanowisk biurowych i nagłośnienie samochodu reklamowego', ['snd', 'scr', 'wifi'], 'firma', A.prj, 'Audio, projekcja, IT'],
      ['Parafia św. Teresy', 'Rabka-Zdrój', 'Kościół', 'Sprzedaż i montaż', 'Instalacja audiowizualna i nagłośnienie chóru', ['snd', 'scr'], 'kosciol', A.ch, 'Audio i wideo'],
      ['Empik', 'Zakopane i Kraków', 'Salony sprzedaży', 'Montaż', 'Nagłośnienie sal sprzedaży', ['snd'], 'sklep', A.snd, 'Nagłośnienie'],
      ['Restauracja „Aleksandra”', 'Mszana Dolna', 'Restauracja i dom weselny', 'Sprzedaż i montaż', 'Instalacja audiowizualna', ['snd', 'scr'], 'gastro', A.cf, 'Audio i wideo'],
      ['Caffe Europa', 'Nowy Sącz', 'Kawiarnia', 'Sprzedaż, montaż i wdrożenie oprogramowania', 'Instalacja reklamowo-wizualna i nagłośnienie', ['scr', 'snd'], 'gastro', A.cf, 'Ekrany i dźwięk'],
      ['FitBar', 'Nowy Sącz', 'Lokal gastronomiczny', 'Montaż', 'Nagłośnienie lokalu', ['snd'], 'gastro', A.snd, 'Nagłośnienie'],
      ['Parafia Narodzenia św. Jana Chrzciciela (Jasna Górka)', 'Ślemień', 'Kościół', 'Montaż', 'Nagłośnienie', ['snd'], 'kosciol', A.ch, 'Nagłośnienie'],
      ['Kaplica Sióstr Nazaretanek', 'Rabka-Zdrój', 'Kaplica', 'Montaż', 'Nagłośnienie', ['snd'], 'kosciol', A.ch, 'Nagłośnienie'],
      ['Szkoła Podstawowa im. Adama Mickiewicza', 'Rabka-Zdrój', 'Szkoła', 'Sprzedaż i montaż', 'Sprzęt projekcyjny', ['scr'], 'szkola', A.school, 'Projekcja'],
      ['Zakłady bukmacherskie', 'Kraków', 'Lokal usługowy', 'Sprzedaż i montaż', 'Sprzęt projekcyjny', ['scr'], 'sklep', A.prj, 'Projekcja'],
      ['Dom prywatny', 'Ponice', 'Dom jednorodzinny', 'Sprzedaż i montaż', 'Instalacja RTV-SAT', ['ant'], 'dom', A.dish, 'Anteny']
    ];
    const FS = [['all', 'Wszystkie'], ['snd', 'Nagłośnienie'], ['scr', 'Multimedia i projekcja'], ['wifi', 'Sieci'], ['ant', 'Anteny']];
    const FO = [['all', 'Każdy obiekt'], ['firma', 'Firmy'], ['kosciol', 'Kościoły'], ['gastro', 'Gastronomia'], ['sklep', 'Sklepy i usługi'], ['szkola', 'Szkoły'], ['dom', 'Domy']];
    const list = R.map((r, i) => ({ r: r, i: i })).filter((x) => (st.fs === 'all' || x.r[5].includes(st.fs)) && (st.fo === 'all' || x.r[6] === st.fo));
    const rl = {
      fs: FS.map((f) => ({ n: f[1], c: f[0] === 'all' ? R.length : R.filter((r) => r[5].includes(f[0])).length, on: st.fs === f[0] ? 'true' : 'false', cls: 'chip' + (st.fs === f[0] ? ' on' : ''), pick: () => self.setState({ fs: f[0], more: false }) })),
      fo: FO.map((f) => ({ n: f[1], on: st.fo === f[0] ? 'true' : 'false', cls: 'chip' + (st.fo === f[0] ? ' on' : ''), pick: () => self.setState({ fo: f[0], more: false }) })),
      list: list.map((x, i) => ({ k: x.r[8], n: x.r[0], m: x.r[1] + ' · ' + x.r[2].toLowerCase(), art: x.r[7], ph: x.r[4], z: x.r[3], cls: 'card rl' + (!st.more && i >= 6 ? ' xa-rlx' : '') })), empty: !list.length,
      moreOn: list.length > 6, moreT: st.more ? 'Zwiń listę' : 'Pokaż wszystkie (' + list.length + ')', more: () => self.setState({ more: !st.more })
    };
    return { rl: rl, ctaEye: 'Masz podobny obiekt?', ctaH: 'Twoja realizacja może być następna.', ctaP: 'Pokaż nam obiekt. Zaproponujemy rozwiązanie, a po montażu pokażemy je tutaj, jeśli się zgodzisz.' };
  }
