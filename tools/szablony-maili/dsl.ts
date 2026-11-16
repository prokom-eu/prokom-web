// Template content (YAML `tresc`) → HTML or plain text. Syntax: SZABLONY-MAILI.md §3.
import * as h from './html.ts'
import type { Accent } from './html.ts'
import type { Dane, LineId } from './schema.ts'

/** xml = Quicktext body, preview = HTML preview with field markers, text = catalogue (Markdown). */
export type Mode = 'xml' | 'preview' | 'text'

export interface RenderContext {
  line: LineId
  dane: Dane
  mode: Mode
  /** Button with a field in its address: plain `#` link + the address as text below. */
  noHrefInput?: boolean
  /** Collected problems: unresolved placeholders, missing data. */
  errors: string[]
  /** Data still marked [DO UZUPEŁNIENIA] / [SZEF]. */
  missing: Set<string>
}

type Node =
  | { t: 'text'; v: string }
  | { t: 'bold'; c: Node[] }
  | { t: 'input'; label: string }
  | { t: 'select'; label: string; options: string[] }
  | { t: 'manual'; v: string }
  | { t: 'optional'; c: Node[] }
  | { t: 'var'; name: string }
  | { t: 'star' }

const VAR_RE = /^(?:[a-z]+\.)?[A-Z][A-Z0-9_]*$/
export const MISSING_RE = /^\[(DO UZUPEŁNIENIA|SZEF)\]/

/** Index of the `}` closing the `{` at `start` (nested braces allowed), or -1. */
function closingBrace(s: string, start: number): number {
  let depth = 0
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}' && --depth === 0) return i
  }
  return -1
}

export function parseInline(s: string): Node[] {
  const flat: Node[] = []
  let buf = ''
  const flush = () => {
    if (buf) flat.push({ t: 'text', v: buf })
    buf = ''
  }
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith('**', i)) {
      flush()
      flat.push({ t: 'star' })
      i++
      continue
    }
    if (s[i] === '{') {
      const end = closingBrace(s, i)
      const inner = end > 0 ? s.slice(i + 1, end) : ''
      let node: Node | null = null
      if (inner.startsWith('I:')) node = { t: 'input', label: inner.slice(2) }
      else if (inner.startsWith('S:')) {
        const [label = '', opts = ''] = splitOnce(inner.slice(2), '|')
        node = { t: 'select', label, options: opts.split(';') }
      } else if (inner.startsWith('M:')) node = { t: 'manual', v: inner.slice(2) }
      else if (inner.startsWith('?:')) node = { t: 'optional', c: parseInline(inner.slice(2)) }
      else if (VAR_RE.test(inner)) node = { t: 'var', name: inner }
      if (node) {
        flush()
        flat.push(node)
        i = end
        continue
      }
    }
    buf += s[i]
  }
  flush()
  return pairStars(flat)
}

function splitOnce(s: string, sep: string): [string, string] {
  const i = s.indexOf(sep)
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]
}

/** `**` markers → bold containers (an unpaired marker stays as text). */
function pairStars(nodes: Node[]): Node[] {
  const out: Node[] = []
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]!
    if (n.t !== 'star') {
      out.push(n)
      continue
    }
    const close = nodes.findIndex((m, j) => j > i && m.t === 'star')
    if (close < 0) {
      out.push({ t: 'text', v: '**' })
      continue
    }
    out.push({ t: 'bold', c: nodes.slice(i + 1, close) })
    i = close
  }
  return out
}

/** Value of a line variable: `TEL` (current line, then shared data) or `biznes.TEL`. */
export function lookupVar(ctx: RenderContext, name: string): string | undefined {
  const [lineKey, field] = name.includes('.') ? splitOnce(name, '.') : [ctx.line, name]
  const lineData = ctx.dane.linie[lineKey as keyof Dane['linie']] as
    Record<string, unknown> | undefined
  const v = lineData?.[field] ?? ctx.dane.wspolne[field]
  return typeof v === 'string' ? v : undefined
}

function renderVar(ctx: RenderContext, name: string): string {
  const v = lookupVar(ctx, name)
  if (v === undefined) {
    ctx.errors.push(`unknown variable {${name}}`)
    return ctx.mode === 'text' ? `{${name}}` : h.esc(`{${name}}`)
  }
  if (MISSING_RE.test(v)) {
    ctx.missing.add(`${name}: ${v}`)
    if (ctx.mode === 'preview') {
      return `<span style="outline:2px solid #D92D20;outline-offset:1px;border-radius:2px">${h.esc(v)}</span>`
    }
  }
  return ctx.mode === 'text' ? v : h.esc(v)
}

export function renderNodes(ctx: RenderContext, nodes: Node[]): string {
  const { mode } = ctx
  return nodes
    .map((n): string => {
      switch (n.t) {
        case 'text':
          return mode === 'text' ? n.v : h.esc(n.v)
        case 'bold': {
          const inner = renderNodes(ctx, n.c)
          return mode === 'text' ? `**${inner}**` : h.strong(inner)
        }
        case 'input':
          if (mode === 'xml') return `[[INPUT=${h.esc(n.label)}]]`
          return mode === 'text' ? `[${n.label}]` : h.fieldMark(h.esc(n.label))
        case 'select': {
          // Line variables are resolved at build time (plain text for Quicktext); fields cannot
          // be nested, because Quicktext does not nest [[…]].
          const options = n.options.map((o) => {
            const nodes = parseInline(o)
            if (nodes.some((x) => x.t !== 'text' && x.t !== 'var')) {
              ctx.errors.push(`nested field in select option: ${o}`)
            }
            const plain = renderNodes({ ...ctx, mode: 'text' }, nodes)
            if (/[;|[\]{}]/.test(plain))
              ctx.errors.push(`select option with forbidden character: ${plain}`)
            return plain
          })
          if (mode === 'xml')
            return `[[INPUT=${h.esc(n.label)}|select|${h.esc(options.join(';'))}]]`
          const label = `${n.label}: ${options.join(' / ')}`
          return mode === 'text' ? `[${label}]` : h.fieldMark(h.esc(label))
        }
        case 'manual':
          if (mode === 'text') return `[UZUPEŁNIJ RAZ: ${n.v}]`
          return `<span style="background:#FFF0A6;border-radius:3px;padding:0 3px">${h.esc(n.v)}</span>`
        case 'optional': {
          const inner = renderNodes(ctx, n.c)
          if (mode === 'xml') return inner
          if (mode === 'text') return `${inner} _(usuń, jeśli nie dotyczy)_`
          return (
            `<span style="border-bottom:1px dashed #C9A400">${inner}</span>` +
            ` <span style="font-size:11px;color:#8A918B">(usuń, jeśli nie dotyczy)</span>`
          )
        }
        case 'var':
          return renderVar(ctx, n.name)
        case 'star':
          return '**'
      }
    })
    .join('')
}

export function inline(ctx: RenderContext, s: string): string {
  return renderNodes(ctx, parseInline(s))
}

function accentOf(ctx: RenderContext): Accent {
  const d = ctx.dane.linie[ctx.line]
  return { ACC: d.ACC, ACC_TXT: d.ACC_TXT, ACC_BTN: d.ACC_BTN, ACC_SOFT: d.ACC_SOFT }
}

/** Button address: a URL, a variable, an {I:} field or an {M:} placeholder. */
function renderButton(ctx: RenderContext, label: string, target: string): string {
  const a = accentOf(ctx)
  const nodes = parseInline(target)
  const manual = nodes.find((n) => n.t === 'manual')
  const hasInput = nodes.some((n) => n.t === 'input')
  if (ctx.mode === 'text') return `[${label} →](${renderNodes(ctx, nodes)})`
  const labelHtml = inline(ctx, label)
  if (manual && manual.t === 'manual') {
    // One-off placeholder: keep it visible next to the button so it is not missed after import.
    return h.button(a, labelHtml, '#') + h.paragraph(renderNodes(ctx, [manual]))
  }
  if (ctx.mode === 'preview') {
    const addr = renderNodes(ctx, nodes)
    const href = hasInput ? '#' : h.escAttr(lookupHref(ctx, nodes))
    return h.button(a, labelHtml, href) + (hasInput ? h.paragraph(`Adres przycisku: ${addr}`) : '')
  }
  if (hasInput && ctx.noHrefInput) {
    return h.button(a, labelHtml, '#') + h.paragraph(renderNodes(ctx, nodes))
  }
  return h.button(a, labelHtml, renderNodes(ctx, nodes).replace(/"/g, '&quot;'))
}

function lookupHref(ctx: RenderContext, nodes: Node[]): string {
  return renderNodes({ ...ctx, mode: 'text', errors: [] }, nodes)
}

const BOX_RE = /^::(info|uwaga|ok)(?: (.*))?$/

/** Renders a whole `tresc`: blocks separated by blank lines. */
export function renderBody(ctx: RenderContext, tresc: string): string {
  const paragraphs = tresc
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n[ \t]*\n/)
    .map((p) => p.split('\n').map((l) => l.trim()))
  const a = accentOf(ctx)
  const text = ctx.mode === 'text'
  const out: string[] = []

  for (const lines of paragraphs) {
    const [first = '', ...rest] = lines
    const head = first.startsWith('::') ? first : ''

    if (head.startsWith('::karta')) {
      const title = inline(ctx, head.slice(7).trim())
      const rows = rest.map((l) => {
        const [label, value] = splitOnce(l, ':')
        return { label: inline(ctx, label.trim()), value: inline(ctx, value.trim()) }
      })
      out.push(
        text
          ? [title && `**${title}**`, ...rows.map((r) => `- ${r.label}: ${r.value}`)]
              .filter(Boolean)
              .join('\n')
          : h.card(a, title, rows),
      )
    } else if (head.startsWith('::kroki')) {
      const title = inline(ctx, head.slice(7).trim())
      const items = rest.map((l) => inline(ctx, l.replace(/^\d+\.\s*/, '')))
      out.push(
        text
          ? [title && `**${title}**`, ...items.map((s, i) => `${i + 1}. ${s}`)]
              .filter(Boolean)
              .join('\n')
          : h.steps(a, title, items),
      )
    } else if (BOX_RE.test(head)) {
      const [, kind = 'info', rawTitle = ''] = BOX_RE.exec(head)!
      const title = inline(ctx, rawTitle.trim())
      const body = rest.map((l) => inline(ctx, l))
      out.push(
        text
          ? `> **${title}**${body.length ? '\n> ' + body.join('\n> ') : ''}`
          : h.box(a, kind as h.BoxKind, title, body.join('<br>')),
      )
    } else if (head.startsWith('::przycisk')) {
      const [label, target] = splitOnce(head.slice(10).trim(), '|')
      out.push(renderButton(ctx, label.trim(), target.trim()))
    } else if (head.startsWith('::pozycje')) {
      const [headerLine = '', ...rowLines] = rest
      const header = headerLine.split('|').map((c) => inline(ctx, c.trim()))
      const rows = rowLines.map((l) => {
        const total = l.startsWith('**')
        const clean = total ? l.replace(/^\*\*/, '').replace(/\*\*$/, '') : l
        return { total, cells: clean.split('|').map((c) => inline(ctx, c.trim())) }
      })
      out.push(
        text
          ? [
              header.join(' | '),
              ...rows.map((r) => (r.total ? '**' : '') + r.cells.join(' | ')),
            ].join('\n')
          : h.items(a, header, rows),
      )
    } else if (head.startsWith('::lista')) {
      const items = rest.map((l) => inline(ctx, l.replace(/^-\s*/, '')))
      out.push(text ? items.map((s) => `- ${s}`).join('\n') : h.checkList(a, items))
    } else if (head) {
      ctx.errors.push(`unknown block: ${head}`)
      out.push(text ? lines.join('\n') : h.paragraph(h.esc(lines.join(' '))))
    } else if (lines.length === 1 && first === '{PYTANIA}') {
      const items = (ctx.dane.pytania[ctx.line] ?? '')
        .trim()
        .split('\n')
        .map((l) => inline(ctx, l.trim().replace(/^-\s*/, '')))
      if (items.length === 0 || !items[0]) ctx.errors.push(`no questions for line ${ctx.line}`)
      out.push(text ? items.map((s) => `- ${s}`).join('\n') : h.bulletList(items))
    } else if (lines.every((l) => l.startsWith('- '))) {
      const items = lines.map((l) => inline(ctx, l.slice(2)))
      out.push(text ? items.map((s) => `- ${s}`).join('\n') : h.bulletList(items))
    } else {
      const html = lines.map((l) => inline(ctx, l))
      out.push(text ? html.join('\n') : h.paragraph(html.join('<br>')))
    }
  }
  return text ? out.join('\n\n') : h.wrap(out.join(''))
}

/** Subject line (Quicktext fills its fields too). */
export function renderSubject(ctx: RenderContext, temat: string | undefined): string {
  if (!temat) return ''
  if (ctx.mode !== 'xml') return renderNodes({ ...ctx, mode: 'text' }, parseInline(temat))
  // Subject is plain text, not HTML: keep [[INPUT=…]] fields, undo HTML escaping.
  return renderNodes(ctx, parseInline(temat))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}
