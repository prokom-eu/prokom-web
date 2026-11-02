/**
 * Type scale of the Biznes pages, read from the CSS of the v150 board `Strona.dc.html`
 * (`.h1`, `.h2`, `.lead`; audit 01.11.2026, prompt 2 W1). One place for the section headings,
 * so a page cannot drift back to 48–54 px H2s. Colour stays with the component (light or dark
 * surface).
 */

/** `.h2`: `clamp(26px,2.6vw,36px)`, line-height 1.05, letter-spacing −.02em, stretch 112%. */
export const BZ_H2 =
  'font-display text-[clamp(26px,2.6vw,36px)] leading-[1.05] font-extrabold tracking-[-0.02em] font-stretch-112% text-balance'

/** `.lead`: `clamp(16px,1.25vw,19px)`, line-height 1.6 (the width stays with the component). */
export const BZ_LEAD = 'text-[clamp(16px,1.25vw,19px)] leading-[1.6]'

/** `.h1` of the subpages: `clamp(34px,4vw,56px)`, line-height 1.01, −.028em, stretch 116%. */
export const BZ_H1 =
  'font-display text-[clamp(34px,4vw,56px)] leading-[1.01] font-extrabold tracking-[-0.028em] font-stretch-116% text-balance'

/** Product and bundle pages: the board sets `font-size: clamp(32px,3.3vw,48px)` on their `.h1`. */
export const BZ_H1_COMPACT =
  'font-display text-[clamp(32px,3.3vw,48px)] leading-[1.01] font-extrabold tracking-[-0.028em] font-stretch-116% text-balance'

/** H1 in the dark hero card of a category (board `.k3h1`): `clamp(34px,3.6vw,52px)`, 1.04. */
export const BZ_H1_CARD =
  'font-display text-[clamp(34px,3.6vw,52px)] leading-[1.04] font-extrabold tracking-[-0.03em] font-stretch-112% text-balance'
