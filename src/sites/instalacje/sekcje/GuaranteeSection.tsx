import Link from 'next/link'

import { plural } from '@/lib/plural'

import { InstIcon } from '../InstIcon'

type Props = { warrantyMonths: number; responseText: string }

// „Do 24 h odpowiadamy…” → the time in bold, as in the prototype.
const RESPONSE_LEAD = /^(Do\s+\d+\s*h)\s+(.+)$/

/**
 * „Gwarancja i serwis” of every service page (`zrodlo/inc/odbsec.html`, spec §5.2): the warranty
 * and the answer promise come from `InstalacjeSettings` (spec §2), the third card leads to Serwis.
 */
export function GuaranteeSection({ warrantyMonths, responseText }: Props) {
  const response = responseText.match(RESPONSE_LEAD)
  return (
    <section id="odbior" className="odbs" style={{ padding: '0 0 104px' }}>
      <div className="wrap">
        <div className="shead">
          <div>
            <span className="eye">Gwarancja i serwis</span>
            <h2 className="h2">
              Po montażu nie znikamy. <span className="acc">Masz numer, pod który dzwonisz.</span>
            </h2>
          </div>
          <p className="lead" style={{ maxWidth: 460 }}>
            Na montaż dajemy gwarancję, na zgłoszenia szybko odpowiadamy, a serwis prowadzimy także
            po innych firmach.
          </p>
        </div>
        <div className="odbg">
          <div className="card odbc">
            <span className="ico">
              <InstIcon name="shield" size={22} />
            </span>
            <b className="h3">Gwarancja</b>
            <p>
              <b className="odbn">
                {warrantyMonths} {plural(warrantyMonths, ['miesiąc', 'miesiące', 'miesięcy'])}
              </b>{' '}
              gwarancji PRO-KOM na montaż. Sprzęt ma dodatkowo gwarancję producenta.
            </p>
          </div>
          <div className="card odbc">
            <span className="ico">
              <InstIcon name="clock" size={22} />
            </span>
            <b className="h3">Odpowiadamy szybko</b>
            <p>
              {response ? (
                <>
                  <b className="odbn">{response[1]}</b> {response[2]}
                </>
              ) : (
                responseText
              )}{' '}
              Oddzwaniamy, odbieramy telefon albo odpisujemy. Termin wizyty technika ustalamy w
              rozmowie.
            </p>
          </div>
          <Link href="/serwis" className="card odbc odbl">
            <span className="ico">
              <InstIcon name="wrench" size={22} />
            </span>
            <b className="h3">Masz już instalację?</b>
            <p>
              Przejmujemy serwis po innych firmach: sprawdzamy instalację i pomagamy odzyskać dostęp
              do urządzeń (za zgodą właściciela, także procedurą producenta).
            </p>
            <span className="odba">Serwis i przejęcie →</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
