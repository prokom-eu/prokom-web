import { Icon } from '@/components/ui/Icon'

import { Tick } from './art'

/*
 * Pictures of PRO-KOM Software (Krystian 16.11: „ładniej pokazać”): a small company website and
 * a phone with the same site for the hero tile and the line scene, and the flow „form → your
 * system → SMS and e-mail”. Illustration only — hidden from readers, the words are a sample.
 * Colours of the line through `--ln` (the parent sets `lineStyle('software')`), the rest tokens.
 */

const CARDS = [
  { icon: 'rocket', label: 'Szybka' },
  { icon: 'search', label: 'W Google' },
  { icon: 'shield', label: 'Z opieką' },
] as const

/** A company website in a browser: address with a lock, nav, headline, photo with a new enquiry. */
export function WebMock({ size }: { size: 'sm' | 'lg' }) {
  return (
    <span aria-hidden="true" className="pk-web2" data-size={size}>
      <span className="pk-web2__bar">
        <i />
        <i />
        <i />
        <span className="pk-web2__url">
          <Icon name="lock" />
          twojafirma.pl
        </span>
      </span>
      <span className="pk-web2__nav">
        <b className="pk-web2__brand">
          <i />
          Twoja firma
        </b>
        <span className="pk-web2__links">
          <i />
          <i />
          <i />
        </span>
        <em>Kontakt</em>
      </span>
      <span className="pk-web2__hero">
        <span className="pk-web2__copy">
          <span className="pk-web2__stars">
            ★★★★★<small>4,9 Google</small>
          </span>
          <strong>{size === 'lg' ? 'Twoja firma, dobrze widoczna.' : 'Twoja firma w sieci'}</strong>
          <i className="pk-web2__line" />
          <i className="pk-web2__line pk-web2__line--short" />
          <span className="pk-web2__btns">
            <em>Umów wizytę</em>
            {size === 'lg' && <u>Oferta</u>}
          </span>
        </span>
        <span className="pk-web2__photo">
          <i className="pk-web2__sun" />
          <i className="pk-web2__hill" />
          <i className="pk-web2__hill pk-web2__hill--back" />
          <span className="pk-web2__toast">
            <Tick />
            Nowe zapytanie
          </span>
        </span>
      </span>
      {size === 'lg' && (
        <span className="pk-web2__cards">
          {CARDS.map((card) => (
            <span key={card.label}>
              <b>
                <Icon name={card.icon} />
              </b>
              {card.label}
            </span>
          ))}
        </span>
      )}
    </span>
  )
}

/** The same website on a phone, with the call button at hand. */
export function PhoneMock() {
  return (
    <span aria-hidden="true" className="pk-ph2">
      <span className="pk-ph2__notch" />
      <b className="pk-ph2__brand">
        <i />
        Twoja firma
      </b>
      <span className="pk-ph2__photo">
        <i className="pk-web2__sun" />
        <i className="pk-web2__hill" />
      </span>
      <i className="pk-web2__line" />
      <i className="pk-web2__line pk-web2__line--short" />
      <em className="pk-ph2__call">
        <Icon name="phone" />
        Zadzwoń
      </em>
    </span>
  )
}

/** An enquiry from the website goes into your system, which answers by SMS and e-mail. */
export function FlowMock() {
  return (
    <span aria-hidden="true" className="pk-flow2">
      <span className="pk-flow2__card">
        <b>
          <Icon name="doc" />
        </b>
        <span>
          <strong>Nowe zgłoszenie</strong>
          <small>formularz · 09:41</small>
        </span>
      </span>
      <i className="pk-flow2__pipe">
        <u />
      </i>
      <span className="pk-flow2__core">
        <b>
          <Icon name="bolt" />
        </b>
        <span>
          <strong>Twój system</strong>
          <small>zapisane · przypisane</small>
        </span>
      </span>
      <i className="pk-flow2__pipe">
        <u />
      </i>
      <span className="pk-flow2__outs">
        <span>
          <Icon name="phone" />
          SMS
          <Tick />
        </span>
        <span>
          <Icon name="mail" />
          E-mail
          <Tick />
        </span>
      </span>
    </span>
  )
}
