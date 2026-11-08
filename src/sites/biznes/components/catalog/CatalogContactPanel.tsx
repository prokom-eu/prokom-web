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
}

/**
 * The v20 contact form under the catalog pages (`/oferta`, category, industry): one set of
 * promises and texts; the call-back time is added to the lead when set in the panel. Below 768 px
 * the help card with the same heading takes the form's place (D12).
 */
export function CatalogContactPanel({ tenantId, id, heading, lead, callbackTime, topic }: Props) {
  return (
    <>
      <div className="max-md:hidden">
        <ContactPanel
          tenantId={tenantId}
          id={id}
          heading={heading}
          lead={[lead, callbackTime && `${callbackTime} w godzinach pracy.`]
            .filter(Boolean)
            .join(' ')}
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
      <PhoneHelpCard tenantId={tenantId} heading={heading} topic={topic} />
    </>
  )
}
