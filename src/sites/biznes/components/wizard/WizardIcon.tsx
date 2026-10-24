import type { WizardIconName } from '@/lib/catalog/wizard'

/** Paths of the board `Kreator` (`KRIC`, `KRN`): 24 × 24, stroke 1.9, round caps (ADR-012 §4). */
const PATHS: Record<WizardIconName, string> = {
  cart: 'M3 4h2l2.2 10.5a1 1 0 001 .8h9.4a1 1 0 001-.8L20 7.5H6 M9 20a1 1 0 100-2 1 1 0 000 2z M17 20a1 1 0 100-2 1 1 0 000 2z',
  fork: 'M7 3v7 M5 3v5a2 2 0 004 0V3 M7 10v11 M17 21V3c-2.2 1.3-3.5 3.8-3.5 7v3H17',
  bed: 'M3 19V6 M3 15h18v4 M21 15v-3a3 3 0 00-3-3h-7v6 M7 12.5a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z',
  calc: 'M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z M8 6.5h8v3.5H8z M8.5 14h.01 M12 14h.01 M15.5 14h.01 M8.5 17.5h.01 M12 17.5h.01 M15.5 17.5h.01',
  car: 'M4 13l1.8-5a2 2 0 011.9-1.3h8.6a2 2 0 011.9 1.3L20 13 M3 13h18v4H3z M6.5 17v2 M17.5 17v2 M7 15h.01 M17 15h.01',
  cross: 'M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z',
  cap: 'M2 9l10-5 10 5-10 5L2 9z M6 11v5c2.5 2 9.5 2 12 0v-5 M22 9v5',
  factory: 'M3 21V10l5 3v-3l5 3v-3l5 3V4h3v17H3z M7 17h2 M12 17h2 M17 17h1',
  truck:
    'M2 9h12v8H2z M14 12h4l3 3v2h-7 M2 9l1.5-3h9L14 9 M6 19.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M17 19.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  plus: 'M12 5v14 M5 12h14',
  register: 'M3 7h18v10H3z M3 10h18 M7 14h4',
  pos: 'M4 5h16v11H4z M8 20h8 M12 16v4 M8 9h8 M8 12h5',
  terminal: 'M6 2h12v20H6z M9 6h6 M9 10h6 M12 17h.01',
  program: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h5',
  booking: 'M3 19V6 M3 15h18v4 M21 15v-3a3 3 0 00-3-3h-7v6',
  ksef: 'M4 4h16v16H4z M8 9h8 M8 13h8 M8 17h5',
  laptop: 'M4 5h16v10H4z M2 19h20',
  wifi: 'M5 12.5a10 10 0 0114 0 M8.5 16a5 5 0 017 0 M12 19.5h.01 M2 9a15 15 0 0120 0',
  backup: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  shield: 'M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3z',
  screen: 'M3 4h18v12H3z M8 20h8 M12 16v4',
  care: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 16a4 4 0 100-8 4 4 0 000 8z M5.6 5.6l3.6 3.6 M14.8 14.8l3.6 3.6 M18.4 5.6l-3.6 3.6 M9.2 14.8l-3.6 3.6',
  signature: 'M3 17c3-1 4-6 6-6s1 6 4 6 4-4 6-4 M3 21h18',
}

/** A line icon of the wizard tiles; decorative — the tile's text names it. */
export function WizardIcon({ name, className }: { name: WizardIconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d={PATHS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
