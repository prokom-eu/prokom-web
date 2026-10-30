// Przenosi sceny SVG z prototypu do stałych TS renderowanych na serwerze (ADR-I003 §4, wzór I5
// `backdrop.ts` i I6 `sceny.ts`).
// Użycie:
//   node docs/design/prokominstalacje/narzedzia/przenies-svg.mjs <plik.body.html> <NAZWA> [opcje] > out.ts
// Opcje:
//   --klasa <k>    tylko <svg> z tą klasą (np. sgsvg); bez opcji — każdy <svg> z viewBox i bez width
//                  (pomija ikony 24×24 z prototypu)
//   --mapa <json>  mapa kolorów jak w przenies-css (`colors`: "#hex|rgba(…)" → "--token"): surowe kolory
//                  w atrybutach i `style` zamienia na var(--token)
//   --wewnatrz     zapisuje tylko wnętrze <svg> (viewBox osobno) — gdy komponent ma własny <svg>
// Wynik: `export const NAZWA = [{ viewBox, attrs, html }, …] as const`. Wiązania szablonu `{{a.b}}`
// zamienia na `%a.b%` (komponent podmienia je przy renderowaniu). Raport (stderr): wiązania,
// pętle i warunki szablonu (`<sc-for>`, `<sc-if>` — do przepisania w React), ikony `<!--i:…-->`,
// kolory bez tokenu, identyfikatory (`id=`, `url(#…)` — muszą być unikalne na stronie).
import fs from 'node:fs'

const [file, name, ...rest] = process.argv.slice(2)
if (!file || !name) {
  console.error('Użycie: przenies-svg.mjs <plik.body.html> <NAZWA> [--klasa k] [--mapa m.json] [--wewnatrz]')
  process.exit(1)
}
const opt = (flag) => {
  const i = rest.indexOf(flag)
  return i < 0 ? null : (rest[i + 1] ?? '')
}
const onlyClass = opt('--klasa')
const inner = rest.includes('--wewnatrz')
const mapPath = opt('--mapa')

const norm = (c) =>
  c
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, '#$1$1$2$2$3$3')
    .replace(/,\.(\d)/g, ',0.$1')
const colors = new Map(
  mapPath
    ? Object.entries(JSON.parse(fs.readFileSync(mapPath, 'utf8')).colors ?? {}).map(([k, v]) => [norm(k), v])
    : [],
)
// The map's scene palette (`palette`, e.g. "il" → `[data-inst-il]` in tokens.css) for colours
// without a token in `colors`. tokens.css is read from the repo root (run the tool from there).
const paletteName = mapPath ? JSON.parse(fs.readFileSync(mapPath, 'utf8')).palette : null
if (paletteName && fs.existsSync('src/styles/tokens.css')) {
  const tokens = fs.readFileSync('src/styles/tokens.css', 'utf8')
  const at = tokens.indexOf(`[data-inst-${paletteName}] {`)
  const block = at < 0 ? '' : tokens.slice(at, tokens.indexOf('}', at))
  for (const m of block.matchAll(new RegExp(`(--${paletteName}-[\\w-]+):\\s*([^;]+);`, 'g'))) {
    if (!colors.has(norm(m[2]))) colors.set(norm(m[2]), m[1])
  }
}

const source = fs.readFileSync(file, 'utf8')

// Top-level <svg>…</svg> blocks (nested <svg> stays inside its parent).
const blocks = []
const tag = /<\/?svg\b[^>]*>/g
let depth = 0
let start = -1
let m
while ((m = tag.exec(source))) {
  if (m[0].startsWith('</')) {
    depth--
    if (depth === 0) blocks.push(source.slice(start, m.index + m[0].length))
  } else if (!m[0].endsWith('/>')) {
    if (depth === 0) start = m.index
    depth++
  }
}

const attr = (open, a) => new RegExp(`\\s${a}="([^"]*)"`).exec(open)?.[1] ?? null
const picked = blocks.filter((svg) => {
  const open = svg.slice(0, svg.indexOf('>') + 1)
  const cls = attr(open, 'class')?.split(/\s+/) ?? []
  if (onlyClass) return cls.includes(onlyClass)
  return attr(open, 'viewBox') !== null && attr(open, 'width') === null
})

const report = { bindings: new Set(), template: new Set(), icons: new Set(), unknown: new Map(), ids: new Set() }
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g

const scenes = picked.map((svg) => {
  const open = svg.slice(0, svg.indexOf('>') + 1)
  let body = inner ? svg.slice(open.length, svg.lastIndexOf('</svg>')) : svg
  body = body.replace(/\s*\r?\n\s*/g, '')
  for (const t of body.match(/<\/?sc-[a-z]+[^>]*>/g) ?? []) report.template.add(t.slice(0, 60))
  for (const i of body.match(/<!--i:[^>]*-->/g) ?? []) report.icons.add(i)
  for (const id of body.match(/\sid="[^"]*"|url\(#[^)]*\)/g) ?? []) report.ids.add(id.trim())
  body = body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, b) => {
    report.bindings.add(b)
    return `%${b}%`
  })
  // Colours only in attribute values and inline styles (never in text).
  body = body.replace(/(="[^"]*")/g, (value) =>
    value.replace(COLOR, (c) => {
      const token = colors.get(norm(c))
      if (token) return `var(${token})`
      report.unknown.set(norm(c), (report.unknown.get(norm(c)) ?? 0) + 1)
      return c
    }),
  )
  const attrs = Object.fromEntries(
    ['class', 'viewBox', 'preserveAspectRatio', 'role', 'aria-label'].flatMap((a) => {
      const v = attr(open, a)
      return v === null ? [] : [[a, v]]
    }),
  )
  return { viewBox: attrs.viewBox ?? null, attrs, html: body }
})

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
process.stdout.write(
  `/**\n * Scenes of \`${file.replace(/\\/g, '/').split('/').slice(-2).join('/')}\`, copied 1:1 by narzedzia/przenies-svg.mjs` +
    ` (ADR-I003 §4).\n * \`%a.b%\` = a binding of the prototype, replaced when rendering. Our own constant, rendered on\n` +
    ` * the server. Generated once, do not edit by hand.\n */\nexport const ${name} = [\n` +
    scenes
      .map(
        (s) =>
          `  {\n    viewBox: ${s.viewBox ? q(s.viewBox) : 'null'},\n    attrs: ${JSON.stringify(s.attrs)},\n    html: ${q(s.html)},\n  },`,
      )
      .join('\n') +
    `\n] as const\n`,
)
const list = (set) => [...set].join(' · ') || '—'
process.stderr.write(
  `scen: ${scenes.length} z ${blocks.length} <svg> w pliku\n` +
    `wiązania (${report.bindings.size}): ${list(report.bindings)}\n` +
    `szablon do React: ${list(report.template)}\n` +
    `ikony: ${list(report.icons)}\n` +
    `id/url(#) — unikalne na stronie: ${list(report.ids)}\n` +
    `kolory bez tokenu (${report.unknown.size}): ${[...report.unknown].map(([c, n]) => `${c}×${n}`).join(' ') || '—'}\n`,
)
