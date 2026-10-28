/**
 * Icons of the product page (K31-ZMIANY §4 pkt 1 and 3): the three highlights from `features`
 * and the „W skrócie” tiles get an icon chosen by keywords. Paths from the board
 * `k31/boards/Strona.dc.html` (24 × 24, stroked).
 */
export const PRODUCT_ICONS = {
  screen: 'M3 4h18v12H3z M8 20h8 M12 16v4',
  cpu: 'M7 7h10v10H7z M10 3v4 M14 3v4 M10 17v4 M14 17v4 M3 10h4 M3 14h4 M17 10h4 M17 14h4',
  ram: 'M3 8h18v8H3z M7 8v8 M11 8v8 M15 8v8 M5 16v3 M19 16v3',
  disk: 'M4 6h16v12H4z M8 14h.01 M12 14h4',
  ports: 'M8 7V3 M16 7V3 M6 7h12v5a6 6 0 01-12 0z M12 18v3',
  wireless: 'M5 12.5a10 10 0 0114 0 M8.5 16a5 5 0 017 0 M12 19.5h.01 M2 9a15 15 0 0120 0',
  battery: 'M3 8h16v8H3z M21 11v2 M6 11h6',
  weight: 'M6 20h12 M12 4v16 M8 8l4-4 4 4',
  shield: 'M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3z',
  warranty: 'M9 12l2 2 4-4 M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3z',
  system: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  printer: 'M6 9V3h12v6 M4 9h16v8H4z M7 14h10v7H7z',
  paper: 'M3 12h18 M3 9v6 M21 9v6 M7 12v2 M11 12v3 M15 12v2',
  scanner: 'M4 5v14 M7 5v14 M10 5v14 M14 5v14 M17 5v14 M20 5v14',
  invoice: 'M3 7h18v10H3z M3 10h18 M7 14h4',
  camera: 'M3 7h12v10H3z M15 11l6-3v8l-6-3',
  cloud: 'M7 18a5 5 0 01-.6-10A6 6 0 0118 9a4 4 0 01-1 9z',
  users:
    'M16 20v-2a4 4 0 00-8 0v2 M12 10a3 3 0 100-6 3 3 0 000 6z M20 20v-2a3 3 0 00-2-2.8 M4 20v-2a3 3 0 012-2.8',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
} as const

export type ProductIcon = keyof typeof PRODUCT_ICONS

type Rule = [ProductIcon, RegExp]

/** Highlights („RAM do 64 GB”, „RJ-45 i HDMI”, „od 1,36 kg”): first matching rule wins. */
const FEATURE_RULES: Rule[] = [
  ['battery', /akumulator|bateri/],
  ['camera', /kamer|rejestrator/],
  ['ram', /\bram\b|pamię/],
  ['cpu', /procesor|intel|amd|xeon|ryzen/],
  ['disk', /dysk|ssd|\bnas\b|zatok/],
  ['screen', /ekran|wyświetlacz|monitor|oled|panel/],
  ['wireless', /wi-?fi|bluetooth|\bbt\b|lte|\b[45]g\b|gprs|poe|modem/],
  ['ports', /rj|hdmi|usb|thunderbolt|złącz|ethernet|\blan\b|kvm/],
  ['scanner', /skan|\bkod|qr|nfc/],
  ['invoice', /ksef|faktur|jpk|inspunkt/],
  ['paper', /papier|mm\/s|\d\s?mm\b/],
  ['printer', /druk|etykiet|paragon|obcinacz/],
  ['weight', /\bkg\b|\bwag|ważen/],
  ['shield', /\bip\d|mil-std|odporn/],
  ['warranty', /gwarancj|serwis/],
  ['system', /android|windows|linux|system/],
  ['cloud', /chmur/],
  ['users', /stanowisk|użytkownik/],
  ['bolt', /w zestawie|w standardzie/],
]

/** Parameter names of the „W skrócie” tiles („Ekran”, „Pamięć RAM”, „Porty”). */
const PARAM_RULES: Rule[] = [
  ['ram', /pamię|\bram\b/],
  ['cpu', /procesor|graficzn|grafika/],
  ['screen', /ekran|rozdzielczo|matryc|wyświetlacz/],
  ['disk', /dysk|zatok|pojemno/],
  ['ports', /port|złącz|interfejs/],
  ['wireless', /łącznoś|wi-?fi|poe/],
  ['battery', /bateri|akumulator/],
  ['weight', /\bwag|ważen|działk/],
  ['shield', /bezpiecze|ochron/],
  ['system', /system/],
  ['printer', /druk/],
  ['paper', /szerokoś|papier|długoś/],
  ['camera', /kamer/],
  ['users', /licencj|użytkownik|sposób pracy/],
  ['invoice', /ksef|faktur|jpk/],
]

const pick = (rules: Rule[], text: string): ProductIcon =>
  rules.find(([, pattern]) => pattern.test(text.toLowerCase()))?.[0] ?? 'star'

export const featureIcon = (feature: string): ProductIcon => pick(FEATURE_RULES, feature)

export const paramIcon = (label: string): ProductIcon => pick(PARAM_RULES, label)
