  initState() { return { qz: [0, 2] }; }
  navKey() { return 'pr'; }
  page(P, c) {
    const st = this.state, self = this;
    const QZ = ['Kamery nie obejmują pokoi, łazienek ani sauny', 'Posesja sąsiada i droga są zamaskowane', 'Mikrofony w kamerach są wyłączone', 'Nagrania nadpisują się automatycznie po ustalonym czasie', 'Przy wejściu w strefę wisi tabliczka z administratorem i celem', 'Pełna informacja jest w recepcji lub na stronie', 'Hasła do rejestratora są zmienione z fabrycznych'];
    const n = st.qz.length;
    const ar = {
      toc: [['czy-mozna', 'Czy można'], ['gdzie', 'Gdzie tak, gdzie nie'], ['jak-dlugo', 'Jak długo nagrania'], ['tabliczka', 'Tabliczka'], ['sasiad', 'Kamera a sąsiad'], ['dzwiek', 'Bez dźwięku'], ['pracownicy', 'Pracownicy'], ['podzial', 'Kto co robi'], ['test', 'Sprawdź się']].map((t) => ({ href: '#' + t[0], n: t[1] })),
      tldr: ['Monitoring w pensjonacie jest legalny, ale właściciel odpowiada za niego jak administrator danych.', 'Parking, wejście, narciarnia: tak. Pokoje, łazienki, sauna, posesje sąsiadów: nie.', 'Kodeks pracy: nagrania z monitoringu pracowników najwyżej 3 miesiące. EROD zaleca możliwie krótko, zwykle kilka dni.', 'Sama naklejka z kamerą nie wystarczy. Potrzebna tabliczka i pełna informacja.'],
      we: ['Kadry kamer i maski prywatności', 'Czas nadpisywania nagrań', 'Hasła i konta tylko dla upoważnionych', 'Miejsca na tabliczki'],
      you: ['Cel monitoringu', 'Informacja dla gości i pracowników', 'Układ zbiorowy, regulamin pracy lub obwieszczenie', 'Udostępnianie nagrań na wniosek'],
      qz: QZ.map((t, i) => { const on = st.qz.includes(i); return { t: t, k: on ? '✓' : '', on: on ? 'true' : 'false', cls: 'chk' + (on ? ' on' : ''), toggle: () => self.setState({ qz: on ? st.qz.filter((x) => x !== i) : st.qz.concat([i]) }) }; }),
      bar: QZ.map((x, i) => i < n ? 'on' : ''), res: n === QZ.length ? 'Wygląda dobrze. Warto co sezon sprawdzić, czy nic się nie przestawiło.' : n + ' z ' + QZ.length + '. Brakujące punkty techniczne ustawimy przy przeglądzie. Przy pozostałych podpowiemy, co przygotować.',
      src: [['Kodeks pracy, art. 22² (t.j. Dz.U. 2026 poz. 1245)', 'https://api.sejm.gov.pl/eli/acts/DU/2026/1245/text.pdf'], ['EROD, Wytyczne 3/2019 dotyczące przetwarzania danych osobowych przez urządzenia wideo', 'https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_201903_video_devices_pl_0.pdf'], ['UODO, Wskazówki Prezesa UODO dotyczące wykorzystywania monitoringu wizyjnego (wersja 1, czerwiec 2018)', 'https://uodo.gov.pl/pl/file/1200'], ['TSUE, wyrok z 11.12.2014, C-212/13 (Ryneš)', 'https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:62013CJ0212'], ['Polsat News, 15.07.2026: kara UODO dla osoby prywatnej (kamery obejmowały drogę i posesje sąsiadów, nagrywały też dźwięk)', 'https://www.polsatnews.pl/wiadomosc/2026-07-15/nagrywal-sasiadow-teraz-musi-srogo-zaplacic-pierwsza-taka-kara/']].map((s) => ({ t: s[0], href: s[1] })),
      rel: [['Ile dni nagrań i jaki dysk', 'Monitoring.dc.html#nagrania'], ['Wi-Fi dla gości a UKE', 'Sieci.dc.html#portal'], ['Przegląd przed sezonem', 'Serwis.dc.html#plany']].map((r) => ({ n: r[0], href: r[1] }))
    };
    return { ar: ar, ctaEye: 'Monitoring ustawiony pod RODO', ctaH: 'Chcesz, żebyśmy sprawdzili Twój monitoring?', ctaP: 'Przegląd kadrów, masek, czasu nagrań i haseł. Bez wymiany sprzętu, jeśli nie trzeba.' };
  }
