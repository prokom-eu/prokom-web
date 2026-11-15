export type CatalogCounts = { products: number; brands: number }

/**
 * Numbers of the catalog in a text from the panel (home page leads, spec. §4: „liczby z bazy”):
 * `{produkty}` → listed products, `{marki}` → brands. Other braces stay as typed.
 */
export function fillCatalogCounts(text: string, counts: CatalogCounts): string {
  return text
    .replaceAll('{produkty}', String(counts.products))
    .replaceAll('{marki}', String(counts.brands))
}
