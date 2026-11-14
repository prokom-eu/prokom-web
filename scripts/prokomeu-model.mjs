#!/usr/bin/env node
/*
 * Data of the boards Dostawy and Wspolpraca → `seed/prokomeu/model/*.json` (H1-1c, ADR-H002 §2).
 * The seed snapshots (`seed/prokomeu/strony/*.json`) keep only the default state of a board and
 * lose the keys of the request list (`pc`, `tv`…), which „Wczytaj przykład do listy” needs. The
 * board itself defines its data in `renderVals()` — this script runs it and writes the content in
 * the shape of `HubSettings.deliveries` / `.cooperation`: line keys instead of colours, hub paths
 * instead of board files, no SVG paths (icons live in code).
 *
 * Usage: node scripts/prokomeu-model.mjs  (re-run after a board changes; review the diff).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BOARDS = 'docs/design/prokomeu/plansze'
const OUT = 'seed/prokomeu/model'

/** The constants and the returned object of a board's `renderVals()`. */
function runBoard(file, constants) {
  const html = readFileSync(join(BOARDS, file), 'utf8')
  const start = html.indexOf('renderVals() {')
  const end = html.indexOf('\n  }\n}', start)
  if (start < 0 || end < 0) throw new Error(`${file}: renderVals() not found`)
  const body = html.slice(start + 'renderVals() {'.length, end)
  // The top-level `return {` of renderVals (4 spaces in); inner callbacks return objects too.
  const at = body.indexOf('return {', body.lastIndexOf('\n    return {'))
  // The board's own code, with its constants returned next to its result.
  const code = `${body.slice(0, at)}const __result = ${body.slice(at + 'return '.length)}
    return { __result, ${constants.join(', ')} }`
  const board = { state: {}, props: {}, setState() {} }
  return new Function(code).call(board)
}

const LINE_OF_COLOUR = {
  'var(--k-b)': 'biznes',
  'var(--k-i)': 'instalacje',
  'var(--k-s)': 'software',
  'var(--k-t)': 'tech',
  'var(--k-y)': 'gaming',
  'var(--k-g)': 'prokom',
}
const line = (colour) => {
  const key = LINE_OF_COLOUR[Array.isArray(colour) ? colour[0] : colour]
  if (!key) throw new Error(`Unknown colour ${colour}`)
  return key
}
const PATHS = {
  'DlaFirm.dc.html': '/dla-firm',
  'Wspolpraca.dc.html': '/wspolpraca',
  'Wspolpraca.dc.html#etapy': '/wspolpraca#etapy',
  'Linie.dc.html': '/linie',
  'Partnerzy.dc.html': '/partnerzy',
  'Kontakt.dc.html': '/kontakt',
}
const path = (href) => {
  if (href.startsWith('#')) return href
  const hub = PATHS[href]
  if (!hub) throw new Error(`Unknown board address ${href}`)
  return hub
}
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const pairs = (rows) => rows.map(([title, text]) => ({ title, text }))
const titled = (rows) => rows.map((row) => ({ title: row.t, text: row.d }))
const faq = (rows) => rows.map(([question, answer]) => ({ question, answer }))
const next = (rows) =>
  rows.map((row) => ({ eyebrow: row.eb, title: row.t, text: row.d, href: path(row.url) }))

function deliveries() {
  const {
    __result: r,
    SEG,
    GR,
    SV,
    TM,
    OB,
    PR,
    FQ,
  } = runBoard('Dostawy.dc.html', ['SEG', 'GR', 'SV', 'TM', 'OB', 'PR', 'FQ'])
  return {
    _zrodlo: `${BOARDS}/Dostawy.dc.html (renderVals) — scripts/prokomeu-model.mjs`,
    segments: SEG.map((s) => ({
      key: slug(s.name),
      name: s.name,
      sub: s.sub,
      line: line(s.L),
      eyebrow: s.eb,
      heading: s.h,
      start: s.start,
      lines: s.lines,
      points: pairs(s.items),
      cta: { label: s.cta, href: path(s.url) },
      form: {
        heading: s.formH,
        orgLabel: s.orgL,
        linkLabel: s.linkL,
        linkPlaceholder: s.linkP,
        descPlaceholder: s.descP,
      },
    })),
    listGroups: GR.map((g) => ({
      key: g.k,
      title: g.t,
      lines: g.line,
      line: line(g.L),
      note: g.note,
      items: g.items.map(([key, title, hint]) => ({ key, title, hint })),
    })),
    services: SV.map(([key, title, hint]) => ({ key, title, hint })),
    terms: [...TM],
    objects: OB.map((o) => ({
      key: slug(o.t),
      title: o.t,
      example: o.ex,
      heading: o.h,
      line: line(o.L),
      preset: Object.entries(o.preset).map(([item, qty]) => ({ item, qty })),
      columns: o.cols.map(([title, lines, colour, items]) => ({
        title,
        lines,
        line: line(colour),
        items: items.map(([name, item]) => ({ title: name, item: item || null })),
      })),
    })),
    levels: r.levels.map((row) => ({ title: row.t, text: row.d })),
    prepTabs: PR.map((p) => ({
      title: p.t,
      lines: p.line,
      line: line(p.L),
      heading: p.h,
      lead: p.lead,
      items: pairs(p.items),
    })),
    brands: r.brands.map((b) => ({
      title: b.t,
      line: line(b.c),
      items: b.items.map((i) => ({ name: i.n, note: i.s })),
    })),
    after: r.after.map((row) => ({ title: row.t, text: row.d, line: line(row.c) })),
    towns: r.towns.map((t) => ({
      name: t.t.replace(' · salon', ''),
      salon: t.t.endsWith(' · salon'),
    })),
    facts: r.facts.map((f) => ({ value: f.v, label: f.l })),
    areas: r.areas.map((a) => ({
      title: a.t,
      lines: a.line,
      line: line(a.c),
      text: a.d,
      tags: a.tags.map((tag) => tag.t),
      how: a.how,
    })),
    steps: titled(r.steps),
    comparison: r.cmp.map((row) => ({
      title: row.t,
      other: row.a,
      ours: row.b,
      line: line(row.c),
    })),
    formalities: titled(r.formal),
    faq: faq(FQ),
    next: next(r.next),
  }
}

function cooperation() {
  const { __result: r, R, SG, SC, FQ } = runBoard('Wspolpraca.dc.html', ['R', 'SG', 'SC', 'FQ'])
  return {
    _zrodlo: `${BOARDS}/Wspolpraca.dc.html (renderVals) — scripts/prokomeu-model.mjs`,
    roles: R.map((role) => ({
      key: slug(role.name),
      name: role.name,
      sub: role.sub,
      line: line(role.L),
      lines: role.lines,
      eyebrow: role.eb,
      heading: role.h,
      start: role.start,
      points: pairs(role.items),
      form: {
        heading: role.formH,
        linkLabel: role.linkL,
        linkPlaceholder: role.linkP,
        descPlaceholder: role.descP,
      },
    })),
    stages: SG.map(([title, when, lead, we, you]) => ({ title, when, lead, we, you })),
    scopes: SC.map((s) => ({
      name: s.name,
      line: line(s.L),
      tag: s.tag,
      items: s.items.map(([title, text, when]) => ({ title, text, when })),
    })),
    facts: r.facts.map((f) => ({ value: f.v, label: f.l })),
    deliveries: titled(r.deliv),
    suppliers: titled(r.supp),
    rules: titled(r.rules),
    faq: faq(FQ),
    next: next(r.next),
  }
}

mkdirSync(OUT, { recursive: true })
for (const [name, data] of [
  ['Dostawy', deliveries()],
  ['Wspolpraca', cooperation()],
]) {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`)
  console.log(`${OUT}/${name}.json`)
}
