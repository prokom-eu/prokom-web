import Link from 'next/link'

import { faqJsonLd } from '@/lib/seo/jsonLd'
import type { CSSProperties } from 'react'

import { InstIcon } from '../InstIcon'
import { InstSection } from './InstSection'
import { JsonLd } from './JsonLd'
import type { Phone } from './types'

type FaqItem = { id?: string | null; question: string; answer: string }
type FaqAside = {
  title?: string | null
  text?: string | null
  button?: string | null
  href?: string | null
} | null

type Props = {
  heading: string | null | undefined
  items: FaqItem[] | null | undefined
  aside: FaqAside | undefined
  phone: Phone | null
  fold?: boolean
  /** Home page (I6): own eyebrow, a link in the head, the band and the padding of `#faq`. */
  eyebrow?: string
  headLink?: { label: string; href: string }
  className?: string
  style?: CSSProperties
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
export function Faq({
  heading,
  items,
  aside,
  phone,
  fold,
  eyebrow = 'Pytania i odpowiedzi',
  headLink,
  className,
  style = { padding: '0 0 104px' },
}: Props) {
  const asideHref = aside?.href || ASIDE.href
  if (!items || items.length === 0) return null
  return (
    <>
      <JsonLd data={faqJsonLd(items)} />
      <InstSection id="faq" fold={fold} className={className} style={style}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{eyebrow}</span>
              <h2 className="h2">{heading || 'Zanim zadzwonisz.'}</h2>
            </div>
            {headLink && (
              <Link href={headLink.href} className="btn btn-g">
                {headLink.label}
              </Link>
            )}
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
              {/^https?:/.test(asideHref) ? (
                <a href={asideHref} className="btn btn-g" target="_blank" rel="noopener noreferrer">
                  {aside?.button || ASIDE.button}
                </a>
              ) : (
                <Link href={asideHref} className="btn btn-g">
                  {aside?.button || ASIDE.button}
                </Link>
              )}
            </div>
          </div>
        </div>
      </InstSection>
    </>
  )
}
