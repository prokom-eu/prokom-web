/**
 * Content rules of the Biznes catalog (K3-KATALOG §10): no prices, instalments, leasing or
 * "free" offers, and no brands PRO-KOM does not sell. One list for the seed tests, the import
 * (badges of katalog v2) and the e2e check of rendered pages.
 */

const BANNED_BRANDS = ['Novitus', 'Honeywell', 'Datalogic', 'Barracuda', 'Streamsoft', 'Verifone']

const RULES: { name: string; pattern: RegExp }[] = [
  // A number before "zł": "700 zł", "0 zł", "1 299,00 zł" — but not "4 złącza".
  { name: 'kwota w zł', pattern: /\d[\d\s.,]*\s?zł(?![\p{L}])/iu },
  { name: 'gratis', pattern: /\bgratis/iu },
  { name: 'w cenie', pattern: /\bw cenie\b/iu },
  { name: 'raty', pattern: /(?<![\p{L}])rat(y|ach|ami|alna|alny)?(?![\p{L}])/iu },
  { name: 'leasing', pattern: /leasing/iu },
  // K4-FINAL §1: the scope and reaction time are „ustalane” in the contract, not „zapisane”.
  {
    name: 'zapisujemy w umowie',
    // The verb only („zapisujemy”, „zapisany”) — „zapisy w umowie” is a plain noun.
    pattern: /(?<![\p{L}])zapis(?:uj|an)\p{L}*(?:\s+(?:go|je|ją))?\s+w\s+umowie/iu,
  },
  ...BANNED_BRANDS.map((brand) => ({
    name: `marka ${brand}`,
    pattern: new RegExp(`(?<![\\p{L}])${brand}(?![\\p{L}])`, 'iu'),
  })),
]

/**
 * Amounts that are not prices (K4-FINAL §1): the cash register relief „do 700 zł” (always with
 * „rozlicza księgowa”), the KSeF thresholds 10 000 zł and 200 mln zł, the terminal that „bywa za
 * 0 zł”. Only on the K4 subpages, where they stand with their explanation (`legalAmounts`); a
 * card badge like „Ulga do 700 zł” is still a price-like promise and is dropped.
 */
const ALLOWED_AMOUNTS: readonly RegExp[] = [
  /(?<![\p{L}])(?:do|maks\.?|maksymalnie)\s700\s?zł/giu,
  /(?<!\d)(?<!\d\s)10\s000\s?zł/giu,
  /(?<!\d)200\s?mln\s?zł/giu,
  /bywa za 0\s?zł/giu,
]

/**
 * Names of the rules a public text breaks; empty when the text may be shown. `legalAmounts`: the
 * K4 subpages (KSeF, ulga, InsERT) — the thresholds above are cut out before the check, any other
 * amount is still an error.
 */
export function forbiddenContent(text: string, { legalAmounts = false } = {}): string[] {
  const checked = legalAmounts
    ? ALLOWED_AMOUNTS.reduce((rest, allowed) => rest.replace(allowed, ' '), text)
    : text
  return RULES.filter((rule) => rule.pattern.test(checked)).map((rule) => rule.name)
}
