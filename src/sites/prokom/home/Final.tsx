import { HeadingText } from '@/components/shared/HeadingText'
import type { HubHome } from '@/lib/prokom/home'
import { toTelHref } from '@/lib/site/link'

import { HUB_CONTAINER } from '../container'

type Props = {
  texts: HubHome['final']
  phone: string | null
  tel: string | null
  /** The second company number (`SiteSettings.phone2`), next to the main one. */
  phone2: string | null
  contactHref: string
}

/**
 * The closing band of the home page (spec §6.1 pkt 12, board 01 „Finał”): the big PRO–KOM word
 * (decoration — the page's H1 already says it), the call to action, the company phone, „Napisz”
 * and the way back to „Dobierz”.
 */
export function Final({ texts, phone, tel, phone2, contactHref }: Props) {
  const tel2 = phone2 ? toTelHref(phone2) : null
  return (
    <section aria-labelledby="final-h" className="pk-final">
      <div aria-hidden="true" className="pk-final__dots" />
      <div className={`pk-final__inner ${HUB_CONTAINER}`}>
        <span aria-hidden="true" className="pk-final__word">
          <span className="pk-wm">PRO</span>
          <span className="pk-final__dash" />
          <span className="pk-wm">KOM</span>
        </span>
        <h2 id="final-h" className="pk-h2 pk-h2--big pk-final__title">
          <HeadingText text={texts.title} emClass="pk-nowrap" />
        </h2>
        <div className="pk-final__cta">
          {phone && tel && (
            <a href={tel} className="pk-hbtn pk-hbtn--accent pk-hbtn--xl pk-hbtn--phone">
              {phone}
            </a>
          )}
          {phone2 && tel2 && (
            <a href={tel2} className="pk-hbtn pk-hbtn--xl pk-hbtn--phone">
              {phone2}
            </a>
          )}
          <a href={contactHref} className="pk-hbtn pk-hbtn--xl">
            {texts.write}
          </a>
          <a href="#dobierz" className="pk-hbtn pk-hbtn--xl">
            {texts.choose}
          </a>
        </div>
      </div>
    </section>
  )
}
