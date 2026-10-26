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
  ...BANNED_BRANDS.map((brand) => ({
    name: `marka ${brand}`,
    pattern: new RegExp(`(?<![\\p{L}])${brand}(?![\\p{L}])`, 'iu'),
  })),
]

/** Names of the rules a public text breaks; empty when the text may be shown. */
export function forbiddenContent(text: string): string[] {
  return RULES.filter((rule) => rule.pattern.test(text)).map((rule) => rule.name)
}
