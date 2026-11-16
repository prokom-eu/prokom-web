import { type Mode, type RenderContext, renderBody, renderSubject } from './dsl.ts'
import { type Content, type LineSet, lineSet } from './load.ts'
import type { LineId, Template } from './schema.ts'

export interface RenderedTemplate {
  template: Template
  groupTitle: string
  /** Quicktext body (HTML with [[INPUT=…]]). */
  xmlBody: string
  /** HTML with visible field markers. */
  previewBody: string
  text: string
  subjectXml: string
  subjectText: string
}

export interface RenderedLine {
  line: LineId
  set: LineSet
  templates: RenderedTemplate[]
  errors: string[]
  /** Data still marked [DO UZUPEŁNIENIA] / [SZEF] used by this line. */
  missing: string[]
}

export interface RenderOptions {
  noHrefInput?: boolean
}

export function renderLine(content: Content, line: LineId, opts: RenderOptions = {}): RenderedLine {
  const set = lineSet(content, line)
  const errors: string[] = []
  const missing = new Set<string>()
  const templates = set.groups.flatMap((g) =>
    g.templates.map((t): RenderedTemplate => {
      const ctx = (mode: Mode): RenderContext => ({
        line,
        dane: content.dane,
        mode,
        noHrefInput: opts.noHrefInput,
        errors: [],
        missing,
      })
      const xml = ctx('xml')
      const preview = ctx('preview')
      const text = ctx('text')
      const r: RenderedTemplate = {
        template: t,
        groupTitle: g.title,
        xmlBody: renderBody(xml, t.tresc),
        previewBody: renderBody(preview, t.tresc),
        text: renderBody(text, t.tresc),
        subjectXml: renderSubject(xml, t.temat),
        subjectText: renderSubject(text, t.temat),
      }
      // The same problem shows in every mode; report it once, prefixed with the template id.
      for (const e of [...xml.errors, ...preview.errors, ...text.errors])
        errors.push(`${line}/${t.id}: ${e}`)
      return r
    }),
  )
  return { line, set, templates, errors: [...new Set(errors)], missing: [...missing] }
}
