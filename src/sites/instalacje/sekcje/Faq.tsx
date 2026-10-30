import Link from 'next/link'

import { faqJsonLd } from '@/lib/seo/jsonLd'
import type { InstService } from '@/payload-types'

import { InstIcon } from '../InstIcon'
import { InstSection } from './InstSection'
import { JsonLd } from './JsonLd'
import type { Phone } from './types'

type Props = {
  heading: string | null | undefined
  items: InstService['faq']
  aside: InstService['faqAside']
  phone: Phone | null
  fold?: boolean
}

// Defaults of the prototype (`common.js → sub()`).
const ASIDE = {
  title: 'Masz inne pytanie?',
  text: 'Wyślij zdjęcie obiektu albo obecnej instalacji. Powiemy, od czego zacząć i czego się spodziewać.',
  button: 'Zaplanuj instalację',
  href: '/zaplanuj',
}

/**
 * FAQ of a service page (`zrodlo/inc/faqsec.html`): numbered questions, the first open, a
 * contact card on the side; the same questions as `FAQPage` structured data (SEO §2.3).
 */
export function Faq({ heading, items, aside, phone, fold }: Props) {
  if (!items || items.length === 0) return null
  return (
    <>
      <JsonLd data={faqJsonLd(items)} />
      <InstSection id="faq" fold={fold} style={{ padding: '0 0 104px' }}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">Pytania i odpowiedzi</span>
              <h2 className="h2">{heading || 'Zanim zadzwonisz.'}</h2>
            </div>
          </div>
          <div className="faqw">
            <div className="ri">
              {items.map((item, index) => (
                <details key={item.id ?? item.question} className="fq" open={index === 0}>
                  <summary>
                    <em>{String(index + 1).padStart(2, '0')}</em>
                    <span>{item.question}</span>
                    <InstIcon name="plus" size={18} strokeWidth={2.4} />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
            <div className="card ri sticky faqa">
              <span className="ico">
                <InstIcon name="chat" size={24} />
              </span>
              <b className="h3">{aside?.title || ASIDE.title}</b>
              <span className="mut">{aside?.text || ASIDE.text}</span>
              {phone && (
                <a href={phone.href} className="btn btn-p">
                  {phone.label}
                </a>
              )}
              <Link href={aside?.href || ASIDE.href} className="btn btn-g">
                {aside?.button || ASIDE.button}
              </Link>
            </div>
          </div>
        </div>
      </InstSection>
    </>
  )
}
