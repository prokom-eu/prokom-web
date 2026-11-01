import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import type { InstOfferBlock } from '@/payload-types'

type Props = {
  hero: InstOfferBlock['hero']
  /** Breadcrumb when the panel leaves it empty. */
  crumb: string
  /** Eyebrow when the panel leaves it empty (e.g. with counts from the data). */
  eyebrow?: string | null
  /** Middle breadcrumb (the guide post: „Poradnik”). */
  parent?: { label: string; href: string }
  className?: string
  style?: CSSProperties
  /** Under the title row (the offer's search bar, the filters). */
  children?: ReactNode
}

/**
 * The hero of the I12 pages (`Oferta`, `Realizacje`, `Poradnik` `.phero`): breadcrumbs, then the
 * eyebrow and h1 beside the lead (`.split`), the page's controls under them. The hero texts come
 * from the panel (`formPageFields`); the block carries the page's h1.
 */
export function SplitHero({ hero, crumb, eyebrow, parent, className, style, children }: Props) {
  const label = hero?.eyebrow || eyebrow
  return (
    <section id="hero" className={['phero', className].filter(Boolean).join(' ')} style={style}>
      <div className="hgrid" />
      <div className="hglow" />
      <div className="wrap" style={{ position: 'relative' }}>
        <nav className="crumb in d1" aria-label="Okruszki">
          <Link href="/">Start</Link>
          <span aria-hidden="true">/</span>
          {parent && (
            <>
              <Link href={parent.href}>{parent.label}</Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span aria-current="page" style={{ color: 'var(--ink)' }}>
            {hero?.crumb || crumb}
          </span>
        </nav>
        <div className="split" style={{ marginTop: 22, alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {label && <span className="eye in d1">{label}</span>}
            <h1 className="h1 in d2">
              {hero?.h1a}
              {hero?.h1b && (
                <>
                  {' '}
                  <span className="acc">{hero.h1b}</span>
                </>
              )}
            </h1>
          </div>
          {hero?.lead && <p className="lead in d3">{hero.lead}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}
