import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { CertZoom } from '@/components/shared/CertZoom'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import {
  APPLE_PROGRAM_NOTE,
  APPLE_PROGRAMS,
  type AppleProgram,
  CERTIFICATES,
  CERTIFICATES_SPAN,
  certificateLabel,
} from '@/lib/partners/certificates'
import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

import { SplitHead } from './SplitHead'

/** Contact page of Biznes (seed `CONTACT_SLUG`) — one form for every question (ADR-003). */
const CONTACT = '/kontakt'

/** Line icons of the programmes, drawn like `Icon` (24 × 24, stroke). */
const PROGRAM_ICON: Record<AppleProgram['key'], string> = {
  dep: 'M4 5h11v8H4zM2 16h15M17 9h4v10h-4zM8.5 20.5l2 2 4-4',
  cto: 'M7 7h10v10H7zM10 10h4v4h-4zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3',
  applecare: 'M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6zM9 12l2 2 4-4',
}

/** How a device reaches an employee with DEP and MDM — the flow drawn in the band. */
const DEP_FLOW = [
  { title: 'Zamawiasz u nas', text: 'Mac, iPhone albo iPad w potrzebnej konfiguracji.' },
  { title: 'Przypisujemy do firmy', text: 'Numer seryjny trafia do Twojej firmy w programie DEP.' },
  { title: 'Pracownik włącza', text: 'Ustawienia, konta i aplikacje przychodzą same z MDM.' },
] as const

function ProgramIcon({ name }: { name: AppleProgram['key'] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PROGRAM_ICON[name]} />
    </svg>
  )
}

/**
 * „Apple dla firm i instytucji” and „Certyfikaty” on the Biznes home page, right after the brands
 * (boss consent 23.11.2026). The navy band leads: Apple DEP (deployment with MDM, drawn as the
 * three steps), Mac in CTO configuration and AppleCare+ through the AB distributor's iLeader
 * programme — selling and deploying Apple hardware, never an Apple service authorisation; Apple
 * is a word, not its logo. Under it the manufacturer documents as proof of skills: statuses as
 * history with their years, a thumbnail opens the document (`CertZoom`). Server-rendered; the
 * only script is the document window.
 */
export function AppleCertificates() {
  return (
    <section
      id="apple-dla-firm"
      aria-labelledby="apple-dla-firm-h"
      className="zh bzac scroll-mt-24 py-6 md:py-20"
    >
      <Container wide>
        <div className="bzac-stage" data-surface="dark">
          <div className="bzac-top">
            <div className="bzac-head">
              <span className="zh-badge">
                <i aria-hidden="true" />
                Apple dla firm i instytucji
              </span>
              <h2 id="apple-dla-firm-h" className={`${BZ_H2} bzac-h`}>
                Maki, iPhone’y i iPady <em>gotowe do pracy od pierwszego dnia.</em>
              </h2>
              <p className={`${BZ_LEAD} bzac-lead`}>
                Dla biur, szkół i urzędów: dobierzemy sprzęt Apple, zamówimy go w potrzebnej
                konfiguracji, przygotujemy do wdrożenia z MDM i dodamy ochronę Apple.
              </p>
              <div className="bzac-actions">
                <Link href={CONTACT} className="zh-btn">
                  Zapytaj o Apple dla firmy
                  <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                </Link>
                <span className="bzac-partner">Partner programu iLeader · AB</span>
              </div>
            </div>
            <figure className="bzac-flow" aria-labelledby="bzac-flow-cap">
              <figcaption id="bzac-flow-cap" className="bzac-flow-cap">
                Wdrożenie z DEP, krok po kroku
              </figcaption>
              <ol className="bzac-steps">
                {DEP_FLOW.map((step, i) => (
                  <li key={step.title} style={{ '--i': i } as CSSProperties}>
                    <span className="bzac-dot" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="bzac-step">
                      <b>{step.title}</b>
                      <span>{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="bzac-done">
                <Icon name="check" strokeWidth={2.6} className="size-4" />
                Bez ręcznej konfiguracji każdego urządzenia
              </p>
            </figure>
          </div>
          <ul className="bzac-cards" data-reveal-cards="">
            {APPLE_PROGRAMS.map((program, i) => (
              <li key={program.key} className="bzac-card">
                <span className="bzac-ico">
                  <ProgramIcon name={program.key} />
                </span>
                <span className="bzac-num" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3 className="bzac-title">{program.title}</h3>
                <p className="bzac-sub">{program.lead}</p>
                <p className="bzac-text">{program.text}</p>
              </li>
            ))}
          </ul>
          <p className="bzac-note">{APPLE_PROGRAM_NOTE}</p>
        </div>

        <div id="certyfikaty" className="bzac-certs scroll-mt-24">
          <SplitHead
            id="certyfikaty-h"
            eyebrow="Certyfikaty"
            heading="Kompetencje potwierdzone przez producentów."
            lead={`Statusy partnerskie i szkolenia Samsunga i Della z lat ${CERTIFICATES_SPAN}, z datami z dokumentów. Kliknij miniaturę, żeby obejrzeć dokument.`}
          />
          <CertZoom items={CERTIFICATES}>
            <ul className="bzac-grid" aria-labelledby="certyfikaty-h" data-reveal-cards="">
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
        </div>
      </Container>
    </section>
  )
}
