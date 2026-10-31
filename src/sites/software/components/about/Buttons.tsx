import Link from 'next/link'

import { cx } from '@/components/ui/cx'

type ButtonLink = { label?: string | null; href?: string | null } | null | undefined

const BASE =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6 font-extrabold transition-transform active:scale-[0.98]'

/**
 * The two buttons of a Software subpage hero or CTA (boards `ONas`, `Wszystko`): primary on
 * `--button-bg`, secondary outlined; full width on the phone. Empty links are left out.
 */
export function Buttons({
  primary,
  secondary,
  className,
}: {
  primary?: ButtonLink
  secondary?: ButtonLink
  className?: string
}) {
  const links = [
    primary?.label && primary.href ? { ...primary, strong: true } : null,
    secondary?.label && secondary.href ? { ...secondary, strong: false } : null,
  ].filter((link): link is { label: string; href: string; strong: boolean } => Boolean(link))
  if (links.length === 0) return null
  return (
    <div className={cx('flex flex-col gap-2.5 min-[641px]:flex-row', className)}>
      {links.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className={cx(
            BASE,
            link.strong
              ? 'bg-button text-accent-ink shadow-raised'
              : 'border border-border bg-card text-ink',
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
