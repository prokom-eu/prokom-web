import Image from 'next/image'
import Link from 'next/link'

import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { cx } from '@/components/ui/cx'
import type { AboutBrand, AboutBrandRow } from '@/lib/biznes/aboutBrands'

/** The H2 of the shared O firmie template — the page stays on its scale (decision 09.11). */
const H2 =
  'font-display text-[clamp(32px,3.8vw,48px)] leading-none font-extrabold tracking-[-0.025em]'
const ROW_LABEL = 'text-xs font-extrabold tracking-[0.12em] text-ink-2 uppercase'
/** Logos always on the white plate (K35 §6, `--plate`), in both themes. */
const TILE =
  'flex items-center justify-center rounded-2xl bg-plate shadow-[0_10px_24px_-16px_var(--plate-shadow),inset_0_0_0_1px_var(--plate-shadow)]'
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text'

type Props = { rows: readonly AboutBrandRow[]; others: readonly AboutBrand[] }

/**
 * „Marki, które sprzedajemy, wdrażamy i serwisujemy” (Web-o-firmie, slot `afterRules`): a row per
 * confirmed status with big logos, then „Pozostałe marki w ofercie” as a logo wall. Logos rise in
 * one by one (`data-reveal-cards`, reduced motion — at once); trademarks stay their owners'.
 */
export function AboutBrands({ rows, others }: Props) {
  if (rows.length === 0 && others.length === 0) return null
  return (
    <section
      id="marki"
      aria-labelledby="o-firmie-marki"
      className={cx(PAGE_CONTAINER, 'scroll-mt-28 py-16')}
      data-rail-section="Marki"
      data-rail-icon="box"
      data-about-brands
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
            Autoryzacje i partnerzy
          </p>
          <h2 id="o-firmie-marki" className={H2}>
            Marki, które sprzedajemy, wdrażamy i serwisujemy
          </h2>
        </div>
        <Link
          href="/oferta"
          className={cx(
            'inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 font-extrabold hover:border-accent-text',
            FOCUS,
          )}
        >
          Cała oferta <span aria-hidden="true">→</span>
        </Link>
      </div>

      <dl className="mt-10 max-md:mt-6 flex flex-col divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-4 py-6 max-md:gap-3 max-md:py-4 min-[800px]:grid-cols-[220px_minmax(0,1fr)] min-[800px]:items-center"
            data-brand-row
          >
            <dt className={ROW_LABEL}>{row.label}</dt>
            <dd>
              <ul
                className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"
                data-reveal-cards=""
              >
                {row.brands.map((brand) => (
                  <li key={brand.slug}>
                    <BrandLogo
                      brand={brand}
                      className="h-20 w-full px-4 sm:h-24 sm:w-[200px] sm:px-6"
                    />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
        {others.length > 0 && (
          <div className="grid gap-4 py-6 max-md:gap-3 max-md:py-4 min-[800px]:grid-cols-[220px_minmax(0,1fr)]">
            <dt className={cx(ROW_LABEL, 'min-[800px]:pt-5')}>Pozostałe marki w ofercie</dt>
            <dd>
              <ul
                className="grid grid-cols-3 gap-2 min-[640px]:grid-cols-4 min-[1000px]:grid-cols-6"
                data-reveal-cards=""
              >
                {others.map((brand) => (
                  <li key={brand.slug}>
                    <BrandLogo brand={brand} className="h-14 w-full px-3 sm:h-16" small />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      <p className="mt-4 text-xs text-ink-2">Logotypy należą do ich właścicieli.</p>
    </section>
  )
}

function BrandLogo({
  brand,
  className,
  small = false,
}: {
  brand: AboutBrand
  className: string
  small?: boolean
}) {
  const image = (
    <Image
      src={brand.logo.url}
      alt={brand.name}
      width={brand.logo.width}
      height={brand.logo.height}
      unoptimized
      className={cx('w-auto object-contain', small ? 'max-h-7' : 'max-h-11')}
    />
  )
  return brand.href ? (
    <Link
      href={brand.href}
      className={cx(TILE, className, 'transition-transform hover:-translate-y-0.5', FOCUS)}
    >
      {image}
    </Link>
  ) : (
    <span className={cx(TILE, className)}>{image}</span>
  )
}
