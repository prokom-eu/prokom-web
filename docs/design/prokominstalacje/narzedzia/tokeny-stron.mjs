// Tokeny kolorów stron Instalacji hurtem (plan przyspieszenia §3): dla każdej strony prototypu
// zbiera kolory z pk.css, których nie pokrywają tokeny z tokens.css ani mapa strony głównej,
// i nadaje im tokeny z parą jasny/ciemny (wartość jasna z reguły `.pk[data-theme="light"] …`).
// Klasy strony: z HTML szablonów i ze słów w apostrofach z `<Strona>.js` (klasy stanów, I7/I8).
// Użycie (raz, potem ręczne poprawki):
//   node docs/design/prokominstalacje/narzedzia/tokeny-stron.mjs > tmp/tokeny-stron.css
// Wynik:
//   stdout — cztery bloki do wklejenia w src/styles/tokens.css (paleta :root, blok linii, ciemny,
//            @media), oznaczone komentarzem „tokeny-stron”;
//   narzedzia/przenies-css.strony.json — mapa dla przenies-css.mjs (`colors` z tokens.css i strony
//            głównej + `selectors`: „selektor|właściwość|nr koloru” → token);
//   stderr — raport: liczba tokenów, kolory z reguł tylko jasnych bez odpowiednika w bazie.
// Prototyp ma motyw ciemny w regułach bazowych, jasny w nadpisaniach — tokeny repo odwrotnie:
// wartość jasna w bloku linii, ciemna w bloku ciemnym i w @media.
import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const pk = fs.readFileSync(join(ROOT, 'pk.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const tokensCss = fs.readFileSync(join(HERE, '../../../../src/styles/tokens.css'), 'utf8')
const homeMap = JSON.parse(fs.readFileSync(join(HERE, 'przenies-css.glowna.json'), 'utf8'))

const norm = (c) =>
  c
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, '#$1$1$2$2$3$3')
    .replace(/,\.(\d)/g, ',0.$1')
    .replace(/,(\d?\.\d+?)0+\)/g, ',$1)')
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g

// Colours already covered: home map + every theme-independent --inst-* / --sx-* of tokens.css.
function block(sel) {
  const at = tokensCss.indexOf(`\n${sel} {`)
  if (at < 0) return {}
  const body = tokensCss.slice(at, tokensCss.indexOf('\n}', at)).replace(/\/\*[\s\S]*?\*\//g, '')
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}
const root = block(':root')
const line = block("[data-line='instalacje']")
const dark = block("[data-line='instalacje'][data-theme='dark']")
const scope = { ...root, ...line }
const resolve = (v, d = 0) => {
  const m = /^var\((--[\w-]+)\)$/.exec(v)
  return m && d < 10 && scope[m[1]] !== undefined ? resolve(scope[m[1]], d + 1) : v
}
const covered = new Map(Object.entries(homeMap.colors).map(([k, v]) => [norm(k), v]))
for (const [k, v] of Object.entries(line)) {
  if (!k.startsWith('--inst-') || k in dark) continue
  const value = resolve(v)
  if (/^#|^rgba?\(/.test(value) && !covered.has(norm(value))) covered.set(norm(value), k)
}
const sxAt = tokensCss.indexOf('[data-inst-sx] {')
for (const m of tokensCss.slice(sxAt, tokensCss.indexOf('}', sxAt)).matchAll(/(--sx-[\w-]+):\s*([^;]+);/g)) {
  if (!covered.has(norm(m[2]))) covered.set(norm(m[2]), m[1])
}

// Classes of every page except the home page (done in I6) and the shared includes.
const pagesDir = join(ROOT, 'zrodlo/pages')
const incDir = join(ROOT, 'zrodlo/inc')
const classesOf = (html) =>
  [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c && !/[{$}]/.test(c))
const homeClasses = new Set(classesOf(fs.readFileSync(join(pagesDir, 'Main.body.html'), 'utf8')))
// Classes built in a page's JS (`'tlev ' + kind`, `cls: 'hroom arm'`, the `.ttx` scene of
// Teletechnika): every quoted word of `<Strona>.js` (I7: these rules and colours were missing).
const jsClassesOf = (js) =>
  [...js.matchAll(/'([ a-z0-9-]+)'/g)].flatMap((m) => m[1].split(' ')).filter((c) => /^[a-z][a-z0-9-]{0,15}$/.test(c))
const pageClasses = new Set([
  ...[...fs.readdirSync(pagesDir).filter((f) => f.endsWith('.body.html')), ...fs.readdirSync(incDir).map((f) => '../inc/' + f)]
    .flatMap((f) => classesOf(fs.readFileSync(join(pagesDir, f), 'utf8'))),
  ...fs
    .readdirSync(pagesDir)
    .filter((f) => f.endsWith('.js') && f !== 'Main.js')
    .flatMap((f) => jsClassesOf(fs.readFileSync(join(pagesDir, f), 'utf8'))),
])
const STATE = new Set('on dim rec all act ready ok open sel cur w2 big hm show hot pk'.split(' '))
const selClasses = (s) => [...s.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])
const relevant = (s) => {
  const cls = selClasses(s)
  return cls.length > 0 && cls.every((c) => pageClasses.has(c) || STATE.has(c)) && cls.some((c) => !homeClasses.has(c) && !STATE.has(c))
}

// Rules (and one level of @media) in file order.
const rules = []
let i = 0
let media = null
let mediaEnd = -1
while (i < pk.length) {
  if (media && i >= mediaEnd) media = null
  const open = pk.indexOf('{', i)
  if (open < 0) break
  const head = pk.slice(i, open).trim()
  if (head.startsWith('@media')) {
    let depth = 1
    let j = open + 1
    while (depth > 0) {
      if (pk[j] === '{') depth++
      if (pk[j] === '}') depth--
      j++
    }
    media = head
    mediaEnd = j - 1
    i = open + 1
    continue
  }
  if (head.startsWith('@')) {
    let depth = 1
    let j = open + 1
    while (depth > 0) {
      if (pk[j] === '{') depth++
      if (pk[j] === '}') depth--
      j++
    }
    i = j
    continue
  }
  const close = pk.indexOf('}', open)
  rules.push({ sel: head.replace(/^}\s*/, ''), body: pk.slice(open + 1, close), media })
  i = close + 1
  while (pk[i] === '}' || /\s/.test(pk[i] ?? '')) {
    if (pk[i] === '}' && media) media = null
    i++
  }
}

// key "selector|property|n" → { dark, light }
const usages = new Map()
const LIGHT = /^\.pk\[data-theme=["']light["']\]\s*/
for (const { sel, body } of rules) {
  for (const raw of sel.split(',').map((s) => s.trim())) {
    const isLight = LIGHT.test(raw)
    const item = raw.replace(LIGHT, '').replace(/^\.pk\s+/, '').replace(/^\.pk(?=[.[#])/, '')
    if (!relevant(item)) continue
    for (const decl of body.split(';')) {
      const colon = decl.indexOf(':')
      if (colon < 0) continue
      const prop = decl.slice(0, colon).trim()
      let n = 0
      for (const c of decl.slice(colon + 1).match(COLOR) ?? []) {
        const key = `${item}|${prop}|${n++}`
        const entry = usages.get(key) ?? {}
        if (isLight) entry.light = norm(c)
        else entry.dark = norm(c)
        usages.set(key, entry)
      }
    }
  }
}

// Only usages with a colour no existing token covers (in either theme).
const needed = [...usages].filter(([, u]) => (u.dark && !covered.has(u.dark)) || (u.light && !covered.has(u.light)))
const lightOnly = needed.filter(([, u]) => !u.dark)
const pairs = needed.filter(([, u]) => u.dark)

// One token per distinct (dark, light) pair; name from the first usage.
const slug = (key) => {
  const [sel, prop] = key.split('|')
  const cls = selClasses(sel).filter((c) => !STATE.has(c)).slice(-2)
  const p = { color: 'c', background: 'bg', 'background-color': 'bg', fill: 'fill', stroke: 'line', 'box-shadow': 'sh', border: 'bd', 'border-color': 'bd' }[prop] ?? prop.replace(/[^a-z]/g, '').slice(0, 4)
  return [...cls, p].join('-').toLowerCase().replace(/[^a-z0-9-]/g, '')
}
const byPair = new Map()
const names = new Set()
const selectors = {}
for (const [key, u] of pairs) {
  const pairKey = `${u.dark}|${u.light ?? ''}`
  let name = byPair.get(pairKey)
  if (!name) {
    let base = `il-${slug(key)}`
    let k = 2
    name = base
    while (names.has(name)) name = `${base}-${k++}`
    names.add(name)
    byPair.set(pairKey, name)
  }
  selectors[key] = `--inst-${name}`
}

const tokensOf = [...byPair].map(([pairKey, name]) => {
  const [d, l] = pairKey.split('|')
  return { name, dark: d, light: l || null }
})
const pal = (n, theme) => `--c-instalacje-${theme ? theme + '-' : ''}${n}`
const out = []
out.push('  /* tokeny-stron: illustrations and widgets of the pages I7–I16 (narzedzia/tokeny-stron.mjs). */')
for (const t of tokensOf) {
  if (t.light && t.light !== t.dark) {
    out.push(`  ${pal(t.name, 'light')}: ${t.light};`)
    out.push(`  ${pal(t.name, 'night')}: ${t.dark};`)
  } else out.push(`  ${pal(t.name)}: ${t.dark};`)
}
const lineBlock = ['  /* tokeny-stron (I7–I16). */']
const darkBlock = ['  /* tokeny-stron (I7–I16). */']
for (const t of tokensOf) {
  if (t.light && t.light !== t.dark) {
    lineBlock.push(`  --inst-${t.name}: var(${pal(t.name, 'light')});`)
    darkBlock.push(`  --inst-${t.name}: var(${pal(t.name, 'night')});`)
  } else lineBlock.push(`  --inst-${t.name}: var(${pal(t.name)});`)
}
process.stdout.write(
  `/* :root */\n${out.join('\n')}\n\n/* [data-line='instalacje'] */\n${lineBlock.join('\n')}\n\n` +
    `/* [data-line='instalacje'][data-theme='dark'] i @media */\n${darkBlock.join('\n')}\n`,
)
const map = {
  prefix: homeMap.prefix,
  palette: 'il',
  ids: null,
  colors: Object.fromEntries([...covered]),
  selectors,
}
fs.writeFileSync(join(HERE, 'przenies-css.strony.json'), JSON.stringify(map, null, 1) + '\n')
process.stderr.write(
  `tokenów: ${tokensOf.length} (z parą jasny/ciemny: ${tokensOf.filter((t) => t.light && t.light !== t.dark).length}), ` +
    `użyć: ${pairs.length}\nkolory tylko w regułach jasnych, bez koloru bazowego (${lightOnly.length}) — do sesji strony:\n` +
    lightOnly.map(([k, u]) => `  ${k} → ${u.light}`).join('\n') +
    '\n',
)
