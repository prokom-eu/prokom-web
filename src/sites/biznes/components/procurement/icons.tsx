import { cx } from '@/components/ui/cx'
import { ICON_PATHS } from '@/components/ui/icons'
import { isIconName } from '@/lib/shared/icons'

/** Rounded rectangle as path data (the prototype draws some icons with `<rect>`). */
function rect(x: number, y: number, w: number, h: number, r = 0): string {
  if (!r) return `M${x} ${y}h${w}v${h}h${-w}z`
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 01${r} ${r}v${h - 2 * r}a${r} ${r} 0 01${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 01${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 01${r} ${-r}z`
}

/** Circle as path data. */
function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`
}

/**
 * Icons of the „Zaopatrzenie firm” prototype (`ico`, ZAOPATRZENIE §2) that the shared set does
 * not have, or draws differently. Kept with the procurement pages, not in the shared icon set
 * (strefa wspólna, ADR-022): names the data uses, viewBox 24, stroke only.
 */
const PATHS: Record<string, string> = {
  check: 'M5 12.5l4.5 4.5L19 7',
  plus: 'M12 5v14M5 12h14',
  crane: 'M4 21V5l8-2v18M4 9h16M16 9v5M2 21h20',
  key: `${circle(8, 15, 4)}M11 12l9-9M17 6l3 3M15 8l2 2`,
  bed: 'M3 18V6M3 14h18v4M21 14v-3a3 3 0 00-3-3h-7v6M7 11a2 2 0 100-4 2 2 0 000 4z',
  office: `${rect(4, 3, 16, 18, 1)}M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3`,
  laptop: `${rect(4, 5, 16, 11, 1.5)}M2 19h20`,
  school: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',
  shop: 'M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  cloud: 'M7 18a5 5 0 01-.6-10A6 6 0 0118 9a4.5 4.5 0 01-1 9z',
  ruler: 'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
  quiet: 'M11 5L6 9H3v6h3l5 4zM16 9l5 5M21 9l-5 5',
  hand: 'M8 13V5a2 2 0 014 0v6M12 11V4a2 2 0 014 0v7M16 11V6a2 2 0 014 0v8a7 7 0 01-7 7h-1a7 7 0 01-6-3l-3-5a2 2 0 013-2l2 2',
  tv: `${rect(3, 5, 18, 12, 1.5)}M8 21h8M12 17v4`,
  copy: `${rect(8, 8, 13, 13, 2)}M16 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h3`,
  chip: `${rect(6, 6, 12, 12, 2)}M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4`,
  lock: `${rect(4, 11, 16, 10, 2)}M8 11V7a4 4 0 018 0v4`,
  user: `${circle(12, 8, 4)}M4 21a8 8 0 0116 0`,
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3',
  wrench: 'M15 7a4 4 0 00-5.3 5.1L4 17.8 6.2 20l5.7-5.7A4 4 0 0017 9l-2.4 2.4-2-2z',
  keyboard: `${rect(2, 6, 20, 12, 2)}M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10`,
  pause: 'M9 6v12M15 6v12',
}

/** Path data of an icon by name, or `null` for a name nobody draws (it then renders nothing). */
export function iconPath(name: string): string | null {
  if (Object.hasOwn(PATHS, name)) return PATHS[name]!
  return isIconName(name) ? ICON_PATHS[name] : null
}

/** A decorative line icon of the procurement pages; an unknown name renders nothing. */
export function ProcIcon({ name, className }: { name: string; className?: string }) {
  const d = iconPath(name)
  if (!d) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('zp-i', className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}
