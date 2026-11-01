import type { ServiceKey } from '@/lib/instalacje/options'

import type { InstIconName } from '../icons'

/*
 * The house cross-section `ArchHouseScene` (ADR-I005 §1): 17 hotspots in the drawing's
 * coordinates (`viewBox 0 70 1000 530`), their service, stage and texts, and „Liczby do
 * projektu” by `spec` key — from `seed/prokominstalacje/architekci/przekroj.json`
 * (= `zrodlo/common.js` `arHotspots()`, `arSpecs()`), view and layer texts from `arScene()`.
 * Numbers only from `docs/strony/prokominstalacje-architekci-zrodla.md`. Colours of the
 * services come from the panel (`InstServices.color`).
 */

export type ArchView = 'kl' | 'ty' | 'in'

export type ArchHotspot = {
  x: number
  y: number
  service: ServiceKey
  stage: string
  title: string
  /** „Klient widzi”. */
  sees: string
  /** „W projekcie zaplanuj”. */
  plan: string
  /** Key of `przekroj.specs`. */
  spec: string
}

export const przekroj = {
  label:
    'Przekrój domu z instalacjami: kamery, alarm, wideodomofon, kontrola dostępu, sieć i Wi-Fi, smart home, dźwięk, telewizor, antena, ładowarka samochodu i przyłącze światłowodu',
  viewsLabel: 'Widok przekroju',
  views: [
    {
      key: 'kl',
      name: 'Gotowy dom',
      icon: 'home',
      caption: 'Tak widzi to klient. Ile instalacji tu jest?',
    },
    {
      key: 'ty',
      name: 'Przed tynkami',
      icon: 'tool',
      caption: 'Przed tynkami: puszki, ramki, rury i trasy kabli',
    },
    {
      key: 'in',
      name: 'Wszystkie instalacje',
      icon: 'layers',
      caption: 'Wszystkie instalacje i trasy do szafy rack',
    },
  ] as { key: ArchView; name: string; icon: InstIconName; caption: string }[],
  /** Layers in the prototype's order (`SN`), with its names. */
  layers: [
    { service: 'kam', name: 'Monitoring' },
    { service: 'alarm', name: 'Alarm i domofon' },
    { service: 'kd', name: 'Kontrola dostępu' },
    { service: 'wifi', name: 'Sieć i Wi-Fi' },
    { service: 'smart', name: 'Smart home' },
    { service: 'snd', name: 'Dźwięk' },
    { service: 'scr', name: 'Ekrany i TV' },
    { service: 'ant', name: 'Anteny' },
    { service: 'ev', name: 'Ładowarka EV' },
    { service: 'tel', name: 'Teletechnika' },
  ] as { service: ServiceKey; name: string }[],
  layersLabel: 'Warstwy instalacji',
  layersTitle: 'Warstwy',
  allLayers: 'Wszystkie',
  stagePrefix: 'Etap: ',
  sees: 'Klient widzi',
  plan: 'W projekcie zaplanuj',
  spec: 'Liczby do projektu',
  specFallback: 'Parametry dobieramy do projektu.',
  prev: 'Poprzedni punkt',
  next: 'Następny punkt',
  hotspots: [
    {
      x: 194,
      y: 250,
      service: 'kam',
      stage: 'Projekt',
      title: 'Kamera pod okapem',
      sees: 'Mała kamera w kolorze elewacji. Bez kabla na wierzchu i bez puszki na ociepleniu.',
      plan: 'Miejsce uzgodnione z detalem okapu i element montażowy w warstwie ocieplenia. Kabel sieciowy do szafy rack.',
      spec: 'kam',
    },
    {
      x: 33,
      y: 472,
      service: 'alarm',
      stage: 'Projekt',
      title: 'Wideodomofon przy furtce',
      sees: 'Panel w słupku ogrodzenia. Gość dzwoni, Ty odbierasz w telefonie.',
      plan: 'Rura osłonowa w ziemi od furtki do budynku, wnęka w słupku na panel.',
      spec: 'dom',
    },
    {
      x: 158,
      y: 470,
      service: 'kd',
      stage: 'Przed tynkami',
      title: 'Zamek z kodem przy drzwiach',
      sees: 'Drzwi otwierane kodem, kartą albo telefonem. Bez szukania kluczy.',
      plan: 'Przewód do ościeżnicy (elektrozaczep albo zamek silnikowy) i zasilanie z szafy.',
      spec: 'kd',
    },
    {
      x: 277,
      y: 451,
      service: 'alarm',
      stage: 'Przed tynkami',
      title: 'Manipulator alarmu',
      sees: 'Płaska klawiatura przy wejściu, w linii z włącznikami.',
      plan: 'Puszka na wysokości włączników przy drzwiach i przewód do centrali w pomieszczeniu technicznym.',
      spec: 'alm',
    },
    {
      x: 631,
      y: 451,
      service: 'smart',
      stage: 'Przed tynkami',
      title: 'Szklany panel Ampio',
      sees: 'Jeden szklany panel zamiast rzędu włączników: światło, rolety, ogrzewanie, sceny.',
      plan: 'Głęboka puszka przy drzwiach. Kolor szkła i ikony dobrane do wnętrza.',
      spec: 'panel',
    },
    {
      x: 482,
      y: 404,
      service: 'snd',
      stage: 'Projekt',
      title: 'Głośniki w suficie',
      sees: 'Maskownice w kolorze sufitu albo głośniki całkiem pod gładzią. Muzyka bez kolumn na podłodze.',
      plan: 'Sufit podwieszany z miejscem na korpus, ramki montażowe przed płytą g-k, przewód do wzmacniacza.',
      spec: 'spk',
    },
    {
      x: 352,
      y: 406,
      service: 'wifi',
      stage: 'Przed tynkami',
      title: 'Punkt Wi-Fi w suficie',
      sees: 'Płaski krążek na suficie. Zasięg w całym domu bez routerów na półce.',
      plan: 'Kabel sieciowy z każdego punktu do szafy, zasilanie przez ten sam kabel (PoE).',
      spec: 'ap',
    },
    {
      x: 478,
      y: 468,
      service: 'scr',
      stage: 'Projekt',
      title: 'Telewizor w zabudowie',
      sees: 'Ekran w lamelach, bez kabli pod spodem. Sprzęt schowany w szafce albo w szafie rack.',
      plan: 'Wnęka z wentylacją, rura pod przewody za ekranem, gniazdo zasilania i sieci.',
      spec: 'tv',
    },
    {
      x: 560,
      y: 518,
      service: 'smart',
      stage: 'Przed tynkami',
      title: 'Ogrzewanie strefowe',
      sees: 'Każdy pokój ma swoją temperaturę, ustawianą z panelu albo telefonu.',
      plan: 'Czujnik temperatury w każdej strefie i przewody do siłowników przy rozdzielaczu.',
      spec: 'heat',
    },
    {
      x: 262,
      y: 254,
      service: 'smart',
      stage: 'Projekt',
      title: 'Roleta w nadprożu',
      sees: 'Nie widać kasety. Roleta zjeżdża sama, gdy słońce grzeje albo gdy wyjeżdżasz.',
      plan: 'Wnęka w nadprożu na kasetę i przewód do sterowania przed tynkami.',
      spec: 'rol',
    },
    {
      x: 490,
      y: 254,
      service: 'snd',
      stage: 'Projekt',
      title: 'Głośnik w łazience',
      sees: 'Głośnik w suficie odporny na wilgoć. Muzyka albo radio rano.',
      plan: 'Model do wilgotnych pomieszczeń i przewód do wzmacniacza strefy.',
      spec: 'bath',
    },
    {
      x: 728,
      y: 470,
      service: 'wifi',
      stage: 'Projekt',
      title: 'Szafa rack',
      sees: 'Klient jej nie widzi. Wszystkie kable kończą się w jednym, opisanym miejscu.',
      plan: 'Miejsce w pomieszczeniu technicznym: wentylacja, osobny obwód zasilania, dostęp z przodu.',
      spec: 'rack',
    },
    {
      x: 946,
      y: 451,
      service: 'ev',
      stage: 'Projekt',
      title: 'Ładowarka w garażu',
      sees: 'Ładowarka na ścianie garażu. Auto ładuje się w nocy.',
      plan: 'Moc przyłącza z zapasem i przewód zasilający do garażu, uzgodnione z projektantem elektrycznym.',
      spec: 'ev',
    },
    {
      x: 943,
      y: 394,
      service: 'kam',
      stage: 'Projekt',
      title: 'Kamera wjazdu',
      sees: 'Widać podjazd i bramę, także w nocy.',
      plan: 'Miejsce nad bramą garażową i kabel do szafy przez ścianę garażu.',
      spec: 'kam2',
    },
    {
      x: 690,
      y: 118,
      service: 'ant',
      stage: 'Projekt',
      title: 'Antena na dachu',
      sees: 'Antena od strony ogrodu, nie na głównej elewacji.',
      plan: 'Miejsce na maszt, przepust przez dach, uziemienie i przewód do szafy.',
      spec: 'ant',
    },
    {
      x: 161,
      y: 498,
      service: 'snd',
      stage: 'Projekt',
      title: 'Głośnik ogrodowy',
      sees: 'Głośnik udający kamień albo schowany w zieleni. Muzyka na tarasie.',
      plan: 'Przewód w rurze w ziemi od tarasu do budynku.',
      spec: 'gard',
    },
    {
      x: 92,
      y: 566,
      service: 'tel',
      stage: 'Projekt',
      title: 'Rura pod światłowód',
      sees: 'Niewidoczna. Internet światłowodowy bez kopania podjazdu.',
      plan: 'Rura osłonowa od granicy działki do pomieszczenia technicznego, z pilotem do przeciągnięcia.',
      spec: 'fib',
    },
  ] as ArchHotspot[],
  specs: {
    kam: 'Kamera IP pobiera zwykle ok. 6–12 W (np. Hikvision ColorVu 8 MP: maks. 6,5 W). Mieści się w PoE 802.3af (13 W dla urządzenia). Kabel do 90 m od szafy.',
    dom: 'Panel furtki i monitor zasilane zwykle z PoE. Rura w ziemi z zapasem, bez łączenia kabli po drodze.',
    kd: 'Zamek albo elektrozaczep zasilany z szafy, przewód do ościeżnicy przed montażem drzwi. Model zamka dobieramy z producentem drzwi.',
    alm: 'Manipulator i czujki na przewodzie albo bezprzewodowe. Przewód do centrali w szafie lub obok niej.',
    panel:
      'Panele Ampio M-DOT: 90×90 albo 90×160 mm, od 2 do 18 pól. Puszka osadzona głębiej niż standardowo. Szkło, ikony i podpisy ustawiasz w kreatorze Ampio.',
    spk: 'Głośnik 6–6,5": otwór ok. 200–210 mm, głębokość 92–120 mm. 8": otwór ok. 257 mm, głębokość ok. 135 mm. Para stereo w odstępie 1,8–3 m.',
    ap: 'Punkt Wi-Fi na środku sufitu, kolejne co 10–12 m (wytyczne TP-Link Omada). Zasilanie PoE+ do 25,5 W (np. UniFi U7 Pro maks. 21 W).',
    tv: 'Kąt widzenia 30–40°: z 2,1 m to ekran ok. 55–70". Środek ekranu na wysokości oczu: dla 65" ok. 100–120 cm od podłogi.',
    heat: 'Czujnik temperatury w każdej strefie i przewód do siłownika przy rozdzielaczu. Strefy ustalamy z projektantem instalacji grzewczej.',
    rol: 'Napęd sterowany z modułu Ampio. Przewód do każdej rolety i wnęka w nadprożu na kasetę.',
    bath: 'Głośnik do wilgotnych pomieszczeń (model łazienkowy), przewód do wzmacniacza strefy.',
    rack: '19": 1U = 44,45 mm. Szafa wisząca 600×450 mm daje ok. 39 cm użytecznej głębokości. Wentylacja, osobny obwód zasilania i dostęp z przodu.',
    ev: 'Elzab CC Home: 3,7 kW (1 faza 16 A), 7,4 kW (1 faza 32 A) albo 11 kW (3 fazy 16 A). 22 kW wymaga 3 faz 32 A.',
    kam2: 'Ta sama zasada co przy elewacji: kabel PoE do szafy (do 90 m), uchwyt nad bramą, bez mostka termicznego w ociepleniu.',
    ant: 'Satelita Hot Bird 13°E. Przewód 75 Ω z ekranowaniem klasy A, osobny do każdego odbiornika z multiswitcha.',
    gard: 'Przewód głośnikowy w rurze w ziemi. Głośniki zewnętrzne odporne na wodę i mróz.',
    fib: 'Rura osłonowa od granicy działki do szafy. W budynkach wielorodzinnych: punkt styku, skrzynka w każdym lokalu, światłowód jednomodowy.',
  } as Record<string, string>,
}
