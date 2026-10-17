import { BRAND_LINKS } from '@/lib/brand/lines'
import { toTelHref } from '@/lib/site/link'
import type { Line } from '@/lib/tenant/lines'

import { Container } from './ui/Container'
import { cx } from './ui/cx'

type Props = { line: Line; phone: string | null }

/**
 * Brand bar above the header: the PRO-KOM lines, the current one marked with the accent dash
 * (ADR-007 — one company, many lines). Hidden on phones (docs/strony/prokombiznes.md §3.1).
 */
export function BrandBar({ line, phone }: Props) {
  const tel = phone ? toTelHref(phone) : null
  return (
    <div data-surface="dark" className="hidden bg-surface-dark text-sm text-white sm:block">
      <Container className="flex items-center justify-between gap-6">
        <nav aria-label="Linie PRO-KOM">
          <ul className="flex flex-wrap items-center gap-x-5">
            {BRAND_LINKS.map((link) => {
              const current = link.line === line
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={current ? 'true' : undefined}
                    className={cx(
                      'relative inline-flex min-h-9 items-center',
                      'after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:rounded-full',
                      current ? 'font-bold after:bg-accent-on-dark' : 'hover:after:bg-white',
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        {phone && (
          <p>
            {tel ? (
              <a href={tel} className="font-bold underline-offset-4 hover:underline">
                {phone}
              </a>
            ) : (
              phone
            )}
          </p>
        )}
      </Container>
    </div>
  )
}
