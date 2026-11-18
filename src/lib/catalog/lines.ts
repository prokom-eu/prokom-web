import type { Line } from '../tenant/lines'

/**
 * Lines that serve the catalog routes (`/oferta`, `/produkt/…`, `/marki`, `/zapytanie`) —
 * one engine for two lines (ADR-029 pkt 1–2). On other domains the routes answer 404.
 */
export const CATALOG_LINES = ['biznes', 'instalacje'] as const satisfies readonly Line[]

/**
 * Instalacje opens its catalog by a deliberate switch, not as a side effect of data: one
 * published product must not put Biznes texts and unstyled pages on prokominstalacje.pl.
 * Turned on in `inst/k1-katalog`, together with the line's catalog texts and styles.
 */
export const INSTALACJE_CATALOG_ENABLED = false

function isCatalogLine(line: Line): boolean {
  return (CATALOG_LINES as readonly Line[]).includes(line)
}

/**
 * Whether the catalog routes are open for a tenant. Biznes always (no extra query on
 * production); Instalacje only when switched on and its catalog has published products —
 * no empty `/oferta` in Google.
 */
export function isCatalogOpen(
  line: Line,
  publishedProducts: number,
  instalacjeEnabled: boolean = INSTALACJE_CATALOG_ENABLED,
): boolean {
  if (line === 'biznes') return true
  if (line === 'instalacje' && !instalacjeEnabled) return false
  return isCatalogLine(line) && publishedProducts > 0
}
