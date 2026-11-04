import type { ObjectKey } from './types'

/**
 * Mini cross-sections of the „Dla kogo” cards (RUNDA-V5 §3): a simplified silhouette of each
 * object in a 200 × 90 box (anchored bottom right of the card) and 3–4 points of installations
 * (cameras, Wi-Fi, alarm…) that pulse in turn while the card is pointed at. Shapes follow the
 * object scenes of the prototype (`zrodlo/pages/Seg*.body.html`), reduced to one flat outline.
 */
export type Silhouette = { d: string; points: readonly (readonly [number, number])[] }

const ground = 'M0 90 L0 86 L200 86 L200 90 Z'

export const SILHOUETTES: Partial<Record<ObjectKey, Silhouette>> = {
  // Detached house: gable roof, chimney, garage.
  dom: {
    d: `${ground} M70 86 L70 50 L105 24 L140 50 L140 86 Z M122 36 L122 26 L130 26 L130 42 Z M140 86 L140 62 L176 62 L176 86 Z`,
    points: [
      [84, 56],
      [128, 58],
      [158, 70],
    ],
  },
  // Guesthouse: wide gable with two balcony floors.
  pens: {
    d: `${ground} M48 86 L48 44 L110 12 L172 44 L172 86 Z M44 58 L176 58 L176 62 L44 62 Z M44 72 L176 72 L176 76 L44 76 Z`,
    points: [
      [64, 50],
      [110, 34],
      [156, 50],
      [92, 68],
    ],
  },
  // Apartments: two blocks with a flat roof.
  apt: {
    d: `${ground} M58 86 L58 30 L112 30 L112 86 Z M112 86 L112 44 L160 44 L160 86 Z M54 28 L116 28 L116 32 L54 32 Z`,
    points: [
      [72, 44],
      [98, 62],
      [136, 56],
    ],
  },
  // Hotel: tall block with an entrance canopy.
  hotel: {
    d: `${ground} M78 86 L78 14 L140 14 L140 86 Z M66 76 L152 76 L152 72 L66 72 Z M140 86 L140 50 L174 50 L174 86 Z`,
    points: [
      [92, 28],
      [126, 46],
      [96, 66],
      [158, 62],
    ],
  },
  // Restaurant: pitched roof and a terrace awning.
  rest: {
    d: `${ground} M66 86 L66 46 L112 26 L158 46 L158 86 Z M150 60 L190 60 L184 70 L150 70 Z M154 86 L154 70 L156 70 L156 86 Z M182 86 L182 70 L184 70 L184 86 Z`,
    points: [
      [84, 54],
      [128, 50],
      [170, 66],
    ],
  },
  // Shop: flat roof, big window band, awning.
  sklep: {
    d: `${ground} M60 86 L60 38 L170 38 L170 86 Z M56 36 L174 36 L174 40 L56 40 Z M60 54 L176 54 L170 62 L60 62 Z`,
    points: [
      [76, 46],
      [116, 46],
      [154, 72],
    ],
  },
  // Company: office block and a hall.
  firma: {
    d: `${ground} M50 86 L50 32 L98 32 L98 86 Z M98 86 L98 52 L132 42 L188 42 L188 86 Z`,
    points: [
      [64, 44],
      [84, 66],
      [126, 60],
      [168, 54],
    ],
  },
  // Church: tower with a spire and the nave.
  kosc: {
    d: `${ground} M64 86 L64 40 L78 24 L92 40 L92 86 Z M76 24 L78 6 L80 24 Z M92 86 L92 52 L134 34 L176 52 L176 86 Z`,
    points: [
      [78, 46],
      [116, 56],
      [154, 62],
    ],
  },
  // School: wide building with a gable and a clock.
  szk: {
    d: `${ground} M40 86 L40 48 L180 48 L180 86 Z M90 48 L110 28 L130 48 Z M36 46 L184 46 L184 50 L36 50 Z`,
    points: [
      [56, 60],
      [110, 40],
      [164, 60],
    ],
  },
  // Municipality: town hall with a small tower and wings.
  gmina: {
    d: `${ground} M46 86 L46 52 L174 52 L174 86 Z M98 52 L98 30 L110 20 L122 30 L122 52 Z M42 50 L178 50 L178 54 L42 54 Z`,
    points: [
      [62, 64],
      [110, 34],
      [158, 64],
    ],
  },
  // Developer: block of flats and a tower crane.
  dev: {
    d: `${ground} M62 86 L62 34 L120 34 L120 86 Z M120 86 L120 48 L154 48 L154 86 Z M170 86 L170 12 L174 12 L174 86 Z M128 14 L196 14 L196 18 L128 18 Z M150 18 L150 30 L152 30 L152 18 Z`,
    points: [
      [78, 46],
      [104, 66],
      [138, 60],
      [172, 22],
    ],
  },
  // Construction site: raw frame with scaffolding, fence and a crane.
  bud: {
    d: `${ground} M60 86 L60 36 L64 36 L64 86 Z M96 86 L96 36 L100 36 L100 86 Z M132 86 L132 36 L136 36 L136 86 Z M58 34 L138 34 L138 38 L58 38 Z M58 58 L138 58 L138 62 L58 62 Z M150 86 L150 70 L196 70 L196 74 L154 74 L154 86 Z M176 70 L176 10 L180 10 L180 70 Z M140 10 L198 10 L198 14 L140 14 Z`,
    points: [
      [80, 48],
      [118, 72],
      [178, 30],
    ],
  },
}
