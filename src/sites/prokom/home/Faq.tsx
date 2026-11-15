import type { FaqTokens, HubHome } from '@/lib/prokom/home'
import { faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'

import { HUB_CONTAINER } from '../container'
import { faqItems } from './model'

type Props = {
  texts: HubHome['faq']
  tokens: FaqTokens
  /** `/pomoc`, or `null` while the page is off (v1.1 flag). */
  helpHref: string | null
}

/**
 * „Zanim zadzwonisz” (spec §6.1 pkt 10, board 01 `#pytania`): native `<details>`, the first open;
 * `{telefon}`, `{adres}`, `{godziny}` filled from the panel (`faqItems`). `FAQPage` structured
 * data — only the visible questions (spec §4); H6-2 must not add a second one.
 */
export function Faq({ texts, tokens, helpHref }: Props) {
  const items = faqItems(texts.items, tokens)
  if (!items.length) return null

  return (
    <section id="pytania" data-rail-section aria-labelledby="pytania-h" className="pk-band">
      <div className={`pk-sect pk-sect--band ${HUB_CONTAINER}`}>
        <div className="pk-faq">
          <div className="pk-faq__head">
            <span className="pk-eb">{texts.eyebrow}</span>
            <h2 id="pytania-h" className="pk-h2 pk-h2--big">
              {texts.title}
            </h2>
            {helpHref && (
              <a href={helpHref} className="pk-hbtn">
                {texts.helpLink} <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
          <div className="pk-faq__list">
            {items.map((item, index) => (
              <details key={`${index}-${item.question}`} className="pk-fq" open={index === 0}>
                <summary>
                  <span aria-hidden="true" className="pk-fq__n">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.question}
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(items)) }}
      />
    </section>
  )
}
