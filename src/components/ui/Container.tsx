import type { ComponentProps } from 'react'

import { cx } from './cx'

/** Page width with side gutters (16 px on a phone). */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cx('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)} {...props} />
  )
}
