import type { ComponentProps } from 'react'

import { Container } from './Container'
import { cx } from './cx'

export type Surface = 'default' | 'muted' | 'dark'

const SURFACE: Record<Surface, string> = {
  default: 'bg-surface text-ink',
  muted: 'bg-surface-2 text-ink',
  dark: 'bg-surface-dark text-white',
}

type Props = ComponentProps<'section'> & { surface?: Surface }

/**
 * Page section on one of the line's backgrounds (surface → surface-2 → dark rhythm), content in a
 * `Container`. `data-surface="dark"` lets links and focus switch to the on-dark accent.
 */
export function Section({ surface = 'default', className, children, ...props }: Props) {
  return (
    <section
      data-surface={surface === 'dark' ? 'dark' : undefined}
      className={cx('py-12 sm:py-16', SURFACE[surface], className)}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  )
}
