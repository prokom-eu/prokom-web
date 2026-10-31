import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import plans from '../../../seed/prokombiznes/k31/plansze-k31.json'
import showrooms from '../../../seed/prokombiznes/k31/marki-salony-k31.json'
import { isSafeSvg, isSvgPath, validateIconPath, validateSvg } from './svg'

const SVG_DIR = path.resolve(__dirname, '../../../seed/prokombiznes/k31/plansze-svg')
const svg = (inner: string) => `<svg viewBox="0 0 10 10">${inner}</svg>`

describe('floor plan SVG (FloorPlans.svg, rendered inline in K31d)', () => {
  it('accepts every floor plan of the K3.1 package', () => {
    const files = readdirSync(SVG_DIR).filter((file) => file.endsWith('.svg'))
    expect(files).toHaveLength(12)
    for (const file of files) {
      expect(isSafeSvg(readFileSync(path.join(SVG_DIR, file), 'utf8')), file).toBe(true)
    }
  })

  it('accepts local references (patterns, filters) and plain inline styles', () => {
    expect(isSafeSvg(svg('<rect fill="url(#tile)" filter="url(#sh)"/>'))).toBe(true)
    expect(isSafeSvg(svg('<line style="stroke-dasharray:6 6;opacity:.5"/>'))).toBe(true)
  })

  it('rejects the bypasses of a blacklist (review K31a-2)', () => {
    // Attribute separated by „/” or a quote instead of whitespace.
    expect(isSafeSvg(svg('<animate/onbegin=alert(1) attributeName=x dur=1s />'))).toBe(false)
    expect(isSafeSvg(svg('<rect x="0"onclick="alert(1)"/>'))).toBe(false)
    // Closing the root early and adding HTML.
    expect(isSafeSvg(svg('</svg><img/src/onerror=alert(1)><svg>'))).toBe(false)
    // Entities and CSS escapes.
    expect(isSafeSvg(svg('<rect fill="u&#114;l(https://example.com)"/>'))).toBe(false)
    expect(isSafeSvg(svg('<rect style="fill:u\\72 l(https://example.com)"/>'))).toBe(false)
    expect(isSafeSvg(svg('<rect style="background:url(https://example.com)"/>'))).toBe(false)
    // Elements and attributes outside the list.
    expect(isSafeSvg(svg('<set attributeName="href" to="javascript:x()"/>'))).toBe(false)
    expect(isSafeSvg(svg('<use href="#a"/>'))).toBe(false)
    expect(isSafeSvg(svg("<rect x='0'/>"))).toBe(false)
    expect(isSafeSvg(svg('<rect x=0/>'))).toBe(false)
    expect(isSafeSvg(svg('<RECT onclick="x()"/>'))).toBe(false)
  })

  it('rejects scripts, event handlers and embedded documents', () => {
    expect(isSafeSvg(svg('<script>alert(1)</script>'))).toBe(false)
    expect(isSafeSvg(svg('<rect onclick="x()"/>'))).toBe(false)
    expect(isSafeSvg(svg('<rect\nonload = "x()"/>'))).toBe(false)
    expect(isSafeSvg(svg('<foreignObject><div/></foreignObject>'))).toBe(false)
    expect(isSafeSvg(svg('<style>rect{fill:red}</style>'))).toBe(false)
    expect(isSafeSvg(svg('<iframe src="x"/>'))).toBe(false)
  })

  it('rejects links and resources outside the document', () => {
    expect(isSafeSvg(svg('<a href="https://example.com"><rect/></a>'))).toBe(false)
    expect(isSafeSvg(svg('<use xlink:href="javascript:x()"/>'))).toBe(false)
    expect(isSafeSvg(svg('<image href="data:image/png;base64,AA"/>'))).toBe(false)
    expect(isSafeSvg(svg('<rect fill="url(https://example.com/a.svg#x)"/>'))).toBe(false)
  })

  it('needs one <svg> root', () => {
    expect(isSafeSvg('<div></div>')).toBe(false)
    expect(isSafeSvg('<svg><rect/>')).toBe(false)
    expect(isSafeSvg('')).toBe(false)
  })

  it('explains the rule in the panel', () => {
    expect(validateSvg(svg('<rect/>'))).toBe(true)
    expect(validateSvg('')).toMatch(/Wklej/)
    expect(validateSvg(svg('<script/>'))).toMatch(/skryptów/)
  })
})

describe('icon path (FloorPlans.iconPath, Showrooms.family)', () => {
  it('accepts every icon of the package', () => {
    const icons = [
      ...plans.sceny.map((scene) => scene.ikona_path),
      ...Object.values(showrooms.salony).flatMap((showroom) => [
        ...showroom.segs.map((segment) => segment.ic),
        ...showroom.svc.map((service) => service.ic),
      ]),
    ]
    for (const icon of icons) expect(isSvgPath(icon), icon).toBe(true)
  })

  it('rejects anything but path commands and numbers', () => {
    expect(isSvgPath('M0 0" onload="x')).toBe(false)
    expect(isSvgPath('<path/>')).toBe(false)
    expect(isSvgPath('')).toBe(false)
  })

  it('is optional in the panel', () => {
    expect(validateIconPath('')).toBe(true)
    expect(validateIconPath(null)).toBe(true)
    expect(validateIconPath('M0 0<')).toMatch(/ścieżk/i)
  })
})
