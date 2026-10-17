import type { ComponentProps } from 'react'

import { Container } from './Container'
import { cx } from './cx'

export type Surface = 'white' | 'papier' | 'dark'

const SURFACE: Record<Surface, string> = {
  white: 'bg-white text-grafit',
  papier: 'bg-papier text-grafit',
  dark: 'bg-grafit text-white',
}

type Props = ComponentProps<'section'> & { surface?: Surface }

/**
 * Page section on one of the brand backgrounds (white → papier → grafit rhythm), content in a
 * `Container`. `data-surface="dark"` lets links and focus switch to the on-dark accent.
 */
export function Section({ surface = 'white', className, children, ...props }: Props) {
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
