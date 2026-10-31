import Link from 'next/link'

type Crumb = { name: string; href: string }

/**
 * Breadcrumbs of a Software subpage: „Strona główna › … › <strona>”, 44 px touch targets
 * (ZMIANY-v21 §10.5). `parents` are the levels between the start page and the current page
 * (a post: „Aktualności”, its category).
 */
export function Breadcrumbs({ current, parents = [] }: { current: string; parents?: Crumb[] }) {
  const links: Crumb[] = [{ name: 'Strona główna', href: '/' }, ...parents]
  return (
    <nav aria-label="Okruszki" className="text-sm text-ink-2">
      <ol className="flex flex-wrap items-center gap-1">
        {links.map((link) => (
          <li key={link.href} className="flex items-center gap-1">
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center px-1 hover:text-ink"
            >
              {link.name}
            </Link>
            <span aria-hidden="true">›</span>
          </li>
        ))}
        <li>
          <span aria-current="page" className="inline-flex min-h-11 items-center px-1">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}
