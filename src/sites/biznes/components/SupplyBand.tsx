import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'

/**
 * A hook-in of a „Zaopatrzenie firm” page (plan 0611 §6.4): one line of text and a link, on the
 * accent tint. Category grid (#2) and the configurator (#5) — texts from the panel.
 */
export function SupplyBand({
  text,
  links,
  className,
}: {
  text: string
  links: readonly { label: string; href: string }[]
  className?: string
}) {
  return (
    <div
      data-supply-band
      className={cx(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl bg-accent-soft px-5 py-3',
        className,
      )}
    >
      <p className="font-extrabold text-ink">{text}</p>
      <div className="flex flex-wrap gap-x-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center gap-2 font-extrabold text-h1-accent underline-offset-4 hover:underline"
          >
            {link.label}
            <Icon name="arrow" strokeWidth={2.4} className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  )
}
