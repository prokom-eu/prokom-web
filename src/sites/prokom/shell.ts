/*
 * Data of the hub's shell (spec §5): menu of the capsule, the „Oferta” mega menu, the sheet and the
 * footer columns — pure functions over the panel data, so the rules (v1.1 flags, Gaming only when
 * published, 6 services per line) are tested without rendering.
 */
import type { HubServiceView } from '@/lib/prokom/data'
import { iconForService } from '@/lib/prokom/icons'
import { type HubLine, isHubLine } from '@/lib/prokom/lines'
import { type HubPageFlags, isHubLinkLive } from '@/lib/prokom/pages'
import type { IconName } from '@/lib/shared/icons'
import type { SharedLine } from '@/lib/shared/project'

export type HubLink = { label: string; href: string }
export type HubNavItem = HubLink & { key: string }

/** The capsule menu after „Oferta ▾” (spec §5.2); pages of v1.1 only when switched on. */
const NAV: readonly HubLink[] = [
  { label: 'Dla firm', href: '/dla-firm' },
  { label: 'Dla domu', href: '/dla-domu' },
  { label: 'Inwestycje i dostawy', href: '/inwestycje-i-dostawy' },
  { label: 'Załatw online', href: '/zalatw-online' },
  { label: 'Pomoc', href: '/pomoc' },
  { label: 'O firmie', href: '/o-firmie' },
  { label: 'Kontakt', href: '/kontakt' },
]

/** Items hidden at 1081–1340 px (spec §5.2): they are in the footer and in the sheet. */
export const NARROW_HIDDEN: readonly string[] = ['/pomoc', '/o-firmie']

export function hubNav(flags: HubPageFlags): HubNavItem[] {
  return NAV.filter((link) => isHubLinkLive(link.href, flags)).map((link) => ({
    ...link,
    key: link.href,
  }))
}

/** „Zacznij od siebie” (board Naglowek): mega menu, sheet and footer. */
const START: readonly (HubLink & { sub: string; icon: IconName })[] = [
  { label: 'Dla firm', href: '/dla-firm', sub: 'Kasa, IT, obiekt, strona', icon: 'brief' },
  { label: 'Dla domu', href: '/dla-domu', sub: 'Instalacje, naprawy, gaming', icon: 'home' },
  {
    label: 'Inwestycje i dostawy',
    href: '/inwestycje-i-dostawy',
    sub: 'Większe zamówienia IT, RTV i AGD',
    icon: 'box',
  },
  {
    label: 'Współpraca',
    href: '/wspolpraca',
    sub: 'Architekci, deweloperzy, wykonawcy',
    icon: 'building',
  },
  {
    label: 'Załatw online',
    href: '/zalatw-online',
    sub: 'Zgłoszenia, wyceny, status naprawy',
    icon: 'bolt',
  },
]

export type StartLink = (typeof START)[number]

export function startLinks(flags: HubPageFlags): StartLink[] {
  return START.filter((link) => isHubLinkLive(link.href, flags))
}

/** Sheet on a phone (board Naglowek `mobLinks`): start links + help, company, contact, news. */
const SHEET_MORE: readonly (HubLink & { icon: IconName })[] = [
  { label: 'Co zrobić, gdy…', href: '/pomoc', icon: 'help' },
  { label: 'O firmie', href: '/o-firmie', icon: 'info' },
  { label: 'Kontakt', href: '/kontakt', icon: 'phone' },
  { label: 'Aktualności', href: '/aktualnosci', icon: 'news' },
]

export function sheetLinks(flags: HubPageFlags): (HubLink & { icon: IconName })[] {
  return [
    ...startLinks(flags).map(({ label, href, icon }) => ({ label, href, icon })),
    ...SHEET_MORE.filter((link) => isHubLinkLive(link.href, flags)),
  ]
}

export type MegaService = { key: string; title: string; short: string; icon: IconName }
export type MegaLine = {
  key: HubLine
  name: string
  description: string | null
  url: string | null
  domain: string | null
  services: MegaService[]
  count: number
}

/** Services shown per line in the mega menu (board: 6). */
export const MEGA_SERVICES = 6

/**
 * Lines of the „Oferta” mega menu (spec §5.2): the published lines of `CompanyData` in their order
 * (Gaming only after its start, ADR-022 pkt 7), each with its first services of `HubServices`.
 */
export function megaLines(lines: readonly SharedLine[], services: readonly HubServiceView[]) {
  return lines.flatMap((line): MegaLine[] => {
    if (!isHubLine(line.key)) return []
    const own = services.filter((service) => service.line === line.key)
    return [
      {
        key: line.key,
        name: line.name,
        description: line.description,
        url: line.url,
        domain: line.domain,
        count: own.length,
        services: own.slice(0, MEGA_SERVICES).map((service) => ({
          key: service.key,
          title: service.title,
          short: service.short,
          icon: iconForService(service.title),
        })),
      },
    ]
  })
}

export type FooterColumnData = { heading: string; links: HubLink[] }

/**
 * Footer columns (spec §5.5): „Cała oferta” from the published lines, then the panel's columns
 * (`shared.footerColumns`) without links to pages that are off.
 */
export function footerColumns(
  lines: readonly SharedLine[],
  panel: readonly { heading?: string | null; links?: { label: string; href: string }[] | null }[],
  flags: HubPageFlags,
): FooterColumnData[] {
  const offer: FooterColumnData = {
    heading: 'Cała oferta',
    links: lines
      .filter((line) => isHubLine(line.key) && line.url)
      .map((line) => ({ label: `PRO-KOM ${line.name}`, href: line.url! })),
  }
  const own = panel.map((column) => ({
    heading: column.heading ?? '',
    links: (column.links ?? [])
      .filter((link) => isHubLinkLive(link.href, flags))
      .map((link) => ({ label: link.label, href: link.href })),
  }))
  return [offer, ...own].filter((column) => column.heading && column.links.length > 0)
}

/** A link of the panel (tab bar, rail action) only when its page exists. */
export function liveLink<T extends { href?: string | null }>(
  link: T | null | undefined,
  flags: HubPageFlags,
): (T & { href: string }) | null {
  return link?.href && isHubLinkLive(link.href, flags) ? { ...link, href: link.href } : null
}
