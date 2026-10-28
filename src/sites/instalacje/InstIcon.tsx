import { INST_ICONS, isInstIconName } from './icons'

type Props = {
  /** A key of `INST_ICONS`; an unknown name (a panel typo) draws nothing. */
  name: string | null | undefined
  size?: number
  strokeWidth?: number
  className?: string
}

/** Stroke icon of the Instalacje design (`<!--i:P.name:18-->` in the prototype, ADR-I003 §2). */
export function InstIcon({ name, size = 18, strokeWidth = 2, className }: Props) {
  if (!name || !isInstIconName(name)) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={INST_ICONS[name]} />
    </svg>
  )
}
