import Link from 'next/link'

import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import { ICON_BUTTON } from '@/components/ui/iconButton'
import type { MegaMenu } from '@/lib/catalog/menu'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'

type Props = {
  items: PublicBiznesNavigation['menu']
  menu: MegaMenu
  /** `tel:` and wa.me links of the line; `null` hides the button. */
  phone: { label: string; href: string } | null
  whatsapp: string | null
}

const ROW = 'flex min-h-12 items-center justify-between gap-3 px-1 font-bold text-ink'
const SUMMARY = `${ROW} cursor-pointer list-none [&::-webkit-details-marker]:hidden`

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      className="shrink-0 transition-transform group-open:rotate-180"
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Content of the phone menu (spec. §3.3): every menu item in the panel's order, Oferta folded
 * into groups → categories (native `<details>`), the theme switch, phone and WhatsApp. No
 * Branże since v20 (B3c). Rendered on the server inside `MobileMenu`.
 */
export function MobileMenuContent({ items, menu, phone, whatsapp }: Props) {
  return (
    <>
      <ul className="divide-y divide-border">
        {items.map((item, i) => {
          if (item.type === 'offer') {
            return (
              <li key={i} className="py-1">
                <Link href="/oferta" className={`${ROW} text-lg`}>
                  {item.label} — cały katalog
                  <span className="text-sm text-ink-2">{menu.total.products}</span>
                </Link>
                <ul>
                  {menu.columns.map((column) => (
                    <li key={column.slug}>
                      <details className="group">
                        <summary className={`${SUMMARY} font-semibold text-ink-2`}>
                          <span className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="inline-flex size-8 items-center justify-center rounded-lg text-white"
                              // Group colours are data of the record (ADR-012).
                              style={{
                                backgroundImage: `linear-gradient(135deg, ${column.gradient[0]}, ${column.gradient[1]})`,
                              }}
                            >
                              <Icon name={column.icon} className="size-[18px]" strokeWidth={2} />
                            </span>
                            {column.name}
                          </span>
                          <Chevron />
                        </summary>
                        <ul className="mb-2 ml-11">
                          {column.items.map((entry) => (
                            <li key={entry.href + entry.label}>
                              <Link
                                href={entry.href}
                                className="flex min-h-11 items-center justify-between gap-2 text-[0.94rem] text-ink-2"
                              >
                                {entry.label}
                                {entry.badge && (
                                  <span className="text-xs font-black uppercase text-ok-text">
                                    {entry.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={column.href}
                              className="flex min-h-11 items-center font-extrabold text-accent-text"
                            >
                              Wszystkie w grupie →
                            </Link>
                          </li>
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
              </li>
            )
          }
          return (
            <li key={i}>
              <Link href={item.href ?? '/'} className={ROW}>
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.partner && (
                    <span className="text-xs font-black uppercase text-ok-text">partner</span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
        <li className="flex min-h-14 items-center justify-between px-1">
          <span className="font-bold">Motyw</span>
          <ThemeToggle className={ICON_BUTTON} />
        </li>
      </ul>
      {(phone || whatsapp) && (
        <div className="mt-4 flex gap-2">
          {phone && (
            <a
              href={phone.href}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent-text px-3 font-extrabold text-accent-ink"
            >
              <Icon name="phone" className="size-[18px]" strokeWidth={2.2} />
              {phone.label}
            </a>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 font-extrabold text-ink"
            >
              <Icon name="chat" className="size-[18px]" strokeWidth={2.2} />
              WhatsApp
            </a>
          )}
        </div>
      )}
    </>
  )
}
