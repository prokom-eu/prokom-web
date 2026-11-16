/**
 * The rules of the cover scenes (`news/PostCover`, `subpages.css` from `.sw-cover *` to `.cv-glow`),
 * one rule per line. The sharing image draws the scene as a picture of its own, where the site's
 * stylesheet does not reach, so it carries these rules inside the SVG with the `var()` replaced by
 * the literal colours (`lib/software/ogColors.ts`). `coverCss.test.ts` fails when they drift
 * apart from `subpages.css`.
 */
export const COVER_CSS = `
.sw-cover * { stroke-linecap: round; stroke-linejoin: round }
.cv-stars circle { fill: var(--cover-ink-2); opacity: 0.7 }
.cv-p, .cv-p2 { fill: var(--cover-glass); stroke: var(--cover-line); stroke-width: 1.2 }
.cv-p2 { fill: var(--cover-glass-2) }
.cv-hair { stroke: var(--cover-line); stroke-width: 1 }
.cv-i { fill: var(--cover-ink) }
.cv-i2 { fill: var(--cover-ink-2) }
.cv-h { fill: var(--cover-hue) }
.cv-hs { fill: var(--cover-hue-soft) }
.cv-hl { stroke: var(--cover-hue); stroke-width: 2 }
.cv-none { fill: none }
.cv-ok { fill: var(--cover-ok) }
.cv-base { fill: var(--news-art-base) }
.cv-badge { fill: var(--news-art-base); stroke: var(--cover-hue); stroke-width: 2 }
.cv-shadow { fill: var(--news-art-base); opacity: 0.6 }
.cv-l, .cv-thin, .cv-thin-i, .cv-stroke, .cv-stroke-b, .cv-teeth, .cv-hline, .cv-okline, .cv-check, .cv-on-solid, .cv-arc, .cv-arc-h, .cv-spin, .cv-spin-h, .cv-ring, .cv-road, .cv-crack, .cv-cart, .cv-future, .cv-sign, .cv-seal, .cv-figure { fill: none }
.cv-l, .cv-thin, .cv-stroke { stroke: var(--cover-ink-2); stroke-width: 2 }
.cv-thin-i { stroke: var(--cover-ink); stroke-width: 2 }
.cv-stroke-b { stroke: var(--cover-ink); stroke-width: 3 }
.cv-teeth { stroke: var(--cover-ink); stroke-width: 6; stroke-linecap: butt; stroke-dasharray: 4 5.42 }
.cv-hline, .cv-sign { stroke: var(--cover-hue); stroke-width: 2.5 }
.cv-dash { stroke-dasharray: 3 5 }
.cv-okline { stroke: var(--cover-ok); stroke-width: 4 }
.cv-check { stroke: var(--cover-ink); stroke-width: 7 }
.cv-on-solid, .cv-plus, .cv-seal { stroke: var(--news-art-base); stroke-width: 2.5 }
.cv-arc, .cv-arc-h { stroke: var(--cover-line); stroke-width: 7 }
.cv-arc-h { stroke: var(--cover-hue) }
.cv-needle, .cv-beam, .cv-pole { stroke: var(--cover-ink); stroke-width: 3 }
.cv-beam { stroke-width: 4 }
.cv-spin, .cv-spin-h { stroke: var(--cover-line); stroke-width: 4 }
.cv-spin-h { stroke: var(--cover-hue); stroke-dasharray: 40 86 }
.cv-ring { stroke: var(--cover-ink); stroke-width: 4 }
.cv-road { stroke: var(--cover-ink-2); stroke-width: 4 }
.cv-road-thin { stroke-width: 2.5; stroke-dasharray: 2 5 }
.cv-old { fill: var(--cover-glass); stroke: var(--cover-ink-2); stroke-width: 1.5; stroke-dasharray: 4 4 }
.cv-crack { stroke: var(--cover-alert); stroke-width: 2 }
.cv-cart { stroke: var(--cover-ink); stroke-width: 5 }
.cv-future { stroke: var(--cover-ink-2); stroke-width: 1.5; stroke-dasharray: 5 5 }
.cv-dots { stroke: var(--cover-ink-2); stroke-width: 2; stroke-dasharray: 1 3 }
.cv-figure { stroke: var(--cover-ink); stroke-width: 6 }
.cv-focus { fill: var(--cover-glass-2); stroke: var(--cover-hue); stroke-width: 2; stroke-dasharray: 4 3 }
.cv-glow { filter: drop-shadow(0 0 10px var(--cover-hue-soft)) }
`
