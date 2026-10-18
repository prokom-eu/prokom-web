import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { MegaMenu } from '@/lib/catalog/menu'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'

type Props = {
  menu: MegaMenu
  shortcuts: PublicBiznesNavigation['shortcuts']
  cards: PublicBiznesNavigation['cards']
}

/** Polish plural: 1 pozycja, 2–4 pozycje, 5+ pozycji (and 12–14 → pozycji). */
function plural(n: number, [one, few, many]: [string, string, string]) {
  if (n === 1) return one
  const tens = n % 100
  return n % 10 >= 2 && n % 10 <= 4 && (tens < 12 || tens > 14) ? few : many
}

/**
 * Oferta ▾ (spec. §3.2): five columns = five catalog groups with their categories and counts,
 * the partner cards on the right and the bar with the whole catalog and the wizard. Category
 * names ≥ 15 px (the boss's remark of 16.10) — a long group gets "Wszystkie w grupie →".
 */
export function MegaMenuPanel({ menu, shortcuts, cards }: Props) {
  const { products, brands } = menu.total
  return (
    <div className="max-h-[calc(100vh-7.5rem)] overflow-auto border-t border-border bg-card shadow-2xl">
      <Container wide className="grid gap-6 py-6 xl:grid-cols-[repeat(5,minmax(0,1fr))_17rem]">
        {shortcuts.length > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2 xl:col-span-full">
            <span>Na skróty:</span>
            {shortcuts.map((link, i) => (
              <span key={link.href} className="inline-flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                <Link href={link.href} className="font-extrabold text-ink hover:underline">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
        )}

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:col-span-5 xl:grid-cols-5">
          {menu.columns.map((column) => (
            <section key={column.slug} aria-labelledby={`mega-${column.slug}`}>
              <Link
                id={`mega-${column.slug}`}
                href={column.href}
                className="mb-2 flex items-center gap-2.5 font-display text-[0.97rem] font-extrabold leading-tight text-ink hover:underline"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
                  // Group colours are data of the record (ADR-012, rozstrzygnięcie of 18.10).
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${column.gradient[0]}, ${column.gradient[1]})`,
                  }}
                >
                  <Icon name={column.icon} className="size-[18px]" strokeWidth={2} />
                </span>
                {column.name}
              </Link>
              <ul>
                {column.items.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className={cx(
                        'flex min-h-10 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[0.94rem] leading-snug hover:bg-surface-2',
                        item.badge ? 'font-extrabold text-ink' : 'font-semibold text-ink-2',
                      )}
                    >
                      <span>{item.label}</span>
                      {item.badge ? (
                        <em className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[0.7rem] font-black uppercase not-italic tracking-wide text-ok-text">
                          {item.badge}
                        </em>
                      ) : (
                        item.count !== undefined && (
                          <small className="text-xs font-bold text-ink-2">
                            {item.count}
                            <span className="sr-only">
                              {' '}
                              {plural(item.count, ['pozycja', 'pozycje', 'pozycji'])}
                            </span>
                          </small>
                        )
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              {column.more && (
                <Link
                  href={column.more.href}
                  aria-label={`Wszystkie w grupie: ${column.name}`}
                  className="mt-1 inline-flex min-h-10 items-center gap-1 px-2 text-sm font-extrabold text-accent-text hover:underline"
                >
                  Wszystkie w grupie
                  <Icon name="arrow" className="size-4" strokeWidth={2.4} />
                </Link>
              )}
            </section>
          ))}
        </div>

        {cards.length > 0 && (
          <div className="hidden gap-3 xl:flex xl:flex-col">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                data-surface={card.dark ? 'dark' : undefined}
                className={cx(
                  'relative flex min-h-36 flex-col gap-1.5 overflow-hidden rounded-2xl p-4 pr-20 transition-transform hover:-translate-y-0.5',
                  card.dark
                    ? 'bg-surface-dark text-white'
                    : 'border border-border bg-surface-2 text-ink',
                )}
              >
                {card.logo && (
                  <span className="self-start rounded-md bg-white px-2 py-1">
                    <MediaImage image={card.logo} sizes="96px" className="h-4 w-auto" />
                  </span>
                )}
                {card.badge && (
                  <span
                    className={cx(
                      'text-[0.68rem] font-black uppercase tracking-wide',
                      card.dark ? 'text-accent-on-dark' : 'text-ok-text',
                    )}
                  >
                    {card.badge}
                  </span>
                )}
                <b className="text-[0.94rem] leading-snug">{card.title}</b>
                {card.text && (
                  <span
                    className={cx(
                      'text-[0.8rem] leading-snug',
                      card.dark ? 'text-white' : 'text-ink-2',
                    )}
                  >
                    {card.text}
                  </span>
                )}
                {card.image && (
                  <MediaImage
                    image={{ ...card.image, alt: '' }}
                    sizes="80px"
                    className="absolute -bottom-1.5 -right-1 w-20"
                  />
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border py-4 text-sm xl:col-span-full">
          <Link
            href="/oferta"
            className="inline-flex items-center gap-1.5 font-extrabold text-accent-text hover:underline"
          >
            Cały katalog · {products} {plural(products, ['pozycja', 'pozycje', 'pozycji'])},{' '}
            {brands} {plural(brands, ['marka', 'marki', 'marek'])}
            <Icon name="arrow" className="size-4" strokeWidth={2.4} />
          </Link>
          {/* TODO(krystian): spec. §3.2 lists the phone in this bar, the `Main` design has none —
              confirm with the boss which one wins. */}
          <span className="text-ink-2">
            Bez cen na stronie — wycenę dostajesz na piśmie, pod swoją firmę.
          </span>
          <Link href="/kreator" className="font-extrabold text-ink hover:underline">
            Nie wiesz, co wybrać? Dobierz zestaw w 60 s
          </Link>
        </div>
      </Container>
    </div>
  )
}
