import { headers } from 'next/headers'
import { connection } from 'next/server'

import { ContactPage } from '@/components/shared/ContactPage'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'

import { Steps } from '@/components/shared/Steps'

import { CartAttachment } from '../../components/contact/CartAttachment'
import { InquiryListCard } from '../../components/contact/InquiryListCard'
import { ContactPanelCard } from '../../components/forms/ContactPanel'

type Props = { tenantId: number }

/** The navy column's lead and promises of the Kontakt form (board Web-kontakt, K4). */
const FORM_LEAD =
  'Oddzwonimy w godzinach pracy z konkretną propozycją. Wycena na piśmie, bez zobowiązań.'
const FORM_PROMISES = [
  'Bez zakładania konta',
  'Bez newslettera i spamu',
  'Odpowiada człowiek z Rabki, nie infolinia',
]

/**
 * `/kontakt` of Biznes (plan 0611 §8.2, Web-kontakt) = the shared Kontakt template on
 * `shared.contact`: phone first, the salon card (Rabka only) with the week's hours and „dziś”,
 * „Z czym dzwonisz?” (4 matters, each picks the form's topic through `?temat=`), the form of the
 * home page (`ContactPanelCard`: navy column with „Co dalej” and the phone, icons in the fields,
 * topic chips) with the inquiry list attached, service area, the other lines, „Zanim zadzwonisz”
 * with „Masz listę pozycji z katalogu?” beside it.
 */
export async function BzContactPageBlock({ tenantId }: Props) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const env = getEnv()
  const [shared, host] = await Promise.all([
    getSharedData(tenantId),
    headers().then((h) => h.get('host')),
  ])
  if (!shared) return null
  const contact = shared.line.contact ?? {}
  return (
    <ContactPage
      shared={shared}
      line="biznes"
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      now={new Date().toISOString()}
      formToken={issueFormToken(env.PAYLOAD_SECRET)}
      hoursLayout="week"
      slots={{
        form: (
          <ContactPanelCard
            tenantId={tenantId}
            headingId="kontakt-formularz"
            heading={contact.formTitle || 'Napisz, czego potrzebujesz.'}
            accentSecondSentence
            lead={FORM_LEAD}
            steps={
              contact.nextSteps?.length ? (
                <Steps steps={contact.nextSteps} orientation="vertical" onDark />
              ) : undefined
            }
            showLocation
            placeMap={false}
            topics={contact.topics ?? []}
            promises={FORM_PROMISES}
            successText={shared.line.responsePromise}
            prefill={<CartAttachment />}
          />
        ),
        faqAside: <InquiryListCard />,
      }}
    />
  )
}
