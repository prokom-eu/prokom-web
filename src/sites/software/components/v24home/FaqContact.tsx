import { faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import type { FaqBlock, SwContactBlock } from '@/payload-types'
import { swContactData } from '@/sites/software/blocks/SwContact/Component'
import { ContactForm } from '@/sites/software/blocks/SwContact/ContactFormLazy'
import { softwareFaq } from '@/sites/software/components/home/FaqSoftware'

type Props = { faq: FaqBlock; contact: SwContactBlock; tenantId: number }

/**
 * „Zanim napiszesz” + „Napisz po swojemu” (ZMIANY-v24 §4 pkt 10, §4.2, pattern `s_8`): the FAQ
 * block and the contact block after it in one section — questions on the left (`<details>`, the
 * first one open, works without JavaScript), the form in a glass card on the right. The FAQ keeps
 * `#faq` and its `FAQPage` data, the card `#kontakt`; the card is the page's final CTA. The contact
 * block's side title is the line under its heading; its promises, audit card and side text are
 * v23 only. A half whose data is missing leaves the other one alone.
 */
export async function FaqContact({ faq: faqBlock, contact: contactBlock, tenantId }: Props) {
  const [faq, contact] = await Promise.all([
    softwareFaq(faqBlock, tenantId),
    swContactData(contactBlock, tenantId),
  ])
  if (!faq && !contact) return null
  return (
    <section id="faq" className="v-sec" aria-labelledby={faq ? 'faq-h' : 'kontakt-h'}>
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(faq.items)) }}
        />
      )}
      <div className="v-wrap v-fc">
        {faq && (
          <div>
            {faq.eyebrow && (
              <p className="sw-eyebrow" data-rise>
                {faq.eyebrow}
              </p>
            )}
            <h2 id="faq-h" className="sw-h2 v-fc-h" data-rise>
              {faq.heading}
            </h2>
            {faq.lead && <p className="v-lead">{faq.lead}</p>}
            <ul className="v-qs">
              {faq.items.map((item, index) => (
                <li key={index}>
                  <details className="v-q" open={index === 0}>
                    <summary>
                      {item.question}
                      <span className="v-q-pl" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p>{item.answer}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}
        {contact && (
          <div id="kontakt" className="sw-glass v-contact">
            <p className="sw-eyebrow">{contact.eyebrow}</p>
            <h2 id="kontakt-h" className="sw-h2 v-contact-h">
              {contact.title}
            </h2>
            {contact.sideTitle && <p className="v-contact-lead">{contact.sideTitle}</p>}
            <ContactForm {...contact.form} look="v24" />
            {(contact.phone || contact.email) && (
              <p className="v-contact-row">
                {contact.phone && <a href={contact.phone.href}>{contact.phone.label}</a>}
                {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
