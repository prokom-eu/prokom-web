  initState() { return { nsel: 0, aud: 'arch', dv: 'lok', am: 'kl', hs: 0, aoff: [], xrTouched: false, st: 1, obj: 'dom', sys: ['wifi', 'kam', 'smart', 'snd', 'scr', 'ev'], done: {}, svc: 'smart', nf: 'all', role: 0, stage: 1, fo: 0, fName: '', fFirm: '', fPh: '', fTown: '', fMsg: '', fFiles: [], fCons: false, fErr: '', fSent: false, nlMail: '', nlOk: false, pdfMail: '', pdfOk: false }; }
  navKey() { return 'ar'; }
  rvIds() { return ['pz', 'au', 'lz', 'dv', 'ex', 'lb', 'pr', 'et', 'wy', 'ck', 'in', 'nw', 'pk', 'za', 'op', 'faq', 'rz']; }
  mountPage() {
    const self = this;
    this._xrT = setTimeout(function () { if (!self.state.xrTouched) self.setState({ am: 'in' }); }, 2600);
    this.every(3400, function () { if (self.state.am !== 'kl' && !self.state.xrTouched) self.setState({ hs: (self.state.hs + 1) % self.hotspots().length }); });
  }
  hotspots() { return this.arHotspots(); }
  page(P, c) {
    const st = this.state, self = this, HU = c.HU;
    const hero = this.arScene(c, { m: st.am, hs: st.hs, off: st.aoff }, (o) => { clearTimeout(self._xrT); const n = { xrTouched: true }; if (o.m) n.am = o.m; if (o.hs !== undefined) n.hs = o.hs; if (o.off) n.aoff = o.off; self.setState(n); });

    const PROB = [
      { ic: P.tool, t: 'Technika dokładana po tynkach', d: 'Kamera „na kołkach”, kabel w listwie, kucie świeżej gładzi tydzień przed przeprowadzką.', a: 'Trasy, puszki i ramki planujemy na rzutach. Po tynkach już nic nie kujemy.' },
      { ic: P.eye, t: 'Urządzenia psują wnętrze', d: 'Rząd włączników, biała kolumna w rogu, czujka na środku sufitu, kable pod telewizorem.', a: 'Dobieramy urządzenia do projektu: maskownice, kolory, szkło paneli, zabudowy.' },
      { ic: P.chat, t: 'Klient chce „smart”, ale nie wie co', d: 'Inwestor pyta o inteligentny dom, a na rozmowę o protokołach nie ma czasu ani Ty, ani on.', a: 'Rozmawiamy z inwestorem prostym językiem i zamieniamy to na listę systemów do projektu.' },
      { ic: P.users, t: 'Sześć firm, nikt za całość', d: 'Osobno alarm, kamery, sieć, antena, audio i smart home. Każdy kładzie swoje kable.', a: 'Jeden wykonawca 10 instalacji i jeden opiekun od koncepcji do serwisu.' }
    ];
    const BR = [{ b: '28%', s: 'architektów i wykonawców wciąga integratora już na etapie koncepcji' }, { b: '31%', s: 'potrzebuje łatwiejszego dostępu do wykwalifikowanych integratorów' }, { b: '30%', s: 'szuka bardziej rzetelnych wykonawców instalacji' }];

    const STG = [
      { t: 'Koncepcja', s: 'Najlepszy moment', best: true, rob: ['Rozmowa z Tobą i inwestorem o potrzebach: bezpieczeństwo, sieć, dźwięk, sterowanie, ładowanie auta.', 'Lista systemów i orientacyjny zakres w wariantach.'], dost: ['Lista instalacji z tym, co zmieniają w projekcie: sufity, wnęki, pomieszczenie techniczne.'], inw: ['Od początku wie, co dostanie. Bez dopłat „bo tego nie było w projekcie”.'] },
      { t: 'Projekt budowlany', s: 'Też dobry moment', best: true, rob: ['Miejsce na szafę rack: wentylacja, osobny obwód, dostęp serwisowy.', 'Przepusty, kanalizacja teletechniczna, przyłącze światłowodu, moc pod ładowarkę.'], dost: ['Wytyczne dla branży elektrycznej i teletechnicznej do włączenia w projekt.'], inw: ['Przyłącza i moc zaplanowane raz, bez rozkopywania podjazdu po latach.'] },
      { t: 'Projekt wnętrz', s: 'Wykonawczy', best: false, rob: ['Rozmieszczenie urządzeń na rzutach: kamery, czujki, głośniki, punkty Wi-Fi, panele, ekrany.', 'Wysokości montażu, trasy kabli, dobór wykończeń: kolor maskownic, szkło paneli.'], dost: ['Rzuty z naniesionymi urządzeniami i zestawienie. [SZEF: PDF czy też DWG]'], inw: ['Technika zgodna z projektem wnętrza, a nie dobrana na budowie.'] },
      { t: 'Przed tynkami', s: 'Stan surowy', best: false, rob: ['Okablowanie, puszki, korytka, ramki pod głośniki sufitowe.', 'Pomiary torów i zdjęcia tras przed zakryciem.'], dost: ['Termin wejścia uzgodniony z wykonawcą i kierownikiem budowy.'], inw: ['Wie, gdzie biegnie każdy kabel, także za 10 lat.'] },
      { t: 'Wykończenie', s: 'Montaż i uruchomienie', best: false, rob: ['Montaż urządzeń, programowanie scen, strojenie dźwięku, pomiar zasięgu Wi-Fi.'], dost: ['Koordynacja z wykonawcą wnętrz. Nie wchodzimy na świeżą gładź bez uzgodnienia.'], inw: ['Wszystko działa w dniu przeprowadzki.'] },
      { t: 'Odbiór i serwis', s: 'Zostajemy po montażu', best: false, rob: ['Szkolenie inwestora, dokumentacja w zakresie ustalonym przed instalacją.', 'Gwarancja 24 miesiące na montaż, przeglądy, pomoc zdalna.'], dost: ['Inwestor dzwoni z serwisem do nas, nie do Ciebie.'], inw: ['Jeden numer do wszystkich instalacji w domu.'] }
    ];
    const s0 = STG[st.st] || STG[0];
    const et = {
      tabs: STG.map((s, i) => ({ n: String(i + 1).padStart(2, '0'), t: s.t, s: s.s, cls: 'artab' + (i === st.st ? ' on' : '') + (s.best ? ' best' : '') + (i < st.st ? ' past' : ''), on: i === st.st ? 'true' : 'false', go: () => self.setState({ st: i }) })),
      cur: { n: String(st.st + 1).padStart(2, '0'), t: s0.t, best: s0.best, rob: s0.rob.map((x) => ({ x: x })), dost: s0.dost.map((x) => ({ x: x })), inw: s0.inw.map((x) => ({ x: x })) },
      bar: 'width:' + Math.round((st.st + 0.5) / STG.length * 100) + '%',
      prev: () => self.setState({ st: Math.max(0, st.st - 1) }), next: () => self.setState({ st: Math.min(STG.length - 1, st.st + 1) })
    };

    const WY = {
      od: [['Rzuty', 'PDF albo DWG, nawet wersja robocza.'], ['Wysokości i przekroje', 'Sufity podwieszane, wnęki, zabudowy.'], ['Projekt wnętrz i oświetlenia', 'Jeśli już jest. Dopasujemy się do niego.'], ['Harmonogram budowy', 'Kiedy tynki, kiedy wykończenie.'], ['Kontakt do inwestora i wykonawcy', 'Tylko za Twoją zgodą.']],
      my: [['Plan urządzeń na rzutach', 'Kamery, czujki, głośniki, Wi-Fi, panele, ekrany, ładowarka.'], ['Wytyczne kablowe', 'Trasy, typy przewodów, puszki i ramki.'], ['Wymagania dla szafy rack', 'Miejsce, wentylacja, zasilanie, dostęp.'], ['Opis systemów', 'Prostym językiem, do projektu albo dla inwestora.'], ['Budżet w wariantach', 'Orientacyjnie na etapie projektu, na piśmie po wizji lokalnej.']]
    };

    // Checklista projektanta
    const OBJ = [['dom', 'Dom jednorodzinny', P.home], ['apt', 'Apartament, mieszkanie', P.key], ['pens', 'Pensjonat, hotel', P.bed], ['lok', 'Lokal: restauracja, sklep, biuro', P.shop], ['wiel', 'Budynek wielorodzinny', P.apt]];
    const SYS = [['wifi', 'Sieć i Wi-Fi'], ['kam', 'Monitoring'], ['alarm', 'Alarm i domofon'], ['kd', 'Kontrola dostępu'], ['smart', 'Smart home'], ['snd', 'Dźwięk'], ['scr', 'Ekrany i TV'], ['ant', 'Anteny'], ['ev', 'Ładowarka EV']];
    const A = 'dom apt pens lok wiel';
    const CK = [
      ['wifi', 'p', 'Miejsce na szafę rack: wentylacja, osobny obwód zasilania, dostęp serwisowy', A],
      ['wifi', 'p', 'Rura osłonowa pod światłowód od granicy działki do budynku', 'dom pens lok'],
      ['wifi', 'p', 'Pion i kanalizacja teletechniczna z zapasem miejsca', 'wiel pens'],
      ['wifi', 't', 'Kabel sieciowy kat. 6 do TV, biurka i każdego punktu Wi-Fi w suficie', A],
      ['wifi', 't', 'Kabel albo pusta rura do garażu, budynku gospodarczego i bramy', 'dom pens'],
      ['kam', 'p', 'Miejsca kamer na elewacji uzgodnione z detalem: okap, gzyms, podbitka', 'dom pens lok wiel'],
      ['kam', 't', 'Puszka montażowa pod każdą kamerą w warstwie ocieplenia', 'dom pens lok wiel'],
      ['kam', 'w', 'Kąty kamer bez sąsiadów i pokoi gości: maski prywatności', 'dom pens wiel'],
      ['alarm', 'p', 'Miejsce na manipulator przy wejściu i na centralę alarmu', 'dom apt pens lok'],
      ['alarm', 't', 'Przewody do czujek, sygnalizatora i czujek zalania przy kotłowni i pralni', 'dom apt pens'],
      ['alarm', 't', 'Wideodomofon: przewód w rurze od furtki do domu', 'dom'],
      ['alarm', 't', 'Panel domofonu przy wejściu do klatki i unifony w lokalach', 'wiel'],
      ['kd', 't', 'Przewód do zamka lub elektrozaczepu w ościeżnicy drzwi', 'apt pens lok wiel'],
      ['kd', 'p', 'Rura pod nawierzchnią do napędu bramy, szlabanu i czytnika', 'pens lok wiel dom'],
      ['smart', 'p', 'Większa rozdzielnica z miejscem na moduły smart home', 'dom apt pens'],
      ['smart', 't', 'Głębokie puszki pod panele i przewód do każdej rolety', 'dom apt pens'],
      ['smart', 't', 'Czujnik temperatury i przewody siłowników w każdej strefie grzewczej', 'dom apt pens'],
      ['smart', 'w', 'Panele: szkło, kolor i ikony dobrane do projektu wnętrza', 'dom apt pens lok'],
      ['snd', 'p', 'Sufit podwieszany albo wnęka o głębokości pod głośnik do zabudowy', A],
      ['snd', 't', 'Ramki montażowe pod głośniki sufitowe przed płytą g-k', A],
      ['snd', 't', 'Przewód głośnikowy z każdej strefy do miejsca wzmacniacza', A],
      ['snd', 'w', 'Maskownice w kolorze sufitu albo do malowania', A],
      ['snd', 't', 'Taras i ogród: przewód w rurze do głośników zewnętrznych', 'dom pens lok'],
      ['scr', 'p', 'Wnęka albo zabudowa pod TV z miejscem na wentylację', 'dom apt pens'],
      ['scr', 't', 'Rura za telewizorem pod przewody, gniazdo zasilania i sieci', 'dom apt pens lok'],
      ['scr', 't', 'Zasilanie i kabel sieci przy witrynie, menu board albo recepcji', 'lok pens'],
      ['ant', 'p', 'Miejsce na maszt i antenę, przepust przez dach, uziemienie', 'dom pens wiel'],
      ['ant', 't', 'Przewód antenowy z anteny do szafy i do każdego telewizora', 'dom pens wiel'],
      ['ev', 'p', 'Moc przyłącza z zapasem pod ładowarkę, uzgodniona z projektantem elektrycznym', 'dom pens lok wiel'],
      ['ev', 't', 'Przewód zasilający i kabel sieci do miejsca ładowarki w garażu lub na parkingu', 'dom pens lok wiel'],
      ['ev', 'p', 'Kanały kablowe pod przyszłe punkty ładowania na miejscach postojowych', 'wiel lok']
    ];
    const PH = [['p', 'Na etapie projektu', P.ruler], ['t', 'Przed tynkami', P.tool], ['w', 'Przy wykończeniu', P.check]];
    const list = CK.filter((r) => st.sys.includes(r[0]) && r[3].split(' ').includes(st.obj));
    const done = st.done || {};
    const dn = list.filter((r) => done[r[2]]).length;
    const ck = {
      objs: OBJ.map((o) => ({ n: o[1], ic: o[2], cls: 'chip' + (st.obj === o[0] ? ' on' : ''), on: st.obj === o[0] ? 'true' : 'false', go: () => self.setState({ obj: o[0], done: {} }) })),
      sys: SYS.map((s) => { const on = st.sys.includes(s[0]); return { n: s[1], st: '--hc:' + HU[s[0]], cls: 'arsys' + (on ? ' on' : ''), on: on ? 'true' : 'false', go: () => self.setState({ sys: on ? st.sys.filter((x) => x !== s[0]) : st.sys.concat([s[0]]) }) }; }),
      ph: PH.map((p) => ({ n: p[1], ic: p[2], items: list.filter((r) => r[1] === p[0]).map((r) => ({ t: r[2], st: '--hc:' + HU[r[0]], sys: (SYS.find((s) => s[0] === r[0]) || [])[1], cls: 'arci' + (done[r[2]] ? ' on' : ''), on: done[r[2]] ? 'true' : 'false', go: () => { const d = Object.assign({}, done); d[r[2]] = !d[r[2]]; self.setState({ done: d }); } })) })).filter((p) => p.items.length),
      n: list.length, nW: this.plw(list.length, 'rzecz', 'rzeczy', 'rzeczy'), dn: dn, pct: 'width:' + (list.length ? Math.round(dn / list.length * 100) : 0) + '%',
      empty: !list.length,
      pdfMail: st.pdfMail, onPdf: (e) => self.setState({ pdfMail: e && e.target ? e.target.value : '' }), pdfOk: st.pdfOk, pdfForm: !st.pdfOk,
      pdfGo: () => { if (/.+@.+\..+/.test(st.pdfMail || '')) self.setState({ pdfOk: true }); },
      objN: (OBJ.find((o) => o[0] === st.obj) || [])[1]
    };

    // Instalacje: wszystko, co architekt powinien wiedzieć
    const SVD = {
      smart: { big: true, h: 'Smart home Ampio: dom, który sam pilnuje światła, ciepła i rolet.', d: 'Polski system Ampio. Światło, ogrzewanie strefowe, rolety, brama, alarm i kamery w jednej aplikacji. Działa także bez internetu, a sceny („przyjazd”, „noc”, „wyjście”) uruchamia jeden przycisk albo czujnik.', plan: ['Projekt przed tynkami: rozdzielnica z miejscem na moduły, przewody do rolet i stref grzewczych.', 'Głębokie puszki pod szklane panele przy drzwiach i w strefach.', 'Czujniki temperatury i ruchu w miejscach uzgodnionych z oświetleniem.'], look: ['Szklane panele M-DOT z własnymi ikonami', 'Jeden panel zamiast rzędu włączników', 'Bez widocznych termostatów'], br: 'Ampio · Matter (Apple, Google, Alexa)' },
      snd: { big: true, h: 'Dźwięk w domu i obiekcie: słychać, nie widać.', d: 'Multiroom w domu: muzyka w każdym pokoju, na tarasie i w łazience, sterowana z telefonu. W restauracji, hotelu, kościele i sali stałe nagłośnienie APART ze strefami i komunikatami. Do domu także głośniki Hi-Fi do zabudowy i głośniki, które są obiektem designu.', plan: ['Głębokość zabudowy w suficie albo ścianie i ramki montażowe przed płytą g-k.', 'Przewody głośnikowe z każdej strefy do jednego miejsca na wzmacniacze.', 'Akustyka: twarde, gładkie wnętrza potrzebują innego doboru niż drewno i tkaniny.'], look: ['Maskownice do malowania', 'Głośniki pod gładzią', 'Głośnik jako rzeźba ścienna'], br: 'APART · Sonos · HEOS · MusicCast · [SZEF: marki Hi-Fi, np. Bowers & Wilkins, ELAC]' },
      kam: { h: 'Monitoring, który nie wygląda jak monitoring.', d: 'Kompletny system: kamery, rejestrator, dyski do pracy całą dobę, zasilanie PoE i podgląd w telefonie. Kamery z kolorem w nocy i wykrywaniem człowieka i auta.', plan: ['Miejsca kamer uzgodnione z detalem elewacji: okap, podbitka, gzyms.', 'Puszka montażowa w ociepleniu, kabel do szafy rack.', 'Kąty bez sąsiadów i stref prywatnych, zgodnie z zasadami RODO.'], look: ['Kamery w kolorze elewacji', 'Bez kabla na wierzchu'], br: 'Hikvision · Dahua · BCS · Ubiquiti' },
      alarm: { h: 'Alarm i wideodomofon: spokój, gdy dom stoi pusty.', d: 'Czujki ruchu, otwarcia, zalania i dymu, syrena i powiadomienia w telefonie. Przy furtce wideodomofon, który odbierasz z dowolnego miejsca.', plan: ['Manipulator przy wejściu, centrala w szafie albo obok.', 'Przewód od furtki do domu w rurze.', 'Czujki zalania przy kotłowni i pralni, ważne w domach letniskowych.'], look: ['Czujki w narożnikach', 'Panel furtki dobrany do ogrodzenia'], br: 'Satel · Ajax · Hikvision · Dahua' },
      kd: { h: 'Kontrola dostępu: kod, karta albo telefon zamiast klucza.', d: 'Zamki z kodem w apartamentach, karty w hotelu i firmie, brama i szlaban z aplikacji. Wiadomo, kto i kiedy wszedł.', plan: ['Przewód do zamka lub elektrozaczepu w ościeżnicy.', 'Rura pod nawierzchnią do bramy, szlabanu i czytnika.'], look: ['Czytniki płaskie, w kolorze drzwi', 'Zamek bez klamki z klawiaturą'], br: 'Dobieramy pod obiekt' },
      wifi: { h: 'Sieć i Wi-Fi: fundament wszystkich pozostałych instalacji.', d: 'Okablowanie strukturalne, szafa rack, światłowód i Wi-Fi bez martwych stref, także w ogrodzie. Na tej sieci działają kamery, smart home, TV i ładowarka.', plan: ['Miejsce na szafę rack w pomieszczeniu technicznym.', 'Punkty Wi-Fi w suficie z kablem PoE, kabel do TV i biurka.', 'Rura pod światłowód od granicy działki.'], look: ['Płaskie punkty Wi-Fi w suficie', 'Zero routerów na półce'], br: 'Ubiquiti · MikroTik · TP-Link Omada' },
      tel: { h: 'Teletechnika w budownictwie: dla deweloperów i wykonawców.', d: 'Instalacje słaboprądowe budynku: światłowód do lokali, RTV/SAT zbiorcza, domofony, okablowanie lokali usługowych, pomiary i dokumentacja do odbioru.', plan: ['Piony, kanalizacja teletechniczna i skrzynki w lokalach.', 'Punkt styku i trasa przyłącza operatora.'], look: ['Skrzynki mieszkaniowe w zabudowie'], br: 'Dobieramy pod obiekt' },
      ant: { h: 'Anteny RTV/SAT: telewizja bez anteny na środku elewacji.', d: 'Anteny satelitarne i naziemne ustawiane miernikiem, instalacje zbiorcze i telewizja w każdym pokoju pensjonatu. Montaż z zapasem na halny.', plan: ['Miejsce na maszt od strony mniej widocznej, przepust przez dach, uziemienie.', 'Przewód antenowy do szafy i do każdego TV.'], look: ['Antena poza głównym widokiem budynku'], br: 'Dobieramy pod obiekt' },
      scr: { h: 'Ekrany i digital signage: obraz jako część wnętrza.', d: 'Telewizory w zabudowie, ekrany w recepcji i witrynie, menu board w gastronomii. Treść zmieniana zdalnie z komputera.', plan: ['Wnęka z wentylacją, rura pod przewody za ekranem.', 'Zasilanie i sieć przy witrynie, recepcji, menu board.'], look: ['Ekran w lamelach albo w meblu', 'Bez kabli pod ekranem'], br: 'Samsung · Avtek · Sharp/NEC' },
      ev: { h: 'Ładowarki samochodów: zaplanuj moc, zanim inwestor kupi auto.', d: 'Ładowarki Elzab EcoPower produkowane w Polsce: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Z doborem mocy do przyłącza i montażem.', plan: ['Moc przyłącza z zapasem, uzgodniona z projektantem elektrycznym.', 'Przewód zasilający i sieciowy do miejsca ładowarki.', 'W budynkach z parkingiem: kanały pod kolejne punkty ładowania.'], look: ['Ładowarka dobrana do elewacji garażu'], br: 'Elzab EcoPower' }
    };
    const ORD = ['smart', 'snd', 'kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'scr', 'ev'];
    const sv = c.SV.find((s) => s.k === st.svc) || c.SV[0];
    const sd = SVD[st.svc] || SVD.smart;
    const ins = {
      list: ORD.map((k) => { const s = c.SV.find((x) => x.k === k); return { n: s.n, s: s.s, ic: s.ic, st: '--hc:' + HU[k], big: !!SVD[k].big, cls: 'arsv' + (st.svc === k ? ' on' : '') + (SVD[k].big ? ' big' : ''), on: st.svc === k ? 'true' : 'false', go: () => self.setState({ svc: k }) }; }),
      cur: { n: sv.n, ic: sv.ic, href: sv.href, h: sd.h, d: sd.d, st: '--hc:' + HU[st.svc], plan: sd.plan.map((x) => ({ x: x })), look: sd.look.map((x) => ({ x: x })), br: sd.br }
    };

    // Nowe rozwiązania do projektów (docelowo kolekcja w panelu: InstArchNews)
    const NF = [['all', 'Wszystko'], ['snd', 'Dźwięk'], ['scr', 'Obraz'], ['smart', 'Sterowanie'], ['wifi', 'Sieć'], ['kam', 'Bezpieczeństwo'], ['ev', 'Energia'], ['sz', 'Szkolenia i oferty']];
    const CAT = { snd: 'Dźwięk', scr: 'Obraz', smart: 'Sterowanie', wifi: 'Sieć', kam: 'Bezpieczeństwo', ev: 'Energia', sz: 'Dla pracowni' };
    const NW = [
      { k: 'snd', ty: 'Nowość', t: 'Głośniki pod gładzią', d: 'Panel montowany w ścianie albo suficie, szpachlowany i malowany razem ze ścianą. Po wykończeniu widać tylko gładką powierzchnię.', sp: [['Głębokość montażu', 'np. 68 mm (Sonance IS6)'], ['Panel', 'np. 409×409 mm'], ['Pasmo', '50 Hz – 30 kHz'], ['Wykończenie', 'do 2–3 mm masy, gładź na wysoki standard']], plan: ['Wnęka albo puszka tylna i przewód głośnikowy przed płytą g-k', 'Wykończenie ściany według instrukcji producenta, cienkimi warstwami'], pr: 'np. Sonance Invisible, Amina', dla: ['Salon', 'Sypialnia', 'Wnętrza minimalistyczne'], st: '[SZEF: dostępność marki u nas]', art: 'M30 28h140v70H30zM60 50h80M60 63h80M60 76h80' },
      { k: 'snd', ty: 'Nowość', t: 'Głośniki sufitowe bez ramki', d: 'Cienka maskownica równo z sufitem, malowana na jego kolor. Wersje bardzo płytkie mieszczą się tam, gdzie zwykły głośnik nie wejdzie.', sp: [['Głębokość', 'od 36 mm (KEF Ci160TR)'], ['Otwór', 'ok. 196–210 mm'], ['Maskownica', 'do malowania, bez ramki'], ['Moc', 'do 140 W (Sonance VX66R)']], plan: ['Pustka w suficie na głębokość montażu', 'Montaż dwuetapowy: ramka i kabel w stanie surowym, głośnik na końcu'], pr: 'np. KEF Ci, Sonance VX, Bowers & Wilkins CCM', dla: ['Salon', 'Kuchnia', 'Łazienka'], st: '[SZEF: marki Hi-Fi u nas]', art: 'M40 40h120M70 40v-6h60v6M100 52a26 8 0 1 0 .1 0M84 62l-8 14M116 62l8 14' },
      { k: 'snd', ty: 'Rozwiązanie', t: 'Subwoofer w ścianie lub suficie', d: 'Pełny bas do salonu albo kina domowego bez skrzyni na podłodze.', sp: [['Głośnik', '200 mm (KEF Ci200QSb)'], ['Otwór', '238×238 mm'], ['Głębokość', '101,6 mm'], ['Pasmo', '30–140 Hz ze wzmacniaczem']], plan: ['Zamknięta przestrzeń o objętości z tabeli producenta', 'Miejsce na wzmacniacz w szafie rack'], pr: 'np. KEF Ci200QSb-THX', dla: ['Kino domowe', 'Salon'], st: '[SZEF: dostępność marki u nas]', art: 'M60 26h80v70H60zM100 61a22 22 0 1 0 .1 0M100 61a9 9 0 1 0 .1 0' },
      { k: 'snd', ty: 'Rozwiązanie', t: 'Głośniki w suficie jako strefa Sonos', d: 'Wzmacniacz Sonos Amp zamienia zwykłe głośniki sufitowe w strefę sterowaną z aplikacji, z AirPlay i dźwiękiem z telewizora.', sp: [['Moc', '2×125 W przy 8 Ω'], ['Złącza', 'HDMI eARC, wejście liniowe, subwoofer'], ['Głośniki', 'do 3 par na jeden Amp'], ['Wymiary', '64×217×217 mm']], plan: ['Szafa rack z wentylacją i kabel sieciowy do wzmacniacza', 'Osobny przewód głośnikowy z każdej strefy do szafy'], pr: 'Sonos Amp; nowy Amp Multi: 8 kanałów, 4 strefy', dla: ['Dom', 'Apartament', 'Restauracja'], st: '', art: 'M40 46h120v30H40zM56 61h20M140 61a5 5 0 1 0 .1 0M40 86l-14 14M160 86l14 14' },
      { k: 'snd', ty: 'Nowość', t: 'Hi-Fi jako rzeźba na ścianie', d: 'Modułowe głośniki z drewna i miedzi połączone rurkami w kompozycję na ścianie. Instalacja artystyczna, która gra.', sp: [['Moduły', 'do 10 głośników i 1 zasilacz'], ['Głośnik', 'Ø 300–350 × 108 mm'], ['Wejścia', '2× RCA, jack 3,5 mm, Bluetooth'], ['Producent', 'Ultrasonic Audio, Słowenia']], plan: ['Ściana pod kompozycję, uzgodniona z projektem wnętrza', 'Gniazdo zasilania przy zasilaczu systemu'], pr: 'Molecule (Ultrasonic Audio)', dla: ['Feature wall', 'Salon', 'Lobby'], st: '[SZEF: dostępność marki u nas]', art: 'M44 40a16 16 0 1 0 .1 0M112 30a20 20 0 1 0 .1 0M158 74a14 14 0 1 0 .1 0M60 42l34 -6M128 44l20 20M44 72v20h114' },
      { k: 'scr', ty: 'Rozwiązanie', t: 'Telewizor, który wygląda jak obraz', d: 'Matowy ekran i wymienne ramki. Wyłączony telewizor pokazuje grafiki, a przewody prowadzą do osobnego modułu w szafce.', sp: [['Grubość', 'ok. 25 mm (The Frame 55")'], ['Montaż', 'płasko, uchwyt Slim Fit w zestawie'], ['Ramki', 'brąz, tek, biel, piaskowe złoto'], ['Wersja Pro', 'moduł bezprzewodowy do 10 m']], plan: ['Miejsce na moduł One Connect w szafce i trasa przewodu w rurze', 'Wersja Pro: modułu nie zamykać w metalowej szafce'], pr: 'Samsung The Frame / The Frame Pro', dla: ['Salon', 'Sypialnia', 'Hotel'], st: '', art: 'M34 26h132v74H34zM42 34h116v58H42zM58 80l24 -26 18 18 14 -12 22 20' },
      { k: 'scr', ty: 'Rozwiązanie', t: 'Projektor laserowy przy ścianie', d: 'Projektor stoi w meblu tuż przy ścianie i daje obraz do 150". Zamiast dużego telewizora: gładka ściana albo ekran.', sp: [['Jasność', '4000 lm (Epson EH-LS800B)'], ['Obraz', '32–150"'], ['Odległość', '100" z ok. 10 cm od ściany'], ['Mebel', 'głębokość ok. 35 cm']], plan: ['Gładka ściana albo ekran ALR', 'Mebel z zasilaniem, HDMI i siecią'], pr: 'np. Epson EH-LS800B', dla: ['Kino domowe', 'Salon', 'Sala konferencyjna'], st: '', art: 'M30 24h140v62H30zM70 98h60v10H70zM100 98l-40 -12M100 98l40 -12' },
      { k: 'scr', ty: 'Rozwiązanie', t: 'Telewizor chowany w suficie lub meblu', d: 'Ekran wysuwa się z sufitu albo komody na pilota lub z systemu automatyki. Gdy niepotrzebny, znika.', sp: [['Ekrany', '40–86"'], ['Pustka w suficie', '210–270 mm'], ['Nośność', 'do 140 kg'], ['Sterowanie', 'RS232, styk, IR']], plan: ['Strop przeniesie ciężar mechanizmu (nawet ok. 145 kg)', 'Klapa rewizyjna, zasilanie i sygnał w suficie'], pr: 'np. Future Automation', dla: ['Sypialnia', 'Salon', 'Apartament premium'], st: '[SZEF: dostępność marki u nas]', art: 'M30 30h140M80 30v12h40V30M70 42h60v40H70zM100 90v14M90 98l10 8 10 -8' },
      { k: 'scr', ty: 'Rozwiązanie', t: 'Ekran w witrynie czytelny w słońcu', d: 'Profesjonalny ekran do witryny, menu albo pylonu: wysoka jasność, praca całą dobę, odporność na pogodę.', sp: [['Jasność', '3500 nit typowo (Samsung OHDX 55")'], ['Odporność', 'IP56, IK10, od −30 do +50 °C'], ['Praca', '24/7'], ['Głębokość', '69 mm']], plan: ['Obwód zasilania o odpowiedniej mocy i kabel sieciowy', 'Konstrukcja nośna pod mocowanie VESA'], pr: 'Samsung Smart Signage', dla: ['Sklep', 'Restauracja', 'Hotel'], st: '', art: 'M60 18h80v74H60zM92 92v16M76 108h48M72 34h56M72 46h40M72 58h50' },
      { k: 'smart', ty: 'Nowość', t: 'Szklane panele z własnymi ikonami', d: 'Polski system Ampio. Jeden szklany panel zamiast rzędu włączników. Kolor szkła, ikony i podpisy ustawiasz w kreatorze i pokazujesz inwestorowi.', sp: [['Rozmiary', '90×90 i 90×160 mm'], ['Pola', 'od 2 do 18, z ekranem albo bez'], ['Krawędź', 'szlif 2 albo 5 mm'], ['Nowość', 'M-DOT-T6 z ekranem dotykowym']], plan: ['Puszka osadzona głębiej niż standardowo, panel równo ze ścianą', 'Przewód magistrali Ampio do każdego panelu'], pr: 'Ampio M-DOT, kreator paneli Ampio', dla: ['Dom', 'Apartament', 'Hotel'], st: '', art: 'M60 22h80v80H60zM80 44a7 7 0 1 0 .1 0M120 44a7 7 0 1 0 .1 0M80 80a7 7 0 1 0 .1 0M120 80a7 7 0 1 0 .1 0' },
      { k: 'smart', ty: 'Rozwiązanie', t: 'Smart home z Apple, Google i Alexą', d: 'Wybrane funkcje Ampio udostępnione w standardzie Matter. Inwestor steruje światłem i roletami także głosem, z ulubionej aplikacji.', sp: [['Standard', 'Matter'], ['Ekosystemy', 'Apple Home, Google Home, Alexa'], ['Parowanie', 'kod QR'], ['Działa bez internetu', 'system Ampio lokalnie']], plan: ['Serwer Ampio z aktualnym oprogramowaniem', 'Stabilna sieć LAN w szafie rack'], pr: 'Ampio + Matter', dla: ['Dom', 'Apartament'], st: '', art: 'M100 30a30 30 0 1 0 .1 0M100 46v30M84 62h32M60 100h80' },
      { k: 'wifi', ty: 'Nowość', t: 'Wi-Fi 7 z sufitu i ze ściany', d: 'Trójpasmowe punkty Wi-Fi 7 (także 6 GHz) w sufit albo na ścianę. Szybki internet w całym domu i ogrodzie, bez routerów na widoku.', sp: [['Wymiary', '150×103×36 mm (U7 Pro Wall)'], ['Zasilanie', 'PoE+, maks. 22 W'], ['Port', '2,5 GbE'], ['Pasma', '2,4 / 5 / 6 GHz']], plan: ['Kabel kat. 6 albo 6A do każdego punktu', 'Rozmieszczenie według projektu radiowego'], pr: 'np. UniFi U7 Pro, TP-Link Omada', dla: ['Dom', 'Hotel', 'Biuro'], st: '', art: 'M100 66a30 9 0 1 0 .1 0M70 46a40 40 0 0 1 60 0M80 54a26 26 0 0 1 40 0M100 66v-34' },
      { k: 'wifi', ty: 'Rozwiązanie', t: 'Wi-Fi i gniazda w puszce, w każdym pokoju', d: 'Punkt Wi-Fi podtynkowy z gniazdami sieciowymi dla telewizora i telefonu. Jeden kabel na pokój hotelu albo apartamentu.', sp: [['Wymiary', '137×99×30 mm (U7 In-Wall)'], ['Porty', '3× 2,5 GbE, jeden z PoE'], ['Zasięg', 'ok. 115 m²'], ['Pobór', 'maks. 13 W']], plan: ['Puszka podtynkowa przy biurku albo TV', 'Jeden kabel sieciowy do każdego pokoju'], pr: 'np. UniFi U7 In-Wall', dla: ['Hotel', 'Pensjonat', 'Apartamenty'], st: '', art: 'M66 26h68v76H66zM82 80h12v10H82zM106 80h12v10h-12zM84 48a24 24 0 0 1 32 0M90 56a14 14 0 0 1 20 0' },
      { k: 'kam', ty: 'Nowość', t: 'Kamery w kolorze elewacji, z AI', d: 'Kolorowy obraz w nocy i wykrywanie człowieka i auta zamiast alarmów od kotów i liści. Obudowa biała albo czarna, dobrana do elewacji.', sp: [['Rozdzielczość', '8 MP, obiektyw F1.0'], ['Noc', 'kolor, doświetlenie do 30 m'], ['Odstraszanie', 'światło i dźwięk'], ['Obudowa', 'IP67, biała lub czarna']], plan: ['Kabel sieciowy do każdego punktu kamery', 'Kolor obudowy i miejsce dobrane do detalu elewacji'], pr: 'np. Hikvision ColorVu 3.0, UniFi G6', dla: ['Dom', 'Pensjonat', 'Osiedle'], st: '', art: 'M40 50l70 -26 12 30 -66 26zM110 24l16 -6 8 22-12 6M60 76l8 26H50' },
      { k: 'kam', ty: 'Nowość', t: 'Wideodomofon z rozpoznawaniem twarzy', d: 'Panel przy furtce otwiera domownikom bez klucza: twarz, karta albo kod QR dla gościa. Rozmowa w telefonie z dowolnego miejsca.', sp: [['Kamery', '2× 2 MP'], ['Dostęp', 'twarz, karta 13,56 MHz, kod QR'], ['Zasilanie', 'PoE 802.3af'], ['Odporność', 'IP65, od −40 do +60 °C']], plan: ['Kabel sieciowy do panelu przy furtce i do monitora w domu', 'Przewód do elektrozaczepu albo napędu bramy'], pr: 'np. Hikvision DS-KV9503-WBE1', dla: ['Dom', 'Osiedle', 'Biuro'], st: '', art: 'M76 20h48v88H76zM100 40a10 10 0 1 0 .1 0M86 64h28v20H86zM90 96h20' },
      { k: 'kam', ty: 'Rozwiązanie', t: 'Zamek bez klucza do apartamentu', d: 'Gość dostaje kod albo dostęp w telefonie tylko na czas pobytu. Właściciel widzi historię wejść i nie przekazuje kluczy.', sp: [['Dostęp', 'telefon, kod, odcisk palca'], ['Uprawnienia', 'do 200'], ['Łączność', 'Matter, Thread, Wi-Fi'], ['Zasilanie', 'akumulator ok. 6 miesięcy']], plan: ['Drzwi z wkładką europejską', 'Zasięg sieci przy drzwiach wejściowych'], pr: 'np. Nuki Smart Lock, zamki hotelowe', dla: ['Apartament na wynajem', 'Pensjonat'], st: '[SZEF: dostępność marki u nas]', art: 'M70 24h60v80H70zM100 52a12 12 0 1 0 .1 0M96 64h8v20h-8zM140 40h20M140 52h14' },
      { k: 'kam', ty: 'Rozwiązanie', t: 'Alarm i włączniki w kolorach wnętrza', d: 'Bezprzewodowy alarm i włączniki z frontami w kilku kolorach. Elementy pasują do wnętrza, a montaż w wykończonym domu nie wymaga kucia.', sp: [['Kolory frontu', '8, od bieli po czerń i oliwkowy'], ['Łączność', 'radiowa, bez kucia'], ['Sterowanie', 'aplikacja'], ['Montaż', 'także po wykończeniu']], plan: ['Puszki pod włączniki', 'Centrala w miejscu z zasilaniem i siecią'], pr: 'np. Ajax LightSwitch', dla: ['Dom', 'Apartament', 'Remont'], st: '', art: 'M40 34h50v60H40zM110 34h50v60h-50zM65 54v20M135 54v20' },
      { k: 'ev', ty: 'Rozwiązanie', t: 'Ładowarki z podziałem mocy', d: 'Polskie ładowarki Elzab EcoPower: do garażu, na ścianę i na parking. Przy kilku stacjach moc przyłącza dzielona automatycznie.', sp: [['CC Home', '3,7 / 7,4 / 11 kW'], ['CC Wall', 'od 1×11 do 2×22 kW, RFID, OCPP'], ['CC City', 'stacja na parking, licznik MID'], ['Kilka stacji', 'dynamiczny podział mocy']], plan: ['Osobny obwód i moc przyłącza (3 fazy dla 11 i 22 kW)', 'Przy kilku stacjach kabel komunikacyjny, przy CC City fundament'], pr: 'Elzab EcoPower CC Home, CC Wall, CC City', dla: ['Dom', 'Pensjonat', 'Garaż podziemny'], st: '', art: 'M70 22h50v80H70zM96 40l-10 20h14l-8 20M120 60h24v34M144 94a8 8 0 1 0 .1 0' },
      { k: 'sz', ty: 'Szkolenie', t: 'Prezentacja dla pracowni', d: 'Krótka prezentacja w Twojej pracowni: co zaplanować w projekcie pod smart home, dźwięk, sieć i monitoring. Z próbkami urządzeń do dotknięcia.', sp: [['Gdzie', 'w pracowni albo w salonie PRO-KOM'], ['Dla kogo', 'architekci, projektanci, zespoły'], ['Z czym', 'próbki: panel, głośnik, kamera, Wi-Fi'], ['Koszt', 'bezpłatnie']], plan: ['Termin ustalamy z Tobą', 'Pytania z bieżących projektów mile widziane'], pr: '', dla: ['Pracownie architektoniczne', 'Biura projektowe'], st: '[SZEF: kto prowadzi, czy w salonie]', art: 'M36 28h128v64H36zM56 48h50M56 60h70M56 72h40M150 104l-14 -12M50 104l14 -12' },
      { k: 'sz', ty: 'Oferta', t: 'Oferta dla pracowni', d: 'Wytyczne do projektu i konsultacja dla Twoich inwestorów. Warunki współpracy opiszemy tutaj, gdy zostaną ustalone.', sp: [['Konsultacja', 'na etapie projektu'], ['Wytyczne', 'plan urządzeń, trasy, szafa rack'], ['Opiekun', 'jedna osoba do projektu'], ['Warunki', 'do ustalenia']], plan: ['Wyślij rzuty i etap projektu', 'Oddzwonimy z propozycją zakresu'], pr: '', dla: ['Architekci', 'Projektanci wnętrz'], st: '[SZEF: warunki współpracy]', art: 'M50 26h100v74H50zM70 46h60M70 60h60M70 74h36M118 82l8 8 16 -18' }
    ];
    const nwL = NW.map((n, i) => Object.assign({ i: i }, n)).filter((n) => st.nf === 'all' || n.k === st.nf);
    const sel = nwL.find((n) => n.i === st.nsel) || nwL[0] || NW[0];
    const nstep = (d) => { const idx = nwL.findIndex((n) => n.i === sel.i); const nx = nwL[(idx + d + nwL.length) % nwL.length]; self.setState({ nsel: nx.i }); };
    const nw = {
      f: NF.map((f) => { const n = f[0] === 'all' ? NW.length : NW.filter((x) => x.k === f[0]).length; return { n: f[1], c: String(n), cls: 'chip' + (st.nf === f[0] ? ' on' : ''), on: st.nf === f[0] ? 'true' : 'false', go: () => self.setState({ nf: f[0], nsel: -1 }) }; }),
      items: nwL.map((n) => ({ t: n.t, ty: n.ty, art: n.art, key: n.sp[0][1], cat: CAT[n.k], st: '--hc:' + (HU[n.k] || '#F2B84B'), cls: 'arnwi' + (n.i === sel.i ? ' on' : ''), on: n.i === sel.i ? 'true' : 'false', tyCls: 'arty' + (n.ty === 'Szkolenie' || n.ty === 'Oferta' ? ' hot' : ''), go: () => self.setState({ nsel: n.i }) })),
      cur: { t: sel.t, d: sel.d, ty: sel.ty, cat: CAT[sel.k], art: sel.art, st: '--hc:' + (HU[sel.k] || '#F2B84B'), tyCls: 'arty' + (sel.ty === 'Szkolenie' || sel.ty === 'Oferta' ? ' hot' : ''), sp: sel.sp.map((x) => ({ l: x[0], v: x[1] })), plan: sel.plan.map((x) => ({ x: x })), pr: sel.pr, hasPr: !!sel.pr, dla: sel.dla.map((x) => ({ n: x })), stt: sel.st, hasSt: !!sel.st, pos: (nwL.findIndex((n) => n.i === sel.i) + 1) + ' / ' + nwL.length },
      prev: () => nstep(-1), next: () => nstep(1),
      nlMail: st.nlMail, onNl: (e) => self.setState({ nlMail: e && e.target ? e.target.value : '' }), nlOk: st.nlOk, nlForm: !st.nlOk,
      nlGo: () => { if (/.+@.+\..+/.test(st.nlMail || '')) self.setState({ nlOk: true }); }
    };

    // Przepisy 2026–2028 (stan na 28.10.2026; źródła w dokumentacji, nie na stronie)
    const PRZ = [
      { d: '20.09.2026', y: 'IX 2026', s: 'Okres przejściowy', c: 'warn', t: 'Stare warunki techniczne tylko z oświadczeniem', x: 'Rozporządzenie o warunkach technicznych z 2002 r. straciło moc. Do 20.03.2028 projekt można przygotować według starych przepisów, jeśli inwestor złoży oświadczenie (art. 102a Prawa budowlanego).', p: 'Na starcie projektu ustal z inwestorem, według których przepisów projektujesz. Od tego zależą wymagania dla instalacji telekomunikacyjnej.' },
      { d: 'w toku', y: 'nowe WT', s: 'Czekamy', c: 'mut', t: 'Nowe warunki techniczne', x: 'Nowe rozporządzenie o warunkach technicznych nie zostało jeszcze ogłoszone (stan na październik 2026).', p: 'Przy każdym projekcie sprawdzamy aktualny stan prawny i dopasowujemy wytyczne.' },
      { d: '12.02.2026', y: 'II 2026', s: 'Obowiązuje', c: 'ok', t: 'Budynek gotowy na światłowód (GIA)', x: 'Unijne rozporządzenie o infrastrukturze gigabitowej: budynki z wnioskiem o pozwolenie złożonym po 12.02.2026 mają mieć infrastrukturę gotową na światłowód i okablowanie światłowodowe. Budynki wielolokalowe także punkt dostępu.', p: 'Rura od granicy działki, trasa do pomieszczenia technicznego i światłowód do punktu zakończenia sieci w budynku.' },
      { d: 'w toku', y: 'ustawa', s: 'W przygotowaniu', c: 'mut', t: 'Polska ustawa wdrażająca GIA', x: 'Projekt nowelizacji megaustawy jest w przygotowaniu. Ma m.in. rozstrzygnąć, czy obowiązek obejmie domy jednorodzinne budowane na własne potrzeby.', p: 'Do czasu uchwalenia rekomendujemy przygotowanie pod światłowód także w domu jednorodzinnym. To rura i trasa, niewielki koszt.' },
      { d: 'od 2013', y: '2013', s: 'Stare WT', c: 'ok', t: 'Instalacja telekomunikacyjna w budynku wielorodzinnym', x: 'Według rozdziału 8a starych warunków technicznych: punkt styku, kanalizacja teletechniczna, co najmniej 2 włókna jednomodowe, 2 skrętki i przewód koncentryczny do każdego mieszkania.', p: 'Dla projektów na starych WT: punkt styku w szafie, skrzynki mieszkaniowe, piony i pomiary do dokumentacji.' },
      { d: '29.05.2026', y: 'V 2026', s: 'Czeka na wdrożenie', c: 'warn', t: 'Ładowanie aut w budynkach mieszkalnych (EPBD)', x: 'Dyrektywa budynkowa: w nowych budynkach mieszkalnych z więcej niż 3 miejscami postojowymi okablowanie co najmniej 50% miejsc, kanały na pozostałe, co najmniej 1 punkt ładowania i 2 miejsca rowerowe na lokal. Termin wdrożenia minął, Polska jeszcze jej nie wdrożyła.', p: 'Warto przewidzieć kanały i moc już teraz. Dołożenie ich po wykończeniu garażu kosztuje więcej.' },
      { d: '20.05.2026', y: 'V 2026', s: 'Obowiązuje', c: 'ok', t: 'Rejestr najmu krótkoterminowego', x: 'Unijne rozporządzenie: każdy lokal na wynajem krótkoterminowy potrzebuje numeru rejestracyjnego. Polska ustawa z karami do 50 tys. zł przeszła przez Sejm 8.10.2026.', p: 'Apartamenty inwestycyjne projektuj od razu pod zdalną obsługę: zamek z kodem, Wi-Fi dla gości, podgląd i serwis zdalny.' },
      { d: 'zawsze', y: 'RODO', s: 'Obowiązuje', c: 'ok', t: 'Kamery a RODO', x: 'Kamera przy domu, która obejmuje ulicę albo posesję sąsiada, podlega RODO (wyrok TSUE C-212/13). W firmie nagrania przechowuje się najwyżej 3 miesiące, a pracowników informuje 2 tygodnie przed uruchomieniem.', p: 'Kąty kamer i maski prywatności ustalamy już na rzutach, nie po montażu.' }
    ];
    const prz = PRZ.map((r) => ({ d: r.d, s: r.s, t: r.t, x: r.x, p: r.p, cls: 'arprst ' + r.c }));
    const TL = [['2013', 'Instalacja telekom. w budynkach wielorodzinnych'], ['12.02.2026', 'GIA: gotowość na światłowód'], ['20.05.2026', 'Rejestr najmu krótkoterminowego'], ['29.05.2026', 'Termin wdrożenia EPBD'], ['20.09.2026', 'Koniec WT z 2002 r.'], ['20.03.2028', 'Koniec okresu przejściowego']].map((t, i) => ({ d: t[0], n: t[1], cls: 'artl' + (i === 4 ? ' now' : '') }));
    const PK = [
      { ic: P.office, t: 'W Twojej pracowni', d: 'Przyjeżdżamy z próbkami: panel Ampio, głośnik sufitowy, kamera, punkt Wi-Fi. Pokazujemy, co zaplanować w projekcie.', tag: 'Podhale i Kraków' },
      { ic: P.shop, t: 'W salonie PRO-KOM', d: 'Rabka-Zdrój albo Zakopane. Zobaczysz i usłyszysz rozwiązania, które możesz pokazać inwestorowi.', tag: '[SZEF: co mamy na pokazie]' },
      { ic: P.crane, t: 'Na budowie, z inwestorem', d: 'Wizja lokalna z Tobą i inwestorem. Na miejscu ustalamy miejsca urządzeń i trasy kabli.', tag: 'Przed tynkami' }
    ];
    const ZA = [
      { ic: P.layers, t: 'Twój projekt, Twoje decyzje', d: 'Dobieramy technikę pod projekt, nie pod markę. Jeśli coś koliduje z wnętrzem, szukamy innego rozwiązania.' },
      { ic: P.shield, t: 'Grasz pierwsze skrzypce', d: 'Z inwestorem rozmawiamy razem z Tobą albo za Twoją zgodą. Nie zmieniamy projektu za Twoimi plecami.' },
      { ic: P.doc, t: 'Wycena na piśmie', d: 'Zakres, sprzęt i cena czarno na białym, w wariantach do wyboru. Inwestor wie, za co płaci.' },
      { ic: P.users, t: 'Jeden opiekun', d: 'Jedna osoba od pierwszej rozmowy do odbioru. Nie tłumaczysz projektu od nowa każdemu monterowi.' },
      { ic: P.check, t: 'Gwarancja 24 miesiące', d: 'Na montaż. Sprzęt według gwarancji producenta. Serwis i przeglądy po montażu.' },
      { ic: P.star, t: 'Warunki dla pracowni', d: '[SZEF: opisane jawnie albo „ustalamy indywidualnie”]' }
    ];
    const FAQ = [
      ['Kiedy najlepiej nas zaprosić?', 'Na etapie koncepcji albo projektu budowlanego. Wtedy miejsce na szafę rack, przepusty, moc pod ładowarkę i sufity pod głośniki nic nie kosztują. Pomożemy też później, ale przed tynkami to ostatni moment bez kucia.'],
      ['Czy muszę znać się na smart home i sieciach?', 'Nie. Wystarczą rzuty i rozmowa o potrzebach inwestora. Technikę bierzemy na siebie, a do projektu oddajemy proste wytyczne.'],
      ['Co dostanę do projektu?', 'Plan urządzeń na rzutach, wytyczne kablowe, wymagania dla szafy rack i opis systemów prostym językiem. Zakres ustalamy na początku, zależnie od etapu i obiektu.'],
      ['Czy pracujecie z projektem elektrycznym innego projektanta?', 'Tak. Instalacje niskoprądowe uzgadniamy z projektantem elektrycznym i wykonawcą. Zasilanie, moc i zabezpieczenia zostają w jego branży.'],
      ['Czy pomożecie, jeśli inwestor wybierze innego wykonawcę?', 'Jedno pytanie do projektu zawsze. Zadzwoń i zapytaj. Pełne wytyczne przygotowujemy do projektów, które realizujemy. [SZEF: potwierdzić]'],
      ['Ile to kosztuje inwestora?', 'Zależy od obiektu i zakresu. Na etapie projektu podajemy orientacyjny budżet w wariantach, a dokładną wycenę na piśmie po wizji lokalnej.'],
      ['Jaki obszar obsługujecie?', 'Podhale i Małopolskę: salony w Rabce-Zdroju i Zakopanem. Przy większych inwestycjach jedziemy dalej, dojazd ustalamy indywidualnie.'],
      ['Według których przepisów projektować teletechnikę w 2026 r.?', 'Stare warunki techniczne straciły moc 20.09.2026. Do 20.03.2028 można projektować według nich, jeśli inwestor złoży oświadczenie. Nowe warunki nie zostały jeszcze ogłoszone, dlatego stan prawny sprawdzamy przy każdym projekcie.'],
      ['Czy dom jednorodzinny musi mieć światłowód?', 'Unijne rozporządzenie GIA obejmuje nowe budynki z wnioskiem o pozwolenie po 12.02.2026. Polska ustawa, która może zwolnić domy budowane na własne potrzeby, jest w przygotowaniu. Rura pod światłowód kosztuje niewiele, więc rekomendujemy ją w każdym projekcie.'],
      ['Kto zajmuje się serwisem po odbiorze?', 'My. Inwestor dostaje jeden numer do wszystkich instalacji. Na montaż dajemy 24 miesiące gwarancji, a przeglądy robimy przed sezonem.']
    ];

    // Formularz „Wyślij rzuty”
    // Dla kogo: przełącznik odbiorcy
    const AUD = [
      { k: 'arch', n: 'Architekt', ic: P.ruler, h: 'Projekt, który obroni się na budowie.', d: 'Technikę wpisujesz w projekt raz, w odpowiednim miejscu. Bez improwizacji ekipy i bez kucia po tynkach.', pts: ['Plan urządzeń na Twoich rzutach (kamery, czujki, głośniki, Wi-Fi, panele)', 'Wytyczne dla branży elektrycznej: szafa rack, przepusty, moc pod ładowarkę', 'Opis systemów prostym językiem dla inwestora', 'Konsultacja na etapie koncepcji, zanim zamkniesz projekt'], cta: 'Wyślij rzuty', href: '#wyslij' },
      { k: 'wn', n: 'Projektant wnętrz', ic: P.eye, h: 'Technika, której nie widać we wnętrzu.', d: 'Dobieramy urządzenia do wnętrza, a nie wnętrze do urządzeń: maskownice, kolor szkła paneli, zabudowy, głośniki pod gładzią.', pts: ['Głośniki w suficie i pod gładzią, maskownice do malowania', 'Szklane panele Ampio: kolor, ikony i podpisy pod projekt', 'Telewizor w zabudowie bez kabli, sprzęt w szafie', 'Pokaz próbek w Twojej pracowni'], cta: 'Zobacz rozwiązania', href: '#nowosci' },
      { k: 'dev', n: 'Deweloper', ic: P.apt, h: 'Budynek gotowy na odbiór i na sprzedaż.', d: 'Teletechnika budynku z pomiarami, części wspólne, garaż z ładowaniem i opcja smart apartamentu. Jeden wykonawca niskoprądówki.', pts: ['Instalacja telekomunikacyjna: punkt styku, skrzynki w lokalach, światłowód', 'Wideodomofony, kontrola dostępu do klatek i garażu, monitoring', 'Ładowarki i przygotowanie miejsc postojowych', 'Pomiary i dokumentacja do odbioru'], cta: 'Zakres dla dewelopera', href: '#deweloperzy' },
      { k: 'gw', n: 'Generalny wykonawca', ic: P.crane, h: 'Podwykonawca, który trzyma harmonogram.', d: 'Wchodzimy na budowę w uzgodnionych oknach: przed tynkami i przy wykończeniu. Jedna osoba kontaktowa dla kierownika budowy.', pts: ['Okablowanie i puszki przed tynkami, zdjęcia tras', 'Koordynacja z elektrykiem i ekipą wykończeniową', 'Montaż, uruchomienie i szkolenie użytkownika', 'Serwis po odbiorze, bez telefonów do Ciebie'], cta: 'Umów wizję na budowie', href: '#wyslij' }
    ];
    const au = AUD.find((a) => a.k === st.aud) || AUD[0];
    const aud = { tabs: AUD.map((a) => ({ n: a.n, ic: a.ic, cls: 'araud' + (a.k === au.k ? ' on' : ''), on: a.k === au.k ? 'true' : 'false', go: () => self.setState({ aud: a.k }) })), cur: { h: au.h, d: au.d, pts: au.pts.map((x) => ({ x: x })), cta: au.cta, href: au.href, ic: au.ic } };

    // Liczby do projektu
    const LZ = [
      { k: 'wifi', b: '90 m', t: 'kabla stałego w torze skrętki', d: 'Kanał do 100 m z kablami przyłączeniowymi. Szafa rack w środku budynku, nie na jego końcu.' },
      { k: 'wifi', b: '55 / 100 m', t: '10 Gb/s: Cat6 / Cat6A', d: 'Cat6 przenosi 10 Gb/s na 37–55 m, Cat6A na 100 m. Przy długich trasach kładziemy Cat6A.' },
      { k: 'wifi', b: '13–71 W', t: 'moc PoE dla urządzenia', d: '802.3af 13 W, at 25,5 W, bt 51 i 71 W. Kamera i punkt Wi-Fi na jednym kablu, bez gniazdka obok.' },
      { k: 'wifi', b: '10–12 m', t: 'odstęp punktów Wi-Fi', d: 'Na środku sufitu, nie w rogu. Tak zalecają wytyczne TP-Link Omada.' },
      { k: 'kam', b: '6–12 W', t: 'pobór kamery IP', d: 'Np. Hikvision ColorVu 8 MP maks. 6,5 W, kamera z motozoomem ok. 12 W. Wystarczy PoE 802.3af.' },
      { k: 'snd', b: 'Ø 200–210', t: 'mm otworu, głośnik 6–6,5"', d: 'Głębokość zabudowy 92–120 mm. Głośnik 8": otwór ok. 257 mm, głębokość ok. 135 mm.' },
      { k: 'snd', b: '1,8–3 m', t: 'rozstaw pary stereo w suficie', d: 'Miejsce słuchania mniej więcej pośrodku. Pokój do ok. 14 m² to zwykle jedna para.' },
      { k: 'snd', b: '2–3 mm', t: 'maks. wykończenia na głośniku pod gładzią', d: 'Amina do 2 mm, Sonance Invisible do 3 mm. Gładź na wysoki standard, cienkie warstwy.' },
      { k: 'scr', b: '30–40°', t: 'kąt widzenia ekranu', d: 'Z 2,1 m to ekran ok. 55–70". Środek ekranu na wysokości oczu siedzącego.' },
      { k: 'wifi', b: '44,45 mm', t: '1U w szafie 19"', d: 'Szafa wisząca 600×450 mm daje ok. 39 cm użytecznej głębokości. Do tego wentylacja i osobny obwód.' },
      { k: 'ev', b: '3,7–22 kW', t: 'moc ładowarki', d: '3,7 kW: 1 faza 16 A. 11 kW: 3 fazy 16 A. 22 kW: 3 fazy 32 A. Moc przyłącza ustal z elektrykiem.' },
      { k: 'smart', b: '90×90', t: 'mm panelu Ampio M-DOT', d: 'Także 90×160 mm, od 2 do 18 pól dotykowych. Puszka osadzona głębiej niż standardowo.' },
      { k: 'ant', b: '13°E', t: 'satelita Hot Bird', d: 'Przewód 75 Ω z ekranowaniem klasy A. Osobny przewód do każdego odbiornika z multiswitcha.' },
      { k: 'tel', b: '≤ 1,2 dB', t: 'tłumienie toru światłowodu w lokalu', d: 'Od skrzynki mieszkaniowej do punktu styku w budynku wielorodzinnym. Pomiary w dokumentacji powykonawczej.' }
    ];
    const lz = LZ.map((x) => ({ b: x.b, t: x.t, d: x.d, st: '--hc:' + HU[x.k] }));

    // Deweloperzy
    const DV = [
      { k: 'lok', n: 'Lokale', ic: P.key, h: 'W każdym mieszkaniu i apartamencie', it: ['Skrzynka mieszkaniowa: światłowód jednomodowy, skrętka, przewód antenowy', 'Gniazda RJ45 i TV w pokojach, punkt Wi-Fi w suficie', 'Unifon albo monitor wideodomofonu', 'Opcja: smart apartament Ampio (światło, ogrzewanie, rolety, zamek)'], why: 'Od 2013 r. każdy nowy budynek wielorodzinny musi mieć instalację telekomunikacyjną: punkt styku, skrzynkę w lokalu, światłowód, skrętkę i koncentryk.' },
      { k: 'wsp', n: 'Części wspólne', ic: P.apt, h: 'Klatki, hol, wejścia, teren', it: ['Panele wideodomofonu przy wejściach, lista lokatorów', 'Karty i breloki do klatek, rowerowni i śmietników', 'Monitoring wejść, holu i terenu z zasadami RODO', 'Zbiorcza instalacja RTV/SAT dla całego budynku'], why: 'Bezpieczeństwo to priorytet dla 50% szukających domu i 34% szukających mieszkania. Najwyżej oceniają czujniki, monitoring i alarm.' },
      { k: 'gar', n: 'Garaż i parking', ic: P.car, h: 'Wjazd, miejsca postojowe, ładowanie', it: ['Szlaban albo brama: pilot, karta, aplikacja, odczyt tablic', 'Monitoring wjazdu i hali garażowej', 'Ładowarki Elzab EcoPower z podziałem mocy', 'Okablowanie i kanały pod kolejne punkty ładowania'], why: 'Gotowość do zakupu auta elektrycznego rośnie z 17% do 29%, gdy kierowca ma ładowarkę tam, gdzie parkuje na noc.' },
      { k: 'inw', n: 'Apartamenty inwestycyjne', ic: P.bed, h: 'Lokale na wynajem krótkoterminowy', it: ['Zamki z kodem: gość wchodzi sam, kod ważny tylko w czasie pobytu', 'Wi-Fi dla gości i telewizja w każdym lokalu', 'Ogrzewanie w trybie oszczędnym, gdy lokal stoi pusty', 'Zdalny podgląd i serwis z Rabki i Zakopanego'], why: 'W Zakopanem działa ok. 3,5 tys. ofert najmu krótkoterminowego, średnie obłożenie ok. 48%. Od 20.05.2026 każdy lokal potrzebuje numeru rejestrowego.' },
      { k: 'odb', n: 'Odbiór i dokumentacja', ic: P.doc, h: 'Pomiary, protokoły, przekazanie', it: ['Pomiary torów światłowodowych i skrętki z protokołami', 'Dokumentacja powykonawcza: trasy, opisy, zestawienia', 'Szkolenie zarządcy i przekazanie haseł', 'Umowa serwisowa dla wspólnoty albo zarządcy'], why: 'Pomiary światłowodu trafiają do dokumentacji powykonawczej. Tłumienie toru od skrzynki w lokalu do punktu styku nie powinno przekraczać 1,2 dB.' }
    ];
    const dv0 = DV.find((d) => d.k === st.dv) || DV[0];
    const dv = { tabs: DV.map((d) => ({ n: d.n, ic: d.ic, cls: 'ardvt' + (d.k === dv0.k ? ' on' : ''), on: d.k === dv0.k ? 'true' : 'false', go: () => self.setState({ dv: d.k }) })), cur: { h: dv0.h, ic: dv0.ic, it: dv0.it.map((x) => ({ x: x })), why: dv0.why },
      data: [{ b: '321', s: 'mieszkań oddanych w 2024 r. w powiecie tatrzańskim (849 w nowotarskim)' }, { b: '4 tys.+', s: 'lokali inwestycyjnych planowanych do 2026 r. w polskich kurortach górskich' }, { b: '20%+', s: 'nowych inwestycji w Polsce ma już miejsca z ładowaniem aut' }] };

    // Doświadczenie
    const EXP = {
      kv: [{ b: 'od 2004', s: 'PRO-KOM w Rabce-Zdroju' }, { b: '2 salony', s: 'Rabka-Zdrój i Zakopane' }, { b: '10', s: 'rodzajów instalacji u jednego wykonawcy' }, { b: '100+', s: 'klientów firmowych całej PRO-KOM' }],
      rl: [['Blachotrapez', 'sale konferencyjne i szkoleniowe, przyłącza IT, nagłośnienie'], ['Parafia św. Teresy', 'nagłośnienie i multimedia, chór'], ['Empik Zakopane i Kraków', 'nagłośnienie i multimedia'], ['Restauracja „Aleksandra”', 'nagłośnienie'], ['Caffe Europa', 'nagłośnienie'], ['SP im. A. Mickiewicza, Rabka', 'nagłośnienie i multimedia'], ['Kaplica Sióstr Nazaretanek', 'nagłośnienie'], ['Dom prywatny, Ponice', 'instalacja RTV i SAT']].map((r) => ({ n: r[0], d: r[1] })),
      br: ['Ampio', 'Dahua', 'Hikvision', 'BCS', 'Ubiquiti', 'MikroTik', 'TP-Link Omada', 'Satel', 'Ajax', 'APART', 'JBL', 'RCF', 'Samsung', 'Elzab EcoPower'].map((n) => ({ n: n }))
    };

    // Biblioteka
    const LIB = {
      own: [
        { ic: P.check, t: 'Checklista projektanta', d: 'Co przewidzieć w projekcie, etap po etapie. PDF, 1 strona na instalację.', f: 'PDF', st: 'Na e-mail' },
        { ic: P.grid, t: 'Symbole urządzeń do rzutów', d: 'Kamery, czujki, głośniki, punkty Wi-Fi, panele, gniazda. Gotowe do wklejenia w rzut.', f: 'DWG · PDF', st: 'W przygotowaniu' },
        { ic: P.doc, t: 'Opisy systemów do projektu', d: 'Krótkie opisy monitoringu, sieci, smart home i dźwięku do części opisowej projektu.', f: 'DOCX', st: 'W przygotowaniu' },
        { ic: P.layers, t: 'Wytyczne dla szafy rack', d: 'Miejsce, wymiary, wentylacja, zasilanie i dostęp. Do pomieszczenia technicznego.', f: 'PDF', st: 'W przygotowaniu' }
      ],
      ext: [
        { t: 'Ampio: katalog dla architekta', d: 'System, panele, realizacje.', href: 'https://www.ampio.com/assets/_catalogues/architect_pl.pdf', m: 'PDF' },
        { t: 'Ampio: katalog dla dewelopera', d: 'Smart apartament w inwestycji.', href: 'https://www.ampio.com/assets/_catalogues/developer_pl.pdf', m: 'PDF' },
        { t: 'Ampio: kreator paneli', d: 'Kolor szkła, ikony, podpisy, podgląd.', href: 'https://kreatorpaneli.ampio.pl/', m: 'Narzędzie' },
        { t: 'UniFi Design Center', d: 'Rzut, symulacja zasięgu Wi-Fi, 3D.', href: 'https://design.ui.com/', m: 'Narzędzie' },
        { t: 'Omada Design Hub', d: 'Mapa zasięgu Wi-Fi i rozmieszczenie punktów.', href: 'https://design.tplinkcloud.com', m: 'Narzędzie' },
        { t: 'Dahua Project Design Tool', d: 'Pole widzenia kamer i martwe strefy.', href: 'https://support.dahuasecurity.com/en/ProjectDesignTool', m: 'Narzędzie' },
        { t: 'Ajax: kalkulatory', d: 'Zasięg radiowy, zasilanie, archiwum wideo.', href: 'https://ajax.systems/tools/', m: 'Narzędzie' },
        { t: 'Sonos dla architektów', d: 'Materiały i broszura dla inwestora.', href: 'https://www.sonos.com/pl-pl/trades/architects', m: 'Strona' }
      ]
    };

    const ROLE = ['Architekt', 'Projektant wnętrz', 'Generalny wykonawca', 'Deweloper', 'Inwestor'];
    const STAGE = ['Koncepcja', 'Projekt budowlany', 'Projekt wnętrz', 'Budowa', 'Wykończenie'];
    const FOB = ['Dom', 'Apartamenty', 'Pensjonat, hotel', 'Lokal', 'Wielorodzinny', 'Inny'];
    const fDig = (st.fPh || '').replace(/\D/g, '').length;
    const fm = {
      role: ROLE.map((n, i) => ({ n: n, cls: 'chip' + (st.role === i ? ' on' : ''), on: st.role === i ? 'true' : 'false', go: () => self.setState({ role: i }) })),
      stage: STAGE.map((n, i) => ({ n: n, cls: 'chip' + (st.stage === i ? ' on' : ''), on: st.stage === i ? 'true' : 'false', go: () => self.setState({ stage: i }) })),
      obj: FOB.map((n, i) => ({ n: n, cls: 'chip' + (st.fo === i ? ' on' : ''), on: st.fo === i ? 'true' : 'false', go: () => self.setState({ fo: i }) })),
      fName: st.fName, onName: (e) => self.setState({ fErr: '', fName: e && e.target ? e.target.value : '' }),
      fFirm: st.fFirm, onFirm: (e) => self.setState({ fFirm: e && e.target ? e.target.value : '' }),
      fPh: st.fPh, onPh: (e) => self.setState({ fErr: '', fPh: e && e.target ? e.target.value : '' }), phCls: 'zin' + (st.fErr && fDig < 9 ? ' xa-bad' : ''),
      fTown: st.fTown, onTown: (e) => self.setState({ fTown: e && e.target ? e.target.value : '' }),
      fMsg: st.fMsg, onMsg: (e) => self.setState({ fMsg: e && e.target ? e.target.value : '' }),
      onFiles: (e) => { const fl = e && e.target && e.target.files ? Array.prototype.slice.call(e.target.files, 0, 6).map((f) => ({ n: f.name, s: (f.size / 1048576).toFixed(1) + ' MB' })) : []; self.setState({ fFiles: fl }); },
      files: st.fFiles, hasFiles: !!(st.fFiles && st.fFiles.length), noFiles: !(st.fFiles && st.fFiles.length),
      fCons: st.fCons ? 'true' : 'false', tCons: () => self.setState({ fErr: '', fCons: !st.fCons }), consCls: 'consent xa-cons' + (st.fCons ? ' on' : ''),
      err: !!st.fErr, errT: st.fErr, form: !st.fSent, sent: !!st.fSent,
      sum: ROLE[st.role] + ' · ' + STAGE[st.stage] + ' · ' + FOB[st.fo] + (st.fTown ? ' · ' + st.fTown : ''),
      send: () => { const e = fDig < 9 ? 'Podaj numer telefonu (9 cyfr), żeby opiekun mógł oddzwonić.' : !st.fCons ? 'Zaznacz zgodę na kontakt w sprawie zgłoszenia.' : ''; if (e) return self.setState({ fErr: e }); self.setState({ fSent: true, fErr: '' }); },
      reset: () => self.setState({ fSent: false, fName: '', fFirm: '', fPh: '', fTown: '', fMsg: '', fFiles: [], fCons: false })
    };

    return {
      pkSt: '--h:#12B6D8', arsc: hero, ar: { prz: prz, tl: TL, aud: aud, lz: lz, dv: dv, exp: EXP, lib: LIB, prob: PROB, br: BR, et: et, wy: { od: WY.od.map((x) => ({ t: x[0], d: x[1] })), my: WY.my.map((x) => ({ t: x[0], d: x[1] })) }, ck: ck, ins: ins, nw: nw, pk: PK, za: ZA, fm: fm },
      anc: [['dla-ciebie', 'Dla kogo'], ['etapy', 'Etapy projektu'], ['checklista', 'Checklista'], ['liczby', 'Liczby do projektu'], ['instalacje', 'Instalacje'], ['nowosci', 'Nowe rozwiązania'], ['deweloperzy', 'Deweloperzy'], ['przepisy', 'Przepisy'], ['doswiadczenie', 'Doświadczenie'], ['biblioteka', 'Biblioteka'], ['faq', 'Pytania'], ['wyslij', 'Wyślij rzuty']].map((a) => ({ href: '#' + a[0], n: a[1] })),
      faq: this.faqList(FAQ, true), sx: { faqH: 'Pytania architektów.', faqA: { t: 'Jedno pytanie do projektu?', d: 'Zadzwoń albo napisz. Zawsze pomożemy, nawet jeśli chodzi tylko o puszkę pod kamerę.', cta: 'Wyślij rzuty', href: '#wyslij' } },
      ctaEye: 'Dla architektów', ctaH: 'Wyślij rzuty. Oddzwonimy z propozycją, co zaplanować.', ctaP: 'Odpowiadamy do 24 h w dni robocze. Konsultacja na etapie projektu jest bezpłatna. [SZEF: potwierdzić]', ctaBtn: 'Wyślij rzuty do konsultacji', ctaBtnHref: '#wyslij'
    };
  }
