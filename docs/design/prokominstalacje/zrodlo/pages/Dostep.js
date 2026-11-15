  initState() { return { tab: 'apt', code: '', res: '', touched: false, hist: [], idI: 0, pw: true }; }
  navKey() { return 'usl'; }
  rvIds() { return ['met', 'apt', 'fir', 'idt', 'lck', 'awr', 'pakiety', 'cena', 'faq', 'rel']; }
  mountPage() {
    var self = this, SEQ = ['2', '4', '6', '8', 'E', 'W', 'W', 'R', '1', '3', '5', '7', 'E', 'W', 'W', 'R'], i = 0;
    this.every(800, function () {
      if (self.state.touched) return;
      var k = SEQ[i]; i = (i + 1) % SEQ.length;
      if (k === 'W') return;
      if (k === 'R') { self.setState({ code: '', res: '' }); return; }
      if (k === 'E') { self.enter(); return; }
      self.setState({ code: (self.state.code + k).slice(0, 6), res: '' });
    });
  }
  enter() {
    const st = this.state;
    const ok = st.code === '2468';
    const msg = ok ? 'kod poprawny, drzwi otwarte' : st.code === '1357' ? 'kod wygasł po wymeldowaniu' : 'błędny kod';
    this.setState({ res: ok ? 'ok' : 'bad', hist: [{ ok: ok, m: msg }].concat(st.hist).slice(0, 2) });
  }
  page(P, c) {
    const st = this.state, self = this;
    const T = {
      apt: { n: 'Apartamenty', ic: P.bed, door: 'APARTAMENT 4', badge: 'Integracja z rezerwacjami', calT: 'Kody gości · ten tydzień', calS: 'kod działa od zameldowania do wymeldowania',
        rows: [['Ap. 4', [[0, 15, 2, 11, 'Kowalska · wygasł', 'off'], [4, 15, 6, 11, 'Nowak · 2468', 'cur']]], ['Ap. 2', [[1, 15, 5, 11, 'Müller · 7310', '']]], ['Sprzątanie', [[2, 11, 2, 14, '11–14', ''], [6, 11, 6, 14, '11–14', '']]]],
        log: [['Pt 15:42', 'Nowak · Ap. 4 · kod gościa', P.key], ['Pt 12:05', 'Sprzątanie · Ap. 4', P.key], ['Śr 10:51', 'Kowalska · kod wygasł', P.clock]] },
      fir: { n: 'Firma', ic: P.office, door: 'MAGAZYN', badge: 'Karty, strefy, harmonogram', calT: 'Uprawnienia · ten tydzień', calS: 'karta działa w wybranych strefach i godzinach',
        rows: [['Magazyn', [[0, 6, 0, 15, '6–15', 'cur'], [1, 6, 1, 15, '6–15', 'cur'], [2, 6, 2, 15, '6–15', 'cur'], [3, 6, 3, 15, '6–15', 'cur'], [4, 6, 4, 15, '6–15', 'cur']]], ['Biuro', [[0, 7, 4, 17, 'pn–pt 7–17 · wszyscy', '']]], ['Serwis', [[2, 9, 2, 13, 'jednorazowo', '']]]],
        log: [['07:52', 'Jan K. · Magazyn · karta', P.card], ['07:31', 'Anna W. · Biuro · karta', P.card], ['Wt 22:14', 'Karta #31 · poza godzinami', P.x]] },
      wsp: { n: 'Wspólnota', ic: P.users, door: 'KLATKA B', badge: 'Brama, furtka, klatki', calT: 'Dostęp · ten tydzień', calS: 'breloki mieszkańców, kody dla kurierów',
        rows: [['Mieszkańcy', [[0, 0, 6, 24, 'cały tydzień · breloki', 'cur']]], ['Kurierzy', [[0, 8, 0, 18, '', ''], [1, 8, 1, 18, '', ''], [2, 8, 2, 18, '', ''], [3, 8, 3, 18, '', ''], [4, 8, 4, 18, '', ''], [5, 8, 5, 14, '', '']]], ['Brelok #14', [[2, 9, 6, 24, 'zgubiony · zablokowany', 'off']]]],
        log: [['18:20', 'Lokal 12 · brelok · Brama', P.key], ['14:03', 'Kurier · kod dzienny · Klatka B', P.key], ['Śr 09:12', 'Brelok #14 zablokowany', P.x]] }
    };
    const t = T[st.tab];
    const pos = (b) => { const l = (b[0] + b[1] / 24) / 7 * 100, r = (b[2] + b[3] / 24) / 7 * 100; return 'left:' + l.toFixed(2) + '%;width:' + Math.max(1.2, r - l).toFixed(2) + '%'; };
    const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
    const press = (k) => () => {
      if (k === 'C') return self.setState({ touched: true, code: '', res: '' });
      if (k === 'OK') { self.setState({ touched: true }); return self.enter(); }
      self.setState({ touched: true, code: (st.res ? '' : st.code + k).slice(0, 6) || k, res: '' });
    };
    const disp = st.code ? st.code.split('').map(() => '•').join('') : '— — — —';
    const dispS = st.res === 'ok' ? 'Otwarte · witamy!' : st.res === 'bad' ? (st.code === '1357' ? 'Kod wygasł' : 'Błędny kod') : st.code ? 'Naciśnij OK' : 'Wpisz kod';
    const hl = st.hist.map((h) => ({ cls: 'kl' + (h.ok ? '' : ' bad'), ic: h.ok ? P.check : P.x, t: 'Teraz', s: t.door.toLowerCase() + ' · ' + h.m }));
    const kd = {
      tabs: Object.keys(T).map((k) => ({ n: T[k].n, ic: T[k].ic, on: st.tab === k ? 'true' : 'false', cls: st.tab === k ? 'on' : '', pick: () => self.setState({ tab: k, touched: true, code: '', res: '' }) })),
      badge: t.badge, door: t.door, dcls: st.res === 'ok' ? 'open' : st.res === 'bad' ? 'bad' : '',
      disp: disp, dispS: dispS, dispCls: st.res, hint: '2468',
      keys: KEYS.map((k) => ({ n: k, a: k === 'C' ? 'Wyczyść' : k === 'OK' ? 'Zatwierdź' : 'Cyfra ' + k, press: press(k) })),
      calT: t.calT, calS: t.calS, days: ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'],
      rows: t.rows.map((r) => ({ n: r[0], bars: r[1].map((b) => ({ t: b[4], st: pos(b), cls: 'kbar' + (b[5] ? ' ' + b[5] : '') })) })),
      log: hl.concat(t.log.map((l) => ({ cls: 'kl' + (l[2] === P.x ? ' bad' : ''), ic: l[2], t: l[0], s: l[1] }))).slice(0, 3)
    };
    const met = [
      { ic: P.grid, t: 'Kod PIN', d: 'Stały dla domowników, czasowy dla gości i serwisu. Wygasa sam.', k: 'Apartamenty, pensjonaty' },
      { ic: P.card, t: 'Karta lub brelok', d: 'Najwygodniejsze dla pracowników i mieszkańców. W systemach online zgubioną blokujesz zdalnie.', k: 'Firmy, wspólnoty, hotele' },
      { ic: P.phone, t: 'Telefon', d: 'Otwieranie z aplikacji, także zdalnie dla gościa, który utknął przy drzwiach.', k: 'Domy, apartamenty' },
      { ic: P.key, t: 'Klucz awaryjny', d: 'Mechaniczne otwarcie albo zasilanie awaryjne, gdy wyczerpie się bateria.', k: 'Każde drzwi' }
    ];
    const aptf = [
      { ic: P.cal, t: 'Rezerwacja', d: 'Gość rezerwuje przez Booking, Airbnb albo Twoją stronę.' },
      { ic: P.cpu, t: 'System rezerwacji', d: 'Tworzy kod ważny od zameldowania do wymeldowania.' },
      { ic: P.send, t: 'Wiadomość do gościa', d: 'Kod przychodzi mailem lub SMS-em przed przyjazdem.' },
      { ic: P.lock, t: 'Przyjazd i wyjazd', d: 'Gość wchodzi sam, a po wymeldowaniu kod przestaje działać.' }
    ];
    const pms = [
      { n: 'Smoobu', z: 'Nuki, TTLock, Yale, Salto KS, igloohome, Tedee i inne', u: 'Funkcja w planie Pro, 4 € miesięcznie za zamek. Nuki wymaga też abonamentu Smart Hosting.' },
      { n: 'Beds24', z: '31 integracji, m.in. Nuki, TTLock, Salto, Yale, Igloohome', u: 'Lista w dokumentacji Beds24.' },
      { n: 'Hotres', z: 'Moduł zamków hotelowych z kodem wysyłanym mailem lub SMS-em', u: 'Partnerów sprawdzamy przy wycenie.' },
      { n: 'Hotel na karty', z: 'Zamki hotelowe RFID, np. dormakaba', u: 'Karty kodowane w recepcji, integracja z systemem hotelowym.' }
    ];
    const firl = [
      { t: 'Strefy', d: 'Biuro, magazyn, serwerownia, zaplecze. Każda grupa osób ma swoje.' },
      { t: 'Harmonogramy', d: 'Karta działa w godzinach pracy, serwis tylko w dniu wizyty.' },
      { t: 'Historia wejść', d: 'Kto, którędy i kiedy. Przydaje się przy incydentach i kontroli dostępu do stref.' },
      { t: 'Brama i szlaban', d: 'Wjazd na plac i parking na pilota, kartę albo odczyt tablic.' }
    ];
    const IDT = [
      ['Brelok 125 kHz', 'najtańszy, popularny', P.key, 1, 'Niska', 'Dane na kartach 125 kHz nie są szyfrowane. Producent ICT sklonował taką kartę w ok. 15 sekund skanerem za ok. 30 USD.', 'Furtka, śmietnik, komórki lokatorskie', 'Każdy może zrobić kopię. Nie do biura ani serwerowni.', '#F07A6A'],
      ['MIFARE Classic', 'karta 13,56 MHz', P.card, 2, 'Średnio-niska', 'Producent układów, NXP, uznał w 2015 r. zabezpieczenie Crypto1 za tylko częściowo skuteczne i odradza Classic tam, gdzie liczy się bezpieczeństwo. Zaleca przejście na MIFARE Plus lub DESFire.', 'Istniejące systemy, mało wrażliwe drzwi', 'Przy nowej instalacji lepiej od razu DESFire albo Plus.', '#F29A4B'],
      ['MIFARE DESFire / Plus', 'szyfrowanie AES', P.shield, 4, 'Wysoka', 'Karty z szyfrowaniem AES znacznie utrudniają klonowanie. W połączeniu z kodem PIN dają uwierzytelnianie dwuskładnikowe. Obsługuje je m.in. polski system Roger RACS 5.', 'Biuro, firma, szkoła, magazyn', 'Karta jest droższa niż brelok 125 kHz.', '#7BD36A'],
      ['Telefon', 'BLE, NFC, kod QR', P.phone, 4, 'Wysoka', 'Telefon jako klucz: przez Bluetooth działa z kilku metrów, więc kierowca otwiera bramę bez wysiadania z auta. Dostęp nadajesz i odbierasz zdalnie, bez zbierania kart.', 'Brama wjazdowa, firmy, apartamenty', 'Gość musi mieć aplikację i naładowany telefon.', '#5B8CF0'],
      ['Kod PIN', 'klawiatura przy drzwiach', P.grid, 3, 'Zależy od kodu', 'W apartamentach to podstawowa metoda: system rezerwacji generuje kod ważny tylko w czasie pobytu i wysyła go gościowi.', 'Apartamenty, domy, pensjonaty', 'Kod można podejrzeć albo przekazać dalej. Najlepiej kody czasowe.', '#F2B84B'],
      ['Odcisk palca', 'biometria', P.finger, 4, 'Wysoka technicznie', 'Odcisku nie da się zgubić ani pożyczyć, ale to dane szczególnej kategorii według RODO. W firmie można go stosować tylko z inicjatywy pracownika albo do dostępu do szczególnie ważnych informacji lub pomieszczeń (art. 22¹ᵃ § 3 i 22¹ᵇ Kp).', 'Serwerownia, archiwum, sejf', 'Nie do ewidencji czasu pracy (stanowisko UODO).', '#B58CF0']
    ];
    const it = IDT[st.idI];
    const idt = {
      tabs: IDT.map((x, i) => ({ n: x[0], s: x[1], ic: x[2], on: st.idI === i ? 'true' : 'false', cls: 'idtb' + (st.idI === i ? ' on' : ''), pick: () => self.setState({ idI: i, touched: true }) })),
      k: 'id' + st.idI, n: it[0], d: it[5], fit: it[6], warn: it[7], lvl: it[4], bar: 'width:' + (it[3] * 25) + '%', st: '--h:' + it[8], cardT: it[0]
    };
    const LK = [
      ['Zwora elektromagnetyczna', 'Trzyma drzwi polem magnetycznym, siła trzymania np. ok. 280 kg. Bez prądu puszcza.', true, 'Drzwi szklane. Wyjście ewakuacyjne tylko z przyciskiem awaryjnym i zwolnieniem z systemu pożarowego', 112, 22, 26, 10, 125, 27],
      ['Elektrozaczep NO (rewersyjny)', 'Pod napięciem zablokowany, po zaniku zasilania odblokowany.', true, 'Klatki schodowe, drogi ewakuacyjne (po uzgodnieniu z rzeczoznawcą ppoż.)', 130, 52, 8, 24, 134, 46],
      ['Elektrozaczep zwykły (NC)', 'Odblokowuje się tylko pod napięciem. Bez prądu drzwi zostają zamknięte.', false, 'Magazyn, biuro, komórki, furtka', 130, 52, 8, 24, 134, 46],
      ['Zamek silnikowy / na wkładkę', 'Rygluje silnikiem, zasilanie z baterii lub przewodu. Zawsze z awaryjnym kluczem.', false, 'Dom, apartament, drzwi wejściowe', 108, 56, 18, 18, 117, 52]
    ];
    const lk = {
      pwOn: st.pw ? 'true' : 'false', pwCls: 'lkpw' + (st.pw ? ' on' : ''), pwT: st.pw ? 'Prąd jest' : 'Brak prądu', tPw: () => self.setState({ pw: !st.pw, touched: true }),
      hint: st.pw ? 'Wszystkie drzwi są zamknięte i czekają na kartę lub kod.' : 'Tak zachowają się drzwi przy zaniku zasilania, jeśli nie ma akumulatora rezerwowego.',
      items: LK.map((l) => { const open = !st.pw && l[2]; return { n: l[0], d: l[1], where: 'Gdzie: ' + l[3], state: open ? 'Otwarte' : 'Zamknięte', cls: 'lki' + (open ? ' open' : '') + (st.pw ? ' pw' : ''), dx: l[4], dy: l[5], dw: l[6], dh: l[7], lx: l[8], ly: l[9] }; })
    };
    const awr = [
      { ic: P.battery, t: 'Bateria w zamku', d: 'Zamki na wkładkę, np. Nuki czy Yale Linus, działają na bateriach i wcześniej ostrzegają w aplikacji (Nuki przy 20%). Gdy bateria się wyczerpie, Nuki otworzysz zwykłym kluczem.' },
      { ic: P.cloud, t: 'Brak internetu', d: 'Systemy takie jak Salto KS dalej działają według reguł zapisanych w zamkach. Kody PIN działają offline.' },
      { ic: P.bolt, t: 'Brak prądu', d: 'Kontrolery z akumulatorem rezerwowym działają dalej. Bez niego zwora puszcza, a elektrozaczep zwykły (NC) trzyma drzwi.' },
      { ic: P.key, t: 'Gość bez telefonu', d: 'Kod na klawiaturze albo karta z recepcji. Zawsze zostawiamy drugą drogę wejścia.' }
    ];
    const chk = [
      { n: '1', t: 'Drzwi', d: 'Kierunek otwierania, materiał, samozamykacz, czy są na drodze ewakuacyjnej.' },
      { n: '2', t: 'Wkładka', d: 'Typ, długość, funkcja awaryjna (otwarcie z kluczem w środku).' },
      { n: '3', t: 'Ościeżnica', d: 'Miejsce na elektrozaczep lub zworę, przejście przewodu przez zawias.' },
      { n: '4', t: 'Kable i zasilanie', d: 'Trasa do kontrolera, zasilacz z akumulatorem, gniazdo w pobliżu.' },
      { n: '5', t: 'Sieć', d: 'Zasięg Wi-Fi lub Bluetooth przy drzwiach dla zamków z bramką.' },
      { n: '6', t: 'Integracje', d: 'Alarm, kamery, program kadrowy, system rezerwacji (Hotres, Beds24, Smoobu, Airbnb).' }
    ];
    return Object.assign(this.sub(c, {
      hero: { crumb: 'Kontrola dostępu i zamki', eye: 'Kontrola dostępu · Zakopane, Rabka-Zdrój, Podhale', h1a: 'Gość wchodzi sam o 23:00.', h1b: 'Ty śpisz spokojnie.', lead: 'Zamki z kodem do apartamentów i pensjonatów, karty dla pracowników, breloki dla wspólnot. Łączymy je z systemem rezerwacji, alarmem i domofonem, żeby klucze przestały być problemem.', kv: [['1 kod', 'na jeden pobyt'], ['0 spotkań', 'żeby przekazać klucze'], ['całą dobę', 'zameldowanie bez recepcji']], tags: ['Apartamenty', 'Pensjonaty', 'Firmy', 'Wspólnoty'] },
      anc: [['metody', 'Czym się otwiera'], ['apartamenty', 'Apartamenty'], ['firma', 'Firma i wspólnota'], ['identyfikatory', 'Karty i breloki'], ['zamki', 'Zamki i prąd'], ['pakiety', 'Zestawy'], ['cena', 'Cena'], ['faq', 'Pytania']],
      pkgs: [
        { ic: P.bed, n: 'Apartament na wynajem', d: 'Jedne drzwi, kod dla każdego gościa.', f: ['Zamek z kodem i aplikacją', 'Integracja z systemem rezerwacji', 'Kody dla sprzątania', 'Powiadomienie o słabej baterii', 'Instrukcja dla gości'], pr: 'od [CENA] zł za drzwi' },
        { ic: P.hotel, n: 'Pensjonat lub kilka apartamentów', d: 'Wejście główne i pokoje w jednym systemie.', f: ['Zamki do pokoi lub apartamentów', 'Wejście główne na kod lub kartę', 'Wideodomofon dla gości', 'Historia wejść', 'Szkolenie dla obsługi'], pr: 'od [CENA] zł', hot: true },
        { ic: P.office, n: 'Firma lub wspólnota', d: 'Karty, strefy, brama i szlaban.', f: ['Czytniki kart przy drzwiach', 'Strefy i harmonogramy', 'Brama i szlaban', 'Rejestr wejść', 'Integracja z alarmem'], pr: 'wycena indywidualna' }
      ],
      cena: [
        { ic: P.door, t: 'Liczba drzwi', d: 'I to, czy są drewniane, metalowe, przeciwpożarowe czy szklane.' },
        { ic: P.lock, t: 'Rodzaj zamka', d: 'Wkładka z kodem, zamek z klamką, elektrozaczep, zwora.' },
        { ic: P.cpu, t: 'Integracje', d: 'System rezerwacji, alarm, domofon, smart home.' },
        { ic: P.plug, t: 'Zasilanie i okablowanie', d: 'Bateryjne czy przewodowe, sterownik, zasilacz awaryjny.' },
        { ic: P.card, t: 'Karty i breloki', d: 'Liczba nośników dla gości, pracowników lub mieszkańców.' },
        { ic: P.globe, t: 'Łączność', d: 'Wi-Fi, mostek, bramka. Przy apartamentach często potrzebna sieć.' }
      ],
      faq: [
        ['Co się stanie, gdy padnie bateria w zamku?', 'Zamek ostrzega wcześniej w aplikacji, a każde drzwi mają awaryjne otwarcie: klucz mechaniczny albo zewnętrzne zasilanie, zależnie od modelu.'],
        ['Czy zamek działa bez internetu?', 'Kod wpisany na klawiaturze zwykle działa lokalnie. Internet jest potrzebny do wysyłania nowych kodów, zdalnego otwierania i historii w aplikacji.'],
        ['Czy zamek połączy się z moim systemem rezerwacji?', 'Zależy od systemu. Smoobu, Beds24 i Hotres mają integracje zamków. Przed zakupem sprawdzamy, który zamek współpracuje z Twoim kontem.'],
        ['Czy mogę założyć zamek na istniejące drzwi?', 'Najczęściej tak: wymieniamy wkładkę albo okucie. Przy drzwiach przeciwpożarowych i nietypowych dobieramy rozwiązanie na miejscu.'],
        ['Czy w firmie można wchodzić na odcisk palca?', 'Biometria pracowników jest dopuszczalna tylko w wąskich przypadkach. Według stanowiska UODO rejestracja czasu pracy biometrią nie jest zgodna z RODO. Proponujemy karty lub breloki.'],
        ['Jaką gwarancję dostanę?', 'Na montaż dajemy 24 miesiące gwarancji PRO-KOM, a urządzenia mają gwarancję producenta. Na zgłoszenie odpowiadamy do 24 h w dni robocze: oddzwonimy albo odpiszemy.'],
        ['Czy mogę zdalnie otworzyć drzwi gościowi?', 'Tak, przy zamkach z bramką internetową otwierasz drzwi z aplikacji i widzisz historię otwarć. Bez bramki kody działają, ale zmiany wprowadza się przy zamku przez Bluetooth.'],
        ['Co z kodami dla sprzątania i serwisu?', 'Każda osoba dostaje własny kod albo kartę z harmonogramem, np. sprzątanie tylko w godzinach między wyjazdem a przyjazdem gości. Gdy ktoś przestaje u Ciebie pracować, usuwasz jego kod, bez wymiany wkładki.']
      ],
      segRel: ['apt', 'pens', 'hotel', 'firma', 'dev'],
      rel: ['alarm', 'wifi', 'smart'],
      src: [['ICT, The 125kHz Proximity Card Dilemma', 'https://www.ict.co/blog/the-125khz-proximity-card-dilemma/'], ['NXP, Security Statement on Crypto1 Implementations (2015)', 'https://www.mifare.net/en/security-statement-on-crypto1-implementations/'], ['Roger RACS 5 v2 (Architektura & Biznes)', 'https://architekturaibiznes.pl/en/racs-5-v2-effective-security-management,38809.html'], ['Rozporządzenie MSWiA o ochronie ppoż., § 4 (Dz.U. 2023 poz. 822)', 'https://arslege.pl/katalog-czynnosci-zabronionych-obowiazki/k310/a29315/'], ['Warunki techniczne z 2002 r., § 239 i § 240 (stosowane w okresie przejściowym)', 'https://arslege.pl/rozporzadzenie-ministra-infrastruktury-w-sprawie-warunkow-technicznych-jakim-powinny-odpowiadac-budynki-i-ich-usytuowanie/k218/s3078/'], ['Inżynier Budownictwa, Drzwi na drogach ewakuacyjnych (PN-EN 179, PN-EN 1125)', 'https://inzynierbudownictwa.pl/drzwi-na-drogach-ewakuacyjnych/'], ['Murator, Drzwi z kontrolą dostępu (zwora, elektrozaczep)', 'https://muratordom.pl/budowa/drzwi/drzwi-z-kontrola-dostepu-od-klucza-do-biometrii-w-jaki-sposob-kontrola-dostepu-zwieksza-poziom-bezpieczestwa-ak-hi1B-WRzU-TZkA.html'], ['Nuki, Smart Lock Pro i puste baterie', 'https://help.nuki.io/hc/en-us/articles/14838368305553-What-happens-when-the-Smart-Lock-batteries-are-empty'], ['Salto, Offline access in Salto KS', 'https://saltosystems.com/en/blog/your-ultimate-guide-offline-access-salto-ks/'], ['Kodeks pracy, art. 22¹ᵃ, 22¹ᵇ i 22³ (t.j. Dz.U. 2026 poz. 1245)', 'https://api.sejm.gov.pl/eli/acts/DU/2026/1245/text.pdf'], ['UODO, rejestracja czasu pracy a biometria (2020)', 'https://www.zut.edu.pl/fileadmin/pliki/2020/iod/1205/UODO-Rejestracja_czasu_pracy_za_pomoc%C4%85_danych_biometrycznych.pdf'], ['Smoobu, Smart Devices', 'https://www.smoobu.com/en/integrations/ssd/'], ['Beds24, Lock Systems', 'https://wiki.beds24.com/index.php/Category:Lock_Systems'], ['Hotres, zamki hotelowe', 'https://hotres.pl/zamki-hotelowe'], ['dormakaba, katalog zamków hotelowych', 'https://dormakaba-res.cloudinary.com/image/upload/v1745464252/dormakaba-prod/1508939035-zamki-hotelowe-pl.pdf']],
      sx: { pkg: { eye: 'Przykładowe zestawy', h: 'Od jednych drzwi do całego budynku.', p: 'Zaczynamy od tego, kto i kiedy ma wchodzić.', note: 'To przykłady. Rodzaj zamków i integracje dobieramy po obejrzeniu drzwi i sprawdzeniu Twojego systemu rezerwacji.' }, cena: { eye: 'Wycena', h: 'Od czego zależy cena.', p: 'Najwięcej zmieniają drzwi i integracje. Zrób zdjęcie drzwi z obu stron i boku skrzydła, a powiemy, jaki zamek pasuje.' }, relH: 'Dostęp działa najlepiej razem z resztą.' }
    }), { idt: idt, lk: lk, awr: awr, chk: chk,  kd: kd, met: met, aptf: aptf, pms: pms, firl: firl, ctaEye: 'Zamki i kontrola dostępu', ctaH: 'Koniec z przekazywaniem kluczy.', ctaP: 'Dobierzemy zamki do drzwi i systemu rezerwacji, zamontujemy i nauczymy obsługi.' });
  }
