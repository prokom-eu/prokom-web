import type { BzContactBlock as BzContactBlockData } from '@/payload-types'

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
  'Nie wiem, doradźcie',
] as const

/** `#kontakt` of the Biznes home page (spec. §4 pkt 13): texts from the panel, the rest shared. */
export function BzContactBlock({ block, tenantId }: Props) {
  return (
    <ContactPanel
      tenantId={tenantId}
      id="kontakt"
      heading={block.heading}
      lead={block.lead}
      formHeading={block.formHeading}
      formNote={block.formNote}
      promises={(block.promises ?? []).map((promise) => promise.text)}
      successText={block.successText}
      topics={HOME_TOPICS}
      topicsLabel="W czym możemy pomóc?"
      accentSecondSentence
    />
  )
}
