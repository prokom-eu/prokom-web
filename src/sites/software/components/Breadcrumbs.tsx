import Link from 'next/link'

/**
 * Breadcrumbs of a Software subpage with one level (`/kontakt`, `/cennik`, `/audyt`): „Strona
 * główna › <strona>”, 44 px touch targets (ZMIANY-v21 §10.5).
 */
export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Okruszki" className="text-sm text-ink-2">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="inline-flex min-h-11 items-center px-1 hover:text-ink">
            Strona główna
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li>
          <span aria-current="page" className="inline-flex min-h-11 items-center px-1">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}
