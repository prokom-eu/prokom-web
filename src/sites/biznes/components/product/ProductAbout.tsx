import { RichText } from '@payloadcms/richtext-lexical/react'

import { Icon } from '@/components/ui/Icon'
import type { ProductView } from '@/lib/catalog/product'

/** „Co robimy przy zakupie” without the card's own list — the board's sentence for every card. */
const PURCHASE_DEFAULT =
  'Dobór wersji, konfiguracja, przeniesienie danych, szkolenie i serwis — w jednej ofercie.'

const LABEL = 'text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase'

/**
 * Description with its side panel (K31-ZMIANY §4 pkt 4): the first paragraph larger; panel „Dla
 * kogo” (industries), „Wyróżnia się” (features), „Producent” and „Co robimy przy zakupie” (the
 * card's „W cenie” when set — replaces „W PRO-KOM w cenie” of stage 1).
 */
export function ProductAbout({ id, product }: { id: string; product: ProductView }) {
  const purchase =
    product.included.length > 0 ? `${product.included.join(', ')}.` : PURCHASE_DEFAULT
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className="grid scroll-mt-40 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.68fr)] lg:gap-14"
    >
      <div className="min-w-0">
        <h2 id={`${id}-h`} className="sr-only">
          Opis
        </h2>
        {product.description ? (
          <RichText
            data={product.description}
            className="rich-text max-w-3xl text-ink-2 [&>p:first-child]:text-[1.2rem] [&>p:first-child]:leading-relaxed [&>p:first-child]:text-ink"
          />
        ) : (
          product.benefit && (
            <p className="max-w-3xl text-[1.2rem] leading-relaxed text-ink">{product.benefit}</p>
          )
        )}
      </div>
      <aside
        aria-label="W skrócie o produkcie"
        className="flex flex-col divide-y divide-border self-start rounded-[26px] bg-surface-2 px-6 py-2"
      >
        {product.industries.length > 0 && (
          <div className="py-4">
            <h3 className={LABEL}>Dla kogo</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {product.industries.map((industry) => (
                <li
                  key={industry.slug}
                  className="rounded-lg bg-card px-2.5 py-1 text-sm font-bold text-ink-2 shadow-[inset_0_0_0_1px_var(--border)]"
                >
                  {industry.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {product.features.length > 0 && (
          <div className="py-4">
            <h3 className={LABEL}>Wyróżnia się</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 font-bold text-ink">
                  <Icon name="check" className="size-4 text-ok-text" strokeWidth={2.6} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        {product.brand && (
          <div className="py-4">
            <h3 className={LABEL}>Producent</h3>
            <p className="mt-2 font-bold text-ink">{product.brand.name}</p>
          </div>
        )}
        <div className="py-4">
          <h3 className={LABEL}>Co robimy przy zakupie</h3>
          <p className="mt-2 text-[0.95rem] leading-relaxed font-bold text-ink-2">{purchase}</p>
        </div>
      </aside>
    </section>
  )
}
