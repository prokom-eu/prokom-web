/**
 * SVG code stored in the panel (`FloorPlans.svg`, ADR-012 rozstrz. 15) and icon paths
 * (`FloorPlans.iconPath`, `Partners.showroom`). The plan renders the SVG inline (K31d), so the
 * check on save is what keeps scripts out of the page. An allowlist, not a blacklist (review
 * K31a-2): only drawing elements and attributes, every attribute `name="value"` after
 * whitespace, no entities or escapes, references only inside the document (`url(#…)`).
 * Colours come from our own CSS classes; `style` only as plain declarations.
 */

const MAX_SVG_LENGTH = 100_000

const ELEMENTS = new Set([
  'svg',
  'g',
  'defs',
  'pattern',
  'filter',
  'feDropShadow',
  'rect',
  'path',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'title',
  'desc',
])

const ATTRIBUTES = new Set([
  'xmlns',
  'viewBox',
  'preserveAspectRatio',
  'role',
  'aria-hidden',
  'aria-label',
  'id',
  'class',
  'style',
  'transform',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'd',
  'points',
  'dx',
  'dy',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'filter',
  'clip-path',
  'patternUnits',
  'patternTransform',
  'gradientUnits',
  'gradientTransform',
  'offset',
  'stop-color',
  'stop-opacity',
  'stdDeviation',
  'flood-color',
  'flood-opacity',
  'text-anchor',
  'dominant-baseline',
  'font-size',
  'font-weight',
])

/** An opening or self-closing tag: name, then ` name="value"` pairs, optional `/`. */
const OPEN_TAG = /<([A-Za-z][\w-]*)((?:\s+[A-Za-z][\w:-]*\s*=\s*"[^"]*")*)\s*\/?>/g
const CLOSE_TAG = /<\/([A-Za-z][\w-]*)\s*>/g
const ATTRIBUTE = /([A-Za-z][\w:-]*)\s*=\s*"([^"]*)"/g
/** `style`: `property: value` pairs without brackets (no `url(`, `expression(`). */
const STYLE = /^\s*[a-z-]+\s*:\s*[\w .%#,-]+(?:;\s*[a-z-]+\s*:\s*[\w .%#,-]+)*;?\s*$/
/** `translate(-60 0) rotate(45)`: transform functions and numbers only. */
const TRANSFORM = /^(?:\s*(?:matrix|translate|scale|rotate|skewX|skewY)\(\s*[-\d.,\se]*\))+\s*$/

function isSafeAttribute(name: string, value: string): boolean {
  if (!ATTRIBUTES.has(name)) return false
  if (name === 'style') return STYLE.test(value)
  if (name === 'transform' || name === 'patternTransform' || name === 'gradientTransform') {
    return TRANSFORM.test(value)
  }
  // Brackets only in a reference to an element of this document: `url(#id)`.
  return !/[()]/.test(value.replace(/url\(#[\w-]+\)/g, ''))
}

export function isSafeSvg(value: string): boolean {
  const code = value.trim()
  if (!code || code.length > MAX_SVG_LENGTH) return false
  // No entities, escapes, comments, doctypes or processing instructions.
  if (/[&\\]|<!|<\?/.test(code)) return false
  // One root: the only `<svg` opens the code, the only `</svg>` closes it.
  if (!/^<svg[\s>]/.test(code) || !/<\/svg>$/.test(code)) return false
  if (code.match(/<svg[\s>/]/gi)?.length !== 1 || code.match(/<\/svg/gi)?.length !== 1) {
    return false
  }
  let safe = true
  const rest = code
    .replace(OPEN_TAG, (_tag, name: string, attributes: string) => {
      if (!ELEMENTS.has(name)) safe = false
      for (const [, attribute, attributeValue] of attributes.matchAll(ATTRIBUTE)) {
        if (!isSafeAttribute(attribute!, attributeValue!)) safe = false
      }
      return ''
    })
    .replace(CLOSE_TAG, (_tag, name: string) => {
      if (!ELEMENTS.has(name)) safe = false
      return ''
    })
  // Whatever did not match the strict tag grammar is left with a `<` or `>` (text has none).
  return safe && !/[<>]/.test(rest)
}

export function validateSvg(value: string | null | undefined): true | string {
  if (!value?.trim()) return 'Wklej kod SVG rzutu (od „<svg” do „</svg>”).'
  return isSafeSvg(value)
    ? true
    : 'Tylko rysunek SVG: bez skryptów, obrazów, linków, animacji i atrybutów „on…”; atrybuty w cudzysłowach "…", bez encji „&…;”, odwołania tylko „url(#…)”, do 100 000 znaków.'
}

/** The `d` of an SVG `<path>`: commands and numbers only. */
const SVG_PATH = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/

export function isSvgPath(value: string): boolean {
  return value.length > 0 && value.length <= 1000 && SVG_PATH.test(value)
}

export function validateIconPath(value: string | null | undefined): true | string {
  if (!value) return true
  return isSvgPath(value)
    ? true
    : 'Ścieżka ikony SVG (atrybut „d”): tylko litery poleceń i liczby, np. „M4 5h16v10H4z”.'
}
