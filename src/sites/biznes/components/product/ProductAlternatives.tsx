import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import { productHref } from '@/lib/catalog/card'
import type { IndexProduct } from '@/lib/catalog/catalogIndex'

/** „Kiedy wybrać coś innego?” (spec. §6.2): links to the alternatives set in the panel. */
export function ProductAlternatives({ products }: { products: IndexProduct[] }) {
  return (
    <section aria-labelledby="alternatywy" className="flex flex-col gap-5">
      <h2
        id="alternatywy"
        className="font-display text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold leading-tight text-ink font-stretch-110%"
      >
        Kiedy wybrać coś innego?
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              href={productHref(product.slug)}
              className="group flex h-full items-start gap-3 rounded-[20px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-extrabold text-ink group-hover:text-accent-text">
                  {product.name}
                </span>
                {product.benefit && (
                  <span className="text-sm leading-snug text-ink-2">{product.benefit}</span>
                )}
              </span>
              <Icon name="arrow" className="mt-0.5 size-4 text-accent-text" strokeWidth={2.4} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
