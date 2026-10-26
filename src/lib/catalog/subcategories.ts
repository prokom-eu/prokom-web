export type SubcategoryRow = { name?: string | null; slug?: string | null }

const key = (value: string | null | undefined) => value?.trim().toLowerCase() ?? ''

/**
 * Subcategories of one category (`CatalogCategories.subcategories`, K3): every name once (the
 * chips would mix) and every address once (two subcategories under one
 * `/oferta/<kategoria>/<adres>`). Rows without an address are only chips.
 */
export function validateSubcategories(rows: SubcategoryRow[] | null | undefined): true | string {
  const names = new Set<string>()
  const slugs = new Set<string>()
  for (const row of rows ?? []) {
    const name = key(row.name)
    if (name && names.has(name)) return `Podkategoria „${name}” jest na liście dwa razy.`
    if (name) names.add(name)
    const slug = key(row.slug)
    if (slug && slugs.has(slug)) return `Adres „${slug}” ma już inna podkategoria.`
    if (slug) slugs.add(slug)
  }
  return true
}
