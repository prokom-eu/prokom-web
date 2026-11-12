import type { IconName } from '../../lib/catalog/options'
import { cx } from './cx'
import { ICON_PATHS } from './icons'

type Props = {
  name: IconName
  /** Accessible name; without it the icon is decorative and hidden from screen readers. */
  title?: string
  /** Stroke of the design: 1.9, small icons 2–2.2. */
  strokeWidth?: number
  className?: string
}

/**
 * Line icon of the design set (ADR-012 §4), drawn inline in `currentColor` — no icon library.
 * Size comes from `className` (default 1.25rem).
 */
export function Icon({ name, title, strokeWidth = 1.9, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('size-5 shrink-0', className)}
      data-icon={name}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
      focusable="false"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}
