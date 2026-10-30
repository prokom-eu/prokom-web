import type { ObjectKey, ServiceKey } from './types'

/**
 * Fixed texts of the home page (ADR-I002 §1). I5: the widget of the hero „Twój obiekt na żywo”
 * — transcribed from `zrodlo/pages/Main.js` (`OBJ.*.n/t/pipCam`, `LAY`) and `Main.body.html`
 * (`#start`), v4.2. The hero's own heading and lead are edited in the panel (`instHome`). The
 * event texts of the prototype (`OBJ.*.e`) are left out: the prototype never shows them.
 * Edited by hand from now on.
 */

/** Objects of the hero, in the order of the tabs. */
export const HERO_OBJECTS = ['dom', 'pens', 'hotel', 'rest', 'sklep', 'firma'] as const
export type HeroObject = (typeof HERO_OBJECTS)[number] & ObjectKey

/** Installation layers, in the order of the chips. */
export const HERO_LAYERS = ['kam', 'alarm', 'kd', 'wifi', 'smart', 'ev', 'snd', 'scr'] as const
export type HeroLayer = (typeof HERO_LAYERS)[number] & ServiceKey

export const HERO_MODES = ['day', 'night', 'winter'] as const
export type HeroMode = (typeof HERO_MODES)[number]

type LayerTexts = Record<HeroLayer, string> & { kamN: string; alarmN: string; smartW: string }

export type HeroObjectTexts = {
  name: string
  /** Icon key of the tab (`INST_ICONS`). */
  icon: string
  /** Label of the camera preview. */
  camera: string
  /** What each installation does in this object; `kamN`/`alarmN` at night, `smartW` in winter. */
  layers: LayerTexts
}

export const glowna = {
  hero: {
    objectsLabel: 'Rodzaj obiektu',
    modesLabel: 'Pora i pogoda',
    chipsLabel: 'Instalacje widoczne na obiekcie',
    modes: {
      day: { label: 'Dzień', icon: 'sun' },
      night: { label: 'Noc', icon: 'moon' },
      winter: { label: 'Zima', icon: 'snow' },
    } satisfies Record<HeroMode, { label: string; icon: string }>,
    layers: {
      kam: { label: 'Kamery', icon: 'cam' },
      alarm: { label: 'Alarm', icon: 'bell' },
      kd: { label: 'Domofon i dostęp', icon: 'lock' },
      wifi: { label: 'Wi-Fi i sieć', icon: 'wifi' },
      smart: { label: 'Smart home Ampio', icon: 'home' },
      ev: { label: 'Ładowarka EV', icon: 'bolt' },
      snd: { label: 'Nagłośnienie', icon: 'spk' },
      scr: { label: 'Ekrany', icon: 'scr' },
    } satisfies Record<HeroLayer, { label: string; icon: string }>,
    live: 'Na żywo',
    empty: 'Włącz instalacje poniżej, a zobaczysz, co robią w tym obiekcie.',
    /** „+N instalacja/-e/-i więcej działa w tym obiekcie”. */
    more: {
      one: 'instalacja',
      few: 'instalacje',
      many: 'instalacji',
      suffix: 'więcej działa w tym obiekcie',
    },
    showAll: 'Pokaż wszystko',
    hideAll: 'Wyłącz wszystko',
    planSet: 'Zaplanuj taki zestaw →',
    scene: 'Ilustracja',
    sceneOn: 'Włączone',
    sceneNothing: 'nic',
    preview: {
      label: 'Podgląd z kamery',
      rec: 'REC',
      person: 'Osoba 97%',
      night: 'Osoba w strefie · powiadomienie wysłane',
      day: 'Wykrywanie ludzi i aut · mniej fałszywych alarmów',
      codec: 'H.265 · 4 MP',
      /** Fixed clock of the night preview (`02:14:ss`). */
      nightClock: '02:14',
    },
    objects: {
      dom: {
        name: 'Dom',
        icon: 'home',
        camera: 'KAM 3 · Podjazd',
        layers: {
          kam: '3 kamery · podgląd w telefonie, nagrania zostają w domu',
          kamN: 'Tryb nocny · furtka, podjazd i ogród pod okiem',
          alarm: 'Rozbrojony · dom i garaż',
          alarmN: 'Uzbrojony na noc · parter i garaż',
          kd: 'Wideodomofon przy furtce · otwierasz z telefonu',
          wifi: 'Wi-Fi w całym domu i w ogrodzie, jedna sieć',
          smart: 'Ogrzewanie, światło i rolety w jednej aplikacji',
          smartW: 'Na zewnątrz −12°, w środku 21° · ogrzewanie z telefonu',
          ev: 'Elzab CC Home · ładujesz w nocy w garażu',
          snd: 'Muzyka w salonie i na tarasie',
          scr: 'Panel przy wejściu: kamery, alarm, ogrzewanie',
        },
      },
      pens: {
        name: 'Pensjonat',
        icon: 'bed',
        camera: 'KAM 2 · Parking',
        layers: {
          kam: '4 kamery · parking, wejście, narciarnia. Bez pokoi i sauny',
          kamN: 'Tryb nocny · parking i narciarnia pod okiem',
          alarm: 'Rozbrojony · narciarnia i zaplecze',
          alarmN: 'Narciarnia uzbrojona · goście śpią spokojnie',
          kd: 'Kod do pokoju wysłany gościowi · przyjazd bez recepcji',
          wifi: 'Osobna sieć dla gości, osobna dla kamer i kasy',
          smart: 'Ogrzewanie tylko w zajętych pokojach',
          smartW: 'Mróz −14° · pokoje nagrzane przed przyjazdem',
          ev: 'Elzab CC Wall dla gości · karta RFID, licznik MID',
          snd: 'Muzyka w jadalni i komunikaty dla gości',
          scr: 'Ekran w recepcji: pogoda, stoki, atrakcje',
        },
      },
      hotel: {
        name: 'Hotel',
        icon: 'hotel',
        camera: 'KAM 1 · Podjazd',
        layers: {
          kam: '4 kamery · podjazd, parking i wejścia',
          kamN: 'Tryb nocny · parking i podjazd nagrywane',
          alarm: 'Strefy: zaplecze, magazyn, technika',
          alarmN: 'Zaplecze uzbrojone · lobby czynne całą noc',
          kd: 'Karty do pokoi · SPA i siłownia tylko dla gości',
          wifi: 'Sieć dla gości, kamery i recepcja w osobnych sieciach',
          smart: 'Pokój wie, że gość wyszedł · ogrzewanie w trybie eko',
          smartW: 'Mróz −14° · pokoje grzeją się według rezerwacji',
          ev: '2 ładowarki Elzab CC Wall dla gości · RFID i OCPP',
          snd: 'Strefy: lobby, restauracja, SPA · osobna głośność',
          scr: 'Ekrany w lobby i w sali konferencyjnej',
        },
      },
      rest: {
        name: 'Restauracja',
        icon: 'food',
        camera: 'KAM 1 · Parking',
        layers: {
          kam: '3 kamery · sala, kasa, parking',
          kamN: 'Lokal zamknięty · zaplecze i parking nagrywane',
          alarm: 'Rozbrojony · lokal otwarty',
          alarmN: 'Lokal uzbrojony po zamknięciu kasy',
          kd: 'Drzwi dostaw z wideodomofonem · zaplecze na kartę',
          wifi: 'Wi-Fi dla gości i osobna sieć dla kasy i terminala',
          smart: 'Sceny światła: obiad, kolacja, zamknięte',
          smartW: 'Mróz −12° · sala nagrzana na otwarcie o 11:00',
          ev: 'Ładowarka dla gości przy parkingu',
          snd: 'Muzyka na sali i na tarasie · osobna głośność',
          scr: 'Menu board przy wejściu · menu zmieniasz z telefonu',
        },
      },
      sklep: {
        name: 'Sklep',
        icon: 'shop',
        camera: 'KAM 1 · Parking',
        layers: {
          kam: '3 kamery · sala, kasa, parking',
          kamN: 'Sklep zamknięty · zaplecze i parking nagrywane',
          alarm: 'Rozbrojony · sklep otwarty',
          alarmN: 'Uzbrojony · czujki w sali i w magazynie',
          kd: 'Zaplecze i magazyn na kartę pracownika',
          wifi: 'Sieć dla kas i terminali, osobna dla klientów',
          smart: 'Światło i ogrzewanie według godzin otwarcia',
          smartW: 'Mróz −12° · ogrzewanie włącza się przed otwarciem',
          ev: 'Ładowarka dla klientów na parkingu',
          snd: 'Muzyka i komunikaty w sklepie',
          scr: 'Ekrany w witrynie i totem przy wejściu',
        },
      },
      firma: {
        name: 'Firma',
        icon: 'factory',
        camera: 'KAM 3 · Brama',
        layers: {
          kam: '4 kamery · plac, brama, rampa, biuro',
          kamN: 'Tryb nocny · plac i brama pod okiem',
          alarm: 'Rozbrojony · zmiana dzienna',
          alarmN: 'Hala i biuro uzbrojone · plac czuwa',
          kd: 'Brama i biuro na karty · historia wejść',
          wifi: 'Wi-Fi w hali i biurze · światłowód między budynkami',
          smart: 'Oświetlenie hali strefami · harmonogram ogrzewania',
          smartW: 'Mróz −12° · hala nagrzana przed pierwszą zmianą',
          ev: 'Ładowarka dla aut firmowych · rozliczanie kart',
          snd: 'Komunikaty i sygnały przerw w hali',
          scr: 'Ekran w hali: plan dnia i informacje BHP',
        },
      },
    } satisfies Record<HeroObject, HeroObjectTexts>,
  },
}
