import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { build } from './build.ts'
import { type RenderContext, inline, renderBody } from './dsl.ts'
import { type Content, loadContent } from './load.ts'
import { cdata, quicktextXml } from './quicktext.ts'
import { renderLine } from './render.ts'
import { LINES, type LineId } from './schema.ts'
import { tagProblems } from './wellformed.ts'

const content = loadContent()
const rendered = Object.fromEntries(LINES.map((l) => [l, renderLine(content, l)])) as Record<
  LineId,
  ReturnType<typeof renderLine>
>
const allTemplates = [
  ...content.shared.szablony.map((t) => ({ file: 'wspolne', t })),
  ...LINES.flatMap((l) => content.lines[l].szablony.map((t) => ({ file: l, t }))),
]

function ctx(mode: RenderContext['mode'], line: LineId = 'biznes'): RenderContext {
  return { line, dane: content.dane, mode, errors: [], missing: new Set() }
}

describe('DSL', () => {
  it('renders fields, selects and bold for Quicktext', () => {
    const c = ctx('xml')
    expect(inline(c, '**{I:kiedy}** i {S:co|a;b}')).toBe(
      '<strong style="color:#121613">[[INPUT=kiedy]]</strong> i [[INPUT=co|select|a;b]]',
    )
    expect(c.errors).toEqual([])
  })

  it('resolves line variables, cross-line references and select options with variables', () => {
    const c = ctx('xml', 'prokom')
    expect(inline(c, '{TEL} {biznes.TEL}')).toBe('883 200 151 889 003 889')
    expect(inline(c, '{S:gdzie|tel. {biznes.TEL};salon}')).toBe(
      '[[INPUT=gdzie|select|tel. 889 003 889;salon]]',
    )
    expect(c.errors).toEqual([])
  })

  it('rejects unknown variables and fields nested in select options', () => {
    const c = ctx('xml')
    inline(c, '{NIEMA} {S:x|{I:y};b}')
    expect(c.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('NIEMA'), expect.stringContaining('nested')]),
    )
  })

  it('keeps optional sentences as plain text in Quicktext and marks them in the preview', () => {
    expect(inline(ctx('xml'), '{?:Zdanie.}')).toBe('Zdanie.')
    expect(inline(ctx('preview'), '{?:Zdanie.}')).toContain('dashed')
  })

  it('renders a total row in the items table', () => {
    const html = renderBody(ctx('xml'), '::pozycje\nA | B\nx | 1 zł\n**Razem | 1 zł')
    expect(html).toContain('border-top:2px solid #244FB0')
    expect(html).toContain('font:700 14px')
  })
})

describe('content (YAML)', () => {
  it('has the expected number of templates per line (≥ 40)', () => {
    const counts = Object.fromEntries(LINES.map((l) => [l, rendered[l].templates.length]))
    expect(counts).toEqual({ biznes: 45, instalacje: 43, software: 42, prokom: 42 })
  })

  it('has no empty groups and unique shortcuts within a line', () => {
    for (const l of LINES) {
      for (const g of rendered[l].set.groups)
        expect(g.templates.length, `${l} ${g.title}`).toBeGreaterThan(0)
      const shortcuts = rendered[l].templates.map((t) => t.template.skrot)
      expect(new Set(shortcuts).size, l).toBe(shortcuts.length)
    }
  })

  it('renders every template without unresolved placeholders', () => {
    for (const l of LINES) {
      expect(rendered[l].errors, l).toEqual([])
      for (const t of rendered[l].templates) {
        for (const out of [t.xmlBody, t.previewBody, t.subjectXml]) {
          expect(out.replace(/\[\[INPUT=[^\]]*\]\]/g, ''), `${l}/${t.template.id}`).not.toMatch(
            /[{}]/,
          )
        }
      }
    }
  })

  it('has no contact literals, WhatsApp or passwords in template texts', () => {
    for (const { file, t } of allTemplates) {
      const where = `${file}/${t.id}`
      expect(t.tresc, where).not.toMatch(/\d{3} \d{3} \d{3}/)
      expect(t.tresc, where).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/)
      expect(t.tresc, where).not.toMatch(/whatsapp/i)
      expect(t.tresc, where).not.toMatch(/hasło:\s*\S/i)
    }
  })

  it('keeps line rules: Instalacje 24 h is a response time, RTV/AGD without installation', () => {
    for (const t of content.lines.instalacje.szablony) {
      expect(t.tresc, t.id).not.toMatch(/technik w 24|w ciągu 24 godzin przyjedziemy/i)
    }
    for (const { file, t } of allTemplates) {
      if (/RTV/.test(t.tresc) && /AGD/.test(t.tresc))
        expect(t.tresc, `${file}/${t.id}`).toMatch(/bez montażu/)
    }
  })
})

describe('HTML', () => {
  const bodies = LINES.flatMap((l) =>
    rendered[l].templates.flatMap((t) => [
      { where: `${l}/${t.template.id}`, html: t.xmlBody },
      { where: `${l}/${t.template.id} (podgląd)`, html: t.previewBody },
    ]),
  )

  it('is well-formed, inline-styled and self-contained', () => {
    for (const { where, html } of bodies) {
      expect(tagProblems(html), where).toEqual([])
      expect(html, where).not.toMatch(/<style|class=|<script/i)
      for (const [, src] of html.matchAll(/src="([^"]*)"/g))
        expect(src, where).toMatch(/^(file:|data:)/)
      expect(Buffer.byteLength(html), where).toBeLessThan(20_000)
    }
  })

  it('marks every table as presentation', () => {
    for (const { where, html } of bodies) {
      for (const [tag] of html.matchAll(/<table[^>]*>/g))
        expect(tag, where).toContain('role="presentation"')
    }
  })
})

describe('contrast (WCAG AA ≥ 4.5:1)', () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }) as [number, number, number]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]
    return (x + 0.05) / (y + 0.05)
  }

  it.each(LINES)('%s: accent text, button and filled step circle', (l) => {
    const d = content.dane.linie[l]
    expect(ratio(d.ACC_TXT, '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
    expect(ratio(d.ACC_TXT, d.ACC_SOFT)).toBeGreaterThanOrEqual(4.5)
    // Button and the filled first step circle both use ACC_BTN (see html.ts steps()).
    expect(ratio('#FFFFFF', d.ACC_BTN)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('Quicktext XML', () => {
  it('splits CDATA around "]]>"', () => {
    expect(cdata('a]]>b')).toBe('<![CDATA[a]]]]><![CDATA[>b]]>')
  })

  it.each(LINES)('%s: well-formed, one <text> per template', (l) => {
    const xml = quicktextXml(rendered[l])
    expect(tagProblems(xml)).toEqual([])
    expect(xml.match(/<text /g)?.length).toBe(rendered[l].templates.length)
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<quicktext version="2">')).toBe(
      true,
    )
  })
})

describe('build', () => {
  it(
    'fails with --strict when line data is still a placeholder; warns without it',
    { timeout: 60_000 },
    async () => {
      const withGap: Content = structuredClone(content)
      withGap.dane.linie.biznes.TEL2 = '[SZEF] drugi numer'
      const out = await mkdtemp(join(tmpdir(), 'szablony-'))
      const base = {
        lines: ['biznes'] as LineId[],
        logoBase: 'file:///maile',
        noHrefInput: false,
        out,
      }

      const loose = await build({ ...base, strict: false }, withGap)
      expect(loose.errors).toEqual([])
      expect(loose.warnings.join('\n')).toContain('[SZEF] drugi numer')

      const strict = await build({ ...base, strict: true }, withGap)
      expect(strict.errors.join('\n')).toContain('--strict')
      const sig = await readFile(join(out, 'biznes', 'podpis-biznes.html'), 'utf8')
      expect(sig).toContain('file:///maile/biznes/logo-biznes.png')
    },
  )
})

describe('snapshots (probka-wzorzec)', () => {
  const pick = (l: LineId, id: string) =>
    rendered[l].templates.find((t) => t.template.id === id)!.previewBody
  it.each([
    ['biznes', 'oferta'],
    ['biznes', 'potwierdz'],
    ['software', 'opieka'],
    ['instalacje', 'pomontazu'],
    ['prokom', 'dostawy-lista'],
  ] as const)('%s/%s', (l, id) => {
    expect(pick(l, id)).toMatchSnapshot()
  })
})
