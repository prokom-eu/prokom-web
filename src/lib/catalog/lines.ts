import type { Line } from '../tenant/lines'

/**
 * Lines that serve the catalog routes (`/oferta`, `/produkt/…`, `/marki`, `/zapytanie`) —
 * one engine for two lines (ADR-029 pkt 1–2). On other domains the routes answer 404.
 */
export const CATALOG_LINES = ['biznes', 'instalacje'] as const satisfies readonly Line[]

export function isCatalogLine(line: Line): boolean {
  return (CATALOG_LINES as readonly Line[]).includes(line)
}

/**
 * Whether the catalog routes are open for a tenant. Biznes always (no extra query on
 * production); Instalacje only once its catalog has published products, so the routes stay
 * 404 until the import of INST-K1 — no empty `/oferta` in Google.
 */
export function isCatalogOpen(line: Line, publishedProducts: number): boolean {
  if (line === 'biznes') return true
  return isCatalogLine(line) && publishedProducts > 0
}
