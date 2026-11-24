import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { CONTACT_PATH } from '@/lib/biznes/mobileNav'
import { SAMSUNG_HISTORY, SAMSUNG_OFFERS, type SamsungOffer } from '@/lib/partners/certificates'
import { getSharedData } from '@/lib/shared/getSharedData'
import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

/** The Samsung repair page of PRO-KOM Tech (prokomserwis.pl, live since 19.11). */
const TECH_SAMSUNG = '/serwis-samsung'

/** Line icons of the offers, drawn like `Icon` (24 × 24, stroke). */
const OFFER_ICON: Record<SamsungOffer['key'], string> = {
  galaxy: 'M7 2h10v20H7zM11 18h2M3 6h2v12H3zM19 6h2v12h-2z',
  knox: 'M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6zM9.5 11V9.5a2.5 2.5 0 0 1 5 0V11M9 11h6v4H9z',
  naprawy: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
}

/** Apps of the phone mock: work ones behind Knox, private ones apart. */
const WORK_APPS = ['Poczta', 'CRM', 'Faktury', 'Dysk'] as const
const PRIVATE_APPS = ['Zdjęcia', 'Muzyka', 'Mapy', 'Gry'] as const

function OfferIcon({ name }: { name: SamsungOffer['key'] }) {
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
      <path d={OFFER_ICON[name]} />
    </svg>
  )
}

/**
 * „Samsung dla firm” on the Biznes home page, between the Apple band and the certificates
 * (Krystian 24.11.2026): Galaxy for a team, Samsung Knox with MDM — drawn as a phone with the
 * work and private sides apart — and repairs at PRO-KOM Tech. A surface of the page's theme
 * (the Apple band above is navy), Samsung as a word. Honest: we are not a Samsung partner today,
 * the 2022–2024 statuses are in the past tense with a link to the documents below.
 */
export async function SamsungBusiness({ tenantId }: { tenantId: number }) {
  const shared = await getSharedData(tenantId)
  const tech = shared?.lines.find((line) => line.key === 'tech')?.url ?? null

  return (
    <section
      id="samsung-dla-firm"
      aria-labelledby="samsung-dla-firm-h"
      className="zh bzsg scroll-mt-24 pb-10 md:pb-16"
    >
      <Container wide>
        <div className="bzsg-stage">
          <div className="bzsg-top">
            <div className="bzsg-head">
              <span className="bzsg-badge">
                <i aria-hidden="true" />
                Samsung dla firm
              </span>
              <h2 id="samsung-dla-firm-h" className={`${BZ_H2} bzsg-h`}>
                Galaxy dla całego zespołu, <em>bezpieczne z Samsung Knox.</em>
              </h2>
              <p className={`${BZ_LEAD} bzsg-lead`}>
                Telefony i tablety Samsung dla handlowców, serwisantów i biura: dobierzemy modele,
                skonfigurujemy Knox z Twoim systemem MDM, a gdy coś się zepsuje, naprawimy w naszym
                salonie.
              </p>
              <div className="bzsg-actions">
                <Link href={CONTACT_PATH} className="bzsg-btn">
                  Zapytaj o Samsung dla firmy
                  <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                </Link>
                {tech && (
                  <a href={`${tech}${TECH_SAMSUNG}`} className="bzsg-link">
                    Naprawy Samsung w PRO-KOM Tech <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
            <figure className="bzsg-phone" aria-labelledby="bzsg-phone-cap">
              <div className="bzsg-device" aria-hidden="true">
                <span className="bzsg-notch" />
                <span className="bzsg-pane bzsg-pane--work">
                  <span className="bzsg-pane-h">
                    <Icon name="lock" strokeWidth={2.2} className="size-3.5" />
                    Służbowe
                  </span>
                  <span className="bzsg-apps">
                    {WORK_APPS.map((app) => (
                      <span key={app} className="bzsg-app">
                        <i />
                        {app}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="bzsg-pane">
                  <span className="bzsg-pane-h">Prywatne</span>
                  <span className="bzsg-apps">
                    {PRIVATE_APPS.map((app) => (
                      <span key={app} className="bzsg-app">
                        <i />
                        {app}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="bzsg-mdm">
                  <Icon name="check" strokeWidth={2.6} className="size-3.5" />
                  Zarządzane przez MDM firmy
                </span>
              </div>
              <figcaption id="bzsg-phone-cap" className="bzsg-cap">
                Knox oddziela dane firmy od prywatnych na jednym telefonie.
              </figcaption>
            </figure>
          </div>
          <ul className="bzsg-cards" data-reveal-cards="">
            {SAMSUNG_OFFERS.map((offer) => (
              <li key={offer.key} className="bzsg-card">
                <span className="bzsg-ico">
                  <OfferIcon name={offer.key} />
                </span>
                <h3 className="bzsg-title">{offer.title}</h3>
                <p className="bzsg-sub">{offer.lead}</p>
                <p className="bzsg-text">{offer.text}</p>
              </li>
            ))}
          </ul>
          <p className="bzsg-note">
            {SAMSUNG_HISTORY} <a href="#certyfikaty">Zobacz dokumenty</a>
          </p>
        </div>
      </Container>
    </section>
  )
}
