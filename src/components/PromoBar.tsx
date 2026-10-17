import type { PublicCompanyData } from '@/lib/site/public'

import { Container } from './ui/Container'

type Promo = NonNullable<PublicCompanyData['promo']>

/** Promo bar from `CompanyData` (active dates are checked when the data is read). */
export function PromoBar({ promo }: { promo: Promo }) {
  return (
    <aside aria-label="Promocja" className="bg-accent-text text-sm text-accent-ink">
      <Container className="py-2 text-center font-semibold">
        {promo.href ? (
          <a
            href={promo.href}
            // The global focus ring has the bar's own colour; use the label colour here.
            className="underline decoration-2 underline-offset-4 focus-visible:outline-accent-ink"
          >
            {promo.text}
          </a>
        ) : (
          promo.text
        )}
      </Container>
    </aside>
  )
}
