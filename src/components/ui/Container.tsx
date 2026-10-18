import type { ComponentProps } from 'react'

import { cx } from './cx'

type Props = ComponentProps<'div'> & {
  /** `wide`: 1280 px, the page width of the Biznes design (header, mega menu). */
  wide?: boolean
}

/** Page width with side gutters (16 px on a phone). */
export function Container({ className, wide = false, ...props }: Props) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        wide ? 'max-w-7xl' : 'max-w-6xl',
        className,
      )}
      {...props}
    />
  )
}
