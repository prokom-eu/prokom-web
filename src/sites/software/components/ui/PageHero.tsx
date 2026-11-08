import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'

import { Breadcrumbs } from '../Breadcrumbs'
import { SectionHead } from './SectionHead'

type Crumb = { name: string; href: string }

type Props = {
  /** Last breadcrumb (the page itself) and the levels above it. */
  crumb: string
  parents?: Crumb[]
  eyebrow: string
  title: string
  /** Second part of the H1, in the hero gradient (`.sw-em-hero`). */
  em?: string | null
  lead?: string | null
  /** Under the lead (tiles, facts, buttons). */
  children?: ReactNode
  /** Right column on wide screens (a form, a card); under the text on a phone. */
  aside?: ReactNode
  className?: string
}

/**
 * Hero of a Software v24 subpage (ZMIANY-v24 §6.2, §9.8; boards `AU-oferta`, `AU-audyt`,
 * `AU-aktualnosci`): breadcrumbs, eyebrow, H1 with its highlighted part, lead, the violet glow
 * behind (closed list of glow places, ADR-015 v24). One per page — it carries the H1.
 */
export function PageHero({
  crumb,
  parents,
  eyebrow,
  title,
  em,
  lead,
  children,
  aside,
  className,
}: Props) {
  return (
    <section className={cx('sw-page-hero', className)}>
      <div className={cx('v-wrap sw-page-hero-in', aside != null && 'sw-page-hero-split')}>
        <div className="min-w-0">
          <Breadcrumbs current={crumb} parents={parents} />
          <SectionHead
            level="h1"
            eyebrow={eyebrow}
            title={title}
            em={em}
            lead={lead}
            width="max-w-[880px]"
            className="mt-4"
          />
          {children}
        </div>
        {aside != null && <div className="sw-page-hero-aside">{aside}</div>}
      </div>
    </section>
  )
}
