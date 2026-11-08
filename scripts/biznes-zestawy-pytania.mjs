#!/usr/bin/env node
// BIZ-3 §9.1: lists what keeps each bundle of prokombiznes.pl from „Gotowe” — open questions of
// items (`do_potwierdzenia`), open compat pairs and items whose K4 card is not ready.
// Usage: node scripts/biznes-zestawy-pytania.mjs [--json]
// The seed computes the same rule (`bundleBlockers`); a card outside K4 and the K3.1 splits is
// marked „spoza K4” — check its K3 status by hand.
import { readFileSync } from 'node:fs'

const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const k3 = read('seed/prokombiznes/k3/zestawy.json')
const k4 = read('seed/prokombiznes/k4/zestawy-k4.json')
const catalog = read('seed/prokombiznes/k4/katalog-k4.json')
const cards = new Map(catalog.produkty.map((card) => [card.slug_seed, card]))
// K3.1 split cards (not in K4): `do-sprawdzenia` unless checked (`status` in the split content).
for (const card of read('seed/prokombiznes/k31/karty-podzial-tresci.json').karty) {
  if (!cards.has(card.slug)) cards.set(card.slug, { status: card.status ?? 'do-sprawdzenia' })
}

const report = k3.zestawy.map((bundle) => {
  const items = k4.zestawy[bundle.slug]?.el ?? []
  const blockers = [
    ...bundle.elementy
      .filter((item) => item.do_potwierdzenia)
      .map((item) => ({ kind: 'pytanie', item: item.slug, text: item.do_potwierdzenia })),
    ...k3.sprawdzone_zgodnosci
      .filter((check) => check.zestaw === bundle.slug && check.status === 'do_potwierdzenia')
      .map((check) => ({ kind: 'para', item: check.para, text: check.zrodlo_w_karcie ?? '' })),
    ...items.flatMap((item) => {
      const card = cards.get(item.s)
      if (!card) return [{ kind: 'karta', item: item.s, text: 'spoza K4 — status z K3' }]
      return card.status === 'gotowe' ? [] : [{ kind: 'karta', item: item.s, text: card.status }]
    }),
  ]
  return { slug: bundle.slug, status: bundle.status, blockers }
})

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2))
} else {
  let questions = 0
  for (const bundle of report) {
    console.log(
      `\n${bundle.slug} (${bundle.status}) — ${bundle.blockers.length || 'nic otwartego'}`,
    )
    for (const blocker of bundle.blockers) {
      if (blocker.kind === 'pytanie') questions += 1
      console.log(`  [${blocker.kind}] ${blocker.item}: ${blocker.text}`)
    }
  }
  const ready = report.filter((bundle) => bundle.status === 'gotowe').length
  console.log(`\nPytania: ${questions} · gotowe w paczce: ${ready}/${report.length}`)
}
