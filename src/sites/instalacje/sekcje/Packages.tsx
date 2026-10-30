import Link from 'next/link'

import { displayPrice, type PriceSettings } from '@/lib/instalacje/price'
import type { InstService } from '@/payload-types'

import { InstIcon } from '../InstIcon'
import { InstSection } from './InstSection'

type Props = {
  intro: InstService['packagesIntro']
  packages: InstService['packages']
  prices: PriceSettings
  /** The plan form with the service picked (SEO §2.8; read from I11). */
  planHref: string
}

// Defaults of the prototype (`common.js → sub()`).
const INTRO = {
  eyebrow: 'Przykładowe zestawy',
  heading: 'Od czego zwykle zaczynamy.',
  note: 'To przykłady. Ostateczny zakres i cenę ustalamy po wizji lokalnej i podajemy na piśmie.',
}

/**
 * Example packages (`zrodlo/inc/pkgs.html`): a price only with the line's switch on and a real
 * price filled in (`displayPrice`), else the "no price" text. A carousel on a phone.
 */
export function Packages({ intro, packages, prices, planHref }: Props) {
  if (!packages || packages.length === 0) return null
  return (
    <InstSection id="pakiety" style={{ padding: '0 0 104px' }}>
      <div className="wrap">
        <div className="shead ri">
          <div>
            <span className="eye">{intro?.eyebrow || INTRO.eyebrow}</span>
            <h2 className="h2">{intro?.heading || INTRO.heading}</h2>
          </div>
          {intro?.text && (
            <p className="lead" style={{ maxWidth: 440 }}>
              {intro.text}
            </p>
          )}
        </div>
        <div className="pkgs">
          {packages.map((pkg) => (
            <div key={pkg.id ?? pkg.name} className={`card pkg ri${pkg.featured ? ' hot' : ''}`}>
              {pkg.featured && (
                <span className="badge">{pkg.badge || 'Najczęściej wybierany'}</span>
              )}
              <span className="ico">
                <InstIcon name={pkg.icon} size={22} />
              </span>
              <b className="h3">{pkg.name}</b>
              {pkg.description && (
                <span className="mut" style={{ fontSize: 15 }}>
                  {pkg.description}
                </span>
              )}
              {pkg.items && pkg.items.length > 0 && (
                <ul>
                  {pkg.items.map((item, index) => (
                    <li key={`${index}-${item}`}>
                      <i>
                        <InstIcon name="check" size={16} strokeWidth={2.6} />
                      </i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pkgf">
                <span className="prc">{displayPrice(pkg.price, prices)}</span>
                <Link href={planHref} className="btn btn-g btn-s">
                  Zapytaj o ten zestaw →
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="note ri" style={{ marginTop: 18 }}>
          <InstIcon name="doc" size={20} />
          <span>{intro?.note || INTRO.note}</span>
        </div>
      </div>
    </InstSection>
  )
}
