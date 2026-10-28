import type { Navigation } from '@/sites/instalacje/dane/types'

/** A published service or object as the menus need it (public fields of the panel). */
export type MenuDoc = {
  key: string
  slug: string | null
  name: string
  icon?: string | null
  color?: string | null
  menuCaption?: string | null
}

export type MenuEntry = {
  key: string
  label: string
  caption: string | null
  icon: string | null
  /** `#rrggbb` from the panel (validated there) — the service or object hue of the design. */
  color: string | null
  href: string
}

export type MenuColumn = { label: string; items: MenuEntry[] }

/** Menus of the Instalacje shell: the code layout filled with the panel's entries. */
export type InstMenu = {
  services: MenuColumn[]
  objects: MenuColumn[]
  /** „Pełna oferta: 10 obszarów, 76 rozwiązań” — counted from the published offer. */
  offer: { areas: number; solutions: number }
}

/** Address of a service page (`/monitoring`) or an object page (`/dla-kogo/dom`), spec §3. */
const serviceHref = (slug: string) => `/${slug}`
const objectHref = (slug: string) => `/dla-kogo/${slug}`

function columns(
  layout: { label: string; keys: readonly string[] }[],
  docs: MenuDoc[],
  href: (slug: string) => string,
  kind: 'service' | 'object',
  missing: string[],
): MenuColumn[] {
  const byKey = new Map(docs.map((doc) => [doc.key, doc]))
  return layout
    .map(({ label, keys }) => ({
      label,
      items: keys.flatMap((key): MenuEntry[] => {
        const doc = byKey.get(key)
        if (!doc?.slug) {
          missing.push(`${kind}:${key}`)
          return []
        }
        return [
          {
            key,
            label: doc.name,
            caption: doc.menuCaption ?? null,
            icon: doc.icon ?? null,
            color: doc.color ?? null,
            href: href(doc.slug),
          },
        ]
      }),
    }))
    .filter((column) => column.items.length > 0)
}

/**
 * Menus from the code layout (`dane/nawigacja.ts`: columns and order) and the panel (names,
 * captions, icons, colours by key — ADR-I002 „Pliki danych w kodzie”). A key the panel has not
 * published (or without an address) is left out and listed in `missing` for a log warning.
 */
export function buildMenu(
  navigation: Pick<Navigation, 'serviceColumns' | 'objectColumns'>,
  services: MenuDoc[],
  objects: MenuDoc[],
  offer: InstMenu['offer'],
): { menu: InstMenu; missing: string[] } {
  const missing: string[] = []
  const menu: InstMenu = {
    services: columns(navigation.serviceColumns, services, serviceHref, 'service', missing),
    objects: columns(navigation.objectColumns, objects, objectHref, 'object', missing),
    offer,
  }
  return { menu, missing }
}

/** Bottom bar tab of a page (MOBILE-APLIKACJA §3); `null` = none (planner, legal pages, 404). */
export type ShellTab = 'home' | 'services' | 'objects' | 'more' | null

/**
 * Where a page sits in the shell: its bottom bar tab and what the desktop header marks — the
 * „Usługi”/„Dla kogo” menu buttons, or the `href` of a header link (prototype `navKey`).
 */
export type ActiveSection = { tab: ShellTab; header: 'services' | 'objects' | string | null }

const inSection = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

export function activeSection(
  pathname: string,
  menu: InstMenu,
  navigation: Pick<Navigation, 'header' | 'more'>,
): ActiveSection {
  if (pathname === '/') return { tab: 'home', header: null }
  const services = menu.services.flatMap((c) => c.items.map((i) => i.href))
  // The full offer belongs to the services (prototype: „Pełna oferta” in the services menu).
  if (pathname === '/uslugi' || services.some((href) => inSection(pathname, href))) {
    return { tab: 'services', header: 'services' }
  }
  if (inSection(pathname, '/dla-kogo')) return { tab: 'objects', header: 'objects' }
  const link = navigation.header.find((item) => inSection(pathname, item.href))
  if (link) return { tab: 'more', header: link.href }
  if (navigation.more.some((item) => inSection(pathname, item.href))) {
    return { tab: 'more', header: null }
  }
  return { tab: null, header: null }
}
