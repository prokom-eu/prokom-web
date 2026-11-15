/**
 * Cascade order of the page stylesheets (paths from `src/sites/instalacje`). Files share
 * selectors (e.g. `.zkticket` in glowna-sekcje and zaplanuj, `.odi` in oferta and teletechnika),
 * so every page module (`glowna.tsx`, `usluga-*.tsx`…) imports its sheets in this order — a new
 * sheet goes into this list first (`style.test.ts`). The order holds on a page opened directly;
 * after client navigation React appends the next page's new sheets at the end, so rules that
 * depend on it must not differ between files.
 */
export const PAGE_SHEET_ORDER = [
  'widzety/architekci/architekci.css',
  'widzety/glowna/glowna.css',
  'sekcje/sceny.css',
  'sekcje/sceny-ruch.css',
  'sekcje/glowna/glowna-sekcje.css',
  'sekcje/glowna/podhale-proces.css',
  'widzety/zaplanuj/zaplanuj.css',
  'widzety/serwis/serwis.css',
  'widzety/oferta/oferta.css',
  'widzety/realizacje/realizacje.css',
  'widzety/firma/firma.css',
  'widzety/alarmy/alarmy.css',
  'widzety/anteny/anteny.css',
  'widzety/dostep/dostep.css',
  'widzety/sieci/sieci.css',
  'widzety/teletechnika/teletechnika.css',
  'widzety/monitoring/monitoring.css',
  'widzety/smart/smart.css',
  'widzety/ekrany/ekrany.css',
  'widzety/ladowarki/ladowarki.css',
  'widzety/naglosnienie/naglosnienie.css',
] as const
