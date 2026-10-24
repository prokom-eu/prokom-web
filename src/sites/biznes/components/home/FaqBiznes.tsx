import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import type { FaqBlock as FaqBlockData } from '@/payload-types'

import { LiveHours } from './LiveHours'

type Props = { block: FaqBlockData; tenantId: number }

/** The field is optional in the shared block: never an empty `h2` the section points to. */
const DEFAULT_HEADING = 'Najczęstsze pytania'

/**
 * Biznes look of the shared FAQ block (spec. §4 pkt 12, ZMIANY-v20 §2.8): a sticky left column
 * with a small contact card, numbered question cards on the right, the first one open.
 * `<details>` works without JavaScript; `FAQPage` JSON-LD as in the shared block.
 */
export async function FaqBiznes({ block, tenantId }: Props) {
  const [settings, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const whatsapp = settings?.biznes?.whatsapp ? toWhatsAppHref(settings.biznes.whatsapp) : null
  const email = settings?.email ?? null
  const hours = company?.locations[0]?.hours ?? []

  return (
    <section id="faq" aria-labelledby="faq-h" className="bg-surface-2 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(block.items)) }}
      />
      <Container
        wide
        className="grid gap-10 min-[1080px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]"
      >
        <div className="min-[1080px]:sticky min-[1080px]:top-28 min-[1080px]:self-start">
          {block.eyebrow && (
            <p className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-accent-text uppercase">
              {block.eyebrow}
            </p>
          )}
          <h2
            id="faq-h"
            className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-110%"
          >
            {block.heading || DEFAULT_HEADING}
          </h2>
          {block.lead && (
            <p className="mt-4 max-w-[46ch] text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-ink-2">
              {block.lead}
            </p>
          )}
          {(phone || email || whatsapp) && (
            <div className="mt-6 max-w-[420px] rounded-[22px] bg-card p-5 shadow-[0_24px_48px_-32px_var(--glow),inset_0_0_0_1px_var(--border)]">
              <LiveHours hours={hours} className="text-sm text-ink" />
              {phone && tel && (
                <a
                  href={tel}
                  className="mt-3 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-accent-text text-[17px] font-extrabold text-accent-ink transition-colors hover:bg-ink hover:text-surface"
                >
                  <Icon name="phone" className="size-5" />
                  {phone}
                </a>
              )}
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-extrabold">
                {whatsapp && (
                  <a
                    href={whatsapp}
                    rel="noopener"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-ink hover:underline"
                  >
                    <Icon name="chat" className="size-4 text-accent-text" />
                    WhatsApp
                    <span className="sr-only"> (otwiera się w nowej karcie)</span>
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 text-ink hover:underline"
                  >
                    <Icon name="mail" className="size-4 text-accent-text" />
                    {email}
                  </a>
                )}
              </p>
            </div>
          )}
        </div>
        <ol className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={item.id ?? i}>
              <details
                open={i === 0}
                className="group rounded-[18px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-shadow open:shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_1.5px_var(--accent-text)]"
              >
                <summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-sm font-extrabold text-accent-text">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-[16.5px] leading-snug font-extrabold text-ink">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink transition-[rotate,background-color,color] duration-200 group-open:rotate-45 group-open:bg-accent-text group-open:text-accent-ink motion-reduce:transition-none"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                      <path
                        d="M12 5v14M5 12h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 pl-[3.6rem] leading-relaxed text-ink-2">{item.answer}</p>
              </details>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
