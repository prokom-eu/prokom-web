/**
 * Icons of the Software frame that the shared set (`ICON_NAMES`) lacks. They are not content
 * picked in the panel, so they stay here instead of growing the database enum (a migration).
 * Paths from the board `Main` (header and bottom bar).
 */

type Props = { className?: string }

const SVG = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
} as const

/** The wizard („Kreator 60 s”). */
export function WandIcon({ className = 'size-4' }: Props) {
  return (
    <svg {...SVG} strokeWidth={2.2} className={className}>
      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
    </svg>
  )
}

export function ChevronIcon({ open, className = 'size-4' }: Props & { open: boolean }) {
  return (
    <svg
      {...SVG}
      strokeWidth={2.4}
      className={`${className} transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** „Menu” of the bottom bar. */
export function MenuIcon({ className = 'size-6' }: Props) {
  return (
    <svg {...SVG} strokeWidth={2} className={className}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  )
}
