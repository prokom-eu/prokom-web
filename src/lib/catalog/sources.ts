/**
 * Links to the producer's pages and datasheets of a product (`Products.sources`, katalog v2).
 * Only absolute http(s) links: they are shown as links on the product page (B6).
 */
export function validateHttpUrls(value: string[] | null | undefined): true | string {
  for (const link of value ?? []) {
    if (!isHttpUrl(link)) return `Link musi zaczynać się od https:// albo http:// — „${link}”.`
  }
  return true
}

function isHttpUrl(link: string): boolean {
  if (/[\s\\]/.test(link)) return false
  try {
    const url = new URL(link)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}
