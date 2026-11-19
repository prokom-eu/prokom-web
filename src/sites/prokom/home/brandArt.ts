import type { AUTHORIZED } from '@/lib/prokom/brands'

/** A static picture in `public/` with its size (for `next/image`). */
export type BrandPicture = { src: string; width: number; height: number }

/**
 * Logos of the brands the hub names (H9, Krystian 15.11) — the same files the lines' sites use
 * (Biznes package `docs/design/prokombiznes/boards/media`, Instalacje `public/instalacje/marki`).
 * Full-colour logos on white, so they sit on light plates in both themes. A brand without a file
 * stays a name.
 */
export const BRAND_LOGOS: Record<string, BrandPicture> = {
  Posnet: { src: '/prokom/marki/posnet.webp', width: 480, height: 108 },
  Elzab: { src: '/prokom/marki/elzab.webp', width: 480, height: 88 },
  GoPOS: { src: '/prokom/marki/gopos.webp', width: 480, height: 117 },
  InsERT: { src: '/prokom/marki/insert.webp', width: 362, height: 160 },
  Lenovo: { src: '/prokom/marki/lenovo.webp', width: 480, height: 160 },
  Dell: { src: '/prokom/marki/dell.webp', width: 480, height: 147 },
  Microsoft: { src: '/prokom/marki/microsoft.webp', width: 480, height: 103 },
  ESET: { src: '/prokom/marki/eset.webp', width: 404, height: 160 },
  Eurocert: { src: '/prokom/marki/eurocert.webp', width: 480, height: 93 },
  Sunmi: { src: '/prokom/marki/sunmi.webp', width: 480, height: 92 },
  Apple: { src: '/prokom/marki/apple.webp', width: 350, height: 120 },
  // Phone makers of Tech: Xiaomi and Motorola from Krystian (15.11), Samsung from Instalacje.
  Xiaomi: { src: '/prokom/marki/xiaomi.webp', width: 450, height: 120 },
  Motorola: { src: '/prokom/marki/motorola.webp', width: 524, height: 120 },
  Dahua: { src: '/instalacje/marki/dahua.webp', width: 402, height: 120 },
  Hikvision: { src: '/instalacje/marki/hikvision.webp', width: 520, height: 66 },
  BCS: { src: '/instalacje/marki/bcs.webp', width: 370, height: 120 },
  Satel: { src: '/instalacje/marki/satel.webp', width: 446, height: 120 },
  Ubiquiti: { src: '/instalacje/marki/ubiquiti.webp', width: 364, height: 120 },
  MikroTik: { src: '/instalacje/marki/mikrotik.webp', width: 493, height: 120 },
  Ampio: { src: '/instalacje/marki/ampio.webp', width: 520, height: 110 },
  'Elzab EcoPower': { src: '/instalacje/marki/elzab-ecopower.webp', width: 342, height: 120 },
  Samsung: { src: '/instalacje/marki/samsung.webp', width: 361, height: 120 },
  APART: { src: '/instalacje/marki/apart.webp', width: 457, height: 120 },
  RCF: { src: '/instalacje/marki/rcf.webp', width: 120, height: 120 },
  // Runda 1811, D4: from Krystian (`seed/partnerzy/alsen.png`); TODO(krystian): the vector logo.
  ALSEN: { src: '/prokom/marki/alsen.webp', width: 480, height: 122 },
}

/** One product of each authorization (photos with a transparent background, Biznes package). */
export const AUTHORIZATION_PRODUCTS: Record<
  (typeof AUTHORIZED)[number],
  BrandPicture & { alt: string }
> = {
  Posnet: {
    src: '/prokom/marki/produkty/posnet-trio.webp',
    width: 568,
    height: 467,
    alt: 'Kasa fiskalna Posnet Trio',
  },
  Elzab: {
    src: '/prokom/marki/produkty/elzab-k10.webp',
    width: 316,
    height: 291,
    alt: 'Kasa fiskalna Elzab K10',
  },
  GoPOS: {
    src: '/prokom/marki/produkty/gopos-zestaw.webp',
    width: 560,
    height: 435,
    alt: 'Zestaw GoPOS: terminal i drukarka',
  },
  InsERT: {
    src: '/prokom/marki/produkty/insert-subiekt-nexo.webp',
    width: 334,
    height: 390,
    alt: 'Pudełko programu Subiekt nexo',
  },
}
