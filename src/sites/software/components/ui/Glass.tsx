import type { HTMLAttributes } from 'react'

import { cx } from '@/components/ui/cx'

/**
 * Glass card of Software v24 (ZMIANY-v24 §1, ADR-015 v24 pkt 3): the translucent `--glass-card` on
 * the page with a hairline edge. `featured`: the one highlighted card of a group, with the violet
 * glow (closed list of glow places, §1). `rise`: comes in on scroll (`data-rise`, motion.css).
 */
export function Glass({
  as: Component = 'div',
  featured = false,
  rise = false,
  className,
  ...rest
}: {
  as?: 'div' | 'article' | 'li' | 'section'
  featured?: boolean
  rise?: boolean
} & HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cx('sw-glass', featured && 'sw-glass-featured', className)}
      data-rise={rise || undefined}
      {...rest}
    />
  )
}
