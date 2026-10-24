import type { BzContactBlock as BzContactBlockData } from '@/payload-types'

import { ContactPanel } from '../../components/forms/ContactPanel'

type Props = { block: BzContactBlockData; tenantId: number }

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
    />
  )
}
