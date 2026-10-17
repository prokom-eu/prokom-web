import type { ComponentProps } from 'react'

import { cx } from './cx'

export type ButtonVariant = 'primary' | 'secondary'

// Touch target ≥ 44 px. Primary: `accent-ink` label on the text accent (≥ 4.5:1, themes.test.ts);
// on a dark block white with the block's colour — the accent stands out too little on navy.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-bold transition-colors'

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-text text-accent-ink hover:bg-ink hover:text-surface in-data-[surface=dark]:bg-white in-data-[surface=dark]:text-surface-dark in-data-[surface=dark]:hover:bg-white in-data-[surface=dark]:hover:underline',
  secondary:
    'border-2 border-accent-text text-accent-text hover:bg-surface-2 in-data-[surface=dark]:border-white in-data-[surface=dark]:text-white in-data-[surface=dark]:hover:bg-white in-data-[surface=dark]:hover:text-surface-dark',
}

type Common = { variant?: ButtonVariant }
type AsLink = Common & ComponentProps<'a'> & { href: string }
type AsButton = Common & ComponentProps<'button'> & { href?: undefined }

/** Call to action: a link when it has `href` (most CTAs), otherwise a real `<button>`. */
export function Button(props: AsLink | AsButton) {
  if (props.href !== undefined) {
    const { variant = 'primary', className, ...rest } = props
    return <a className={cx(BASE, VARIANT[variant], className)} {...rest} />
  }
  const { variant = 'primary', className, type = 'button', ...rest } = props
  return <button type={type} className={cx(BASE, VARIANT[variant], className)} {...rest} />
}
