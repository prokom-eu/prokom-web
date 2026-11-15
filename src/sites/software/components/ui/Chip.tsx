import type { ComponentProps } from 'react'

import { cx } from '@/components/ui/cx'

/**
 * Chip of Software v24: a small rounded label, or a toggle when it is a button (`pressed` →
 * `aria-pressed`, accent soft fill and edge). Touch target ≥ 44 px as a button.
 */
export function Chip({
  pressed,
  className,
  ...rest
}: { pressed?: boolean } & ComponentProps<'button'>) {
  return (
    <button type="button" aria-pressed={pressed} className={cx('sw-chip', className)} {...rest} />
  )
}

/** A chip that only labels (no action): a `<span>` with the same look. */
export function ChipLabel({ className, ...rest }: ComponentProps<'span'>) {
  return <span className={cx('sw-chip', className)} {...rest} />
}
