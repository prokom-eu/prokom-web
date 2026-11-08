import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import type { OfferMenu } from '@/lib/catalog/menu'
import { plural } from '@/lib/plural'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'

import { SheetSearch } from './SheetSearch'

type Props = {
  offer: OfferMenu
  menu: PublicBiznesNavigation['menu']
}

const ROW =
  'flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 font-bold text-ink hover:bg-surface-2'

/**
 * The Biznes list in the shared „Menu” sheet (≤ 1080 px, ELEMENTY-WSPOLNE-BIZNES §1): the
 * catalog search, the departments as lists that unfold into their categories, then the other menu
 * entries from the panel. The sheet adds the contact card, the lines and the theme switch.
 */
export function BizSheetList({ offer, menu }: Props) {
  const links = menu.filter((item) => item.type === 'link' && item.href)
  return (
    <nav aria-label="Oferta i strony" className="flex flex-col gap-1">
      <SheetSearch />
      {offer.departments.map((department) => (
        <details key={department.slug} className="group rounded-2xl bg-card">
          <summary className={`${ROW} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-lg text-white"
                style={{
                  background: `linear-gradient(135deg, ${department.gradient[0]}, ${department.gradient[1]})`,
                }}
              >
                <Icon name={department.icon} className="size-4" />
              </span>
              {department.name}
            </span>
            <Icon
              name="arrow"
              className="size-3.5 rotate-90 transition-transform group-open:-rotate-90"
              strokeWidth={2.4}
            />
          </summary>
          <ul className="flex flex-col pb-2 pl-11">
            {department.categories.map((category) => (
              <li key={category.href}>
                <Link href={category.href} className={ROW}>
                  {category.label}
                  <span className="text-xs font-semibold text-ink-3">{category.count}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href={department.href} className={`${ROW} text-accent-text`}>
                Cały dział · {department.count}{' '}
                {plural(department.count, ['pozycja', 'pozycje', 'pozycji'])}
              </Link>
            </li>
          </ul>
        </details>
      ))}
      <ul className="mt-2 flex flex-col">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href ?? '/'} className={ROW}>
              {item.label}
              <Icon name="arrow" className="size-3.5" strokeWidth={2.4} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
