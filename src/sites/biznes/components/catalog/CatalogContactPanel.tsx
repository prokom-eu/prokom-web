import { Container } from '@/components/ui/Container'

import { InquirySteps } from '../InquirySteps'
import { ContactPanel } from '../forms/ContactPanel'
import { PhoneHelpCard } from './PhoneHelpCard'

type Props = {
  tenantId: number
  id: string
  heading: string
  lead: string
  /** `SiteSettings.biznes.promises.callbackTime` — only from the panel [SZEF]. */
  callbackTime: string | null
  /** What the page is about (category, industry): the phone card writes it into the inquiry. */
  topic?: string | null
  /** The steps of an inquiry as the heading of the form — one help block (audit 0611 P1-2). */
  withSteps?: boolean
}

/**
 * The v20 contact form under the catalog pages (`/oferta`, category, industry): one set of
 * promises and texts; the call-back time is added to the lead when set in the panel. Below 768 px
 * the help card with the same heading takes the form's place (D12). `id` names the whole block, so
 * an anchor (`#kontakt`) lands on the form on a computer and on the card on a phone.
 */
export function CatalogContactPanel({
  tenantId,
  id,
  heading,
  lead,
  callbackTime,
  topic,
  withSteps = false,
}: Props) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="max-md:hidden">
        <ContactPanel
          tenantId={tenantId}
          id={`${id}-form`}
          heading={heading}
          lead={[lead, callbackTime && `${callbackTime} w godzinach pracy.`]
            .filter(Boolean)
            .join(' ')}
          steps={withSteps ? <InquirySteps callbackTime={callbackTime} /> : undefined}
          formHeading="Formularz zapytania"
          formNote="Pola z gwiazdką są wymagane. Resztę dopiszemy razem przez telefon."
          promises={[callbackTime, 'Wycena na piśmie', 'Bez zobowiązań'].filter(
            (promise): promise is string => Boolean(promise),
          )}
          successText={
            callbackTime
              ? `${callbackTime} w godzinach pracy. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.`
              : null
          }
        />
      </div>
      {withSteps && (
        // D12: the phone keeps the steps too, above the help card that replaces the form.
        <Container wide className="pt-10 min-[768px]:hidden">
          <InquirySteps callbackTime={callbackTime} tone="light" />
        </Container>
      )}
      <PhoneHelpCard tenantId={tenantId} id={`${id}-help`} heading={heading} topic={topic} />
    </div>
  )
}
