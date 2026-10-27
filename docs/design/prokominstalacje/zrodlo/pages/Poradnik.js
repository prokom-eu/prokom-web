  initState() { return { cat: 'all' }; }
  navKey() { return 'pr'; }
  page(P, c) {
    const st = this.state, self = this;
    const A = [
      ['mon', 'Monitoring', 'Ile dni nagrań potrzebujesz i jaki dysk dobrać', 'Kalkulator i wzór: liczba kamer, strumień, pojemność dysku. Do tego limity z Kodeksu pracy.', 'Monitoring.dc.html#nagrania', '4 min'],
      ['mon', 'Monitoring', 'Twarz czy sylwetka? Jak dobrać kamerę do odległości', 'Progi DORI z normy PN-EN 62676-4 i kalkulator pikseli na metr.', 'Monitoring.dc.html#ile-widac', '5 min'],
      ['ener', 'Energia', 'Ładowarka dla gości pensjonatu: moc, UDT i formalności', 'Co mówi ustawa o elektromobilności i kiedy ładowarka dla gości może być już stacją ogólnodostępną.', 'Ladowarki.dc.html#formalnosci', '6 min'],
      ['law', 'Przepisy', 'Wi-Fi dla gości: czy trzeba zgłaszać do UKE?', 'Prawo komunikacji elektronicznej o Wi-Fi jako dodatku do noclegu.', 'Sieci.dc.html#portal', '3 min'],
      ['noc', 'Obiekty noclegowe', 'Zamek z kodem i system rezerwacji: co z czym działa', 'Smoobu, Beds24, Hotres i zamki, które obsługują.', 'Dostep.dc.html#apartamenty', '4 min'],
      ['law', 'Przepisy', 'DSO czy zwykłe nagłośnienie? Kiedy przepisy wymagają systemu ostrzegawczego', '§ 29 rozporządzenia MSWiA w praktyce: pensjonat, hotel, hala. DSO wykonują firmy z odpowiednimi uprawnieniami, my montujemy nagłośnienie użytkowe.', 'Naglosnienie.dc.html#dso', '5 min'],
      ['av', 'Dźwięk i obraz', 'DVB-T2 i anteny w górach', 'Od kiedy Małopolska nadaje w DVB-T2 i co zrobić, gdy stok zasłania nadajnik.', 'Anteny.dc.html#multipleksy', '4 min'],
      ['law', 'Przepisy', 'Uchwała krajobrazowa w Zakopanem a ekrany i szyldy', 'Terminy dostosowania i co sprawdzić przed montażem ekranu w witrynie.', 'Multimedia.dc.html#zewnatrz', '4 min'],
      ['noc', 'Obiekty noclegowe', 'Przegląd przed sezonem: co sprawdzamy', 'Kamery, dyski, Wi-Fi, zamki, ładowarka i ekrany przed feriami i wakacjami.', 'Serwis.dc.html#plany', '3 min'],
      ['law', 'Przepisy', 'Odcisk palca w firmie: kiedy wolno', 'Kodeks pracy i stanowisko UODO o biometrii przy rejestracji czasu pracy.', 'Dostep.dc.html#firma', '3 min']
    ];
    const CATS = [['all', 'Wszystkie'], ['law', 'Przepisy'], ['mon', 'Monitoring'], ['noc', 'Obiekty noclegowe'], ['ener', 'Energia'], ['av', 'Dźwięk i obraz']];
    const list = A.filter((a) => st.cat === 'all' || a[0] === st.cat);
    const pr = {
      cats: CATS.map((x) => ({ n: x[1], on: st.cat === x[0] ? 'true' : 'false', cls: 'chip' + (st.cat === x[0] ? ' on' : ''), pick: () => self.setState({ cat: x[0] }) })),
      list: list.map((a) => ({ c: a[1], t: a[2], d: a[3], href: a[4], m: 'Krótka odpowiedź na stronie usługi →' })), empty: !list.length
    };
    return { pr: pr, ctaEye: 'Poradnik', ctaH: 'Nie znalazłeś odpowiedzi? Zapytaj nas wprost.', ctaP: 'Wyślij zdjęcie obiektu albo opisz sytuację. Odpowiemy po ludzku, bez lania wody.' };
  }
