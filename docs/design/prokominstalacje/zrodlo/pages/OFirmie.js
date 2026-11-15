  navKey() { return 'of'; }
  rvIds() { return ['ln', 'hi', 'jk', 'dn']; }
  page(P, c) {
    const of = {
      kv: [{ b: 'od 2004', s: 'na Podhalu' }, { b: '2 salony', s: 'Rabka-Zdrój i Zakopane' }, { b: '4 linie', s: 'Biznes, Software, Tech, Instalacje' }],
      lines: [
        { ic: P.cpu, t: 'Biznes', d: 'Kasy fiskalne, systemy sprzedaży, komputery, programy i opieka IT dla firm.', l: 'prokombiznes.pl →', href: 'https://prokombiznes.pl', cls: 'lnc ri' },
        { ic: P.globe, t: 'Software', d: 'Strony internetowe, panele i aplikacje dla firm i obiektów.', l: 'prokomsoftware.pl →', href: 'https://prokomsoftware.pl', cls: 'lnc ri' },
        { ic: P.wrench, t: 'Tech · serwis', d: 'Naprawy komputerów, laptopów i telefonów w salonach.', l: 'prokomserwis.pl →', href: 'https://prokomserwis.pl', cls: 'lnc ri' },
        { ic: P.net, t: 'Instalacje', d: 'Monitoring, alarmy, dostęp, sieci, smart home, nagłośnienie, ekrany, ładowarki, teletechnika.', l: 'Jesteś tutaj', href: 'Main.dc.html', cls: 'lnc ri cur' }
      ],
      tl: [
        { y: '2004', t: 'Początek PRO-KOM', d: 'Firma rusza w Rabce-Zdroju.' },
        { y: '[rok]', t: 'Salon w Zakopanem', d: '[SZEF: kiedy otwarty]' },
        { y: '[rok]', t: 'Pierwsze instalacje', d: '[SZEF: monitoring, nagłośnienie]' }
      ],
      val: [
        { ic: P.eye, t: 'Najpierw wizja lokalna', d: 'Nie wyceniamy w ciemno. Oglądamy obiekt i dopiero wtedy proponujemy rozwiązanie.' },
        { ic: P.doc, t: 'Wycena na piśmie', d: 'Zakres, sprzęt i cena czarno na białym, zwykle w wariantach do wyboru.' },
        { ic: P.layers, t: 'Projekt całości', d: 'Kamery, sieć, alarm i reszta zaprojektowane razem, żeby do siebie pasowały.' },
        { ic: P.check, t: 'Odbiór przy Tobie', d: 'Sprawdzamy działanie razem z Tobą i pokazujemy, jak korzystać z systemu.' },
        { ic: P.wrench, t: 'Serwis po montażu', d: 'Przeglądy przed sezonem i jeden numer do serwisu.' },
        { ic: P.pin, t: 'Blisko', d: 'Salony w Rabce i Zakopanem, blisko obiektów na Podhalu.' }
      ]
    };
    return { of: of, ctaEye: 'Poznajmy się', ctaH: 'Wpadnij do salonu albo zaproś nas do siebie.', ctaP: 'Rabka-Zdrój, ul. Orkana 16B i Zakopane. Albo wizja lokalna w Twoim obiekcie.' };
  }
