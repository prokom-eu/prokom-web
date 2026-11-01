import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import type { SoftwareNavigation } from '@/lib/software/navigation'

type Props = { mega: SoftwareNavigation['mega'] }

/**
 * Icons of the columns in the order of the board (`stany/01-menu-oferta.jpg`): strony, systemy,
 * aplikacje, po wdrożeniu. The package has no icon field; a column past these shows none.
 */
const COLUMN_ICONS: readonly IconName[] = ['site', 'panel', 'bolt', 'target']

const LINK = 'block rounded-lg px-1.5 py-2 font-semibold text-ink hover:bg-surface-2'
const HEADING =
  'flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.1em] text-ink-2'

/**
 * Panel of „Oferta ▾” (spec. §3.1): link columns from `SiteSettings.software.navigation.mega`,
 * the full-offer card and the „Dla branż” chips.
 */
export function SwMegaMenu({ mega }: Props) {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-raised">
      <div className="grid grid-cols-[1fr_1fr_1fr_minmax(300px,1.15fr)] gap-6 p-5 pl-8">
        {/* Two columns side by side, the rest stacked in the third (board: „Po wdrożeniu”
            under „Aplikacje i automatyzacje”). */}
        {[mega.columns.slice(0, 1), mega.columns.slice(1, 2), mega.columns.slice(2)].map(
          (cell, c) => (
            <div key={c} className="space-y-6 py-3">
              {cell.map((column, i) => (
                <MegaColumn key={column.title} column={column} icon={COLUMN_ICONS[c + i]} />
              ))}
            </div>
          ),
        )}

        <aside
          aria-label={mega.card.eyebrow}
          className="rounded-2xl border border-accent-line bg-accent-soft p-6"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-accent-text">
            {mega.card.eyebrow}
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink">
            {mega.card.title}
          </p>
          <p className="mt-2 text-[15px] text-ink-2">{mega.card.text}</p>
          <Link
            href={mega.card.cta[1]}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-button px-6 font-bold text-accent-ink"
          >
            {mega.card.cta[0]}
          </Link>

          {/* Only active industries (SWV6 A1): none — no group at all. */}
          {mega.branze.links.length > 0 && (
            <>
              <h2 className="mt-6 text-sm font-extrabold uppercase tracking-[0.1em] text-ink-2">
                {mega.branze.label}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {mega.branze.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-9 items-center rounded-full bg-chip px-3 text-sm font-bold text-ink hover:bg-surface-3"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {mega.card.links.length > 0 && (
            <ul className="mt-5 space-y-2.5">
              {mega.card.links.map(([label, href], i) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      i === 0 ? 'font-bold text-ink hover:underline' : 'text-ink-2 hover:underline'
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}

function MegaColumn({
  column,
  icon,
}: {
  column: SoftwareNavigation['mega']['columns'][number]
  icon: IconName | undefined
}) {
  return (
    <section aria-label={column.title}>
      <h2 className={HEADING}>
        {icon && (
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
            <Icon name={icon} className="size-4" strokeWidth={2} />
          </span>
        )}
        {column.title}
      </h2>
      <ul className="mt-3 space-y-0.5">
        {column.links.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className={LINK}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
