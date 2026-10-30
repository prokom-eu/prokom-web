import Link from 'next/link'

import type { InstService } from '@/payload-types'

import { InstIcon } from '../InstIcon'
import { InstSection } from './InstSection'

type Props = {
  intro: InstService['priceIntro']
  factors: InstService['priceFactors']
  planHref: string
  fold?: boolean
}

/** „Od czego zależy cena” (`zrodlo/inc/cena.html`); button text default from `common.js`. */
export function PriceFactors({ intro, factors, planHref, fold }: Props) {
  if (!factors || factors.length === 0) return null
  return (
    <InstSection id="cena" fold={fold} style={{ padding: '0 0 104px' }}>
      <div className="wrap split">
        <div className="ri flex flex-col gap-4">
          <span className="eye">{intro?.eyebrow || 'Wycena'}</span>
          <h2 className="h2">{intro?.heading || 'Co wpływa na cenę.'}</h2>
          {intro?.text && <p className="lead">{intro.text}</p>}
          <div className="flex flex-wrap gap-2.5">
            <Link href={planHref} className="btn btn-p">
              {intro?.button || 'Wyślij zdjęcia do wyceny'}
            </Link>
          </div>
        </div>
        <div className="prep ri">
          {factors.map((factor) => (
            <div key={factor.id ?? factor.title}>
              <i>
                <InstIcon name={factor.icon} size={20} />
              </i>
              <span>
                <b className="block">{factor.title}</b>
                {factor.description && <span className="mut">{factor.description}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </InstSection>
  )
}
