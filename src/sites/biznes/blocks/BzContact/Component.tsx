import { routeUrl } from '@/lib/biznes/route'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { BzContactBlock as BzContactBlockData } from '@/payload-types'

import { PhoneHelpCard } from '../../components/catalog/PhoneHelpCard'
import { ContactPanel } from '../../components/forms/ContactPanel'

type Props = { block: BzContactBlockData; tenantId: number }

/** Chips of the home form (board `Web-start` `#s4-kontakt`, prompt 2 W2), sent as topics. */
const HOME_TOPICS = [
  'Kasa fiskalna',
  'System POS / GoPOS',
  'Terminal płatniczy',
  'Program dla firmy',
  'KSeF',
  'Opieka IT / komputery',
  'Sieć i kopie danych',
  // Plan 0611 §7.1 pkt 14 („Zaopatrzenie firm”, B2-3).
  'Większa dostawa sprzętu',
  'Nie wiem, doradźcie',
] as const

/**
 * `#kontakt` of the Biznes home page (spec. §4 pkt 13): texts from the panel, the rest shared.
 * Below 768 px the help card with the same heading (phone, inquiry drawer) takes the form's place
 * (D12); the form stays on `/kontakt` and `/zapytanie`. The
 * anchor `#kontakt` (section rail, links from outside) wraps both, so it lands on either.
 * The left column shows the location (plan 0611 §7.1 pkt 14); on a phone the help card carries
 * the address and the route link.
 */
export async function BzContactBlock({ block, tenantId }: Props) {
  const shared = await getSharedData(tenantId)
  const salon = shared?.salons[0] ?? null
  const address = salon ? `${salon.street}, ${salon.postalCode} ${salon.city}` : null
  const route = address ? routeUrl(shared?.company.mapsUrl, address) : null
  return (
    <div id="kontakt" className="scroll-mt-24">
      <div className="max-md:hidden">
        <ContactPanel
          tenantId={tenantId}
          id="kontakt-formularz"
          heading={block.heading}
          lead={block.lead}
          formHeading={block.formHeading}
          formNote={block.formNote}
          promises={(block.promises ?? []).map((promise) => promise.text)}
          successText={block.successText}
          topics={HOME_TOPICS}
          topicsLabel="W czym możemy pomóc?"
          accentSecondSentence
          showLocation
        />
      </div>
      <PhoneHelpCard
        tenantId={tenantId}
        id="kontakt-help"
        heading={block.heading}
        place={address ? { address, route } : null}
      />
    </div>
  )
}
