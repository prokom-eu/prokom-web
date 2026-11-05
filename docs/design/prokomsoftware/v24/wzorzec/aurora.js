class Component extends DCLogic {
  constructor(p){super(p);this.state={theme:'dark',sec:'start',acat:0,wt:1,wb:-1,wsel:{},wsz:-1,ws:0,si:0,sm:0,tt:0,asc:0,cmp:0,mega:0,srch:0,q:'',msh:0,kq:0,slide:0,tick:0,tx:0,ty:0,t2x:0,t2y:0,pan:0,sv:1,dv:0,av:0,cut:-1,cut2:50,drag:false,mode:0,step:0,flt:0,pop:-1,gt:0,sf:false,added:[],wz:1,pst:0,lay:0,faq:0,topic:0};}
  componentDidMount(){try{const th=localStorage.getItem('au-theme');if(th==='light'||th==='dark')this.setState({theme:th});}catch(e){}this.kh=(e)=>{if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();this.setState({srch:1,q:''});}else if(e.key==='Escape'){this.setState({srch:0,mega:0,msh:0});}};try{window.addEventListener('keydown',this.kh);}catch(e){}try{this.io=new IntersectionObserver((es)=>{es.forEach(en=>{if(en.isIntersecting&&en.target.id)this.setState({sec:en.target.id});});},{rootMargin:'-40% 0px -55% 0px'});document.querySelectorAll('section[id]').forEach(el=>this.io.observe(el));}catch(e){}this.ck=(e)=>{try{const a=e.target&&e.target.closest?e.target.closest('a[href^="#"]'):null;if(!a)return;const id=decodeURIComponent(a.getAttribute('href').slice(1));if(!id)return;const el=id==='top'?document.documentElement:document.getElementById(id);if(!el)return;e.preventDefault();this.setState({msh:0,mega:0});const rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;const off=window.innerWidth<=600?78:104;const y0=window.scrollY;const y1=id==='top'?0:Math.max(0,el.getBoundingClientRect().top+y0-off);const arrive=()=>{if(id==='top')return;el.classList.remove('au-arrive');void el.offsetWidth;el.classList.add('au-arrive');clearTimeout(this.at);this.at=setTimeout(()=>el.classList.remove('au-arrive'),1700);};if(rm){window.scrollTo(0,y1);arrive();return;}const dist=Math.abs(y1-y0);const dur=Math.min(1250,Math.max(520,dist*.32));const t0=performance.now();const ez=t=>t<.5?16*t*t*t*t*t:1-Math.pow(-2*t+2,5)/2;cancelAnimationFrame(this.raf);const step=n=>{const p=Math.min(1,(n-t0)/dur);window.scrollTo(0,y0+(y1-y0)*ez(p));if(p<1)this.raf=requestAnimationFrame(step);else arrive();};this.raf=requestAnimationFrame(step);}catch(_){}};try{document.addEventListener('click',this.ck);}catch(e){}this.start();}
  componentWillUnmount(){try{window.removeEventListener('keydown',this.kh);}catch(e){}clearInterval(this.iv);try{this.io&&this.io.disconnect();document.removeEventListener('click',this.ck);cancelAnimationFrame(this.raf);}catch(e){}}
  start(){clearInterval(this.iv);this.iv=setInterval(()=>{if(this.state.pop<0)this.setState({slide:(this.state.slide+1)%7,tick:this.state.tick+1});},4200);}
  offers(){
    const O=[
      ['s','Strony','Strona wizytówka','Klient znajduje Twój telefon i dzwoni jednym kliknięciem.','od 999 zł','od 1 tygodnia','site','wizytowka',true,
        ['Jedna strona, gotowa w tydzień','Telefon, mapa i formularz zawsze pod ręką','Szybka na telefonie i gotowa pod Google'],
        ['Projekt w Twoich kolorach i z Twoim logo','Sekcje: o firmie, usługi, opinie, kontakt','Przycisk „Zadzwoń” i formularz z powiadomieniem na maila','Mapa dojazdu i godziny otwarcia','Strona połączona z wizytówką Google','Domena i serwer w Polsce, zapisane na Twoją firmę'],
        ['Biuro, gabinet, kancelaria albo mała firma usługowa','Firma, która dziś ma tylko profil na Facebooku','Ktoś, kto chce mieć stronę w tydzień'],
        ['Masz dużo usług i chcesz pokazywać realizacje — wybierz stronę firmową','Potrzebujesz kilku wersji językowych'],
        'Firma ma tylko profil na Facebooku. Po tygodniu ma własną stronę z ofertą, mapą i formularzem, a każde zapytanie od razu trafia na maila.'],
      ['s','Strony','Strona firmowa z panelem','Oferta, realizacje i opinie. Treści zmieniasz sam, bez informatyka.','od 2 490 zł','od 2 tygodni','site','firmowa',true,
        ['Oferta, realizacje i kontakt na osobnych podstronach','Panel po polsku: ceny, zdjęcia, aktualności','Gotowa pod Google i odpowiedzi AI'],
        ['Projekt graficzny pod Twoją markę','Do 8 podstron i galeria realizacji','Panel po polsku z kontami dla pracowników','Formularz wyceny z powiadomieniem na maila','Dane strukturalne i mapa strony dla Google','Szkolenie z panelu i instrukcja na 2 strony'],
        ['Firma z kilkoma usługami albo produktami','Firma, która chce pokazywać realizacje i opinie','Ktoś, kto sam chce zmieniać treści'],
        ['Wystarczy Ci jedna strona z telefonem — wybierz wizytówkę','Masz kilkanaście usług, blog i języki — wybierz rozbudowaną'],
        'Firma pokazuje usługi, realizacje i opinie klientów. Nowy wpis dodaje sama w panelu w 5 minut, a zapytania z formularza trafiają prosto do biura.'],
      ['s','Strony','Rozbudowana strona firmowa','Szeroka oferta, blog, kilka języków i kilka osób w panelu.','od 6 990 zł','od 5 tygodni','site','rozbudowana',false,
        ['Dziesiątki podstron i czytelna nawigacja','Blog, poradniki i kilka języków','Role w panelu: kto pisze, kto zatwierdza'],
        ['Plan strony i treści pod Google','Szablony podstron: usługa, realizacja, artykuł','Blog z kategoriami i autorami','Wersje językowe: polska i do 2 kolejnych','Role i historia zmian w panelu','Pomiar szybkości i raport przy odbiorze'],
        ['Firma z szeroką ofertą albo kilkoma oddziałami','Firma, która zdobywa klientów treściami','Zespół kilku osób dodających treści'],
        ['Zaczynasz i masz 3 usługi — wystarczy strona firmowa','Nikt w firmie nie będzie pisał treści'],
        'Firma ma trzy działy i poradnik w trzech językach. Każdy dział dodaje swoje wpisy, a szef zatwierdza je przed publikacją.'],
      ['s','Strony','Landing page','Jedna usługa albo kampania. Formularz na każdym ekranie.','od 1 299 zł','od 1 tygodnia','site','landing',false,
        ['Jedna strona pod jedną usługę','Formularz i telefon na każdym ekranie','Gotowa pod reklamy w Google i na Facebooku'],
        ['Tekst pod jedną usługę: korzyści, jak to działa, pytania','Formularz z kilkoma polami i powiadomieniem','Liczenie zgłoszeń bez śledzących skryptów','Wersja szybka na telefon','Wersja pod reklamę z osobnym adresem','Do 2 poprawek po starcie kampanii'],
        ['Firma, która reklamuje jedną usługę','Oferta sezonowa albo nowa usługa','Test nowej usługi przed dużą stroną'],
        ['Chcesz pokazać całą firmę — wybierz stronę firmową','Nie planujesz reklamy ani kampanii'],
        'Firma reklamuje jedną usługę w Google. Landing tłumaczy ją w trzech krokach, a każde zgłoszenie od razu trafia na maila.'],
      ['s','Strony','Strona dla pensjonatu','Pokoje, zapytanie o termin i trzy języki. Bez prowizji portalu.','od 1 999 zł','od 2 tygodni','site','pensjonat',true,
        ['Pokoje z cenami i galerią','Zapytanie o termin prosto do Ciebie','Wersje PL, EN i DE'],
        ['Strony pokoi z galerią i cenami','Formularz zapytania o termin','Wersje polska, angielska i niemiecka','Okolica, dojazd i atrakcje','Mapa i wizytówka Google','Panel do zmiany cen i zdjęć'],
        ['Pensjonat, agroturystyka, apartamenty','Obiekt, który oddaje portalom wysokie prowizje','Gospodarz, który chce gości bezpośrednio'],
        ['Potrzebujesz rezerwacji z płatnością online — wycenimy osobno','Masz kilkadziesiąt obiektów'],
        'Pensjonat w Rabce dostaje zapytania po niemiecku i angielsku prosto na maila. Gospodarz odpowiada sam, bez prowizji portalu.'],
      ['s','Strony','Strona dla restauracji','Menu zmieniasz sam. Gość rezerwuje stolik przez formularz.','od 1 999 zł','od 2 tygodni','site','restauracja',false,
        ['Menu, które zmieniasz w minutę','Rezerwacja stolika przez formularz','Zdjęcia sali i dań, mapa dojazdu'],
        ['Menu z kategoriami i cenami w panelu','Formularz rezerwacji stolika','Galeria sali i dań','Godziny, mapa i parking','Dane restauracji dla Google','Menu po angielsku'],
        ['Restauracja, karczma, bar, kawiarnia','Lokal, który często zmienia menu','Lokal, do którego trafiają turyści'],
        ['Chcesz zamówień z dostawą i płatnością online','Prowadzisz sieć lokali'],
        'Karczma zmienia menu dnia rano z telefonu. Turysta z Google widzi aktualne dania po angielsku i rezerwuje stolik na wieczór.'],
      ['p','Przebudowa i opieka','Przebudowa starej strony','Nowa, szybka strona bez utraty pozycji w Google.','od 1 499 zł','od 2 tygodni','before','przebudowa',true,
        ['Nowy wygląd i szybkość na telefonie','Stare adresy przekierowane, Google zostaje','Treści przenosimy za Ciebie'],
        ['Audyt starej strony i lista jej adresów','Nowy projekt i nowy kod, bez starych wtyczek','Przeniesienie treści i zdjęć','Przekierowania wszystkich starych adresów','Pomiar szybkości przed i po','Kontrola w Google przez 30 dni po starcie'],
        ['Strona sprzed lat, wolna i nieczytelna na telefonie','Strona na WordPressie, której boisz się aktualizować','Strona, z której nikt nie dzwoni'],
        ['Strona jest nowa i działa — wystarczy darmowy audyt','Chcesz zmienić tylko kolor przycisku'],
        'Firma ma stronę z 2012 roku, która ładuje się prawie 7 sekund. Po przebudowie ładuje się w 1,9 s, a wszystkie 42 stare adresy prowadzą do nowych podstron.'],
      ['p','Przebudowa i opieka','Opieka i rozwój','Kopia co noc, aktualizacje i czas reakcji zapisany w umowie.','od 149 zł / mies.','od pierwszego dnia','care','',false,
        ['Kopia zapasowa co noc','Aktualizacje i monitoring 24/7','Czas reakcji zapisany w umowie'],
        ['Kopia co noc, przechowywana 30 dni','Aktualizacje bezpieczeństwa','Monitoring działania strony 24/7','Drobne zmiany treści w ramach pakietu','Czas reakcji w umowie','Raport co miesiąc od opieki Rozszerzonej'],
        ['Każda strona i system, które mają po prostu działać','Firma bez własnego informatyka','Ktoś, kto chce mieć spokój'],
        ['Chcesz sam zarządzać serwerem','Strona ma działać tylko kilka tygodni'],
        'W nocy serwer robi kopię. Rano monitoring zgłasza, że formularz przestał wysyłać maile. Poprawiamy to, zanim zauważy klient.'],
      ['p','Przebudowa i opieka','Przejęcie strony lub systemu','Odzyskamy dostępy i dane po kimś, kto zniknął.','od 990 zł','start w 2 dni robocze','care','',false,
        ['Odzyskanie dostępów do domeny i serwera','Kopia danych i kodu na Twoje konto','Plan: naprawić, przebudować czy zostawić'],
        ['Spis: domena, serwer, poczta, kod','Przeniesienie dostępów na Twoją firmę','Pełna kopia danych i kodu','Raport stanu bezpieczeństwa','Lista pilnych poprawek','Propozycja dalszej opieki'],
        ['Poprzedni wykonawca nie odbiera telefonu','Nie wiesz, kto ma hasło do domeny','Strona albo program przestały działać'],
        ['Masz wszystkie dostępy i działającą opiekę','—'],
        'Firma nie wie, kto opłaca domenę. W dwa dni odzyskujemy dostęp, przenosimy domenę na firmę i robimy pełną kopię strony.'],
      ['y','Systemy','System zamówień i zleceń','Kto, co i na kiedy — zamówienia, zlecenia i zadania w jednym panelu.','od 3 490 zł','od 3 tygodni','dash','zamowienia',true,
        ['Zamówienia i zlecenia w jednym miejscu','Każdy wie, co ma zrobić i na kiedy','Zakończone zlecenie trafia do faktury'],
        ['Lista zamówień i zleceń ze statusami','Przypisanie do osób i terminy','Widok dla pracownika na telefonie i komputerze','Załączniki, zdjęcia i historia zmian','Do 5 użytkowników w cenie','Eksport do programu księgowego'],
        ['Firma, która dostaje zamówienia mailem i telefonicznie','Biuro, które prowadzi wszystko w Excelu','Firma, w której zadania giną między ludźmi'],
        ['Masz 1–2 zlecenia w tygodniu','Wystarczy gotowy program z abonamentem — powiemy to wprost'],
        'Zamówienie z maila trafia do panelu jednym kliknięciem. Anna widzi je na swojej liście z terminem, a po zakończeniu zamówienie samo przechodzi do faktury.'],
      ['y','Systemy','CRM dla firmy','Klienci, zapytania i oferty. System przypomina, do kogo zadzwonić.','od 3 490 zł','od 3 tygodni','dash','crm',false,
        ['Klienci i zapytania w jednym miejscu','Przypomnienia, do kogo zadzwonić dziś','Historia rozmów i ofert'],
        ['Baza klientów z historią','Etapy: zapytanie, oferta, wygrane','Przypomnienia o telefonach','Szablony ofert w PDF','Import z Excela','Raport sprzedaży'],
        ['Firma, która wysyła oferty firmom','Handlowcy z notatkami w zeszycie','Firma, której uciekają zapytania'],
        ['Masz kilku stałych klientów','Potrzebujesz systemu dla stu handlowców'],
        'Handlowiec rano widzi listę: pięć osób do telefonu, w tym Hotel Gorce, któremu oferta poszła trzy dni temu. Nic nie ucieka.'],
      ['y','Systemy','Z Excela do systemu','Siedem arkuszy zamieniamy w jeden panel bez duplikatów.','od 2 990 zł','od 2 tygodni','dash','excel',false,
        ['Dane z wielu arkuszy w jednej bazie','Bez duplikatów, z aktualnymi cenami','Szukasz i eksportujesz jednym kliknięciem'],
        ['Przegląd Twoich arkuszy','Jedna baza z uprawnieniami','Import i czyszczenie danych','Wyszukiwarka i filtry','Eksport do Excela, kiedy chcesz','Kopia co noc'],
        ['Firma, w której „ostateczny_v7.xlsx” krąży mailem','Kilka osób zmienia te same dane','Dane są, ale nie da się ich znaleźć'],
        ['Arkusz ma 50 wierszy i jednego użytkownika','Dane zmieniają się raz w roku'],
        '4 812 wierszy z siedmiu arkuszy trafia do jednej bazy. Duplikaty znikają, a każdy pracownik widzi tylko swoją część.'],
      ['y','Systemy','Czas pracy i rozliczenia','Godziny z telefonu pracownika, nie z kartek.','od 2 990 zł','od 2 tygodni','dash','czas',false,
        ['Start i koniec pracy w telefonie','Urlopy i nieobecności w jednym miejscu','Zestawienie do wypłaty gotowe'],
        ['Rejestracja czasu w telefonie','Godziny przypisane do zleceń','Urlopy i nieobecności','Zestawienie miesięczne dla księgowej','Uprawnienia kierownika','Eksport do Excela'],
        ['Firma z pracownikami na zmiany albo u klientów','Kadry liczą godziny z kartek i maili','Chcesz wiedzieć, ile czasu zajmuje zlecenie'],
        ['Wszyscy pracują w biurze 8–16','Masz program kadrowy, który już to robi'],
        'Pracownik rano klika „Start” w telefonie albo na komputerze. Na koniec miesiąca księgowa dostaje zestawienie godzin bez jednej papierowej kartki.'],
      ['a','Automatyzacje','Powiadomienia SMS i e-mail','„Zamówienie wysłane”, „gotowe do odbioru”, przypomnienia — wysyłają się same.','wycena po rozmowie','termin na piśmie','flow','sms',false,
        ['SMS i mail wysyłane automatycznie','Klient wie, co się dzieje','Mniej telefonów „i kiedy?”'],
        ['Szablony wiadomości po polsku','Wysyłka przy zmianie statusu','Przypomnienia o terminach i płatnościach','Historia wysłanych wiadomości','Koszty SMS według zużycia','Podpięcie pod Twój system'],
        ['Serwis, hurtownia, gabinet albo firma usługowa','Firma, do której klienci dzwonią „i kiedy?”','Firma z terminami wizyt albo dostaw'],
        ['Wysyłasz kilka wiadomości w miesiącu','—'],
        'Zamówienie zmienia status na „Wysłane”, a klient dostaje SMS z numerem przesyłki. Biuro nie musi dzwonić.'],
      ['a','Automatyzacje','Faktury i raporty bez przepisywania','Zakończone zlecenie samo trafia do faktury, a raport sam do szefa.','wycena po rozmowie','termin na piśmie','flow','faktury',false,
        ['Pozycje z systemu prosto do programu do faktur','Raport dla szefa w piątek o 16:00','Zero ręcznego przepisywania'],
        ['Sprawdzenie Twojego programu do faktur przed wyceną','Reguły: kiedy powstaje faktura','Raport tygodniowy na maila','Powiadomienia o opóźnieniach','Historia operacji','Test na Twoich danych przed startem'],
        ['Firma, która przepisuje zlecenia do faktur','Szef, który czeka na raport w Excelu','Biuro z dużą liczbą drobnych zleceń'],
        ['Wystawiasz kilka faktur w miesiącu','Twój program do faktur nie wymienia danych (sprawdzimy to)'],
        'Zlecenie dostaje status „zakończone”. Pozycje trafiają do Subiekta, faktura czeka na podpis, a w piątek o 16:00 szef dostaje raport tygodnia.'],
      ['a','Automatyzacje','Asystent AI do zapytań','Szkic odpowiedzi w minutę, w kilku językach. Ty zatwierdzasz.','wycena po rozmowie','termin na piśmie','flow','ai',false,
        ['Szkic odpowiedzi z Twoim cennikiem','Zapytania po polsku, angielsku i niemiecku','Nic nie wychodzi bez Twojego kliknięcia'],
        ['Asystent przygotowany na Twoich treściach','Szkice odpowiedzi na maile i formularze','Tłumaczenie zapytań','Panel do zatwierdzania','Koszty AI według zużycia','Zasady prywatności opisane w umowie'],
        ['Pensjonat i firma z zapytaniami wieczorem','Firma z klientami z zagranicy','Biuro, które odpisuje ciągle na te same pytania'],
        ['Chcesz, żeby AI wysyłało samo, bez kontroli','Masz kilka zapytań w miesiącu'],
        'O 22:14 przychodzi pytanie po niemiecku o parking. Rano czeka gotowy szkic odpowiedzi. Klikasz „Wyślij”.']];
    return O.map((o,i)=>({i,c:o[0],cat:o[1],name:o[2],effect:o[3],price:o[4],time:o[5],kind:o[6],variant:o[7],live:o[8],short:o[9],get:o[10],who:o[11],not:o[12].filter(x=>x!=='—'),ex:o[13],g:o[2].startsWith('Opieka')||o[2].startsWith('Przejęcie')?'o':o[0]}));
  }
  openPop(i){this.setState({pop:i,gt:0,sf:false});}
  cutFrom(e){const r=e.currentTarget.getBoundingClientRect();return Math.max(4,Math.min(96,Math.round((e.clientX-r.left)/r.width*100)));}
  renderVals(){
    const s=this.state,OF=this.offers();
    // hero
    const IND=[['stronę wizytówkę.','site','wizytowka','1','1',['01','Strona wizytówka','telefon, mapa i formularz na jednym ekranie'],['od 999 zł','od 1 tygodnia']],
      ['stronę firmową.','site','firmowa','1','0',['02','Strona firmowa','oferta, realizacje i opinie, panel po polsku'],['od 2 490 zł','od 2 tygodni']],
      ['rozbudowaną stronę.','site','rozbudowana','0','0',['03','Rozbudowana strona','dziesiątki podstron, blog i języki'],['od 6 990 zł','od 5 tygodni']],
      ['stronę hotelu.','site','pensjonat','1','1',['04','Hotel i pensjonat','pokoje i zapytania bez prowizji portalu'],['od 1 999 zł','od 2 tygodni']],
      ['stronę restauracji.','site','restauracja','1','0',['05','Restauracja','menu zmieniasz sam, rezerwacja stolika'],['od 1 999 zł','od 2 tygodni']],
      ['system dla firmy.','dash','zamowienia','0','0',['06','System dla firmy','zamówienia, klienci i zadania w jednym panelu'],['od 2 990 zł','pierwszy moduł 2–3 tyg.']],
      ['automatyzacje i AI.','flow','ai','0','0',['07','Automatyzacje i AI','SMS-y, faktury i odpowiedzi idą same'],['po rozmowie','termin na piśmie']]];
    const NI=IND.length,cur=IND[s.slide%NI];
    const RK=r=>r===0?'transform:translate3d(0,0,0) rotateY(-12deg) rotateX(4deg);opacity:1;z-index:6'
      :r===1?'transform:translate3d(70px,-34px,-160px) rotateY(-12deg) rotateX(4deg);opacity:.5;z-index:5'
      :r===2?'transform:translate3d(130px,-64px,-320px) rotateY(-12deg) rotateX(4deg);opacity:.22;z-index:4'
      :r===NI-1?'transform:translate3d(-90px,60px,120px) rotateY(-12deg) rotateX(4deg);opacity:0;z-index:7;pointer-events:none'
      :'transform:translate3d(160px,-80px,-420px) rotateY(-12deg) rotateX(4deg);opacity:0;z-index:1;pointer-events:none;visibility:hidden';
    const rk=i=>{const r=(i-s.slide+NI*9)%NI;return r<=3?'r'+r:r===NI-1?'rl':'rx';};const wins=IND.map((w,i)=>({kind:w[1],variant:w[2],phone:w[3],toast:w[4],style:RK((i-s.slide+NI*9)%NI),cls:'w '+rk(i),lab:w[5][1]}));const SIP=['M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4','M3 4h18v12H3zM8 20h8M12 16v4M7 8h6M7 11h4','M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z','M2 20l7-11 4 6 3-4 6 9zM17 5a2 2 0 1 0 0 .1','M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9','M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z','M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2zM19 16l1 2.5 2.5 1-2.5 1L19 23l-1-2.5-2.5-1 2.5-1z'];const slides=IND.map((w,i)=>({ip:SIP[i]||SIP[0],n:w[5][0],t:w[5][1],d:w[5][2],p:w[6][0],tm:w[6][1],cls:'sl'+(i===s.slide%NI?' on':''),key:i===s.slide%NI?'s'+s.tick:'n'+i,pick:()=>{this.setState({slide:i,tick:s.tick+1});this.start();}}));
    const chips=[];IND.forEach((c,i)=>{const a=i===s.slide%NI;chips.push({cls:'chipf'+(a?' on':''),pos:'left:-12px;top:110px;transition-delay:'+(a?'.35s':'0s'),ic:c[5][0],t:c[5][1],s:c[5][2]});chips.push({cls:'chipf'+(a?' on':''),pos:'right:6px;bottom:70px;transition-delay:'+(a?'.6s':'0s'),ic:c[6][0],t:c[6][1],s:c[6][2]});});
    const IL=['Biura rachunkowe','Firmy transportowe','Kancelarie','Hotele i pensjonaty','Restauracje','Hurtownie','Producenci','Drukarnie','Gabinety i kliniki','Szkoły i kursy','Serwisy','Biura nieruchomości','Agencje','Firmy budowlane','Warsztaty','Stowarzyszenia'];
    const AM=[];
    const inds=IL.concat(IL).map((t,i)=>({t,cls:'ichip'+((i%IL.length)===AM[s.slide%NI]?' on':'')}));
    const kinWord=cur[0],kinKey='k'+s.tick;
    // situations
    const PN=[['01','Nie mam strony','Klienci pytają o stronę, a Ty jej nie masz','site','wizytowka','1','1','Wizytówka albo strona firmowa w 1–2 tygodnie: telefon, oferta, mapa i formularz. Podgląd do klikania dostajesz po 5–7 dniach.','od 999 zł',0],
      ['02','Mam starą stronę','Strona jest, ale wygląda jak z 2012 roku i nic nie daje','before','przebudowa','0','0','Przebudujemy ją na szybką i wygodną na telefonie. Stare adresy przekierujemy, więc nie stracisz pozycji w Google.','od 1 499 zł',6],
      ['03','Toniemy w Excelach','Zamówienia w mailach, klienci w Excelu, dane w siedmiu arkuszach','dash','zamowienia','0','0','Jeden panel na zamówienia, zadania i klientów. Pierwszy moduł działa po 2–3 tygodniach, reszta dochodzi etapami.','od 2 990 zł',9],
      ['04','Za dużo przepisywania','Ciągle coś przepisujesz, wysyłasz i przypominasz ręcznie','flow','sms','0','0','SMS-y, faktury i raporty wysyłają się same. Asystent AI szykuje odpowiedzi, a Ty tylko zatwierdzasz.','wycena po rozmowie',13]];
    const pans=PN.map((p,i)=>({n:p[0],short:p[1],q:p[2],kind:p[3],variant:p[4],phone:p[5],toast:p[6],ans:p[7],price:p[8],scale:'0.8',o:i===s.pan?'on':'',cls:'pan'+(i===s.pan?' on':''),hover:()=>{if(s.pan!==i)this.setState({pan:i});},pick:()=>{if(s.pan!==i)this.setState({pan:i});},open:()=>this.openPop(p[9])}));
    // bento
    const SV=[['Wizytówka','wizytowka','od 999 zł','od 1 tygodnia','Jedna strona: kim jesteś, co robisz, telefon i mapa. Klient dzwoni jednym kliknięciem.',0],['Firmowa','firmowa','od 2 490 zł','od 2 tygodni','Oferta, realizacje i opinie. Treści zmieniasz sam w panelu po polsku.',1],['Rozbudowana','rozbudowana','od 6 990 zł','od 5 tygodni','Szeroka oferta, blog, kilka języków i kilka osób w panelu.',2],['Landing page','landing','od 1 299 zł','od 1 tygodnia','Jedna usługa albo kampania. Formularz na każdym ekranie.',3],['Pensjonat','pensjonat','od 1 999 zł','od 2 tygodni','Pokoje, zapytanie o termin i trzy języki, bez prowizji portalu.',4],['Restauracja','restauracja','od 1 999 zł','od 2 tygodni','Menu zmieniasz sam, gość rezerwuje stolik przez formularz.',5]];
    const sv0=SV[s.sv];
    const DV=[['Zamówienia','zamowienia','od 3 490 zł',9],['CRM','crm','od 3 490 zł',10],['Czas pracy','czas','od 2 990 zł',12],['Z Excela','excel','od 2 990 zł',11]];
    const AV=[['SMS i e-mail','sms',13],['Faktury','faktury',14],['Raporty','raporty',14],['Asystent AI','ai',15]];
    // showroom
    const MW=[96,124,96,150],ML=['Strona','Przebudowa','System','Automatyzacje'];
    const modes=ML.map((l,i)=>({label:l,sel:String(i===s.mode),cls:i===s.mode?'on':'',w:MW[i]+'px',pick:()=>this.setState({mode:i,step:0})}));
    const SS=[[['Klient wchodzi z Google','i klika „Zapytaj o wycenę” na telefonie'],['Wypełnia trzy pola','bez zakładania konta'],['Ty masz maila od razu','z numerem i opisem']],
      [['Przeciągnij suwak','stara strona po lewej, nowa po prawej'],['Zobacz szybkość','6,8 s → 1,9 s na telefonie'],['Stare adresy działają','Google nie traci Twoich pozycji']],
      [['Kliknij nowe zamówienie','i przypisz je osobie'],['Anna ma je na swojej liście','z terminem i załącznikami'],['Gotowe — do faktury','bez przepisywania']],
      [['Zlecenie oznaczone jako gotowe','jednym kliknięciem w panelu'],['Pozycje idą do Subiekta','nikt nic nie przepisuje'],['Faktura gotowa','klient dostaje SMS i maila']]];
    const st=s.step,m=s.mode;
    const shSteps=SS[m].map((x,i)=>{const act=st===i,done=st>i;return {n:done?'✓':String(i+1),t:x[0],d:x[1],o:act?'on':done?'done':'',go:()=>this.setState({step:i+1>st?i+1:st}),
      st:'display:flex;gap:12px;align-items:flex-start;text-align:left;background:'+(act?'rgba(150,112,238,.14)':'transparent')+';border:1px solid '+(act?'rgba(150,112,238,.55)':'rgba(244,245,241,.1)')+';color:#f4f5f1;border-radius:14px;padding:12px 14px;font:inherit;cursor:pointer;transition:background-color .3s,border-color .3s',
      dot:'width:26px;height:26px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:900;transition:background-color .3s;background:'+(done?'#9670ee':'rgba(244,245,241,.1)')+';color:'+(done?'#121613':'#f4f5f1')};});
    // popular
    const F=[['Wszystko',null,110],['Strony','s',100],['Przebudowa i opieka','p',214],['Systemy','y',104],['Automatyzacje','a',150]];
    const list=OF.filter(o=>!F[s.flt][1]||o.c===F[s.flt][1]);
    const filters=F.map((f,i)=>({label:f[0],n:String(f[1]?OF.filter(o=>o.c===f[1]).length:OF.length),sel:String(i===s.flt),cls:i===s.flt?'on':'',w:f[2]+'px',pick:()=>this.setState({flt:i})}));
    const fpL=5+F.slice(0,s.flt).reduce((a,f)=>a+f[2]+2,0)+'px';
    // wizard
    const W=[['Wizytówka','Kim jesteś, telefon, mapa.','od 999 zł','od 1 tygodnia','site','wizytowka'],['Strona firmowa','Oferta, realizacje, panel.','od 2 490 zł','od 2 tygodni','site','firmowa'],['Rozbudowana strona','Wiele podstron, blog, języki.','od 6 990 zł','od 5 tygodni','site','rozbudowana'],['Landing page','Jedna usługa albo kampania.','od 1 299 zł','od 1 tygodnia','site','landing'],['Przebudowa strony','Masz stronę, ale nic nie daje.','od 1 499 zł','od 2 tygodni','before','przebudowa'],['System dla firmy','Zamówienia, klienci, godziny.','od 2 990 zł','od 2 tygodni','dash','zamowienia'],['Automatyzacje','SMS-y, faktury, raporty.','po rozmowie','termin na piśmie','flow','sms'],['Opieka lub przejęcie','Kopie, aktualizacje, dostępy.','od 149 zł / mies.','od pierwszego dnia','care','']];
    const wtiles=W.map((w,i)=>({n:w[0],d:w[1],p:w[2],cls:'wt'+(i===s.wz?' on':''),pick:()=>this.setState({wz:i})}));
    const cw=W[s.wz];
    // popup
    const FL={s:[['Rozmowa','30 min, bezpłatnie'],['Podgląd i wycena','po 5–7 dniach'],['Budowa','co tydzień nowa wersja'],['Start','szkolenie i odbiór']],
      p:[['Audyt starej strony','2 dni robocze'],['Podgląd nowej strony','po 5–7 dniach'],['Treści i przekierowania','1–2 tygodnie'],['Start i kontrola Google','30 dni po starcie']],
      o:[['Rozmowa','co masz i co działa'],['Przejęcie dostępów','1–2 dni robocze'],['Kopie i monitoring','od pierwszej nocy'],['Raport','co miesiąc']],
      y:[['Rozmowa','jak naprawdę pracujecie'],['Szkic do klikania','po 5–7 dniach'],['Pierwszy moduł','po 2–3 tygodniach'],['Kolejne etapy','płatne po odbiorze']],
      a:[['Rozmowa','co dziś przepisujecie'],['Sprawdzenie programów','przed wyceną'],['Test na Twoich danych','około tygodnia'],['Start','z historią każdej operacji']]};
    const PAY={s:'30% / 70% po odbiorze',p:'30% / 70% po odbiorze',o:'co miesiąc, bez długich umów',y:'30% + raty po etapach',a:'30% + reszta po starcie'};
    const AFT={s:'opieka od 149 zł / mies.',p:'opieka od 149 zł / mies.',o:'rezygnujesz, kiedy chcesz',y:'opieka systemu w umowie',a:'koszty SMS i AI wg zużycia'};
    const FQ={s:[['Czy sam zmienię treści?','Tak. Panel po polsku, tylko z polami, które naprawdę zmieniasz.'],['Czyja jest domena i strona?','Twoja. Domena, serwer i kod są zapisane na Twoją firmę.']],
      p:[['Czy stracę pozycje w Google?','Każdy stary adres przekierowujemy na nowy i przez 30 dni pilnujemy Google. Miejsca w wynikach nie gwarantuje nikt, ale nie zaczynasz od zera.'],['Co z treściami?','Przenosimy je za Ciebie i przy okazji poprawiamy to, co jest nieaktualne.']],
      o:[['Czy mogę zrezygnować?','Tak, w każdej chwili. Kod, dane i dostępy zostają Twoje.'],['Opiekujecie się stronami, których nie robiliście?','Tak, po przeglądzie. Czasem powiemy, że taniej będzie przebudować.']],
      y:[['Ile osób może korzystać?','Do 5 użytkowników w cenie. Kolejnych dodajesz bez przebudowy.'],['Co, jeśli zmieni się sposób pracy?','Dokładamy moduł na tym samym fundamencie. Nic nie wyrzucasz.']],
      a:[['Czy coś wyjdzie przez pomyłkę?','Najpierw test na Twoich danych. Każda wiadomość i faktura ma podgląd i historię.'],['Ile kosztuje SMS i AI?','Według zużycia, po stawkach operatora. Szacunek dostajesz razem z wyceną.']]};
    const GAL=o=>o.kind==='site'?[['Komputer','site',o.variant,'0','0'],['Telefon','phone',o.variant,'0','1'],['Komputer i telefon','site',o.variant,'1','1']]
      :o.kind==='before'?[['Przed i po','before','przebudowa','0','0'],['Nowa strona','site','przebudowa','1','0'],['Na telefonie','phone','przebudowa','0','0']]
      :o.kind==='dash'?[['Panel','dash',o.variant,'0','0'],['Klienci','dash','crm','0','0'],['Co dzieje się samo','flow','sms','0','0']]
      :o.kind==='flow'?[['Jak to działa','flow',o.variant,'0','0'],['W systemie','dash','zamowienia','0','0']]
      :[['Status opieki','care','','0','0'],['Strona pod opieką','site','wizytowka','1','0']];
    const open=s.pop>=0,po0=OF[open?s.pop:0],N=OF.length,gal=GAL(po0),gt=Math.min(s.gt,gal.length-1),inQ=s.added.includes(po0.i);
    const fl=FL[po0.g].map((f,i,a)=>({n:String(i+1),t:f[0],d:f[1],bg:i===0?'#6e45d4':'#ece7fb',c:i===0?'#fff':'#5b33c4',line:i<a.length-1?'position:absolute;left:14px;top:30px;bottom:0;width:2px;background:#e3e6df':'display:none'}));
    const sim=OF.filter(o=>o.c===po0.c&&o.i!==po0.i).concat(OF.filter(o=>o.c!==po0.c)).slice(0,3).map(o=>({name:o.name,price:o.price,kind:o.kind,variant:o.variant,open:()=>this.setState({pop:o.i,gt:0})}));
    const po={...po0,key:'o'+po0.i,pos:(po0.i+1)+' z '+N,prevName:OF[(po0.i+N-1)%N].name,nextName:OF[(po0.i+1)%N].name,pay:PAY[po0.g],after:AFT[po0.g],flow:fl,q:FQ[po0.g].map(q=>({q:q[0],a:q[1]})),sim};
    const svOpen=()=>this.openPop(sv0[5]);
    return {
      quote:String(s.added.length),hasQuote:s.added.length>0,
      slides,slideN:String((s.slide%NI)+1).padStart(2,'0'),kinWord,kinKey,capKa:'ca'+s.tick,capKb:'cb'+s.tick,wins,inds,cap:{ic:cur[5][0],t:cur[5][1],s:cur[5][2],m:cur[6][0],ms:cur[6][1]},hdots:IND.map((x,i)=>i===s.slide%NI?'on':''),rigT:'rotateY('+s.tx.toFixed(2)+'deg) rotateX('+s.ty.toFixed(2)+'deg)',
      tilt:(e)=>{const r=e.currentTarget.getBoundingClientRect();this.setState({tx:((e.clientX-r.left)/r.width-.5)*8,ty:((e.clientY-r.top)/r.height-.5)*-6});},
      untilt:()=>this.setState({tx:0,ty:0}),
      pans,
      svs:SV.map((v,i)=>({l:v[0],cls:i===s.sv?'on':'',pick:()=>this.setState({sv:i})})),sv:{variant:sv0[1],price:sv0[2],time:sv0[3],d:sv0[4],open:svOpen},svKey:'s'+s.sv,
      dvs:DV.map((v,i)=>({l:v[0],cls:i===s.dv?'on':'',pick:()=>this.setState({dv:i})})),dv:{variant:DV[s.dv][1],price:DV[s.dv][2],open:()=>this.openPop(DV[s.dv][3])},dvKey:'d'+s.dv,
      avs:AV.map((v,i)=>({l:v[0],cls:i===s.av?'on':'',pick:()=>this.setState({av:i})})),av:{variant:AV[s.av][1],open:()=>this.openPop(AV[s.av][2])},avKey:'a'+s.av,
      openPrz:()=>this.openPop(6),openCare:()=>this.openPop(7),
      cut:String(s.cut),cut2:String(s.cut2),
      dragStart:(e)=>{this.setState({drag:true,cut:this.cutFrom(e)});},
      dragMove:(e)=>{if(this.state.drag)this.setState({cut:this.cutFrom(e)});},
      dragStart2:(e)=>{this.setState({drag:true,cut2:this.cutFrom(e),step:Math.max(this.state.step,1)});},
      dragMove2:(e)=>{if(this.state.drag)this.setState({cut2:this.cutFrom(e)});},
      dragEnd:()=>{if(this.state.drag)this.setState({drag:false});},
      modes,spL:6+MW.slice(0,m).reduce((x,y)=>x+y+2,0)+'px',spW:MW[m]+'px',mode:String(m),m0:m===0,m1:m===1,m2:m===2,m3:m===3,
      shSteps,shNextTxt:st>=3?'Następny tryb':'Następny krok',
      shNext:()=>{if(st<3)this.setState({step:st+1});else this.setState({mode:(m+1)%4,step:0});},
      reset:()=>this.setState({step:0,cut2:50}),advance:()=>this.setState({step:Math.min(3,st+1)}),
      s0:st===0,s1:st===1,s23:st>=2,moved:st>=1,notMoved:st<1,
      mailCls:'appear'+(st>=3?' on':''),ap1:'appear'+(st>=1?' on':''),ap2:'appear'+(st>=2?' on':''),ap3:'appear'+(st>=3?' on':''),ap3k:'kcard appear'+(st>=3?' on':''),
      crewTxt:st>=1?'1 nowe zadanie':'Brak nowych zadań',crewBtn:st>=3?'Zakończone ✓':st>=2?'Oznacz jako gotowe':'Rozpocznij',
      tilt2:(e)=>{const r=e.currentTarget.getBoundingClientRect();this.setState({t2x:((e.clientX-r.left)/r.width-.5)*5,t2y:((e.clientY-r.top)/r.height-.5)*-4});},
      untilt2:()=>this.setState({t2x:0,t2y:0}),
      tilt2T:'perspective(1800px) rotateY('+s.t2x.toFixed(2)+'deg) rotateX('+s.t2y.toFixed(2)+'deg)',
      filters,fpL,fpW:F[s.flt][2]+'px',popKey:String(s.flt),popCount:list.length+' rozwiązań z ceną',
      pops:list.map((o,i)=>({cat:o.cat,name:o.name,effect:o.effect,price:o.price,time:o.time,kind:o.kind,variant:o.variant,phone:o.kind==='site'?'1':'0',live:o.live,delay:(i*45)+'ms',open:()=>this.openPop(o.i)})),
      wtiles,wPrice:cw[2],wTime:cw[3],wName:cw[0],wKey:'w'+s.wz,wv:{kind:cw[4],variant:cw[5]},
      popOpen:open,po,gv:{kind:gal[gt][1],variant:gal[gt][2],phone:gal[gt][3],toast:gal[gt][4]},galKey:'g'+po0.i+'-'+gt,
      gtabs:gal.map((g,i)=>({l:g[0],sel:String(i===gt),cls:i===gt?'on':'',pick:()=>this.setState({gt:i})})),
      closePop:()=>this.setState({pop:-1}),
      prevPop:()=>this.setState({pop:(po0.i+N-1)%N,gt:0}),nextPop:()=>this.setState({pop:(po0.i+1)%N,gt:0}),
      onScr:(e)=>{const v=e.currentTarget.scrollTop>140;if(v!==this.state.sf)this.setState({sf:v});},
      sfCls:'sf'+(s.sf?' on':''),
      addTxt:inQ?'✓ W Twojej wycenie':'Dodaj do wyceny',
      addPop:()=>{const a=this.state.added;this.setState({added:a.includes(po0.i)?a.filter(x=>x!==po0.i):a.concat(po0.i)});},
      ...this.rest(),...this.aur()
    };
  }
  rest(){
    const s=this.state;
    const ST=[['01','Rozmowa','30 min','Opowiadasz, jak pracuje firma. My słuchamy.','U Ciebie w firmie, w Rabce-Zdroju albo online. Nie musisz nic przygotowywać ani znać nazw technologii.',['Jasną odpowiedź: budować czy kupić gotowe','Listę rzeczy, które zostają bez zmian','Termin podglądu i wyceny'],['Godzinę czasu','Szczerość o tym, co nie działa'],'0 zł','Rozmowa i szkic są bezpłatne i bez zobowiązań.'],
      ['02','Podgląd i wycena','5–7 dni','Najpierw podgląd do klikania i wycena, potem decyzja','Dostajesz podgląd strony albo systemu do klikania i wycenę: zakres, stała cena, etapy, termin.',['Podgląd do klikania','Wycenę ważną 30 dni','Plan etapów z terminami'],['Uwagi do podglądu','Decyzję: start albo nie'],'30%','po podpisaniu umowy. Reszta przy stronach po odbiorze, przy systemach ratami po etapach. Faktura VAT, przelew 7 dni.'],
      ['03','Budowa','od 1 tyg.','Co tydzień dostajesz nową wersję do klikania','Budujemy etapami. Klikasz, zgłaszasz uwagi, my poprawiamy. Pierwszy etap działa, zanim skończymy ostatni.',['Wersję testową co tydzień','Pierwszy etap systemu po 2–3 tygodniach','Listę zmian po każdym tygodniu'],['15 minut tygodniowo','Treści i zdjęcia, jeśli masz'],'po odbiorze','Strona: 70% po odbiorze. System: rata po każdym odebranym etapie.'],
      ['04','Wdrożenie','1–2 dni','Uruchomienie bez zatrzymywania firmy','Przenosimy dane, zakładamy konta, szkolimy ludzi na ich zleceniach. Stary sposób działa równolegle, dopóki nie powiesz „wyłączamy”.',['Dane przeniesione i sprawdzone','Szkolenie i instrukcję na 2 strony','Dostępy, domenę i kod na Twoje konto'],['Półtorej godziny zespołu','Decyzję o dniu startu'],'ostatnia rata','Po odbiorze, z protokołem i pomiarem szybkości.'],
      ['05','Opieka','co miesiąc','Po starcie nie zostajesz sam','Kopie co noc, aktualizacje, monitoring i czas reakcji w umowie. Gdy firma rośnie, dokładamy moduł na tym samym fundamencie.',['Kopie, aktualizacje, monitoring','Czas reakcji w umowie','Raport co miesiąc od opieki Rozszerzonej'],['Nic. Najwyżej pomysł na kolejny moduł'],'od 149 zł / mies.','Trzy poziomy opieki. Rezygnujesz, kiedy chcesz, kod i dane zostają Twoje.']];
    const steps=ST.map((x,i)=>({n:x[0],t:x[1],time:x[2],sel:String(i===s.pst),o:i===s.pst?'on':i<s.pst?'done':'',cls:'stb'+(i===s.pst?' on':i<s.pst?' done':''),pick:()=>this.setState({pst:i})}));
    const c=ST[s.pst];
    const L=[['Strona','Next.js · TypeScript','To, co widzi Twój klient','Klient nie czeka, a Google lepiej ocenia szybkie strony.','strona czeka gotowa na serwerze, nic nie składa się w locie z wtyczek.',[['< 2,5 s','treść na ekranie'],['< 200 ms','reakcja na klik'],['0','wtyczek']]],
      ['Panel','Payload CMS','Gdzie sam zmieniasz treść','Ceny, zdjęcia i godziny zmieniasz sam, bez dzwonienia do informatyka.','panel po polsku, tylko z polami, które naprawdę zmieniasz.',[['PL','cały panel'],['konta','dla pracowników'],['historia','każdą zmianę da się cofnąć']]],
      ['System','Python · Django','Gdzie pracuje Twoja firma','Zlecenia, klienci i uprawnienia w jednym sprawdzonym systemie.','dojrzałe narzędzie do danych i uprawnień, używane od lat w dużych serwisach.',[['role','kto co widzi'],['API','wymiana danych'],['1','baza zamiast Exceli']]],
      ['Automaty','Celery · Redis','Co dzieje się samo','SMS-y, raporty i kopie wychodzą o czasie, także w nocy.','kolejka zadań pilnuje, żeby nic nie zginęło i nic nie poszło dwa razy.',[['o czasie','harmonogram'],['ponawia','gdy coś zawiedzie'],['log','historia operacji']]],
      ['Dane','PostgreSQL','Gdzie leżą Twoje dane','Dane są Twoje. Eksport dostajesz na każde żądanie.','otwarta baza rozwijana od prawie 40 lat, bez licencji i uzależnienia.',[['~40','lat rozwoju'],['0 zł','za licencję'],['na żądanie','eksport']]],
      ['Serwer','Docker · VPS w Polsce','Gdzie to wszystko stoi','Dane klientów zostają w kraju. Zmiana serwera bez przepisywania.','Docker pakuje całość w paczki, które działają na każdym serwerze.',[['PL','serwer i dane'],['co noc','kopia'],['1 paczka','przenosiny']]]];
    const layers=L.map((l,i)=>({n:l[0],t:l[1],cls:'lay2'+(i===s.lay?' on':''),pick:()=>this.setState({lay:i})}));
    const cl=L[s.lay];
    const Q=[['Ile to kosztuje, także co miesiąc?','Każde rozwiązanie ma cenę „od”, a dokładną kwotę za stały zakres dostajesz po krótkiej rozmowie. Opieka: serwer w Polsce, kopie i aktualizacje od 149 zł miesięcznie. Bez opieki płacisz tylko za serwer i domenę.'],['Ile to trwa?','Wizytówka i landing od 1 tygodnia, strona firmowa i przebudowa od 2 tygodni, rozbudowana strona od 5 tygodni. System: pierwszy moduł po 2–3 tygodniach. Postęp oglądasz co tydzień.'],['Czy sam zmienię treści?','Tak. Dostajesz panel po polsku, tylko z polami, które naprawdę zmieniasz: ceny, zdjęcia, godziny, aktualności.'],['Czy będzie widoczna w Google i w ChatGPT?','Robimy wszystko, co od nas zależy, w cenie każdego projektu: szybkość, dane strukturalne, czytelna treść. Miejsca w wynikach uczciwie nie gwarantuje nikt.'],['Czyja jest domena, kod i dane?','Twoje. Domena, serwer, kod, panel i dostępy należą do Twojej firmy. Projekt może przejąć każdy, nie tylko my.'],['Mam już stronę. Co z nią?','Zaczynamy od darmowego audytu. Często wystarczy przebudowa zamiast nowej strony od zera, a stare adresy przekierujemy.']];
    const faqs=Q.map((q,i)=>({q:q[0],a:q[1],exp:String(i===s.faq),o:i===s.faq?'open':'',cls:'faq'+(i===s.faq?' open':''),tog:()=>this.setState({faq:s.faq===i?-1:i})}));
    const T=['Strona','Przebudowa strony','System dla firmy','Automatyzacje','Opieka lub przejęcie','Audyt'];
    const topics=T.map((l,i)=>({l,sel:String(i===s.topic),mark:i===s.topic?'✓ ':'',cls:'ctopic'+(i===s.topic?' on':''),pick:()=>this.setState({topic:i})}));
    return {steps,progW:(s.pst*20)+'%',stepKey:String(s.pst),cs:{n:c[0],time:c[2],h:c[3],p:c[4],get:c[5],you:c[6],pay:c[7],payd:c[8]},
      layers,layKey:String(s.lay),cl:{sub:cl[2],gain:cl[3],why:cl[4],kpi:cl[5].map(k=>({v:k[0],l:k[1]}))},faqs,topics};
  }
  aur(){
    const s=this.state,dark=s.theme!=='light';
    const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
    const IC={bed:'M3 18V8M3 14h18v4M21 18v-4a3 3 0 0 0-3-3h-7v3M7.5 11a1.5 1.5 0 1 0 0-.01',fork:'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9',home:'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5',mnt:'M3 19l6-9 4 6 3-4 5 7z',heart:'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',car:'M5 16h14M6 16l1.5-5h9L18 16M5 16v3M19 16v3M8 13.5h.01M16 13.5h.01',bag:'M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0',case:'M4 8h16v11H4zM9 8V5h6v3M4 13h16',tool:'M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z',cube:'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5'};
    const IND=[['Pensjonat, hotel, apartamenty','bed','pensjonat','crm','Rezerwacje i goście w jednym panelu',['Zapytanie o termin bez prowizji portalu','Pokoje z galerią i cenami','Wersje PL, EN i DE','Okolica, dojazd i atrakcje']],
      ['Restauracja, bar, kawiarnia','fork','restauracja','zamowienia','Zamówienia i rezerwacje stolików',['Menu, które zmieniasz w minutę','Rezerwacja stolika online','Menu po angielsku dla turystów','Godziny, mapa i parking']],
      ['Budowlanka i remonty','home','budowlanka','czas','Zlecenia i czas pracy ekip',['Realizacje z opisem i zdjęciami','Formularz bezpłatnej wyceny','Opinie klientów','Obszar działania na mapie']],
      ['Turystyka i atrakcje','mnt','turystyka','crm','Rezerwacje terminów i grupy',['Wolne terminy i rezerwacja','Strona w 3 językach','Mapa, dojazd i parking','Opinie z Google']],
      ['Uroda i zdrowie','heart','uroda','crm','Kalendarz wizyt i klienci',['Rezerwacja wizyt 24/7','Przypomnienia SMS','Cennik zabiegów','Galeria efektów']],
      ['Warsztat i motoryzacja','car','warsztat','zamowienia','Zlecenia napraw i statusy',['Umawianie wizyt online','Status naprawy w SMS','Cennik usług','Historia serwisowa klienta']],
      ['Sklep i handel','bag','sklep','excel','Stany i ceny w jednej bazie',['Asortyment i promocje','Godziny i dojazd do sklepów','Rezerwacja odbioru','Nowości co tydzień']],
      ['Biuro i usługi dla firm','case','biuro','crm','Klienci, sprawy i terminy',['Konsultacja online','Czytelna oferta i cennik','Poradnik dla klientów','Bezpieczny formularz dokumentów']],
      ['Produkcja i rzemiosło','tool','produkcja','excel','Zamówienia i produkcja',['Katalog produktów','Zapytanie ofertowe B2B','Wersja po angielsku','Realizacje i certyfikaty']],
      ['Inna firma','cube','firmowa','zamowienia','Zamówienia, klienci i zadania',['Oferta, realizacje i opinie','Formularz zapytania','Panel po polsku','Gotowa pod Google i AI']]];
    /* --- showroom by industry --- */
    const si=s.si,ci=IND[si],sm=s.sm;
    const showInd=IND.map((x,i)=>({t:x[0],ic:IC[x[1]],cls:'au-ind'+(i===si?' on':''),pick:()=>this.setState({si:i})}));
    const SM=['Strona','Na telefonie','System'];
    const showModes=SM.map((x,i)=>({t:x,cls:'au-seg'+(i===sm?' on':''),pick:()=>this.setState({sm:i})}));
    const showKind=sm===2?'dash':sm===1?'phone':'site',showVar=sm===2?ci[3]:ci[2];
    /* --- configurator v3 --- */
    const T=[['Strona wizytówka','Kim jesteś, telefon, mapa, formularz.',999,'od 1 tygodnia',0],['Strona firmowa','Oferta, realizacje, opinie, panel.',2490,'od 2 tygodni',1],['Rozbudowana strona','Wiele podstron, blog, języki.',6990,'od 5 tygodni',2],['Landing page','Jedna usługa albo kampania.',1299,'od 1 tygodnia',3],['Przebudowa starej strony','Masz stronę, ale nic nie daje.',1499,'od 2 tygodni',6],['System dla firmy','Zamówienia, klienci, zadania, godziny.',2990,'1. moduł w 2–3 tyg.',9],['Automatyzacje i AI','SMS-y, faktury, odpowiedzi same.',0,'termin na piśmie',13],['Nie wiem jeszcze','Opiszesz po swojemu, doradzimy.',0,'rozmowa 30 min, 0 zł',1]];
    const wt=s.wt,t=T[wt],g=wt<=3?'site':wt===4?'redo':wt===5?'sys':wt===6?'auto':'idk';
    const FEAT=[['Telefon i formularz','Mapa i godziny','Opinie z Google','Galeria zdjęć'],['Oferta na podstronach','Realizacje i opinie','Formularz wyceny','Blog lub aktualności','Wersje językowe'],['Blog i poradnik','Wersje językowe','Role w panelu','Wyszukiwarka','Strefa dla klientów'],['Kampania w Google','Kampania na Facebooku','Kalkulator lub formularz','Opinie i pytania']];
    const OPT={have:['Domena','Logo','Zdjęcia','Teksty','Stara strona','Zaczynamy od zera'],
      feat:wt<=3?FEAT[wt].concat(s.wb>=0&&s.wb<9?IND[s.wb][5].slice(0,2).filter(x=>!FEAT[wt].includes(x)):[]):[],
      redo:['Mam dostęp do domeny','Mam treści do przeniesienia','Mam logo i zdjęcia','Nie wiem, kto ma dostępy'],
      fix:['Wolno się ładuje','Źle wygląda na telefonie','Nikt nie dzwoni z Google','Trudno zmienić treści','Przestarzały wygląd','Boję się o bezpieczeństwo'],
      today:['Excel i arkusze','Papier i zeszyt','Gotowy program, który nie wystarcza','Maile i telefony','Dopiero zaczynamy'],
      sysf:['Zamówienia i zlecenia','Klienci i oferty','Kalendarz i rezerwacje','Czas pracy','Magazyn i stany','Faktury do programu','Raporty dla szefa','Aplikacja dla pracowników'],
      auto:['SMS-y i e-maile do klientów','Faktury bez przepisywania','Raporty dla szefa','Odpowiedzi AI na zapytania','Przypomnienia o płatnościach'],
      prog:['Subiekt lub inny program do faktur','Excel','Gmail lub Outlook','Własny system','Nie wiem'],
      desc:['Nie mamy strony','Wszystko jest w Excelu','Strona nic nie daje','Informatyk zniknął','Za dużo przepisywania','Nie wiem, od czego zacząć']};
    const SZ=['1–5 osób','6–20 osób','21–50 osób','ponad 50'];
    const sel=k=>s.wsel[k]||[];
    const tog=(k,i,excl)=>()=>{const cur=sel(k);let n=cur.includes(i)?cur.filter(z=>z!==i):cur.concat(i);if(excl!==undefined){if(i===excl&&!cur.includes(i))n=[excl];else n=n.filter(z=>z!==excl||i===excl);}this.setState({wsel:{...s.wsel,[k]:n}});};
    const opts=(k,excl)=>OPT[k].map((x,i)=>({t:x,cls:'au-opt'+(sel(k).includes(i)?' on':''),mark:sel(k).includes(i)?'✓':'+',pick:tog(k,i,excl)}));
    const STEPS={site:['type','ind','have','feat','res'],redo:['type','ind','redo','fix','res'],sys:['type','ind','today','sysf','res'],auto:['type','ind','auto','res'],idk:['type','ind','desc','res']}[g];
    const LBL={type:'Rodzaj',ind:'Branża',have:'Co już masz',feat:'Co ma umieć',redo:'Twoja strona',fix:'Co poprawić',today:'Jak pracujecie',sysf:'Co ma robić',auto:'Co ułatwić',desc:'Opisz',res:'Wynik'};
    const ws=Math.min(s.ws,STEPS.length-1),key=STEPS[ws],last=ws===STEPS.length-1;
    const names=(k)=>sel(k).map(i=>OPT[k][i]);
    const sum=[];
    if(s.wb>=0)sum.push(['Branża',[IND[s.wb][0]]]);
    if(g==='site'){if(sel('have').length)sum.push(['Masz już',names('have')]);if(sel('feat').length)sum.push(['Ma umieć',names('feat')]);}
    if(g==='redo'){if(sel('redo').length)sum.push(['Twoja strona',names('redo')]);if(sel('fix').length)sum.push(['Do poprawy',names('fix')]);}
    if(g==='sys'){if(sel('today').length)sum.push(['Dziś',names('today')]);if(sel('sysf').length)sum.push(['System ma',names('sysf')]);if(s.wsz>=0)sum.push(['Użytkownicy',[SZ[s.wsz]]]);}
    if(g==='auto'){if(sel('auto').length)sum.push(['Automaty',names('auto')]);if(sel('prog').length)sum.push(['Programy',names('prog')]);}
    if(g==='idk'&&sel('desc').length)sum.push(['Temat',names('desc')]);
    let tip='Po 5–7 dniach klikasz podgląd. Dopiero wtedy decydujesz, czy ruszamy.';
    const H=sel('have'),F=sel('fix'),TD=sel('today'),A=sel('auto');
    if(g==='site'){if(H.includes(5))tip='Zaczynamy od zera? Pomożemy z domeną, logo i tekstami. Ustalimy to na krótkiej rozmowie.';else if(H.length&&!H.includes(3))tip='Nie masz tekstów? Napiszemy je po 20-minutowej rozmowie o Twojej firmie.';else if(s.wb===0&&wt<=1)tip='Dla obiektu noclegowego kluczowe jest zapytanie o termin bez prowizji portalu. Dodamy je.';else if(wt===3)tip='Landing najlepiej działa z kampanią reklamową. Pomożemy ją ustawić i policzyć zgłoszenia.';else tip='W cenie każdej strony: wersja na telefon, podstawowe SEO, panel po polsku, SSL i szybkość poniżej 2,5 s.';}
    if(g==='redo'){if(F.includes(2))tip='Zaczniemy od darmowego audytu: sprawdzimy, dlaczego Google nie przyprowadza klientów.';else if(sel('redo').includes(3))tip='Spokojnie, to częste. Odzyskamy dostęp do domeny i serwera, zanim cokolwiek zmienimy.';else tip='Stare adresy przekierujemy na nowe, więc nie stracisz pozycji w Google.';}
    if(g==='sys'){if(TD.includes(2))tip='Najpierw sprawdzimy, czy Twój program da się rozbudować. Czasem to taniej niż nowy system.';else if(s.wsz===0)tip='Na start wystarczy jeden moduł. Kolejne dołożymy, gdy firma urośnie.';else tip='Zaczynamy od modułu, który najbardziej boli. Działa po 2–3 tygodniach, płacisz po odbiorze.';}
    if(g==='auto')tip=A.includes(3)?'Asystent AI tylko szykuje odpowiedzi. Nic nie wychodzi bez Twojego kliknięcia.':'Najpierw testujemy na Twoich danych. Każda wiadomość i faktura ma historię.';
    if(g==='idk')tip='Nie musisz znać nazw. Opisz, co Cię męczy. Powiemy uczciwie, co się opłaca. Czasem: nic nie budować.';
    const vkind=g==='redo'?'before':g==='sys'?'dash':g==='auto'?'flow':'site';
    const vvar=g==='redo'?'przebudowa':g==='sys'?(s.wb>=0?IND[s.wb][3]:'zamowienia'):g==='auto'?(A.includes(3)?'ai':A.includes(1)?'faktury':A.includes(2)?'raporty':'sms'):(wt===3?'landing':wt===2&&s.wb<0?'rozbudowana':s.wb>=0?IND[s.wb][2]:['wizytowka','firmowa','rozbudowana','landing'][Math.min(wt,3)]||'firmowa');
    const ofr=this.offers()[t[4]];
    const S=(o)=>this.setState(o);
    return {themeCls:dark?'dark':'light',isDark:dark,isLight:!dark,
      toggleTheme:()=>{const n=dark?'light':'dark';try{localStorage.setItem('au-theme',n)}catch(e){}S({theme:n});},themeLabel:dark?'Tryb jasny':'Tryb ciemny',
      showInd,showModes,showKind,showVar,showKey:'sh'+si+'-'+sm,showName:ci[0],showIc:IC[ci[1]],showFeat:sm===2?[ci[4],'Dostęp z telefonu i komputera','Uprawnienia dla pracowników','Kopia danych co noc']:ci[5],showSub:sm===2?'System: '+ci[4].toLowerCase():'Strona dla branży: '+ci[0].toLowerCase(),
      showGo:()=>S({wb:si<9?si:9,ws:Math.max(s.ws,0)}),
      wTypes:T.map((x,i)=>({n:String(i+1).padStart(2,'0'),t:x[0],d:x[1],p:x[2]?'od '+fmt(x[2])+' zł':i===7?'0 zł':'po rozmowie',cls:'wtp'+(i===wt?' on':''),pick:()=>S({wt:i,ws:1})})),
      wInd:IND.map((x,i)=>({t:x[0],ic:IC[x[1]],cls:'au-ind'+(i===s.wb?' on':''),pick:()=>S({wb:i,ws:2})})),
      oHave:opts('have',5),oFeat:opts('feat'),oRedo:opts('redo'),oFix:opts('fix'),oToday:opts('today'),oSysf:opts('sysf'),oAuto:opts('auto'),oProg:opts('prog'),oDesc:opts('desc'),
      oSz:SZ.map((x,i)=>({t:x,cls:'au-opt'+(i===s.wsz?' on':''),mark:i===s.wsz?'✓':'',pick:()=>S({wsz:i})})),
      wsteps:STEPS.map((x,i)=>({n:i<ws?'✓':String(i+1),t:LBL[x],cls:'wst'+(i===ws?' on':i<ws?' done':''),go:()=>S({ws:i})})),
      kType:key==='type',kInd:key==='ind',kHave:key==='have',kFeat:key==='feat',kRedo:key==='redo',kFix:key==='fix',kToday:key==='today',kSysf:key==='sysf',kAuto:key==='auto',kDesc:key==='desc',kRes:key==='res',
      isSite:g==='site',
      wBack:()=>S({ws:Math.max(0,ws-1)}),wNextGo:()=>S({ws:last?0:ws+1}),wNextTxt:last?'Zacznij od nowa':ws===STEPS.length-2?'Pokaż wynik':'Dalej',
      wCanSkip:!last&&ws>0,wSkipGo:()=>S({ws:ws+1}),
      wName:t[0],wTime:t[3],wKind:vkind,wVar:vvar,wKey:'wz'+vkind+vvar,
      wPrice:t[2]?'od '+fmt(t[2])+' zł':wt===7?'0 zł za rozmowę':'wycena po rozmowie',wNet:t[2]?'netto · stała cena za zakres na piśmie':wt===7?'30 minut, bez zobowiązań':'po 30-minutowej rozmowie',
      wTip:tip,wSum:sum.map(x=>({h:x[0],v:x[1].join(' · ')})),wHasSum:sum.length>0,wGet:ofr.short,
      wOpen:()=>this.openPop(t[4]),wBar:'width:'+((ws+1)/STEPS.length*100)+'%',wStepN:(ws+1)+' z '+STEPS.length,
      techTabs:['Szybka','Bezpieczna','Widoczna w Google i AI','Na czym budujemy'].map((x,i)=>({t:x,cls:'au-seg'+(i===s.tt?' on':''),pick:()=>S({tt:i})})),
      auScan:()=>{if(this.state.asc===1)return;S({asc:1});clearTimeout(this.ascT);this.ascT=setTimeout(()=>this.setState({asc:2}),2600);},
      asc0:s.asc===0,asc1:s.asc===1,asc2:s.asc===2,
      aRows:[['Szybkość','główna treść po 4,1 s na telefonie','do poprawy'],['Telefon','przyciski i tekst czytelne','dobrze'],['Google i AI','brak danych o firmie i godzinach','do poprawy'],['Bezpieczeństwo','certyfikat SSL, aktualny system','dobrze'],['Dostępność','zbyt słaby kontrast przycisków','do poprawy']].map((r,i)=>({t:r[0],d:r[1],v:r[2],cls:'au-arow'+(r[2]==='dobrze'?' ok':' bad'),dl:(i*.35)+'s'})),
      cmpTabs:['vs freelancer','vs agencja z miasta'].map((x,i)=>({t:x,cls:'au-seg'+(i===s.cmp?' on':''),pick:()=>S({cmp:i})})),
      cmpRows:[['Podgląd na żywo przed zakupem',['rzadko, zwykle po zaliczce','po podpisaniu umowy'][s.cmp],'na stronie, od razu, za darmo'],['Kod, domena i dane należą do Ciebie',['zależy od umowy','często zostają u agencji'][s.cmp],'zapisane w umowie'],['Czas reakcji na piśmie',['zwykle brak','w droższych pakietach'][s.cmp],'w każdym poziomie opieki'],['Firma, która nie zniknie',['jedna osoba, jeden telefon','tak, ale daleko'][s.cmp],'biuro w Rabce-Zdroju, od 2004 r.'],['Spotkanie u Ciebie w firmie',['czasem','rzadko, zwykle online'][s.cmp],'na Podhalu i w Małopolsce'],['Sprzęt, sieć i kasy z tej samej firmy',['nie','nie'][s.cmp],'przez PRO-KOM Biznes i Instalacje']].map(r=>({t:r[0],o:r[1],m:r[2]})),
      cmpOther:['Freelancer','Agencja z miasta'][s.cmp],
      openNow:(()=>{const d=new Date(),h=d.getHours()+d.getMinutes()/60,wd=d.getDay();return wd>=1&&wd<=5&&h>=9&&h<17;})(),
      closedNow:!(()=>{const d=new Date(),h=d.getHours()+d.getMinutes()/60,wd=d.getDay();return wd>=1&&wd<=5&&h>=9&&h<17;})(),
      offCat:['Strony internetowe','Przebudowa i opieka','Systemy dla firm','Automatyzacje i AI'].map((x,i)=>({t:x,n:String(i+1).padStart(2,'0'),cls:'au-oc'+(s.flt===i+1?' on':''),pick:()=>S({flt:i+1})})),
      megaOpen:s.mega===1,megaOn:()=>S({mega:1}),megaOff:()=>S({mega:0}),megaTog:()=>S({mega:s.mega===1?0:1}),megaCls:'au-mega-btn'+(s.mega===1?' on':''),
      megaCols:[['Strony internetowe',[0,1,2,3,4,5]],['Przebudowa i opieka',[6,7,8]],['Systemy dla firm',[9,10,11,12]],['Automatyzacje i AI',[13,14,15]]].map(c=>({h:c[0],items:c[1].map(i=>{const o=this.offers()[i];return {t:o.name,p:o.price,go:()=>{S({mega:0});this.openPop(i);}};})})),
      srchOpen:s.srch===1,srchOn:()=>S({srch:1,q:''}),srchOff:()=>S({srch:0}),
      onQ:(e)=>S({q:e.target.value}),onQKey:(e)=>{if(e.key==='Escape')S({srch:0});},
      q:s.q,qEmpty:!s.q,
      ...(()=>{const norm=x=>x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l');const qq=norm(s.q||'').trim();
        const ACT=[['Zadzwoń · 883 200 151','Software · pn–pt 9:00–17:00','tel telefon zadzwon numer','tel'],['Napisz e-mail','kontakt@prokomsoftware.pl','mail email napisz','mail'],['Wyznacz trasę','ul. Orkana 16B, Rabka-Zdrój','trasa dojazd mapa adres','map'],['Kreator 60 s','Cena i termin bez dzwonienia','kreator wycena cena koszt','kr'],[dark?'Motyw jasny':'Motyw ciemny','Przełącz wygląd strony','motyw jasny ciemny dark light','th'],['Kontakt','Formularz, adres, godziny','kontakt formularz','ct']];
        const acts=ACT.filter(a=>!qq||norm(a[0]+' '+a[2]).includes(qq)).map(a=>({t:a[0],d:a[1],k:a[3],go:a[3]==='th'?()=>{const n=dark?'light':'dark';try{localStorage.setItem('au-theme',n)}catch(e){}S({theme:n});}:()=>S({srch:0})}));
        const offs=qq?this.offers().filter(o=>norm(o.name+' '+o.effect+' '+o.cat).includes(qq)).slice(0,6).map(o=>({t:o.name,d:o.cat+' · '+o.price,go:()=>{S({srch:0});this.openPop(o.i);}})):[];
        const PG=[['Oferta','16 rozwiązań z ceną i terminem','@P:oferta'],['Kreator wyceny','60 sekund, bez dzwonienia','@P:kreator'],['Darmowy audyt','raport w 2 dni robocze','@P:audyt'],['O firmie','PRO-KOM od 2004 r.','@P:firma'],['Kontakt','telefon, adres, formularz','@P:kontakt'],['Aktualności','nowości i poradniki','@P:aktualnosci'],['Polityka prywatności','RODO, dane z formularzy','@P:polityka'],['Regulamin','zasady korzystania ze strony','@P:regulamin'],['Cookies','bez ciasteczek śledzących','@P:cookies'],['Dostępność','deklaracja dostępności','@P:dostepnosc'],['Mapa strony','wszystkie podstrony','@P:mapa']];
        const pgs=qq?PG.filter(p=>norm(p[0]+' '+p[1]).includes(qq)).map(p=>({t:p[0],d:p[1],h:p[2]})):[];
        const n=(qq?acts.length:0)+offs.length+pgs.length;
        return {sActs:acts,sOffs:offs,sPgs:pgs,sHasOffs:offs.length>0,sHasPgs:pgs.length>0,sNone:!!qq&&n===0,sCount:qq?n+' wyników':'',sPop:['strona wizytówka','system zamówień','przebudowa strony','darmowy audyt','automatyzacje'].map(t=>({t,go:()=>S({q:t})}))};})(),
      mshOpen:s.msh===1,mshOn:()=>S({msh:1}),mshOff:()=>S({msh:0}),
      kfaqs:[['Czy muszę mieć specyfikację?','Nie. Wystarczy kilka zdań po swojemu. Resztę ustalimy w 30-minutowej rozmowie.'],['Czy przyjeżdżacie do klienta?','Tak, na Podhalu i w Małopolsce. Z resztą Polski rozmawiamy online.'],['Co przygotować przed rozmową?','Jeśli masz: adres obecnej strony, przykładowe strony, które Ci się podobają, i listę rzeczy, które dziś Cię męczą.'],['Czy mogę przyjść bez umawiania?','Tak, w godzinach pracy salonu przy ul. Orkana 16B. Na dłuższą rozmowę lepiej umówić termin.']].map((x,i)=>({q:x[0],a:x[1],o:i===s.kq?'open':'',exp:String(i===s.kq),tog:()=>S({kq:s.kq===i?-1:i})})),
      rc:(()=>{const o={};__RAILIDS__.forEach(k=>o[k]=k===String(this.state.sec).replace(/-/g,'_')?'on':'');return o;})(),
      ...(()=>{const PO=[['Poradnik','Ile kosztuje strona internetowa dla firmy? Od czego zależy cena','Rozkładamy cenę na części: projekt, treści, funkcje, opieka. Z przykładami od 999 zł do systemów na zamówienie.','4 lis 2026','7 min','pr'],['Strony','WordPress czy strona pisana od podstaw — co wybrać','Szablon jest tani na start, ale kosztuje później. Porównujemy szybkość, bezpieczeństwo i koszt po 3 latach.','28 paź 2026','6 min','st'],['Strony','5 sygnałów, że Twoja strona traci klientów','Wolne ładowanie, brak telefonu na górze, formularz, który nie działa. Sprawdzisz to w 10 minut.','21 paź 2026','4 min','st'],['Automatyzacje','Automatyzacja w małej firmie: od czego zacząć','Trzy rzeczy, które warto zautomatyzować najpierw: powiadomienia, faktury i raporty. Bez wielkiego wdrożenia.','14 paź 2026','5 min','au'],['Bezpieczeństwo','Czy domena i strona naprawdę należą do Ciebie?','Sprawdź w 3 minuty, na kogo jest domena, hosting i kod. I co zrobić, jeśli nie na Ciebie.','7 paź 2026','3 min','bz'],['Systemy','Excel czy system dla firmy — kiedy warto przejść','Siedem arkuszy, trzy wersje prawdy. Kiedy własny panel zaczyna się zwracać i ile to kosztuje.','30 wrz 2026','6 min','sy']];
        const CATS=['Wszystkie','Poradnik','Strony','Systemy','Automatyzacje','Bezpieczeństwo'];const ac=s.acat||0;
        const mp=(p,i)=>({cat:p[0],t:p[1],d:p[2],dt:p[3],rt:p[4],k:'au-pc-art c-'+p[5],key:'p'+i+'-'+ac});
        const list=PO.map(mp).filter(p=>ac===0||p.cat===CATS[ac]);
        return {aCats:CATS.map((c,i)=>({t:c,cls:'au-chip'+(i===ac?' on':''),sel:String(i===ac),pick:()=>S({acat:i})})),aFeat:list[0]||mp(PO[0],0),aPosts:list.slice(1),aHasPosts:list.length>1,aCount:list.length+(list.length===1?' wpis':list.length<5?' wpisy':' wpisów')};})(),
      statusShort:(()=>{const d=new Date(),h=d.getHours()+d.getMinutes()/60,wd=d.getDay();return wd>=1&&wd<=5&&h>=9&&h<17?'Otwarte':'Teraz zamknięte';})(),
      statusTxt:(()=>{const d=new Date(),h=d.getHours()+d.getMinutes()/60,wd=d.getDay();return wd>=1&&wd<=5&&h>=9&&h<17?'Otwarte · do 17:00':'Zamknięte · otwieramy w dzień roboczy o 9:00';})(),
      tt0:s.tt===0,tt1:s.tt===1,tt2:s.tt===2,tt3:s.tt===3,ttKey:'tt'+s.tt};
  }
}
