import Image from 'next/image'

import { CertZoom } from '@/components/shared/CertZoom'
import { CERTIFICATES, certificateLabel } from '@/lib/partners/certificates'

import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSectionLazy'

/**
 * The two Samsung trainings of 2018 that are about mounting screens: installation and service of
 * professional displays, and SMART Signage / Hospitality. Only those — the mobile and Dell partner
 * statuses are about phones and computers, not installations (boss consent 23.11.2026).
 */
export const SCREEN_TRAININGS = CERTIFICATES.filter(
  (item) => item.id === 'samsung-vd-2018' || item.id === 'samsung-signage-2018',
)

const SECTION = { padding: '0 0 104px' }

/**
 * „Szkolenia producenta” on the Ekrany page, after „Gdzie montujemy”: proof that we know the
 * screens we mount. Each training with its year; a document opens enlarged (`CertZoom`).
 */
export function Szkolenia() {
  return (
    <InstSection id="szkolenia" style={SECTION}>
      <div className="wrap">
        <div className="card scr-train ri">
          <div className="scr-train__text">
            <span className="eye">Szkolenia producenta</span>
            <h2 className="h2">
              Ekrany Samsunga montujemy <span className="acc">po szkoleniach producenta</span>
            </h2>
            <p className="lead">
              W 2018 roku przeszliśmy szkolenia Samsunga z instalacji i serwisu ekranów
              profesjonalnych oraz z systemów SMART Signage i SMART Hospitality do recepcji, sklepów
              i hoteli.
            </p>
            <p className="scr-train__hint">
              <InstIcon name="eye" size={18} />
              Kliknij dokument, żeby go obejrzeć.
            </p>
          </div>
          <CertZoom items={SCREEN_TRAININGS}>
            <ul className="scr-train__docs">
              {SCREEN_TRAININGS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    data-cert={item.id}
                    className="scr-train__thumb"
                    aria-label={`Powiększ dokument: ${item.title}, ${item.period}`}
                  >
                    <Image
                      src={item.image.thumb}
                      alt=""
                      width={item.image.thumbWidth}
                      height={item.image.thumbHeight}
                      sizes="(min-width: 900px) 220px, 42vw"
                    />
                  </button>
                  <span className="scr-train__chip">{certificateLabel(item)}</span>
                  <b>{item.title}</b>
                  <span className="mut">{item.scope}</span>
                </li>
              ))}
            </ul>
          </CertZoom>
        </div>
      </div>
    </InstSection>
  )
}
