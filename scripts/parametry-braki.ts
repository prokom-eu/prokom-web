/**
 * Missing required parameters of ready Biznes cards (PRODUKCJA-BIZNES-1211 §1, sesja 2):
 *   node scripts/parametry-braki.ts   → docs/zadania/parametry-braki.md
 *                                       + src/lib/biznes/requiredSpecs.gaps.json (the test's list)
 * Node 24 runs TypeScript directly (type stripping); no build step, no new dependency.
 * Fill a gap only from the producer's page or PDF (the card's `zrodla`), then run this again —
 * the test fails while the list names a gap that is already filled, so the list only shrinks.
 */
import { readFileSync, writeFileSync } from 'node:fs'

// Node needs the `.ts` file name, `tsc` refuses it in an import: loaded by path, typed here.
const SPECS = '../src/lib/biznes/requiredSpecs.ts'
const { missingSpecs } = (await import(SPECS)) as typeof import('../src/lib/biznes/requiredSpecs')

type Card = {
  slug_seed: string
  status: string
  kategoria: string
  nazwa: string
  parametry: { k: string; v: string }[]
  zrodla?: { url: string }[]
}

const catalog = JSON.parse(readFileSync('seed/prokombiznes/k4/katalog-k4.json', 'utf8')) as {
  produkty: Card[]
}
const ready = catalog.produkty.filter((card) => card.status === 'gotowe')
const gaps: Record<string, string[]> = {}
for (const card of ready) {
  const missing = missingSpecs(card.kategoria, card.parametry)
  if (missing?.length) gaps[card.slug_seed] = missing
}
writeFileSync('src/lib/biznes/requiredSpecs.gaps.json', `${JSON.stringify(gaps, null, 2)}\n`)

const byCategory = new Map<string, Card[]>()
for (const card of ready.filter((c) => gaps[c.slug_seed])) {
  byCategory.set(card.kategoria, [...(byCategory.get(card.kategoria) ?? []), card])
}
const lines = [...byCategory.entries()]
  .sort((a, b) => b[1].length - a[1].length)
  .flatMap(([category, cards]) => [
    `\n## ${category} (${cards.length})\n`,
    '| slug | brakuje | gdzie szukać |',
    '|---|---|---|',
    ...cards.map(
      (card) =>
        `| \`${card.slug_seed}\` | ${gaps[card.slug_seed]!.join(', ')} | ${card.zrodla?.[0]?.url ? `[źródło karty](${card.zrodla[0].url})` : '— (brak źródła)'} |`,
    ),
  ])
const total = Object.values(gaps).reduce((sum, list) => sum + list.length, 0)
writeFileSync(
  'docs/zadania/parametry-braki.md',
  `# Braki parametrów obowiązkowych — karty Biznesu (PRODUKCJA-BIZNES-1211 §1)

Wygenerowane przez \`node scripts/parametry-braki.ts\` z \`seed/prokombiznes/k4/katalog-k4.json\`. Nie edytuj ręcznie. Obowiązkowe klucze kategorii są w \`src/lib/biznes/requiredSpecs.ts\`.

**Stan:** ${ready.length} gotowych kart · ${Object.keys(gaps).length} z brakami · ${total} brakujących pól.

Zasada: brak uzupełniamy **tylko** ze strony albo PDF-u producenta (źródło karty, data w \`sprawdzono\`). Gdy producent danej wartości nie podaje, wpis zostaje tutaj z dopiskiem, gdzie szukano. Nie zgadujemy. Po uzupełnieniu uruchom skrypt ponownie. Test \`requiredSpecs.test.ts\` pilnuje, żeby lista tylko malała. Uzupełnianie idzie kategoriami w sesjach 3–4 (KATALOG-DANE-2).
${lines.join('\n')}
`,
)
console.log(`${Object.keys(gaps).length} kart z brakami, ${total} pól`)
