import Link from 'next/link'

import type { SoftwareNavigation } from '@/lib/software/navigation'
import { toTelHref } from '@/lib/site/link'

import { Glass } from '../components/ui/Glass'

type Props = {
  band: NonNullable<SoftwareNavigation['startBand']>
  /** `shared.line.phone` — the second button. */
  phone: string | null
}

/**
 * „Zacznij od podglądu, nie od faktury.” above the shared footer (ZMIANY-v24 §3.5, board
 * `.au-prefoot`): a glass card with the glow, the wizard and the phone. `data-footer-cta`: a page
 * that ends with its own CTA (`data-final-cta` — wizard, thanks, news, audit) drops it
 * (`site.css`), as the v23 footer's band.
 */
export function StartBand({ band, phone }: Props) {
  const [label, href] = band.cta
  const tel = phone ? toTelHref(phone) : null
  return (
    <section data-footer-cta aria-labelledby="start-band-h" className="v-sec">
      <div className="v-wrap">
        <Glass featured className="sw-cta sw-start-band">
          <div>
            <p className="text-xs font-extrabold tracking-[0.14em] text-accent-text uppercase">
              {band.eyebrow}
            </p>
            <h2 id="start-band-h" className="sw-h2 sw-cta-title mt-2">
              {band.title}
              {band.em ? (
                <>
                  {' '}
                  <em className="sw-em">{band.em}</em>
                </>
              ) : null}
            </h2>
          </div>
          <div className="flex flex-col gap-2.5 min-[641px]:flex-row min-[1081px]:shrink-0">
            <Link
              href={href}
              data-motion="button"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-button px-6 font-extrabold text-accent-ink"
            >
              {label}
            </Link>
            {phone && tel ? (
              <a
                href={tel}
                data-motion="button-outline"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-6 font-extrabold"
              >
                {phone}
              </a>
            ) : null}
          </div>
        </Glass>
      </div>
    </section>
  )
}
