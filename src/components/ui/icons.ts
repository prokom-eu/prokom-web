import type { IconName } from '../../lib/catalog/options'

/**
 * Paths of the line icons from the design (`seed/prokombiznes/ikony.json`, then the names only in
 * `seed/prokomsoftware/ikony.json`, then the hub's `seed/prokomeu/ikony.json`): viewBox 24, no
 * fill, round caps. A missing icon is drawn in the same style (or taken from Lucide) and added
 * here and to `ICON_NAMES` — the test keeps both in sync with the seed packages.
 */
export const ICON_PATHS: Record<IconName, string> = {
  shield: 'M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3z M9 12l2 2 4-4',
  cal: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  users:
    'M9 11a4 4 0 100-8 4 4 0 000 8z M2 21v-1a6 6 0 016-6h2a6 6 0 016 6v1 M16 3.5a4 4 0 010 7.5 M22 21v-1a6 6 0 00-4-5.6',
  store:
    'M3 9l2-5h14l2 5 M3 9a2.25 2.25 0 004.5 0 2.25 2.25 0 004.5 0 2.25 2.25 0 004.5 0 2.25 2.25 0 004.5 0 M5 11v9h14v-9 M10 20v-5h4v5',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  doc: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h5',
  life: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 16a4 4 0 100-8 4 4 0 000 8z M5.6 5.6l3.6 3.6 M14.8 14.8l3.6 3.6 M18.4 5.6l-3.6 3.6 M9.2 14.8l-3.6 3.6',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  check: 'M5 12l5 5L20 7',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5l3 2',
  monitor: 'M4 5h16v11H4z M8 20h8 M12 16v4 M7 12l3-3 2 2 4-4',
  remote: 'M4 5h16v11H4z M8 20h8 M12 16v4 M10 9l2 2 4-4',
  bell: 'M6 16V11a6 6 0 0112 0v5l2 2H4z M10 21h4',
  wallet: 'M4 7h15a1 1 0 011 1v10a1 1 0 01-1 1H4z M4 7V5h12 M16 13h.01',
  chat: 'M4 5h16v11H9l-5 4z',
  wrench: 'M15 7a4 4 0 00-5.3 5.1L4 17.8 6.2 20l5.7-5.7A4 4 0 0017 9l-2.4 2.4-2-2L15 7z',
  rocket:
    'M12 3c3 2 4.5 5.5 4.5 9.5l-1.5 3h-6l-1.5-3C7.5 8.5 9 5 12 3z M9 15l-3 3 M15 15l3 3 M12 10h.01 M10 21h4',
  map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  q: 'M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3 M12 17h.01 M12 21a9 9 0 100-18 9 9 0 000 18z',
  flash: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5 M12 16h.01',
  grad: 'M2 9l10-5 10 5-10 5L2 9z M6 11v5c2.5 2 9.5 2 12 0v-5',
  server: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18z M15.5 8.5l-2 5-5 2 2-5z',
  // Software (`seed/prokomsoftware/ikony.json`); shared names keep the Biznes drawing above.
  panel: 'M3 4h18v16H3zM3 9h18M9 9v11',
  site: 'M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01',
  grid: 'M4 4h16v16H4zM4 10h16M4 15h16M10 4v16',
  plug: 'M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4',
  ticket: 'M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4zM10 7v12',
  lifebuoy:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  sign: 'M3 17c3-4 5-4 6 0s3 4 6-2 4-4 6 1',
  cash: 'M3 6h18v12H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  x: 'M6 6l12 12M18 6L6 18',
  bed: 'M3 18V8M3 14h18v4M21 18v-6a3 3 0 0 0-3-3h-7v5M7 11h.01',
  food: 'M5 3v8a3 3 0 0 0 6 0V3M8 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  car: 'M5 16l1.5-5h11l1.5 5M4 16h16v3H4zM7 19v2M17 19v2M7.5 13.5h.01M16.5 13.5h.01',
  home: 'M3 21h18M5 21V10l7-6 7 6v11M9 21v-5h6v5',
  mountain: 'M3 20l6-10 4 6 3-4 5 8z',
  heart: 'M12 21s-8-5-8-11a5 5 0 0 1 8-3.5A5 5 0 0 1 20 10c0 6-8 11-8 11z',
  bag: 'M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0',
  card: 'M3 6h18v12H3zM7 10h5M7 14h8',
  target:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  key: 'M15 7a4 4 0 1 1-3.9 5H3v3h3v3h3v-3h2.1A4 4 0 0 1 15 7z',
  mega: 'M3 11l15-6v14L3 13zM7 12v6',
  mount: 'M3 20l6-10 4 6 3-4 5 8z',
  brief: 'M4 7h16v13H4zM9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16',
  // pro-kom.eu (`seed/prokomeu/ikony.json`, H1).
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
  barcode: 'M4 6v12M8 6v12M11 6v12M15 6v12M18 6v12M21 6v12',
  vending: 'M6 2h12v20H6zM9 6h6v6H9zM9 16h2',
  laptop: 'M4 5h16v10H4zM2 19h20',
  database:
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  printer: 'M7 8V4h10v4M5 8h14v8H5zM8 14h8v6H8z',
  camera: 'M3 7h12v10H3zM15 10l6-3v10l-6-3',
  lock: 'M6 10h12v11H6zM8 10V7a4 4 0 018 0v3M12 14v3',
  wifi: 'M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01',
  speaker: 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 010 6M19 6a8 8 0 010 12',
  tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
  mobile: 'M8 2h8v20H8zM11 18h2',
  gear: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',
  gamepad:
    'M6 9h12a4 4 0 014 4v1a3 3 0 01-5.3 1.9L15 14H9l-1.7 1.9A3 3 0 012 14v-1a4 4 0 014-4zM8 11v4M6 13h4',
  pc: 'M7 2h10v20H7zM10 6h4M12 17h.01',
  sliders: 'M4 6h16M4 12h16M4 18h16M15 4v4M8 10v4M17 16v4',
  gauge: 'M12 14l4-4M4 18a9 9 0 1116 0',
  spark: 'M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4z',
  help: 'M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4.5M12 18h.01M3 12a9 9 0 1018 0 9 9 0 00-18 0',
  info: 'M12 8h.01M11 12h1v5h1M3 12a9 9 0 1018 0 9 9 0 00-18 0',
  news: 'M4 5h13v14H6a2 2 0 01-2-2zM17 9h3v8a2 2 0 01-2 2M8 9h5M8 13h5',
}
