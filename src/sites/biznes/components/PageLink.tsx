import Link from 'next/link'
import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'

export type PageLinkKind = 'primary' | 'outline' | 'light' | 'outlineDark' | 'ok'

// Touch target ≥ 44 px. Primary: white label on the text accent (≥ 4.5:1 — ZMIANY-v20 §1:
// never dark text on blue); on the navy blocks white buttons; `ok` is the audit's green CTA,
// its label in `surface` (white on the dark green, dark on the night theme's light green).
const BASE =
  'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl px-6 py-2.5 text-center font-extrabold transition-[background-color,color,box-shadow]'

const KIND: Record<PageLinkKind, string> = {
  primary:
    'bg-accent-text text-accent-ink shadow-[0_14px_30px_-14px_var(--accent-text)] hover:bg-ink hover:text-surface',
  outline:
    'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]',
  light: 'bg-white text-surface-dark hover:bg-accent-soft',
  outlineDark: 'text-white ring-[1.5px] ring-white/35 ring-inset hover:bg-white/10',
  ok: 'bg-ok-text text-surface shadow-[0_14px_30px_-14px_var(--ok)] hover:bg-ink hover:text-surface',
}

type Props = {
  href: string
  kind?: PageLinkKind
  arrow?: boolean
  className?: string
  children: ReactNode
}

/** Call-to-action link of the Biznes subpages (plansze Dzial, Gopos, Insert). */
export function PageLink({ href, kind = 'primary', arrow = false, className, children }: Props) {
  return (
    <Link href={href} className={cx(BASE, KIND[kind], className)}>
      {children}
      {arrow && <Icon name="arrow" strokeWidth={2.4} className="size-[18px] shrink-0" />}
    </Link>
  )
}

/** Both fields of an optional `linkGroup` filled in: a link to render. */
export function hasLink(
  link: { label?: string | null; href?: string | null } | null | undefined,
): link is { label: string; href: string } {
  return Boolean(link?.label && link.href)
}
