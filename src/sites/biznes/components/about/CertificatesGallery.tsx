import Image from 'next/image'

import { CertZoom } from '@/components/shared/CertZoom'
import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { Icon } from '@/components/ui/Icon'
import { CERTIFICATES, CERTIFICATES_SPAN, certificateLabel } from '@/lib/partners/certificates'

import { SplitHead } from '../home/SplitHead'

/**
 * „Certyfikaty” on the Biznes `/o-firmie` page, after the brands (moved off the home page —
 * Krystian 24.11.2026): the manufacturer documents as proof of skills, statuses as history with
 * their years; a thumbnail opens the document (`CertZoom`, the only script).
 */
export function CertificatesGallery() {
  return (
    <section
      id="certyfikaty"
      aria-labelledby="certyfikaty-h"
      data-rail-section="Certyfikaty"
      data-rail-icon="doc"
      className={`zh bzac-certs ${PAGE_CONTAINER} scroll-mt-28 py-16`}
    >
      <SplitHead
        id="certyfikaty-h"
        eyebrow="Certyfikaty"
        heading="Kompetencje potwierdzone przez producentów."
        lead={`Statusy partnerskie i szkolenia Samsunga i Della z lat ${CERTIFICATES_SPAN}, z datami z dokumentów. Kliknij miniaturę, żeby obejrzeć dokument.`}
      />
      <CertZoom items={CERTIFICATES}>
        <ul className="bzac-grid" data-reveal-cards="">
          {CERTIFICATES.map((item) => (
            <li key={item.id} className="bzac-cert">
              <button
                type="button"
                data-cert={item.id}
                className="bzac-thumb"
                aria-label={`Powiększ dokument: ${item.title}, ${item.period}`}
              >
                <Image
                  src={item.image.thumb}
                  alt=""
                  width={item.image.thumbWidth}
                  height={item.image.thumbHeight}
                  sizes="(min-width: 1100px) 230px, (min-width: 640px) 30vw, 80vw"
                />
                <span className="bzac-zoom" aria-hidden="true">
                  <Icon name="search" strokeWidth={2.4} className="size-4" />
                </span>
              </button>
              <span className="bzac-chip" data-kind={item.kind}>
                {certificateLabel(item)}
              </span>
              <b className="bzac-cert-title">{item.title}</b>
              <span className="bzac-scope">{item.scope}</span>
            </li>
          ))}
        </ul>
      </CertZoom>
    </section>
  )
}
