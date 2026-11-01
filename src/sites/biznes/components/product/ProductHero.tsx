import Link from 'next/link'

import type { IconName } from '@/lib/catalog/options'
import type { ProductView } from '@/lib/catalog/product'
import { featureIcon } from '@/lib/catalog/productIcons'
import { serviceStrip, serviceTile } from '@/lib/catalog/purchase'
import type { PublicImage } from '@/lib/media/public'

import { ColorPicker } from './ColorPicker'
import { ProductAddButton } from './ProductAddButton'
import { PathIcon, productIconPath } from './PathIcon'
import { ProductGallery } from './ProductGallery'
import { VersionChips, YourVersion } from './ProductVersionPicker'

/** Three highlights from `features` (K31-ZMIANY §4 pkt 1). */
const HIGHLIGHTS = 3

const CHIP =
  'inline-flex min-h-8 items-center rounded-xl px-2.5 text-[0.82rem] font-extrabold transition-colors'

type Props = {
  product: ProductView
  icon: IconName
  /** Link of the brand (its page or showroom) and of the main category, when they exist. */
  brandHref: string | null
  categoryHref: string | null
  phone: { label: string; href: string } | null
  videoTarget: string | null
  /** Photos of the gallery: the colours' pictures first (K32 §9), then the card's own. */
  gallery: PublicImage[]
  /** Gallery slide of each colour (`null`: a colour without a picture). */
  colorSlides: (number | null)[]
}

/**
 * Hero of the product page 2.0 (K31-ZMIANY §4 pkt 1): gallery | brand · series · category,
 * H1, „W tej karcie”, subtitle, 3 highlights with icons, „Twoja wersja” (or the benefit), CTA
 * with the phone and the service strip.
 */
export function ProductHero({
  product,
  icon,
  brandHref,
  categoryHref,
  phone,
  videoTarget,
  gallery,
  colorSlides,
}: Props) {
  const { brand, category } = product
  const highlights = product.features.slice(0, HIGHLIGHTS)
  // The strip follows the category (K4-FINAL §4.4, K36 §13): copy of the page, not product data.
  const services = serviceStrip({
    category: category?.slug ?? null,
    subcategory: product.subcategory,
    brand: brand?.slug ?? null,
  })
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
      <ProductGallery
        name={product.name}
        images={gallery}
        brand={brand}
        icon={icon}
        videoTarget={videoTarget}
        colorSlides={colorSlides}
        service={serviceTile({ kind: product.kind, brand: brand?.slug ?? null })}
      />

      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {brand &&
            (brandHref ? (
              <Link
                href={brandHref}
                className={`${CHIP} bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:text-accent-text`}
              >
                {brand.name}
              </Link>
            ) : (
              <span className={`${CHIP} bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]`}>
                {brand.name}
              </span>
            ))}
          {product.series && (
            <span className={`${CHIP} bg-accent-soft text-h1-accent`}>Seria {product.series}</span>
          )}
          {category &&
            (categoryHref ? (
              <Link
                href={categoryHref}
                className={`${CHIP} bg-surface-2 text-ink-2 hover:text-accent-text`}
              >
                {category.name}
              </Link>
            ) : (
              <span className={`${CHIP} bg-surface-2 text-ink-2`}>{category.name}</span>
            ))}
        </div>

        <h1 className="font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02] font-extrabold tracking-[-0.025em] text-ink font-stretch-110%">
          {product.heading}
        </h1>

        <VersionChips />

        {(product.subtitle ?? product.benefit) && (
          <p className="text-[clamp(1.05rem,1.4vw,1.2rem)] leading-relaxed text-ink-2">
            {product.subtitle ?? product.benefit}
          </p>
        )}

        {highlights.length > 0 && (
          <ul className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {highlights.map((feature) => (
              <li
                key={feature}
                className="flex flex-col gap-3 rounded-[18px] bg-surface-2 p-3 sm:p-4"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-card text-accent-text shadow-[inset_0_0_0_1px_var(--border)]">
                  <PathIcon d={productIconPath(featureIcon(feature))} className="size-[18px]" />
                </span>
                <span className="text-sm leading-snug font-bold text-ink sm:text-[0.95rem]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}

        <ColorPicker colors={product.colors} />

        <YourVersion benefit={product.subtitle ? product.benefit : null} />

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-2.5">
            <ProductAddButton className="min-w-0 flex-1 basis-56" />
            {phone && (
              <a
                href={phone.href}
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-card px-6 font-display text-lg font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
              >
                <span className="sr-only">Zadzwoń: </span>
                {phone.label}
              </a>
            )}
          </div>
          <p className="text-sm text-ink-2">
            Bez cen na stronie — ofertę z wybraną wersją dostajesz na piśmie.
          </p>
        </div>

        <ul className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
          {services.map((service) => (
            <li key={service.title} className="flex gap-3 text-sm">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ok-text">
                <PathIcon d={service.icon} className="size-4" />
              </span>
              <span className="leading-snug">
                <span className="block font-extrabold text-ink">{service.title}</span>
                <span className="text-ink-2">— {service.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
