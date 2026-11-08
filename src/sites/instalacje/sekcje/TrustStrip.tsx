import Link from 'next/link'

import { plural } from '@/lib/plural'

import { Arrow } from '../Arrow'
import { InstIcon } from '../InstIcon'

type Props = { warrantyMonths: number }

/**
 * The trust band above the CTA band (runda v6 §1.3) — in place of the big „Gwarancja i serwis”
 * cards with their repeated heading. One low row, no h2: three facts, the fact in bold. The
 * warranty comes from `InstalacjeSettings`; „1 dzień roboczy”, not „24 h”, so it never reads as the
 * time of arrival (spec §2: „24 h” only as the answer to a report). Keeps the shared id `odbior`.
 */
export function TrustStrip({ warrantyMonths }: Props) {
  return (
    <section id="odbior" className="trs" aria-label="Gwarancja i serwis">
      <div className="wrap">
        <ul className="trsl">
          <li className="trsi">
            <span className="trsico" aria-hidden="true">
              <InstIcon name="shield" size={20} />
            </span>
            <span>
              <b>
                {warrantyMonths} {plural(warrantyMonths, ['miesiąc', 'miesiące', 'miesięcy'])}
              </b>{' '}
              gwarancji na montaż
            </span>
          </li>
          <li className="trsi">
            <span className="trsico" aria-hidden="true">
              <InstIcon name="clock" size={20} />
            </span>
            <span>
              <b>Odpowiadamy w 1 dzień roboczy</b>
            </span>
          </li>
          <li className="trsi">
            <Link href="/serwis" className="trsa">
              <span className="trsico" aria-hidden="true">
                <InstIcon name="wrench" size={20} />
              </span>
              <span>
                <b>Przejmujemy serwis</b> po innych firmach <Arrow />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
