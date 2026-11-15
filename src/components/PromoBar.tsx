import { promoClosedScript } from '@/lib/site/promo'
import type { PublicCompanyData } from '@/lib/site/public'

import { PromoClose } from './PromoClose'
import { Container } from './ui/Container'

type Promo = NonNullable<PublicCompanyData['promo']>

/**
 * Seasonal promo bar from `CompanyData` (active dates are checked when the data is read). With
 * a campaign id it can be closed (spec. §3.6): the choice is remembered per campaign, and the
 * inline script before the bar hides it again on the next page before it is painted.
 */
export function PromoBar({ promo }: { promo: Promo }) {
  const script = promoClosedScript(promo.campaignId)
  return (
    <>
      {script && <script dangerouslySetInnerHTML={{ __html: script }} />}
      <aside
        aria-label="Promocja"
        data-promo-bar=""
        className="bg-accent-text text-sm text-accent-ink"
      >
        <Container className="flex items-center justify-center gap-3 py-2 text-center font-semibold">
          <span className={script ? 'flex-1' : undefined}>
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
          </span>
          {script && promo.campaignId && <PromoClose campaignId={promo.campaignId} />}
        </Container>
      </aside>
    </>
  )
}
