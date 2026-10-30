// Przenosi reguły pk.css wybranych klas do zagnieżdżonego CSS linii (I6, ADR-I003 §3).
// Użycie: node docs/design/prokominstalacje/narzedzia/przenies-css.mjs <pk.css> <src/styles/tokens.css> <klasy.txt> <mapa.json> [klasy-strony.txt] > out.css
// klasy.txt — klasy sekcji; mapa.json — {"prefix":"sx","palette":"sx|il","ids":[…],"colors":{"#hex|rgba(…)":"--token"},
// "selectors":{"selektor|właściwość|nr":"--token"}} (selectors — z tokeny-stron.mjs, wygrywa z colors);
// klasy-strony.txt — wszystkie klasy strony (selektory z innymi klasami odpadają). Raport (stderr):
// reguły „tylko jasny motyw” i kolory bez tokenu — do ręcznego przejrzenia. Wzór mapy: przenies-css.glowna.json.
// Ports pk.css rules of the given classes to nested, token-only CSS for src/sites/instalacje.
// usage: node przenies-css.mjs <pk.css> <tokens.css> <classes.txt> <map.json> > out.css
import fs from 'node:fs'

const [pkPath, tokensPath, classesPath, mapPath] = process.argv.slice(2)
const pk = fs.readFileSync(pkPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const tokens = fs.readFileSync(tokensPath, 'utf8')
const targets = new Set(fs.readFileSync(classesPath, 'utf8').split(/\s+/).filter(Boolean))
const manual = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
const pagePath = process.argv[6]
const page = pagePath ? new Set(fs.readFileSync(pagePath, 'utf8').split(/\s+/).filter(Boolean)) : null

const norm = (c) =>
  c
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, '#$1$1$2$2$3$3')
    .replace(/,\.(\d)/g, ',0.$1')
    .replace(/,(\d?\.\d+?)0+\)/g, ',$1)')

// Scene palettes from tokens.css (value → --name): `sx` = home service cards (I6), `il` = service
// page illustrations (I7+). The map's `palette` picks the fallback for colours without a token.
function palette(name) {
  const found = new Map()
  const at = tokens.indexOf(`[data-inst-${name}] {`)
  if (at < 0) return found
  const block = tokens.slice(at, tokens.indexOf('}', at))
  for (const m of block.matchAll(new RegExp(`(--${name}-[\\w-]+):\\s*([^;]+);`, 'g'))) {
    const v = norm(m[2])
    if (!found.has(v)) found.set(v, m[1])
  }
  return found
}
const sx = palette('sx')
const fallback = manual.palette && manual.palette !== 'sx' ? palette(manual.palette) : sx
const general = new Map(Object.entries(manual.colors).map(([k, v]) => [norm(k), v]))
const VARS = {
  '--bg': '--surface',
  '--bg2': '--surface-2',
  '--bg3': '--surface-3',
  '--card2': '--card-2',
  '--line': '--border',
  '--text': '--ink',
  '--muted': '--ink-2',
  '--soft': '--ink-soft',
  '--accentText': '--accent-text',
  '--accentSoft': '--accent-soft',
  '--accentLine': '--accent-line',
  '--accentInk': '--accent-ink',
  '--hdr': '--header-bg',
  '--bad': '--inst-plan-err',
}

const unknown = new Map()
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g

function convert(decls, isScene, selector) {
  let out = decls.replace(/var\((--[a-zA-Z0-9]+)/g, (m, v) => (VARS[v] ? `var(${VARS[v]}` : m))
  out = out.replace(/(^|[;{\s])(--[a-zA-Z0-9]+)\s*:/g, (m, p, v) => (VARS[v] ? `${p}${VARS[v]}:` : m))
  // Fonts of the prototype → the repo's local fonts (next/font variables).
  out = out
    .replace(/(['"]?)Archivo\1\s*,\s*sans-serif/g, 'var(--font-display)')
    .replace(/(['"]?)Manrope\1\s*,\s*sans-serif/g, 'var(--font-sans)')
  // Per declaration: a colour of this selector and property may have its own token
  // (`selectors` of the map, `tokeny-stron.mjs`: "selector|property|n" → token).
  const first = selector.split(',')[0].trim()
  out = out
    .split(';')
    .map((decl) => {
      const colon = decl.indexOf(':')
      const prop = colon < 0 ? '' : decl.slice(0, colon).trim()
      let n = 0
      return decl.replace(COLOR, (c) => {
        const own = manual.selectors?.[`${first}|${prop}|${n++}`]
        if (own) return `var(${own})`
        const v = norm(c)
        const token = (isScene && sx.get(v)) || general.get(v) || fallback.get(v)
        if (token) return `var(${token})`
        unknown.set(v, [...(unknown.get(v) ?? []), selector])
        return c
      })
    })
    .join(';')
  return out
}

// Top-level rules and one level of @media.
const blocks = []
let i = 0
while (i < pk.length) {
  const open = pk.indexOf('{', i)
  if (open < 0) break
  const head = pk.slice(i, open).trim()
  if (head.startsWith('@media') || head.startsWith('@supports')) {
    let depth = 1
    let j = open + 1
    const inner = []
    let k = j
    while (depth > 0) {
      if (pk[j] === '{') depth++
      if (pk[j] === '}') {
        depth--
        if (depth === 1) {
          inner.push(pk.slice(k, j + 1))
          k = j + 1
        }
      }
      j++
    }
    blocks.push({ media: head, rules: inner.map((r) => r.trim()).filter(Boolean) })
    i = j
  } else if (head.startsWith('@keyframes')) {
    let depth = 1
    let j = open + 1
    while (depth > 0) {
      if (pk[j] === '{') depth++
      if (pk[j] === '}') depth--
      j++
    }
    blocks.push({ keyframes: head.split(/\s+/)[1], body: pk.slice(open, j) })
    i = j
  } else {
    const close = pk.indexOf('}', open)
    blocks.push({ rule: `${head}{${pk.slice(open + 1, close)}}` })
    i = close + 1
  }
}

const classesOf = (sel) => [...sel.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map((m) => m[1])
const lightOnly = []
const usedFrames = new Set()

function port(rule) {
  const open = rule.indexOf('{')
  const sel = rule.slice(0, open).trim()
  const body = rule.slice(open + 1, rule.lastIndexOf('}')).trim()
  const items = sel
    .split(',')
    .map((s) => s.trim())
    .filter((s) => classesOf(s).some((c) => targets.has(c) || (manual.prefix && c.startsWith(manual.prefix))))
    .filter((s) => !page || classesOf(s).every((c) => c === 'pk' || page.has(c)))
    .filter((s) => !manual.ids || [...s.matchAll(/#([a-zA-Z][\w-]*)/g)].every((m) => manual.ids.includes(m[1])))
  if (items.length === 0) return null
  const keep = []
  for (const item of items) {
    if (/\[data-theme=["']light["']\]/.test(item)) lightOnly.push(`${item}{${body}}`)
    else keep.push(item.replace(/^\.pk\s+/, '').replace(/^\.pk(?=[.[#])/, ''))
  }
  if (keep.length === 0) return null
  const isScene = keep.every((s) => classesOf(s).some((c) => c.startsWith('sx')))
  for (const m of body.matchAll(/animation(?:-name)?\s*:\s*([^;]+)/g)) {
    for (const w of m[1].split(/[\s,]+/)) usedFrames.add(w)
  }
  const decls = convert(body, isScene, keep.join(','))
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
  return { selectors: keep, decls, hover: keep.every((s) => s.includes(':hover')) }
}

const out = []
const fmt = (r, pad) =>
  `${pad}${r.selectors.map((s) => `& ${s}`).join(`,\n${pad}`)} {\n${r.decls
    .map((d) => `${pad}  ${d.replace(/\s*:\s*/, ': ')};`)
    .join('\n')}\n${pad}}`
for (const b of blocks) {
  if (b.rule) {
    const r = port(b.rule)
    if (!r) continue
    out.push(r.hover ? `  @media (hover: hover) {\n${fmt(r, '    ')}\n  }` : fmt(r, '  '))
  } else if (b.media) {
    const rs = b.rules.map(port).filter(Boolean)
    if (rs.length) out.push(`  ${b.media} {\n${rs.map((r) => fmt(r, '    ')).join('\n')}\n  }`)
  }
}
const frames = blocks.filter((b) => b.keyframes && usedFrames.has(b.keyframes))
let css = `[data-line='instalacje'] {\n${out.join('\n')}\n}\n`
for (const f of frames) {
  // Only inside animation declarations: a class may share the keyframes' name (.ucorb).
  css = css.replace(/(animation(?:-name)?:\s*)([^;\n]+)/g, (m, p, v) =>
    p + v.replace(new RegExp(`(^|[\\s,])${f.keyframes}(?=$|[\\s,])`, 'g'), `$1inst-${f.keyframes}`),
  )
  css += `\n@keyframes inst-${f.keyframes} ${convert(f.body, true, '@keyframes')}\n`
}
process.stdout.write(css)
process.stderr.write(
  `rules: ${out.length}, keyframes: ${frames.map((f) => f.keyframes).join(' ')}\n` +
    `light-only (${lightOnly.length}):\n  ${lightOnly.join('\n  ')}\n` +
    `unknown colours (${unknown.size}):\n${[...unknown].map(([c, s]) => `  ${c}  ← ${[...new Set(s)].slice(0, 3).join(' | ')}`).join('\n')}\n`,
)
