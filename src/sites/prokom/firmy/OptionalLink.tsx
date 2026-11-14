import type { ReactNode } from 'react'

/** A card that links where its line has a site, plain otherwise (never `<a>` without `href`). */
export function OptionalLink({
  href,
  className,
  children,
}: {
  href: string | null
  className: string
  children: ReactNode
}) {
  return href ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  )
}
