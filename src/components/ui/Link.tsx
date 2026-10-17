import type { ComponentProps } from 'react'

import { cx } from './cx'

/**
 * Text link in the line's text colour (≥ 4.5:1); on a dark section it switches to the on-dark
 * accent by itself. A plain `<a>`: hrefs from the panel may be external, `tel:` or `mailto:`.
 */
export function Link({ className, ...props }: ComponentProps<'a'>) {
  return (
    <a
      className={cx(
        'font-semibold text-accent-text underline decoration-2 underline-offset-4 hover:decoration-accent',
        'in-data-[surface=dark]:text-accent-on-dark in-data-[surface=dark]:hover:decoration-white',
        className,
      )}
      {...props}
    />
  )
}
