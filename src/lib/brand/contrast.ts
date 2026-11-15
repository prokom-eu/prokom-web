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

type Rgba = { r: number; g: number; b: number; a: number }

const RGBA = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i

function parse(color: string): Rgba {
  const hex = HEX.exec(color)
  if (hex) {
    const [r, g, b] = hex.slice(1).map((channel) => parseInt(channel, 16))
    return { r, g, b, a: 1 }
  }
  const rgba = RGBA.exec(color)
  if (!rgba) throw new Error(`Expected #rrggbb or rgba(), got "${color}"`)
  return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] }
}

const toHex = (channels: number[]) =>
  `#${channels.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

/** `#rrggbb` of a colour (maybe translucent, `rgba()`) laid over an opaque background. */
export function composite(color: string, background: string): string {
  const top = parse(color)
  const bottom = parse(background)
  return toHex([
    top.r * top.a + bottom.r * (1 - top.a),
    top.g * top.a + bottom.g * (1 - top.a),
    top.b * top.a + bottom.b * (1 - top.a),
  ])
}

/** Every `#rrggbb` and `rgba()` colour in a CSS value, e.g. the stops of a gradient. */
export function colorStops(value: string): string[] {
  return value.match(/#[0-9a-f]{6}(?![0-9a-f])|rgba?\([^)]*\)/gi) ?? []
}

/** HSL hue (0–360°) and saturation (0–100 %) of a colour; alpha is ignored. */
export function hueAndSaturation(color: string): { hue: number; saturation: number } {
  const { r, g, b } = parse(color)
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  if (delta === 0) return { hue: 0, saturation: 0 }
  const lightness = (max + min) / 2
  const saturation = (delta / (1 - Math.abs(2 * lightness - 1))) * 100
  const sector =
    max === rn
      ? ((gn - bn) / delta) % 6
      : max === gn
        ? (bn - rn) / delta + 2
        : (rn - gn) / delta + 4
  return { hue: (sector * 60 + 360) % 360, saturation }
}
