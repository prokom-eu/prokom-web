import Link from 'next/link'

import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import { ICON_BUTTON } from '@/components/ui/iconButton'
import { CONTACT_PATH } from '@/lib/biznes/mobileNav'
import { BUNDLES_PATH } from '@/lib/catalog/bundle'
import { VENDING_PATH } from '@/lib/catalog/category'
import { PLAN_PATH } from '@/lib/catalog/floorPlan'
import type { OfferMenu } from '@/lib/catalog/menu'
import type { IconName } from '@/lib/catalog/options'
import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import { plural } from '@/lib/plural'
import { NEWS_PATH } from '@/lib/posts/list'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'

type Props = {
  /** Menu items of the panel; Oferta becomes the department tiles. */
  items: PublicBiznesNavigation['menu']
  offer: OfferMenu
  /** Status confirmed in the panel per partner name, e.g. `{ GoPOS: 'Autoryzowany partner' }`. */
  partnerStatuses: Readonly<Record<string, string>>
  phone: { label: string; href: string } | null
}

const ABOUT_PATH = '/o-firmie'

/** Pages of the line that live in the chips row, not in the list (board `App-Menu`). */
const CHIPS = [
  { label: 'O firmie', href: ABOUT_PATH },
  { label: 'Konfigurator', href: CONFIGURATOR_PATH },
  { label: 'Aktualności', href: NEWS_PATH },
  { label: 'Kontakt i dojazd', href: CONTACT_PATH },
]
const IN_CHIPS = new Set(CHIPS.map((chip) => chip.href))

/** Icons of the list rows by address; panel items without one get the arrow. */
const ROW_ICONS: Readonly<Record<string, IconName>> = {
  [BUNDLES_PATH]: 'box',
  [PLAN_PATH]: 'map',
  [VENDING_PATH]: 'cash',
  '/marki': 'star',
  '/opieka-it': 'shield',
  '/gopos': 'card',
  '/insert': 'doc',
}

type Row = { label: string; href: string; count?: number; status?: string }

const positions = (n: number) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])}`

/**
 * Content of the phone menu sheet (MOBILE-APLIKACJA §1, K4-FINAL §7, board `App-Menu`): the
 * departments as coloured tiles with their counts, then Gotowe zestawy, Plan Twojej firmy, the
 * panel's menu items (partners with the status confirmed in the panel under the name, full
 * wording — K4-FINAL §1) and Automaty vendingowe; chips to the remaining pages, the theme switch and the call
 * button. No „highlights” of the old mega menu — their labels are forbidden since K4.
 * Links `replace` the sheet's own history entry (`BottomSheet` `closeOnBack`): „back” and the
 * header's „←” then lead to the page the menu was opened on, not to the same page again.
 */
export function MobileMenuContent({ items, offer, partnerStatuses, phone }: Props) {
  const rows: Row[] = [
    ...(offer.totals.bundles > 0
      ? [{ label: 'Gotowe zestawy', href: BUNDLES_PATH, count: offer.totals.bundles }]
      : []),
    { label: 'Plan Twojej firmy', href: PLAN_PATH },
    ...items.flatMap((item): Row[] => {
      if (item.type === 'offer' || !item.href || IN_CHIPS.has(item.href)) return []
      const status = item.partner ? partnerStatuses[item.label] : undefined
      return [{ label: item.label, href: item.href, ...(status && { status }) }]
    }),
    { label: 'Automaty vendingowe', href: VENDING_PATH },
    // A panel item with the address of a fixed row (e.g. /zestawy) shows once.
  ].filter((row, i, all) => all.findIndex((other) => other.href === row.href) === i)

  return (
    <div className="mt-4 flex flex-col gap-5">
      {offer.departments.length > 0 && (
        <ul className="grid grid-cols-2 gap-2.5">
          {offer.departments.map((department, i) => (
            <li
              key={department.slug}
              // An odd last tile takes the whole row, as on the board.
              className={
                i === offer.departments.length - 1 && i % 2 === 0 ? 'col-span-2' : undefined
              }
            >
              <Link
                href={department.href}
                replace
                className="flex min-h-[7.5rem] h-full flex-col justify-between gap-3 rounded-[22px] p-3.5 text-white"
                // Department colours are data of the record (ADR-012). White text sits on the
                // dark end only, deepened toward the corner: the light end fails AA under text.
                style={{
                  backgroundImage: `linear-gradient(135deg, ${department.gradient[0]}, color-mix(in srgb, ${department.gradient[0]} 70%, var(--surface-dark)))`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 items-center justify-center rounded-xl bg-white/20"
                >
                  <Icon name={department.icon} className="size-5" strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-display text-[1.02rem] font-extrabold leading-tight">
                    {department.name}
                  </span>
                  <span className="text-[0.82rem] font-bold text-white/85">
                    {positions(department.count)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.href}>
            <Link
              href={row.href}
              replace
              className="flex min-h-14 items-center gap-3 font-bold text-ink"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text"
              >
                <Icon name={ROW_ICONS[row.href] ?? 'arrow'} className="size-5" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                {row.label}
                {/* Status in its full wording, as the footer badges (K4-FINAL §1, §7). */}
                {row.status && (
                  <span className="block text-sm font-semibold text-ink-2">{row.status}</span>
                )}
              </span>
              {row.count !== undefined && (
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-bold text-ink-2">
                  {row.count}
                  <span className="sr-only">
                    {' '}
                    {plural(row.count, ['zestaw', 'zestawy', 'zestawów'])}
                  </span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <li key={chip.href}>
            <Link
              href={chip.href}
              replace
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-[0.92rem] font-bold text-ink"
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex min-h-14 items-center justify-between rounded-2xl bg-surface-2 px-4">
        <span className="font-bold">Jasny / ciemny</span>
        <ThemeToggle className={ICON_BUTTON} />
      </div>

      {phone && (
        <a
          href={phone.href}
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-accent-text px-4 font-extrabold text-accent-ink"
        >
          <Icon name="phone" className="size-[18px]" strokeWidth={2.2} />
          Zadzwoń · {phone.label}
        </a>
      )}
    </div>
  )
}
