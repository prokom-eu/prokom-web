import Image from 'next/image'

import { CertZoom } from '@/components/shared/CertZoom'
import { Icon } from '@/components/ui/Icon'
import {
  APPLE_PROGRAM_NOTE,
  APPLE_PROGRAMS,
  CERTIFICATES,
  CERTIFICATES_SPAN,
  certificateLabel,
} from '@/lib/partners/certificates'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'

/** Anchor of the Apple band on the Biznes home page (`BzAppleCertificates`). */
const BIZNES_APPLE = '/#apple-dla-firm'

/**
 * „Programy partnerskie i certyfikaty” (boss consent 23.11.2026), right after „Marki i
 * autoryzacje”: the current Apple iLeader programme (AB distributor) in the Biznes colour — it is
 * about selling and deploying Apple hardware for companies, so it leads to prokombiznes.pl — and
 * the manufacturer statuses and trainings as history with their years; a thumbnail opens the
 * document. Apple is a word, never its logo; nothing here says „autoryzowany serwis Apple”.
 */
export function Certificates({ biznesUrl }: { biznesUrl: string | null }) {
  return (
    <section
      id="certyfikaty"
      data-rail-section
      aria-labelledby="certyfikaty-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">Programy partnerskie i certyfikaty</span>
          <h2 id="certyfikaty-h" className="pk-h2">
            Producenci sprawdzili nas nie raz
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">
          Dziś działamy w programie Apple iLeader dystrybutora AB. Wcześniej mieliśmy statusy
          partnerskie Samsunga i Della i szkolenia producentów. Pokazujemy je z datami z dokumentów.
        </p>
      </div>
      <div className="pk-cert">
        <div className="pk-cert__now" style={lineStyle('biznes')}>
          <span className="pk-cert__live">
            <i aria-hidden="true" />
            Aktualnie
          </span>
          <p className="pk-cert__brand">
            Apple <span>program iLeader · AB</span>
          </p>
          <ul className="pk-cert__programs" role="list">
            {APPLE_PROGRAMS.map((program) => (
              <li key={program.key}>
                <b>{program.title}</b>
                <span>{program.lead}</span>
              </li>
            ))}
          </ul>
          <p className="pk-cert__note">{APPLE_PROGRAM_NOTE}</p>
          {biznesUrl && (
            <a href={`${biznesUrl}${BIZNES_APPLE}`} className="pk-cert__link">
              Apple dla firm na prokombiznes.pl <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <CertZoom items={CERTIFICATES} className="pk-cert__past">
          <p className="pk-cert__past-head">
            Statusy i szkolenia producentów <span>{CERTIFICATES_SPAN}</span>
          </p>
          <ol className="pk-cert__list" role="list">
            {CERTIFICATES.map((item) => (
              <li key={item.id} className="pk-cert__item">
                <button
                  type="button"
                  data-cert={item.id}
                  className="pk-cert__thumb"
                  aria-label={`Powiększ dokument: ${item.title}, ${item.period}`}
                >
                  <Image
                    src={item.image.thumb}
                    alt=""
                    width={item.image.thumbWidth}
                    height={item.image.thumbHeight}
                    sizes="96px"
                  />
                  <span className="pk-cert__zoom" aria-hidden="true">
                    <Icon name="search" />
                  </span>
                </button>
                <span className="pk-cert__body">
                  <span className="pk-cert__chip" data-kind={item.kind}>
                    {certificateLabel(item)}
                  </span>
                  <b className="pk-cert__title">{item.title}</b>
                  <span className="pk-cert__scope">{item.scope}</span>
                </span>
              </li>
            ))}
          </ol>
        </CertZoom>
      </div>
    </section>
  )
}
