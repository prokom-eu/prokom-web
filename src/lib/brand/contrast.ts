/** WCAG 2.x contrast of brand colours, used by the token tests (`src/styles/tokens.test.ts`). */

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i

/** Relative luminance of a `#rrggbb` colour (WCAG 2.x definition). */
export function relativeLuminance(hex: string): number {
  const match = HEX.exec(hex)
  if (!match) throw new Error(`Expected #rrggbb, got "${hex}"`)
  const [r, g, b] = match.slice(1).map((channel) => {
    const c = parseInt(channel, 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio of two colours, 1–21; the order does not matter. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}
