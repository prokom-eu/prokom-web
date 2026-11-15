  initState() { return { who: 0, sys: 0, sym: 0, urg: 1, sent: false, ph: '', town: '', err: '' }; }
  navKey() { return 'srw'; }
  rvIds() { return ['pl', 'pz', 'zd', 'faq', 'rel']; }
  page(P, c) {
    const st = this.state, self = this;
    const touch = (o) => self.setState(Object.assign({ err: '' }, o));
    const dig = (st.ph || '').replace(/\D/g, '').length;
    const SYS = [['Kamery', P.cam, ['Brak obrazu', 'Nie nagrywa', 'Brak podglądu w telefonie', 'Inne']], ['Alarm', P.bell, ['Fałszywe alarmy', 'Nie da się uzbroić', 'Brak powiadomień', 'Inne']], ['Wi-Fi i sieć', P.wifi, ['Brak internetu', 'Słaby zasięg', 'Goście nie mogą się połączyć', 'Inne']], ['Zamki', P.lock, ['Kod nie działa', 'Słaba bateria', 'Brak połączenia z rezerwacjami', 'Inne']], ['Smart home', P.home, ['Scena nie działa', 'Brak sterowania z telefonu', 'Ogrzewanie', 'Inne']], ['Nagłośnienie', P.spk, ['Brak dźwięku', 'Szumy, trzaski', 'Mikrofon', 'Inne']], ['Ekrany', P.scr, ['Czarny ekran', 'Stara treść', 'Brak połączenia', 'Inne']], ['Ładowarka', P.bolt, ['Nie ładuje', 'Karta nie działa', 'Błąd na diodzie', 'Inne']], ['Antena i TV', P.dish, ['Brak sygnału', 'Obraz się rwie', 'Nowy telewizor', 'Inne']], ['Inne', P.wrench, ['Opiszę w rozmowie']]];
    const URG = ['Pilne: obiekt bez zabezpieczenia', 'W ciągu kilku dni', 'Przy najbliższym przeglądzie'];
    const s = SYS[st.sys], sym = s[2][Math.min(st.sym, s[2].length - 1)];
    const sent = !!st.sent, step = sent ? 1 : -1;
    const ST = [['Przyjęte', 'Zgłoszenie jest u nas', P.check], ['Odpowiedź', 'Do 24 h w dni robocze oddzwonimy albo odpiszemy', P.phone], ['Diagnoza lub wizyta', 'Najpierw zdalnie, za Twoją zgodą. Jeśli trzeba, ustalamy termin przyjazdu', P.cal], ['Naprawione', 'Potwierdzamy zakres wykonanych prac', P.star]];
    const sv = {
      form: !sent, track: sent,
      who: ['Montowaliście u mnie', 'Inna firma'].map((n, i) => ({ n: n, on: st.who === i ? 'true' : 'false', cls: st.who === i ? 'on' : '', pick: () => touch({ who: i }) })),
      sys: SYS.map((x, i) => ({ n: x[0], ic: x[1], on: st.sys === i ? 'true' : 'false', cls: 'chip' + (st.sys === i ? ' on' : ''), pick: () => touch({ sys: i, sym: 0 }) })),
      sym: s[2].map((n, i) => ({ n: n, on: st.sym === i ? 'true' : 'false', cls: 'chip' + (st.sym === i ? ' on' : ''), pick: () => touch({ sym: i }) })),
      urg: URG.map((n, i) => ({ n: n, on: st.urg === i ? 'true' : 'false', cls: 'chip' + (st.urg === i ? ' on' : ''), pick: () => touch({ urg: i }) })),
      ph: st.ph, onPh: (e) => touch({ ph: e && e.target ? e.target.value : '' }), town: st.town, onTown: (e) => self.setState({ town: e && e.target ? e.target.value : '' }),
      phCls: 'zin' + (st.err && dig < 9 ? ' xa-bad' : ''), err: !!st.err, errT: st.err, urgent: st.urg === 0,
      send: () => { if (dig < 9) return self.setState({ err: 'Podaj numer telefonu (9 cyfr), żebyśmy mogli oddzwonić.' }); touch({ sent: true }); }, reset: () => touch({ sent: false, ph: '', town: '' }),
      sSys: s[0], sSym: sym, sUrg: URG[st.urg],
      steps: ST.map((x, i) => ({ t: x[0], d: x[1], ic: x[2], cls: 'trs' + (i < step ? ' done' : i === step ? ' on' : '') }))
    };
    const plans = [
      { n: 'Przegląd', d: 'Dla domów i małych instalacji.', f: ['Przegląd raz w roku, przed zimą', 'Czyszczenie kamer i test nagrywania', 'Zdalna pomoc w godzinach pracy'], pr: 'od [CENA] zł rocznie' },
      { n: 'Sezon', d: 'Dla pensjonatów, restauracji i sklepów.', hot: true, f: ['Dwa przeglądy: przed zimą i przed latem', 'Zdalne sprawdzanie nagrywania i dysków [SZEF: jak często]', 'Pierwszeństwo w terminach w sezonie'], pr: 'od [CENA] zł rocznie' },
      { n: 'Pełna opieka', d: 'Dla hoteli, firm i instytucji.', f: ['Przeglądy według ustaleń', 'Stały opiekun i raport po wizycie', 'Naprawy w pierwszej kolejności', 'Odpowiedź do 24 h w dni robocze, przyjazd w terminie z umowy'], pr: 'wycena indywidualna' }
    ].map((p) => Object.assign(p, { hot: !!p.hot, cls: 'card plan ri' + (p.hot ? ' hot' : ''), pr: (this.props.ceny ?? false) ? p.pr : 'Cena po rozmowie' }));
    const pz = [
      { n: '01', t: 'Inwentaryzacja', d: 'Spisujemy, co jest zamontowane: urządzenia, modele, okablowanie, stan.' },
      { n: '02', t: 'Dostęp', d: 'Pomagamy odzyskać dostęp do rejestratorów, routerów i central: za zgodą właściciela, także procedurą producenta.' },
      { n: '03', t: 'Raport', d: 'Co działa, co trzeba naprawić od razu, a co może poczekać.' },
      { n: '04', t: 'Propozycja', d: 'Naprawa, rozbudowa albo wymiana tylko tego, co faktycznie trzeba.' }
    ];
    const zd = [
      { ic: P.cam, t: 'Kamery', d: 'Ustawienia, nagrywanie, aplikacja.' },
      { ic: P.wifi, t: 'Sieć i Wi-Fi', d: 'Punkty dostępowe, vouchery, aktualizacje.' },
      { ic: P.home, t: 'Smart home', d: 'Sceny, harmonogramy, zmiany ustawień.' },
      { ic: P.scr, t: 'Ekrany', d: 'Treści i harmonogramy.' },
      { ic: P.lock, t: 'Zamki', d: 'Kody, integracje, historia.' },
      { ic: P.bolt, t: 'Ładowarki', d: 'Karty RFID i konfiguracja (modele online).' }
    ];
    return Object.assign(this.sub(c, {
      hero: { mid: false, crumb: 'Serwis i przeglądy', eye: 'Serwis instalacji · Rabka-Zdrój, Zakopane, Podhale', h1a: 'Coś nie działa?', h1b: 'Zgłoś. Sprawdzimy zdalnie albo przyjedziemy.', lead: 'Serwisujemy kamery, alarmy, sieci, zamki, smart home, nagłośnienie, ekrany i ładowarki. Także instalacje, które montowała inna firma. Przed sezonem robimy przeglądy, żeby awarie nie trafiały się w pełnym obłożeniu.', kv: [['2 salony', 'Rabka-Zdrój i Zakopane'], ['zdalnie', 'diagnoza wielu usterek'], ['od 2004', 'PRO-KOM na Podhalu']], tags: ['Awarie', 'Przeglądy sezonowe', 'Przejęcie instalacji', 'Umowy serwisowe'], cta: 'Umów przegląd', ctaHref: '#plany' },
      anc: [['plany', 'Opieka serwisowa'], ['przejecie', 'Przejęcie instalacji'], ['zdalnie', 'Zdalnie i na miejscu'], ['faq', 'Pytania']],
      faq: [
        ['Ile kosztuje przyjazd serwisu?', 'Zależy od miejscowości i tego, czy masz umowę serwisową. [SZEF: zasady dojazdu i stawki]. Wiele usterek sprawdzamy najpierw zdalnie, bez kosztów dojazdu.'],
        ['Czy naprawicie instalację po innej firmie?', 'Tak. Zaczynamy od inwentaryzacji i pomocy w odzyskaniu dostępu do urządzeń, a potem proponujemy naprawę albo rozsądną rozbudowę.'],
        ['Co, jeśli nie znam haseł do rejestratora?', 'Często da się odzyskać dostęp procedurą producenta. Zawsze potwierdzamy, że jesteś właścicielem albo zarządcą obiektu.'],
        ['Czy robicie przeglądy przed sezonem?', 'Tak. To najczęstsza usługa dla pensjonatów: kamery, dyski, Wi-Fi, zamki, ładowarka i ekrany sprawdzone, zanim przyjadą goście.'],
        ['Jak szybko reagujecie?', 'Na każde zgłoszenie odpowiadamy do 24 h w dni robocze: oddzwonimy albo odpiszemy. To czas na odpowiedź, a nie na przyjazd technika. Część usterek da się rozwiązać zdalnie, a gdy potrzebny jest przyjazd, termin ustalamy w rozmowie. Przy umowie serwisowej masz pierwszeństwo.'],
        ['Czy naprawy w gwarancji są bezpłatne?', 'Usterki montażu przez 24 miesiące usuwamy w ramach gwarancji PRO-KOM. Wady sprzętu zgłaszamy razem z Tobą do producenta w ramach jego gwarancji. Nie ogranicza to Twoich uprawnień ustawowych, np. z tytułu niezgodności towaru z umową.'],
        ['Czy umowa serwisowa jest obowiązkowa?', 'Nie. Usterki możesz zgłaszać jednorazowo. Umowa daje stałe przeglądy, pierwszeństwo w sezonie i kogoś, kto zna Twoją instalację.'],
        ['Co przygotować przed przyjazdem serwisu?', 'Opis objawów, zdjęcie urządzenia i komunikatu błędu, dostęp do rejestratora albo szafy i dane logowania, jeśli je masz. Często to wystarczy, żeby rozwiązać problem zdalnie.']
      ],
      rel: ['kam', 'alarm', 'wifi', 'smart'],
      sx: { faqH: 'Pytania o serwis.', relH: 'Serwisujemy wszystko, co montujemy.', faqA: { t: 'Coś nie działa?', d: 'Opisz usterkę w formularzu. Odpowiemy do 24 h w dni robocze: oddzwonimy albo odpiszemy.', cta: 'Zgłoś usterkę', href: '#zglos' } },
      src: [['Ustawa o prawach konsumenta, rozdz. 5a: odpowiedzialność przedsiębiorcy za zgodność towaru z umową', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827']]
    }), { sv: sv, plans: plans, pz: pz, zd: zd, ctaEye: 'Serwis instalacji', ctaH: 'Coś nie działa albo zbliża się sezon?', ctaP: 'Zgłoś usterkę w formularzu albo umów przegląd przed sezonem. Odpowiadamy do 24 h w dni robocze.', ctaBtn: 'Zgłoś usterkę', ctaBtnHref: '#zglos' });
  }
