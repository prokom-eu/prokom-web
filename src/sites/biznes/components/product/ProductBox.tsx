import Image from 'next/image'

import { Icon } from '@/components/ui/Icon'
import type { ProductView } from '@/lib/catalog/product'

import { AddToCartButton } from '../AddToCartButton'

type Props = {
  product: ProductView
  /** Main phone of the line (`tel:`) and WhatsApp (wa.me), as in the header. */
  contact: { phone: { label: string; href: string } | null; whatsapp: string | null }
  /** `SiteSettings.biznes.promises.callbackTime`; empty → only „Bez cen…”. */
  callbackTime: string | null
}

const CONTACT_LINK =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-card px-4 text-sm font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]'

/**
 * Box next to the gallery (spec. §6.2), sticky on a desktop: brand, category, H1, benefit,
 * key parameters (or the card's features when none are set), „Dla:”, versions, the inquiry
 * switch, phone and WhatsApp, „W PRO-KOM w cenie” and the no-prices line. No prices, ever.
 */
export function ProductBox({ product, contact, callbackTime }: Props) {
  const { brand, category, subcategory } = product
  const where = [category?.name, subcategory].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-5 rounded-[26px] bg-card p-5 shadow-[0_30px_60px_-40px_var(--glow),inset_0_0_0_1px_var(--border)] sm:rounded-[32px] sm:p-7 lg:sticky lg:top-28">
      <div className="flex min-h-8 items-center justify-between gap-3">
        {brand?.logo ? (
          <span className="inline-flex h-8 shrink-0 items-center rounded-lg bg-white px-2 shadow-[inset_0_0_0_1px_var(--border)]">
            <Image
              src={brand.logo.url}
              alt={brand.name}
              width={brand.logo.width}
              height={brand.logo.height}
              unoptimized
              className="h-auto max-h-5 w-auto max-w-[110px] object-contain"
            />
          </span>
        ) : brand ? (
          <span className="text-sm font-black uppercase tracking-wider text-ink-2">
            {brand.name}
          </span>
        ) : (
          <span />
        )}
        {where && <span className="text-right text-sm font-bold text-ink-3">{where}</span>}
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink font-stretch-110%">
          {product.name}
        </h1>
        {product.benefit && <p className="leading-relaxed text-ink-2">{product.benefit}</p>}
      </div>

      {product.keyParams.length > 0 ? (
        <dl className="grid grid-cols-2 gap-2">
          {product.keyParams.map((param) => (
            <div
              key={param.label}
              className="flex flex-col-reverse gap-0.5 rounded-2xl bg-surface-2 px-3.5 py-3"
            >
              <dt className="text-xs font-bold text-ink-3">{param.label}</dt>
              <dd className="font-display text-lg font-extrabold leading-tight text-ink font-stretch-106%">
                {param.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        product.features.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {product.features.map((feature) => (
              <li
                key={feature}
                className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm font-bold text-ink-2"
              >
                {feature}
              </li>
            ))}
          </ul>
        )
      )}

      {product.industries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="mr-1 font-bold text-ink-3">Dla:</span>
          {product.industries.map((industry) => (
            <span
              key={industry.slug}
              className="rounded-full bg-surface-2 px-3 py-1 font-bold text-ink-2"
            >
              {industry.name}
            </span>
          ))}
        </div>
      )}

      {product.variants.length > 0 && (
        <div className="flex flex-col gap-1.5 text-sm">
          <h2 className="font-bold text-ink-3">Wersje</h2>
          <ul className="flex flex-col gap-1">
            {product.variants.map((variant) => (
              <li key={variant.name} className="flex gap-2 text-ink-2">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-3" />
                <span>
                  {variant.name}
                  {variant.difference && (
                    <span className="text-ink-3"> — {variant.difference}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <AddToCartButton slug={product.slug} name={product.name} variant="primary" />
        {(contact.phone || contact.whatsapp) && (
          <div className="grid grid-cols-2 gap-2">
            {contact.phone && (
              <a href={contact.phone.href} className={CONTACT_LINK}>
                <Icon name="phone" className="size-4" strokeWidth={2.1} />
                {contact.phone.label}
              </a>
            )}
            {contact.whatsapp && (
              <a href={contact.whatsapp} target="_blank" rel="noopener" className={CONTACT_LINK}>
                <Icon name="chat" className="size-4" strokeWidth={2.1} />
                WhatsApp
                <span className="sr-only"> (otwiera się w nowej karcie)</span>
              </a>
            )}
          </div>
        )}
      </div>

      {product.included.length > 0 && (
        <div className="rounded-2xl bg-surface-2 p-4">
          <h2 className="text-sm font-extrabold text-ink">W PRO-KOM w cenie</h2>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink-2">
            {product.included.map((item) => (
              <li key={item} className="flex gap-2">
                <Icon name="check" className="mt-0.5 size-4 text-ok-text" strokeWidth={2.4} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-center text-xs leading-relaxed text-ink-3">
        Bez cen na stronie — wycenę przygotujemy na piśmie
        {callbackTime?.trim() ? ` · ${callbackTime.trim()}` : ''}.
      </p>
    </div>
  )
}
