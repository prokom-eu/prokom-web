import type { SectionHead } from './anteny'

/**
 * Fixed texts of the Smart home Ampio page (ADR-I002 §1): the sections that are not in
 * `InstServices` and the widgets. Transcribed from `zrodlo/pages/SmartHome.js` +
 * `SmartHome.body.html` (v4.2) the way `cleanPrototype` cleans a snapshot: without UI keys and
 * without the source list (`src`) — spec §2: no source lists on the site. Spec §2.7: voice only
 * through Matter, multiroom through Sonos/HEOS/MusicCast, no 5-year Ampio warranty, no EN 50131
 * class for the Ampio alarm. Edited by hand from now on.
 */

export type RoomKey = 'sal' | 'kuch' | 'syp' | 'hol' | 'laz' | 'gab' | 'tar' | 'gar'
export type SceneKey = 'rano' | 'wyj' | 'kino' | 'noc' | 'przyj'
export type RoomStateKey = 'g' | 'e' | 'c'
export type AreaKey =
  'sw' | 'heat' | 'air' | 'bl' | 'gate' | 'al' | 'acc' | 'cam' | 'en' | 'gar' | 'av' | 'app'

type Titled = { title: string; text: string }

export const smartHome = {
  /** Floor plan of the house controlled by Ampio in the hero (`sh`). */
  plan: {
    label: 'Interaktywny plan domu sterowanego przez Ampio',
    scenesLabel: 'Sceny',
    roomsLabel: 'Plan domu, wybierz pomieszczenie',
    offline: 'Bez internetu',
    /** Rooms of the plan: name and the rectangle in the 640×400 viewBox. */
    rooms: {
      sal: { name: 'Salon', x: 20, y: 20, w: 280, h: 210 },
      kuch: { name: 'Kuchnia', x: 300, y: 20, w: 150, h: 150 },
      syp: { name: 'Sypialnia', x: 450, y: 20, w: 170, h: 190 },
      hol: { name: 'Hol', x: 300, y: 170, w: 150, h: 130 },
      laz: { name: 'Łazienka', x: 450, y: 210, w: 170, h: 90 },
      gab: { name: 'Gabinet', x: 20, y: 230, w: 160, h: 150 },
      tar: { name: 'Taras', x: 180, y: 230, w: 120, h: 150 },
      gar: { name: 'Garaż', x: 300, y: 300, w: 320, h: 80 },
    } satisfies Record<RoomKey, { name: string; x: number; y: number; w: number; h: number }>,
    /** Windows with blinds: room, x, y, w, h (horizontal when w > h). */
    windows: [
      ['sal', 60, 14, 80, 8],
      ['sal', 180, 14, 80, 8],
      ['sal', 14, 80, 8, 80],
      ['kuch', 340, 14, 70, 8],
      ['syp', 490, 14, 90, 8],
      ['syp', 626, 70, 8, 90],
      ['laz', 626, 230, 8, 50],
      ['gab', 14, 270, 8, 70],
      ['gab', 60, 386, 80, 8],
    ] as const satisfies readonly (readonly [RoomKey, number, number, number, number])[],
    scenes: [
      { key: 'rano', name: 'Dzień dobry', icon: 'sun' },
      { key: 'wyj', name: 'Wyjście', icon: 'door' },
      { key: 'kino', name: 'Kino', icon: 'tv' },
      { key: 'noc', name: 'Noc', icon: 'moon' },
      { key: 'przyj', name: 'Przyjazd', icon: 'car' },
    ] satisfies { key: SceneKey; name: string; icon: string }[],
    notes: {
      rano: 'Dzień dobry: rolety w górę, światło w kuchni i łazience, ogrzewanie na 21°.',
      wyj: 'Wyjście: jednym przyciskiem gasną światła, przymykają się rolety, ogrzewanie schodzi do 17°, a alarm się uzbraja.',
      kino: 'Kino: salon przyciemniony do 15%, rolety zasłonięte, w pozostałych pomieszczeniach światło zgaszone.',
      noc: 'Noc: rolety zamknięte, w holu delikatne światło nocne, w sypialni 19°, alarm w trybie nocnym.',
      przyj:
        'Przyjazd: brama otwiera się, w holu, salonie i garażu zapala się światło, dom jest nagrzany.',
    } satisfies Record<SceneKey, string>,
    manualNote: 'Zmieniasz ustawienia ręcznie, a dom zapamiętuje je jako nową scenę, jeśli chcesz.',
    offlineNote: ' Internet nie działa, ale sceny, panele i czujniki pracują lokalnie w budynku.',
    alarm: 'ALARM',
    card: {
      eyebrow: 'Pomieszczenie',
      light: 'Światło',
      blind: 'Zasłonięcie',
      temp: 'Temperatura',
      lightLess: 'Ciemniej',
      lightMore: 'Jaśniej',
      blindLess: 'Otwórz',
      blindMore: 'Zamknij',
      tempLess: 'Chłodniej',
      tempMore: 'Cieplej',
    },
    net: {
      app: 'Aplikacja Ampio UNI',
      appOn: 'połączona',
      appOff: 'działa w sieci domowej, zdalnie czeka na internet',
      panels: 'Panele w ścianach',
      modules: 'Moduły w rozdzielnicy',
      works: 'działają',
    },
  },

  /** „Co sterujesz” (`#co-sterujesz`): twelve areas, one open. */
  areas: {
    head: {
      eyebrow: 'Co sterujesz',
      heading: 'Dwanaście rzeczy, którymi steruje Ampio.',
      accent: 'W jednej aplikacji i na panelach w ścianie.',
      lead: 'Ampio to polski system automatyki budynku. Łączy światło, ogrzewanie, rolety, bramę, alarm, kamery i energię tak, żeby dom sam robił to, co powtarzasz codziennie. Kliknij obszar, żeby zobaczyć, co potrafi i z jakich modułów to budujemy.',
    } satisfies SectionHead,
    tabsLabel: 'Obszary sterowania',
    when: 'Kiedy',
    then: 'To',
    modulesLabel: 'Moduły Ampio',
    worksWith: 'Współpracuje m.in. z',
    footnote: 'Integracja zależy od modelu urządzenia, dlatego każdą sprawdzamy w projekcie.',
    items: [
      {
        key: 'sw',
        name: 'Oświetlenie',
        icon: 'light',
        group: 'Światło',
        text: 'Od zwykłego włącznika po setki opraw w biurze. Każdy obwód może mieć scenę, harmonogram i czujnik ruchu.',
        features: [
          'Włączanie, ściemnianie i sceny jednym przyciskiem',
          'Taśmy LED, kolory RGBW i płynne ściemnianie punktów LED',
          'DALI do 64 opraw, każda osobno, także z regulacją barwy bieli',
          'Światło według obecności, pory dnia i jasności za oknem',
          'Symulacja obecności, gdy wyjeżdżasz',
        ],
        when: 'Wieczorem ktoś wchodzi na schody',
        then: 'Zapala się delikatne światło i samo gaśnie po chwili',
        modules: ['M-REL', 'M-DIM', 'M-OC', 'M-LED + S-LED', 'M-CON-DL-s'],
        integrations: ['DALI', 'Philips', 'OSRAM', 'Shelly'],
        note: 'W biurach i szkołach DALI pozwala utrzymywać stałe natężenie światła w lux.',
      },
      {
        key: 'heat',
        name: 'Ogrzewanie i chłodzenie',
        icon: 'thermo',
        group: 'Klimat',
        text: 'Temperatura w każdym pomieszczeniu osobno, razem z pompą ciepła, kotłem i klimatyzacją.',
        features: [
          'Grzejniki, podłogówka, kocioł gazowy i pompa ciepła',
          'Strefy od 1 do 32 z harmonogramem dzień i noc',
          'Obniżenie temperatury przy otwartym oknie i pod nieobecność',
          'Klimatyzacja sterowana razem z ogrzewaniem',
          'Ochrona przed zamarznięciem w pustym domu',
        ],
        when: 'Otwierasz okno w sypialni',
        then: 'Grzejnik w tym pokoju przechodzi w tryb ochrony, a po zamknięciu wraca do pracy',
        modules: ['M-RT-s', 'M-CON-HVAC-p', 'M-CON-485-s', 'M-SENS'],
        integrations: ['Panasonic', 'Daikin', 'Viessmann', 'Buderus', 'LG', 'Danfoss'],
        note: 'Pompa ciepła i klimatyzator łączą się przez Modbus albo bramkę HVAC. Model sprawdzamy w projekcie.',
      },
      {
        key: 'air',
        name: 'Wentylacja i powietrze',
        icon: 'cloud',
        group: 'Powietrze',
        text: 'Rekuperacja i czujniki pracują razem, więc wentylacja reaguje na to, co dzieje się w pomieszczeniu.',
        features: [
          'Sterowanie rekuperatorem z aplikacji i paneli',
          'Biegi wentylacji według wilgotności i harmonogramu',
          'Czujniki temperatury, wilgotności i ciśnienia',
          'Napędy i zawory sterowane sygnałem 0–10 V',
        ],
        when: 'Rośnie wilgotność w łazience',
        then: 'Rekuperator przechodzi na wyższy bieg, a potem wraca do normalnego',
        modules: ['M-SENS', 'M-SENS-LITE', 'M-OUT', 'M-CON-485-s'],
        integrations: ['Thessla Green', 'Zehnder', 'Komfovent', 'Brink', 'Pro-Vent'],
        note: 'M-SENS-LITE mierzy temperaturę, wilgotność i ciśnienie.',
      },
      {
        key: 'bl',
        name: 'Rolety, markizy i okna',
        icon: 'blind',
        group: 'Osłony',
        text: 'Rolety, żaluzje i markizy chodzą według słońca i scen. Okna dachowe też da się podpiąć.',
        features: [
          'Harmonogram według wschodu i zachodu słońca',
          'Wszystkie rolety naraz albo każda osobno',
          'Zamknięcie rolet po wyjściu z domu',
          'Markizy na tych samych wyjściach co rolety',
          'Okna dachowe Velux i Fakro, stacja pogodowa',
        ],
        when: 'Zachodzi słońce',
        then: 'Rolety na parterze zjeżdżają w dół, a w salonie zapala się światło',
        modules: ['M-REL', 'WL-REL-ROL1p', 'M-IN'],
        integrations: ['Somfy', 'Selve', 'Fakro', 'Velux', 'Davis', 'Netatmo'],
        note: 'Według producenta automatyka rolet pomaga też utrzymać ciepło w domu.',
      },
      {
        key: 'gate',
        name: 'Brama, furtka i zamki',
        icon: 'gate',
        group: 'Wjazd',
        text: 'Brama i furtka otwierają się z telefonu, panelu albo same, gdy wracasz do domu.',
        features: [
          'Brama z aplikacji, panelu i pilota',
          'Otwarcie przy podjeździe dzięki geolokalizacji telefonu',
          'Powiadomienie, gdy brama zostanie otwarta',
          'Zamki Gerda, Tedee i Shelly',
        ],
        when: 'Zbliżasz się autem do domu',
        then: 'Otwiera się brama, a w garażu i na podjeździe zapala się światło',
        modules: ['M-REL', 'M-IN', 'M-SERV'],
        integrations: ['Hörmann', 'Somfy', 'Gerda', 'Tedee', 'Shelly'],
        note: 'Geolokalizację ustawia się w aplikacji Ampio UNI jako strefę na mapie.',
      },
      {
        key: 'al',
        name: 'Alarm i czujki',
        icon: 'shield',
        group: 'Bezpieczeństwo',
        text: 'Alarm uzbraja się razem ze sceną Wyjście, a czujki zalania i dymu same reagują.',
        features: [
          'Własna centrala Ampio z 8 wejściami albo integracja z Satel Integra i Jablotron',
          'Uzbrajanie i rozbrajanie z panelu kodem PIN i z aplikacji',
          'Czujki zalania z zamknięciem zaworu wody',
          'Czujki dymu i gazu z powiadomieniem na telefon (nie zastępują certyfikowanych czujek ani systemu sygnalizacji pożarowej)',
          'Uzbrojenie razem ze sceną Wyjście',
        ],
        when: 'Czujka zalania wykryje wodę',
        then: 'Zawór wody się zamyka, a Ty dostajesz powiadomienie na telefon',
        modules: ['M-ALARM-8s', 'M-CON-232-s', 'M-CON-485-s', 'M-IN'],
        integrations: ['Satel', 'Jablotron', 'Bosch', 'DSC'],
        note: 'Centrala Ampio nie ma podanej klasy według normy EN 50131. Gdy wymaga jej ubezpieczyciel, montujemy alarm Satel i łączymy go z Ampio.',
      },
      {
        key: 'acc',
        name: 'Dostęp i wideodomofon',
        icon: 'key',
        group: 'Wejście',
        text: 'Karta albo kod zamiast klucza, a wideodomofon odbierasz w tej samej aplikacji.',
        features: [
          'Czytniki kart i klawiatury kodowe',
          'Szklane panele z czytnikiem kart RFID',
          'Wideodomofon w aplikacji Ampio UNI',
          'Wejście do pokoju kartą lub kodem, bez recepcji',
        ],
        when: 'Gość przykłada kartę do panelu',
        then: 'Zamek się otwiera, a w pokoju włącza się światło powitalne i ogrzewanie',
        modules: ['M-CON-KEY-p', 'M-DOT-R14', 'M-DOT-R PRO', 'M-SERV-MINI-s'],
        integrations: ['Akuvox', 'DoorBird', 'Dahua', 'Vidiline'],
        note: 'Dla bezpieczeństwa zaczepem drzwi steruje moduł lokalnie, kartą lub kodem, a nie zdalnie z aplikacji.',
      },
      {
        key: 'cam',
        name: 'Kamery w aplikacji',
        icon: 'cam',
        group: 'Podgląd',
        text: 'Obraz z kamer widzisz w tej samej aplikacji, w której sterujesz domem.',
        features: [
          'Podgląd kamer w aplikacji Ampio UNI',
          'Integracja z kamerami Hikvision, Dahua i TP-Link',
          'Zdarzenie z alarmu może włączyć światło na posesji',
          'Powiadomienia o ruchu i naruszeniu strefy',
        ],
        when: 'Alarm wykryje ruch na posesji',
        then: 'Zapalają się lampy ogrodowe, a powiadomienie prowadzi do obrazu z kamery',
        modules: ['M-SERV-s', 'M-SERV-MINI-s'],
        integrations: ['Hikvision', 'Dahua', 'TP-Link', 'Tiandy'],
        note: 'Nagrania zostają w rejestratorze. Ampio pokazuje obraz, nie zastępuje monitoringu.',
      },
      {
        key: 'en',
        name: 'Energia i fotowoltaika',
        icon: 'bolt',
        group: 'Energia',
        text: 'Zużycie prądu, wody i gazu na żywo, a urządzenia pracują wtedy, gdy panele dają nadwyżkę.',
        features: [
          'Pomiar prądu, wody i gazu z liczników',
          'Dane z falownika i magazynu energii w aplikacji',
          'Włączanie urządzeń przy nadwyżce z fotowoltaiki',
          'W biurach osobne liczniki do rozliczania najemców',
        ],
        when: 'Panele dają nadwyżkę prądu',
        then: 'Włącza się grzałka bojlera albo inne urządzenie, zamiast oddawać prąd do sieci',
        modules: ['M-IN-IMP4s', 'M-CON-485-s', 'M-REL'],
        integrations: ['Huawei', 'Fronius', 'SMA', 'GoodWe', 'Eastron', 'F&F'],
        note: 'Ładowarek do aut na liście integracji producenta nie ma. Konkretny model sprawdzamy osobno.',
      },
      {
        key: 'gar',
        name: 'Ogród, podlewanie i basen',
        icon: 'leaf',
        group: 'Na zewnątrz',
        text: 'Podlewanie według pogody i wilgotności ziemi, oświetlenie ogrodu i obsługa basenu.',
        features: [
          'Strefy podlewania z czasem i intensywnością',
          'Prognoza pogody, czujnik deszczu i wilgotności gleby',
          'Oświetlenie ogrodu i podjazdu',
          'Basen: filtracja, podgrzewanie, światło i pomiar wody',
        ],
        when: 'Prognoza zapowiada deszcz',
        then: 'Podlewanie przesuwa się na inny dzień',
        modules: ['M-REL', 'M-IN', 'M-IN-AD8s'],
        integrations: ['Festo', 'Danfoss', 'Bosch', 'Davis', 'Elsner'],
        note: 'Elektrozawory i czujniki są innych producentów. Ampio steruje nimi i zbiera dane.',
      },
      {
        key: 'av',
        name: 'Muzyka i kino domowe',
        icon: 'music',
        group: 'Multimedia',
        text: 'Scena Kino gasi światło i zasłania rolety, a muzyka gra w wybranych pomieszczeniach.',
        features: [
          'Scena Kino: światło, rolety, telewizor lub projektor jednym przyciskiem',
          'Muzyka w kilku pomieszczeniach przez Sonos, HEOS albo MusicCast',
          'Wzmacniacz Ampio z radiem FM do jednej strefy',
          'Telewizory i projektory w scenach',
        ],
        when: 'Włączasz scenę Kino',
        then: 'Światło schodzi do 15%, rolety zjeżdżają, a projektor i dźwięk się włączają',
        modules: ['M-AV-AMP-s', 'M-CON-IR', 'M-CON-232-s'],
        integrations: ['Sonos', 'HEOS', 'MusicCast', 'Chromecast', 'LG', 'Epson'],
        note: 'Muzyka w wielu strefach idzie przez systemy audio tych marek. Sam wzmacniacz Ampio nie ma Bluetooth.',
      },
      {
        key: 'app',
        name: 'Aplikacja, głos i sceny',
        icon: 'star',
        group: 'Sterowanie',
        text: 'Jedna aplikacja dla domu i wszystkich obiektów, sceny, harmonogramy i sterowanie głosem.',
        features: [
          'Aplikacja Ampio UNI na telefon i tablet, z widżetami',
          'Kilka obiektów w jednym telefonie, dostęp dla gości na czas',
          'Sceny według godziny, słońca, obecności i zdarzeń',
          'Głos przez standard Matter: Google, Amazon Alexa, Apple',
          'Home Assistant, Node-RED, MQTT i REST API dla zaawansowanych',
        ],
        when: 'Mówisz asystentowi „dobranoc”',
        then: 'Uruchamia się scena Noc: rolety w dół, światła gasną, alarm w trybie nocnym',
        modules: ['M-SERV-s', 'M-SERV-MINI-s'],
        integrations: ['Matter', 'Home Assistant', 'Node-RED', 'MQTT'],
        note: 'Zakres urządzeń sterowanych głosem ustalamy w projekcie, bo zależy od Matter.',
      },
    ] satisfies {
      key: AreaKey
      name: string
      icon: string
      group: string
      text: string
      features: string[]
      when: string
      then: string
      modules: string[]
      integrations: string[]
      note: string
    }[],
  },

  /** „Dlaczego Ampio” (`#dlaczego`) with the failure demo (`fl`). */
  why: {
    eyebrow: 'Dlaczego Ampio',
    heading: 'Każdy moduł ma własny mózg.',
    accent: 'Jedna awaria nie gasi domu.',
    lead: 'W wielu systemach wszystko zależy od jednego sterownika. Ampio rozkłada logikę na moduły połączone magistralą. Gdy jeden się zepsuje, przestaje działać tylko jego część, a reszta domu pracuje dalej.',
    list: [
      {
        title: 'Polski producent',
        text: 'Ampio projektuje i produkuje system w Polsce. Marka działa od 1997 roku, system na magistrali CAN rozwija od 2007.',
      },
      {
        title: 'Działa w domu bez internetu',
        text: 'W sieci domowej aplikacja Ampio UNI steruje domem także wtedy, gdy nie ma internetu. Z zewnątrz potrzebny jest internet.',
      },
      {
        title: 'Przewodowa magistrala',
        text: 'Jedna skrętka łączy moduły, panele i czujniki. Przewód jest pewniejszy niż radio i nie potrzebuje baterii.',
      },
      {
        title: 'Rozbudowa w każdej chwili',
        text: 'Nowe moduły dokładamy do tej samej magistrali, bez wymiany tego, co już działa.',
      },
      {
        title: 'Bez abonamentu',
        text: 'Za sterowanie lokalne producent nie pobiera dziś opłat od właścicieli (stan na październik 2026). Zastrzega, że może się to zmienić.',
      },
    ] satisfies Titled[],
    failure: {
      title: 'Co się dzieje przy awarii?',
      fail: 'Symuluj awarię',
      restore: 'Przywróć zasilanie',
      controller: 'STEROWNIK',
      bus: 'MAGISTRALA CAN',
      central: {
        title: 'Jeden centralny sterownik',
        ok: 'Wszystko zależy od jednego urządzenia.',
        bad: 'Sterownik nie działa, więc stoją wszystkie pomieszczenia.',
      },
      modular: {
        title: 'Ampio: logika w modułach',
        ok: 'Każdy moduł działa samodzielnie.',
        bad: 'Nie działa jeden moduł. Reszta domu pracuje normalnie.',
      },
      note: 'Ilustracja zasady działania. Ampio opisuje przykład z budowy: po przecięciu kabla między piętrami automatyka w pokojach działała dalej.',
    },
  },

  /** „Szklane panele Ampio M-DOT” (`#panele`): glass colour, size, the pressed fields. */
  panels: {
    eyebrow: 'Szklane panele Ampio M-DOT',
    heading: 'Panel zaprojektujesz razem z nami.',
    lead: 'W Kreatorze Paneli Ampio wybieramy kolor szkła, liczbę pól, ikony i podpisy. Panele mają od 2 do 18 pól dotykowych, w formacie kwadratowym albo prostokątnym, a wybrane modele mają czytnik kart RFID.',
    glassLabel: 'Kolor szkła',
    sizeLabel: 'Liczba pól',
    glass: ['Czarne', 'Białe', 'Grafitowe'],
    /** Fields and grid columns of each size. */
    sizes: [
      { fields: 6, cols: 3 },
      { fields: 9, cols: 3 },
      { fields: 12, cols: 4 },
    ],
    fieldsSuffix: 'pól',
    label: 'PRZYKŁADOWY UKŁAD PANELU',
    icons: [
      { name: 'Światło', icon: 'light' },
      { name: 'Rolety', icon: 'blind' },
      { name: 'Ogrzew.', icon: 'thermo' },
      { name: 'Scena', icon: 'star' },
      { name: 'Brama', icon: 'gate' },
      { name: 'Alarm', icon: 'shield' },
      { name: 'Muzyka', icon: 'music' },
      { name: 'Noc', icon: 'moon' },
      { name: 'Wyjście', icon: 'door' },
      { name: 'Taras', icon: 'sun2' },
      { name: 'Kino', icon: 'tv' },
      { name: 'Wentyl.', icon: 'cloud' },
    ],
  },

  /** „Integracje” (`#integracje`). */
  integrations: {
    head: {
      eyebrow: 'Integracje',
      heading: 'Pompa ciepła, rekuperacja, alarm, kamery. Wszystko się dogada.',
      lead: 'Ampio rozmawia w kilkunastu standardach komunikacji, od KNX i DALI po Modbus, MQTT i Matter. Przez Matter łączy się z asystentami Apple, Google i Amazon Alexa.',
    } satisfies SectionHead,
    groups: [
      {
        name: 'Standardy',
        tags: [
          'KNX',
          'DALI',
          'Modbus',
          'Z-Wave',
          'ZigBee',
          'EnOcean',
          'MQTT',
          'REST API',
          'Matter',
        ],
      },
      { name: 'Alarmy i kamery', tags: ['Satel', 'Jablotron', 'Dahua', 'Hikvision'] },
      { name: 'Domofony i zamki', tags: ['Akuvox', 'DoorBird', 'Gerda', 'Tedee', 'Shelly'] },
      { name: 'Klimatyzacja', tags: ['Daikin', 'LG', 'Samsung', 'Mitsubishi', 'Gree'] },
      {
        name: 'Rekuperacja',
        tags: ['Thessla Green', 'Zehnder', 'Komfovent', 'Brink', 'Pro-Vent'],
      },
      {
        name: 'Pompy ciepła i kotły',
        tags: ['Panasonic', 'LG', 'Daikin', 'Viessmann', 'Buderus', 'Stiebel'],
      },
      { name: 'Fotowoltaika', tags: ['Huawei', 'Fronius', 'SMA', 'GoodWe', 'Sofar'] },
      { name: 'Audio', tags: ['Sonos', 'Denon', 'HEOS', 'MusicCast', 'Chromecast'] },
      { name: 'Rolety, okna, bramy', tags: ['Somfy', 'Selve', 'Fakro', 'Velux', 'Hörmann'] },
      { name: 'Liczniki i pogoda', tags: ['Eastron', 'F&F', 'Apator', 'Davis', 'Netatmo'] },
      {
        name: 'Głos (przez Matter) i platformy',
        tags: ['Apple', 'Google', 'Amazon Alexa', 'Home Assistant', 'Node-RED'],
      },
    ],
    note: 'Konkretny model urządzenia sprawdzamy przy projekcie.',
  },

  /** „Pensjonaty, apartamenty, hotele” (`#obiekty`): the floor of rooms, the app, segments. */
  objects: {
    head: {
      eyebrow: 'Pensjonaty, apartamenty, hotele',
      heading: 'Pusty pokój grzeje mniej i nie świeci.',
      accent: 'A wszystkie obiekty masz w jednym telefonie.',
      lead: 'Kliknij pokój, żeby zmienić jego stan. Tak działa logika, którą ustawiamy w obiektach noclegowych: gość w pokoju ma komfort, pusty pokój oszczędza, a obsługa wie, co się dzieje.',
    } satisfies SectionHead,
    floor: 'Pensjonat · piętro 1',
    roomPrefix: 'Pokój',
    ecoSuffix: 'w trybie eko',
    initialRooms: ['g', 'e', 'g', 'c', 'e', 'g'] satisfies RoomStateKey[],
    states: {
      g: { name: 'Gość w pokoju', temp: '21°', light: 'wg gościa', mode: 'komfort' },
      e: { name: 'Pokój pusty', temp: '17°', light: 'zgaszone', mode: 'tryb eko' },
      c: { name: 'Do sprzątania', temp: '19°', light: 'włączone', mode: 'obsługa' },
    } satisfies Record<RoomStateKey, { name: string; temp: string; light: string; mode: string }>,
    staffNote:
      'Do tego powiadomienia dla obsługi: wyciek wody, awaria, hałas w ciszy nocnej. Tak działa Ampio w hotelu Citadines w Berlinie.',
    app: {
      label: 'Aplikacja Ampio UNI z kilkoma obiektami, przykładowy ekran',
      title: 'Ampio UNI',
      sub: 'Moje obiekty',
      caption: 'Przykładowy ekran · ilustracja',
      /** Objects of the app: tab, title, note and six tiles (name, icon, value, sub, on). */
      objects: [
        {
          tab: 'Dom',
          title: 'Dom w Rabce',
          note: 'Wszyscy w domu · alarm rozbrojony',
          tiles: [
            ['Salon', 'thermo', '21°', 'ogrzewanie', true],
            ['Światło', 'light', '4', 'włączone', true],
            ['Rolety', 'blind', 'Otwarte', 'parter', false],
            ['Brama', 'gate', 'Zamknięta', 'wjazd', false],
            ['Alarm', 'shield', 'Rozbrojony', 'dom', false],
            ['Energia', 'bolt', '3,2 kW', 'z paneli PV', true],
          ],
        },
        {
          tab: 'Zakopane 1',
          title: 'Apartament Zakopane 1',
          note: 'Gość przyjeżdża o 16:00 · ogrzewanie włączone',
          tiles: [
            ['Salon', 'thermo', '21°', 'na przyjazd', true],
            ['Sypialnia', 'thermo', '20°', 'na przyjazd', true],
            ['Światło', 'light', 'Wył.', 'czeka na gościa', false],
            ['Woda', 'drop', 'OK', 'czujnik zalania', false],
            ['Drzwi', 'lock', 'Kod aktywny', '16:00–11:00', true],
            ['Rolety', 'blind', 'Otwarte', 'salon', false],
          ],
        },
        {
          tab: 'Zakopane 2',
          title: 'Apartament Zakopane 2',
          note: 'Pusty od 3 dni · tryb eko',
          tiles: [
            ['Salon', 'thermo', '16°', 'tryb eko', false],
            ['Sypialnia', 'thermo', '16°', 'tryb eko', false],
            ['Światło', 'light', 'Wył.', 'symulacja obecności', false],
            ['Woda', 'drop', 'OK', 'czujnik zalania', false],
            ['Drzwi', 'lock', 'Zamknięte', 'brak rezerwacji', false],
            ['Mróz', 'snow', '−9°', 'na zewnątrz', true],
          ],
        },
      ] satisfies {
        tab: string
        title: string
        note: string
        tiles: [string, string, string, string, boolean][]
      }[],
    },
    segments: [
      {
        icon: 'hotel',
        name: 'Hotel i pensjonat',
        features: [
          'Karta w kieszeni przy drzwiach włącza zasilanie pokoju',
          'Panele M-DOT PRO z grawerem numeru pokoju i logo',
          'Wejście kartą lub kodem, funkcje dla obsługi w aplikacji',
          'Sceny dla sal: kolacja, konferencja, SPA',
        ],
        note: 'Panele PRO zamawia się od 10 sztuk jednego wzoru.',
      },
      {
        icon: 'office',
        name: 'Biuro i firma',
        features: [
          'Klimat w strefach, który nadąża za zmianą aranżacji',
          'Sala konferencyjna jednym przyciskiem: światło, rolety, ekran',
          'Połączenie z kontrolą dostępu, alarmem i kamerami',
          'Liczniki mediów do rozliczania najemców',
        ],
        note: '',
      },
      {
        icon: 'town',
        name: 'Obiekt publiczny',
        features: [
          'Od jednej sali po kompleks budynków',
          'Światło według obecności, pory dnia i natężenia w lux',
          'Harmonogramy i tryby oszczędne po godzinach',
          'Ampio steruje m.in. salą sesyjną Rady Miasta w Szczecinie',
        ],
        note: 'To nie jest system przeciwpożarowy.',
      },
    ],
    refs: {
      label: 'Realizacje Ampio w obiektach',
      items: [
        {
          title: 'Hotel Taaka Ryba, Sumina',
          text: 'Kiosk w lobby, sterowanie pokojem z panelu i aplikacji, puste pokoje w trybie oszczędnym (2023).',
        },
        {
          title: 'Citadines, Berlin',
          text: 'Czujniki obecności, alarmy o wyciekach i hałasie dla obsługi, montaż bez zamykania hotelu (2024).',
        },
        {
          title: 'Hotel Arche, Piła',
          text: 'Oświetlenie korytarzy i wentylacja sali konferencyjnej.',
        },
      ] satisfies Titled[],
      note: 'To realizacje producenta Ampio, nie PRO-KOM. Funkcje hotelowe (moduł pokoju M-ROOM-s PRO, panel z kieszenią na kartę) są na zamówienie specjalne.',
    },
  },

  /** „Z czego składa się instalacja Ampio” (`#moduly`). */
  modules: {
    head: {
      eyebrow: 'Dla dociekliwych',
      heading: 'Z czego składa się instalacja Ampio.',
      lead: 'Moduły na szynę DIN w rozdzielnicy albo do puszki, połączone jedną magistralą. Dobieramy je w projekcie do liczby obwodów, rolet i pomieszczeń.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'cpu',
        name: 'Serwer i aplikacja',
        text: 'Brama dla aplikacji Ampio UNI w domu i przez chmurę, integracje IP i wideodomofony.',
        models: ['M-SERV-s', 'M-SERV-MINI-s'],
      },
      {
        icon: 'light',
        name: 'Oświetlenie',
        text: 'Ściemniacze, taśmy LED, kolory RGBW i integracja z DALI.',
        models: ['M-DIM', 'M-OC', 'M-LED', 'M-CON-DL-s'],
      },
      {
        icon: 'blind',
        name: 'Rolety, żaluzje, brama',
        text: 'Wyjścia przekaźnikowe do napędów, także bezprzewodowy sterownik rolety.',
        models: ['M-REL', 'WL-REL-ROL1p'],
      },
      {
        icon: 'thermo',
        name: 'Ogrzewanie i chłodzenie',
        text: 'Regulacja w strefach (od 1 do 32), harmonogramy dzień i noc, klimatyzatory i Modbus.',
        models: ['M-RT-s', 'M-CON-HVAC-p', 'M-CON-485-s'],
      },
      {
        icon: 'cloud',
        name: 'Czujniki',
        text: 'Temperatura, wilgotność, światło, jakość powietrza, ruch i wejścia na kontaktrony lub czujki zalania.',
        models: ['M-SENS', 'WZ-PIR', 'M-IN'],
      },
      {
        icon: 'bolt',
        name: 'Energia',
        text: 'Wejścia impulsowe dla liczników prądu, wody i gazu, integracje falowników PV.',
        models: ['M-IN-IMP4s'],
      },
      {
        icon: 'grid',
        name: 'Panele szklane',
        text: 'Od 2 do 18 pól, z wyświetlaczem, z ekranem dotykowym, z czytnikiem RFID albo gestami.',
        models: ['M-DOT', 'M-DOT-T6', 'M-DOT-R14', 'M-DOT-GEST'],
      },
      {
        icon: 'layers',
        name: 'Integracje i alarm',
        text: 'Bramki do KNX, Z-Wave, EnOcean i podczerwieni, własna centrala alarmowa.',
        models: ['M-CON-KNX-s', 'M-CON-ZWAVE-s', 'M-ALARM-8s'],
      },
    ],
    note: 'Konkretny dobór robimy w projekcie, a wycenę podajemy dla całej instalacji.',
  },

  /** „Kiedy zacząć” (`#etapy`): seven stages and the checklist before plastering. */
  stages: {
    head: {
      eyebrow: 'Kiedy zacząć',
      heading: 'Najlepiej, zanim elektryk położy pierwszy przewód.',
      lead: 'Smart home planujemy razem z instalacją elektryczną. Wtedy jest najtaniej i najwięcej da się zrobić. W gotowym domu też się da, choć zwykle trzeba dołożyć przewody.',
    } satisfies SectionHead,
    steps: [
      {
        n: '01',
        title: 'Rozmowa i potrzeby',
        text: 'Co ma się dziać w domu, kto w nim mieszka, co już jest.',
        who: 'Ty i my',
      },
      {
        n: '02',
        title: 'Projekt i dobór modułów',
        text: 'Rozmieszczenie paneli, czujników i odbiorników, schemat rozdzielnicy.',
        who: 'PRO-KOM',
      },
      {
        n: '03',
        title: 'Okablowanie przed tynkami',
        text: 'Magistrala do paneli, czujników i urządzeń do integracji.',
        who: 'PRO-KOM z elektrykiem',
      },
      {
        n: '04',
        title: 'Rozdzielnica i montaż',
        text: 'Moduły na szynie DIN, zasilacze z redundancją, panele i czujniki.',
        who: 'PRO-KOM',
      },
      {
        n: '05',
        title: 'Programowanie i sceny',
        text: 'Sceny, harmonogramy, automatyki i integracje.',
        who: 'PRO-KOM',
      },
      {
        n: '06',
        title: 'Szkolenie i aplikacja',
        text: 'Uczymy obsługi aplikacji. Zakres przekazania dostępów i uprawnień ustalamy w umowie.',
        who: 'Ty i my',
      },
      {
        n: '07',
        title: 'Serwis zdalny i rozbudowa',
        text: 'Zmiany scen zdalnie, nowe moduły w dowolnym momencie.',
        who: 'PRO-KOM',
      },
    ],
    checklist: {
      eyebrow: 'Budujesz? Lista przed tynkami',
      heading: 'Odhacz, co już masz zaplanowane',
      initial: [0, 1],
      done: 'Komplet. Jesteś gotowy na smart home.',
      progress: 'Zaplanowane:',
      of: 'z',
      button: 'Umów konsultację projektu →',
      items: [
        {
          title: 'Skrętka magistrali do każdego panelu',
          text: 'I do urządzeń, które chcesz połączyć: rekuperator, klimatyzacja, falownik.',
        },
        {
          title: 'Głębsze puszki pod panele',
          text: 'Korpus panelu chowa się w ścianie na 22 mm, dlatego pod panel montuje się głęboką puszkę. Typ puszki podajemy w projekcie.',
        },
        {
          title: 'Przewód do czujnika temperatury',
          text: 'Dwużyłowy, do najbliższego panelu lub modułu, czujnik na 120–150 cm.',
        },
        {
          title: 'Większa rozdzielnica',
          text: 'Moduły Ampio montuje się na szynie DIN, potrzeba na nie miejsca.',
        },
        {
          title: 'Dwa zasilacze z redundancją',
          text: 'Osobne zabezpieczenia, jeden buforowy, połączone modułem redundancji.',
        },
        {
          title: 'Przewody do rolet i bramy',
          text: 'Każdy napęd osobno, żeby sterować nim z systemu.',
        },
        { title: 'Zapasowy kabel magistrali', text: 'Opcjonalnie, na późniejszą rozbudowę.' },
        { title: 'Miejsce na serwer i router', text: 'Serwer Ampio łączy się z siecią domową.' },
      ] satisfies Titled[],
    },
  },

  /**
   * Note under the warranty section (`.xc-gwn`). Spec §2.7: no Ampio warranty period until the
   * authorisation is confirmed.
   * TODO(krystian): szef potwierdza autoryzację Ampio (spec §12) — wtedy zdanie o okresie
   * gwarancji producenta albo o zakupie przez partnera (zdanie „[SZEF…]” z prototypu pominięte).
   */
  warrantyNote:
    'Gwarancja na moduły Ampio: według warunków producenta. Warunki gwarancji Ampio zależą m.in. od montażu przez instalatora autoryzowanego przez producenta.',
}
