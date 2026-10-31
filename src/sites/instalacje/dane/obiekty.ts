import type { ObjectKey, ServiceKey } from './types'

/**
 * Code data of the „Dla kogo” pages (`/dla-kogo/<slug>`, KOMPONENTY §5), from
 * `zrodlo/generator-obiektow/build_seg.py` (template texts, `SIM`, `LY`) and `lib.py` (`SV`
 * layers), hotspot titles from `zrodlo/pages/Seg*.js` and `Noclegowe.js` (`D.hs`). Everything else of an
 * object page is in the panel (`InstObjects`, ADR-I002 §2): the hotspot descriptions there are
 * in the order of these titles (the numbers on the drawing).
 */

/** Scene filter (`LY`): groups of services. */
export type LayerKey = '' | 'bez' | 'net' | 'av' | 'kom'

export const LAYERS: readonly { key: LayerKey; label: string }[] = [
  { key: '', label: 'Wszystko' },
  { key: 'bez', label: 'Bezpieczeństwo' },
  { key: 'net', label: 'Sieć i łączność' },
  { key: 'av', label: 'Dźwięk i obraz' },
  { key: 'kom', label: 'Komfort i energia' },
]

/** Layer of each service (`SV`); the colours come from the panel (`InstServices.color`). */
export const SERVICE_SCENE: Record<ServiceKey, { layer: Exclude<LayerKey, ''> }> = {
  kam: { layer: 'bez' },
  alarm: { layer: 'bez' },
  kd: { layer: 'bez' },
  wifi: { layer: 'net' },
  tel: { layer: 'net' },
  ant: { layer: 'net' },
  smart: { layer: 'kom' },
  snd: { layer: 'av' },
  scr: { layer: 'av' },
  ev: { layer: 'kom' },
}

export type SceneHotspot = { title: string; service: ServiceKey }

/**
 * Objects with a page (all 12 since I10). The pensjonat page (`Noclegowe.*`) is the same
 * template as the others in prototype v4.2 — KOMPONENTY §5 „sekcje dodatkowe” is out of date.
 */
export type BuiltObjectKey = ObjectKey

/**
 * Per object: the hotspot titles and services in the order of the numbers on the drawing, and
 * the „Podobne obiekty” cards (`SIM`).
 */
export const OBJECT_SCENES: Record<
  BuiltObjectKey,
  { hotspots: readonly SceneHotspot[]; similar: readonly ObjectKey[] }
> = {
  pens: {
    hotspots: [
      { title: 'Kod do drzwi i wideodomofon w telefonie', service: 'kd' },
      { title: 'Kamera narciarni i suszarni', service: 'kam' },
      { title: 'Kamera wjazdu i parkingu', service: 'kam' },
      { title: 'Punkt Wi-Fi w każdym pokoju', service: 'wifi' },
      { title: 'Telewizja w pokojach z jednej szafy', service: 'ant' },
      { title: 'Czujka dymu w każdym pokoju', service: 'alarm' },
      { title: 'Czujka czadu w kotłowni', service: 'alarm' },
      { title: 'Ogrzewanie pokoi według obłożenia', service: 'smart' },
      { title: 'Ekran w jadalni: pogoda i stoki', service: 'scr' },
      { title: 'Most radiowy do dobudówki', service: 'wifi' },
      { title: 'Ładowarka dla gości', service: 'ev' },
    ],
    similar: ['apt', 'hotel', 'rest'],
  },
  dom: {
    hotspots: [
      { title: 'Czujki otwarcia i ruchu odporne na zwierzęta', service: 'alarm' },
      { title: 'Czujka zalania pod kotłem i pralką', service: 'alarm' },
      { title: 'Czujka dymu i czadu przy kominku', service: 'alarm' },
      { title: 'Temperatura i tryb nieobecności', service: 'smart' },
      { title: 'Kamera furtki i ogrodu', service: 'kam' },
      { title: 'Kamera podjazdu i garażu', service: 'kam' },
      { title: 'Wideodomofon przy furtce', service: 'alarm' },
      { title: 'Brama i furtka z telefonu, kod dla sąsiada', service: 'kd' },
      { title: 'Router z łączem zapasowym i UPS', service: 'wifi' },
      { title: 'Antena ustawiona miernikiem', service: 'ant' },
      { title: 'Ładowarka w garażu', service: 'ev' },
    ],
    similar: ['apt', 'pens'],
  },
  apt: {
    hotspots: [
      { title: 'Zamek z kodem w drzwiach apartamentu', service: 'kd' },
      { title: 'Kod do bramy i klatki, za zgodą wspólnoty', service: 'kd' },
      { title: 'Czujka zalania pod pralką', service: 'alarm' },
      { title: 'Czujka dymu, obowiązkowa przy najmie', service: 'alarm' },
      { title: 'Ogrzewanie: pusty lokal i przyjazd gościa', service: 'smart' },
      { title: 'Punkt Wi-Fi zamiast routera w szafce', service: 'wifi' },
      { title: 'Telewizor z DVB-T2 i aplikacjami', service: 'ant' },
      { title: 'Czujnik hałasu bez nagrywania dźwięku', service: 'smart' },
      { title: 'Wjazd do garażu dla gościa', service: 'kd' },
    ],
    similar: ['pens', 'hotel', 'dom'],
  },
  hotel: {
    hotspots: [
      { title: 'Wi-Fi w każdym pokoju i strefie wspólnej', service: 'wifi' },
      { title: 'Telewizja w pokojach z jednej szafy', service: 'ant' },
      { title: 'Zamek na kartę albo klucz w telefonie', service: 'kd' },
      { title: 'Samodzielne meldowanie i wideodomofon', service: 'kd' },
      { title: 'Kamera wjazdu na parking', service: 'kam' },
      { title: 'Kamery w lobby i na korytarzach', service: 'kam' },
      { title: 'Nagłośnienie i mikrofony w sali', service: 'snd' },
      { title: 'Ekran i prezentacje bez kabli', service: 'scr' },
      { title: 'Ekran powitalny w recepcji', service: 'scr' },
      { title: 'Pokój sterowany według obecności', service: 'smart' },
      { title: 'Ładowarki na parkingu', service: 'ev' },
      { title: 'Szafa: sieć, telewizja, rejestrator, UPS', service: 'wifi' },
    ],
    similar: ['pens', 'rest', 'apt'],
  },
  rest: {
    hotspots: [
      { title: 'Głośniki sufitowe w strefach', service: 'snd' },
      { title: 'Panel dla DJ-a i mikrofony', service: 'snd' },
      { title: 'Głośniki na tarasie', service: 'snd' },
      { title: 'Menu board nad barem', service: 'scr' },
      { title: 'Kamera nad kasą', service: 'kam' },
      { title: 'Kamera wejścia i parkingu', service: 'kam' },
      { title: 'Wi-Fi gości oddzielone od kasy', service: 'wifi' },
      { title: 'Czujki w chłodni i kuchni', service: 'alarm' },
      { title: 'Sceny światła na sali', service: 'smart' },
      { title: 'Szafa: router, łącze zapasowe, UPS', service: 'wifi' },
      { title: 'Kod do zaplecza dla dostawców', service: 'kd' },
    ],
    similar: ['hotel', 'pens', 'sklep'],
  },
  sklep: {
    hotspots: [
      { title: 'Kamera przy wejściu, na wysokości twarzy', service: 'kam' },
      { title: 'Kamera nad kasą', service: 'kam' },
      { title: 'Kamera w alejce z drogim towarem', service: 'kam' },
      { title: 'Ekran w witrynie, czytelny w słońcu', service: 'scr' },
      { title: 'Muzyka w strefach i komunikaty z kasy', service: 'snd' },
      { title: 'Czujka zbicia szyby i ruchu', service: 'alarm' },
      { title: 'Przycisk napadowy przy kasie', service: 'alarm' },
      { title: 'Sieć kasy i terminala z łączem zapasowym', service: 'wifi' },
      { title: 'Kod na zaplecze i dzwonek dla dostaw', service: 'kd' },
      { title: 'Harmonogram światła witryny', service: 'smart' },
    ],
    similar: ['rest', 'firma'],
  },
  firma: {
    hotspots: [
      { title: 'Czytnik kart przy wejściu do biura', service: 'kd' },
      { title: 'Karta do hali i magazynu, eksport do RCP', service: 'kd' },
      { title: 'Kamery na rampie', service: 'kam' },
      { title: 'Kamera bramy i placu', service: 'kam' },
      { title: 'Wi-Fi w hali dobrane do regałów', service: 'wifi' },
      { title: 'Światłowód między budynkami', service: 'wifi' },
      { title: 'Szafa rack i okablowanie z opisem gniazd', service: 'tel' },
      { title: 'Alarm strefowy i czujki w serwerowni', service: 'alarm' },
      { title: 'Komunikaty i sygnał przerwy w hali', service: 'snd' },
      { title: 'Ekran z informacjami dla zmiany', service: 'scr' },
      { title: 'Ogrzewanie i światło biura według harmonogramu', service: 'smart' },
    ],
    similar: ['sklep', 'bud', 'dev'],
  },
  kosc: {
    hotspots: [
      { title: 'Kolumny głośnikowe na filarach', service: 'snd' },
      { title: 'Mikrofony przy ołtarzu i ambonie', service: 'snd' },
      { title: 'Pętla indukcyjna w ławkach', service: 'snd' },
      { title: 'Kamera do transmisji mszy', service: 'scr' },
      { title: 'Ekran z tekstami pieśni', service: 'scr' },
      { title: 'Kamera przy wejściu i skarbonie', service: 'kam' },
      { title: 'Alarm w zakrystii', service: 'alarm' },
      { title: 'Głośniki zewnętrzne na odpust', service: 'snd' },
      { title: 'Szafa: mikser, rejestrator, łącze', service: 'wifi' },
    ],
    similar: ['szk', 'gmina'],
  },
  szk: {
    hotspots: [
      { title: 'Wideodomofon i kontrola wejścia', service: 'kd' },
      { title: 'Kamera holu wejściowego', service: 'kam' },
      { title: 'Kamera korytarza przed łazienkami', service: 'kam' },
      { title: 'Kamera boiska i wejścia', service: 'kam' },
      { title: 'Dzwonki i komunikaty z sekretariatu', service: 'snd' },
      { title: 'Wi-Fi w klasach na 30 urządzeń', service: 'wifi' },
      { title: 'Monitor interaktywny w klasie', service: 'scr' },
      { title: 'Nagłośnienie sali i akademii', service: 'snd' },
      { title: 'Szafa za routerem OSE', service: 'wifi' },
      { title: 'Alarm po lekcjach', service: 'alarm' },
    ],
    similar: ['gmina', 'kosc'],
  },
  gmina: {
    hotspots: [
      { title: 'Mikrofony radnych i nagłośnienie sali', service: 'snd' },
      { title: 'Kamery i transmisja sesji', service: 'scr' },
      { title: 'Ekran z wynikami głosowania', service: 'scr' },
      { title: 'Połączenie z systemem głosowania elektronicznego', service: 'snd' },
      { title: 'Zapis lokalny, łącze zapasowe, UPS', service: 'wifi' },
      { title: 'Monitoring placu i przystanku', service: 'kam' },
      { title: 'Pętla indukcyjna w punkcie obsługi', service: 'snd' },
      { title: 'Karty do archiwum i serwerowni', service: 'kd' },
      { title: 'Wi-Fi dla mieszkańców osobno od sieci urzędu', service: 'wifi' },
      { title: 'Alarm budynku urzędu', service: 'alarm' },
    ],
    similar: ['szk', 'kosc'],
  },
  dev: {
    hotspots: [
      { title: 'Punkt styku dla wszystkich operatorów', service: 'tel' },
      { title: 'Pion: światłowód, skrętka i koncentryk', service: 'tel' },
      { title: 'Skrzynka teletechniczna przy każdym mieszkaniu', service: 'tel' },
      { title: 'Zbiorcza antena naziemna i satelitarna', service: 'ant' },
      { title: 'Panel domofonowy przy wejściu', service: 'alarm' },
      { title: 'Unifon albo wideodomofon w mieszkaniu', service: 'alarm' },
      { title: 'Karta do garażu i klatek', service: 'kd' },
      { title: 'Monitoring osiedla', service: 'kam' },
      { title: 'Przygotowanie pod smart home', service: 'smart' },
      { title: 'Kanały kablowe pod ładowarki', service: 'ev' },
    ],
    similar: ['bud', 'firma'],
  },
  bud: {
    hotspots: [
      { title: 'Kamery na maszcie solarnym', service: 'kam' },
      { title: 'Zoom na kontener i skład stali', service: 'kam' },
      { title: 'Router LTE z dwiema kartami SIM', service: 'wifi' },
      { title: 'Panel i akumulator z grzaniem', service: 'kam' },
      { title: 'Czujki zewnętrzne ze zdjęciem alarmu', service: 'alarm' },
      { title: 'Syrena, światło i komunikat głosowy', service: 'alarm' },
      { title: 'Timelapse i podgląd dla inwestora', service: 'scr' },
      { title: 'Kable pod docelowe instalacje budynku', service: 'tel' },
    ],
    similar: ['dev', 'firma'],
  },
}

/** Template texts of the object page (`build_seg.py` BODY and `page()`). */
export const objectPage = {
  parent: { label: 'Dla kogo', href: '/#dla-kogo' },
  scene: {
    label: 'Przekrój obiektu z zaznaczonymi instalacjami',
    layersLabel: 'Pokaż instalacje',
    legendLabel: 'Lista punktów na przekroju',
    prev: 'Poprzedni punkt',
    next: 'Następny punkt',
  },
  problems: { fixLabel: 'Co robimy' },
  day: { onScene: 'Na przekroju:', showPoint: 'Pokaż punkt' },
  law: { eyebrow: 'Przepisy i obowiązki' },
  mountains: { eyebrow: 'Specyfika Podhala' },
  prepare: {
    eyebrow: 'Przed wizytą',
    heading: 'Przygotuj to, a wycena będzie szybsza.',
    lead: 'Zaznacz, co już masz. Zdjęcia możesz wysłać w formularzu albo przez WhatsApp.',
    /** Church, school and municipality (`build_seg.py`: `kosc`, `szk`, `gmina`). */
    leadInstitution:
      'Zaznaczenie, co już jest, przyspieszy wycenę. Zdjęcia można wysłać w formularzu albo przez WhatsApp.',
    of: 'z',
    cta: 'Wyślij zdjęcia i opis →',
    ctaDone: 'Gotowe, wyślij zgłoszenie →',
  },
  packages: {
    eyebrowPrefix: 'Zestawy dla',
    note: 'To przykłady. Ostateczny zakres i cenę ustalamy po wizji lokalnej i podajemy na piśmie.',
  },
  faqHeading: 'Zanim zadzwonisz.',
  relatedHeading: 'Usługi, które łączymy w tym obiekcie.',
  similarHeading: 'Podobne obiekty',
} as const

/** Object keys whose checklist lead speaks of an institution, not a person. */
export const INSTITUTIONS: readonly ObjectKey[] = ['kosc', 'szk', 'gmina']
