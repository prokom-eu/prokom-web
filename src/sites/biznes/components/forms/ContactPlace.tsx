import { AddressMap } from '@/components/shared/AddressMap'
import { Icon } from '@/components/ui/Icon'
import { routeUrl, salonAddress } from '@/lib/biznes/route'
import type { SharedData } from '@/lib/shared/getSharedData'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'

/**
 * The location column of the home contact (plan 0611 §7.1 pkt 14, audit P2.5): the address map
 * with the pin and „Wyznacz trasę ↗”, then phone, e-mail and the address with hours — instead of
 * the channel tiles that repeated the footer. Every value from the panel (`CompanyData`, the
 * line's settings); the drawing is of the office, so the map shows only for the first salon.
 * `map={false}` where the page shows the map already (`/kontakt`, its hero card).
 */
export function ContactPlace({ shared, map = true }: { shared: SharedData; map?: boolean }) {
  const { company, line } = shared
  const salon = shared.salons[0] ?? null
  const address = salonAddress(salon)
  const route = routeUrl(company.mapsUrl, address)
  const tel = line.phone ? toTelHref(line.phone) : null
  const hours = salon ? hoursSummary(salon.hours) : null
  return (
    <div className="flex flex-col gap-4" data-contact-place>
      {map && salon && address && (
        <AddressMap
          variant="dark"
          height={190}
          mobileHeight={150}
          radius={20}
          label={{ title: 'PRO-KOM', text: salon.street }}
          description={`Mapa: ${company.name}, ${address}`}
          mapsUrl={route}
          routeLabel="Wyznacz trasę"
        />
      )}
      <ul className="flex flex-col gap-3 text-sm">
        {line.phone && tel && (
          <li>
            <a href={tel} className="flex items-center gap-3 hover:underline">
              <Ico name="phone" />
              <span className="flex flex-col">
                <span className="text-base font-extrabold">{line.phone}</span>
                {line.phone2 && <span className="text-white/75">także {line.phone2}</span>}
              </span>
            </a>
          </li>
        )}
        {line.email && (
          <li>
            <a href={`mailto:${line.email}`} className="flex items-center gap-3 hover:underline">
              <Ico name="mail" />
              <span className="font-extrabold">{line.email}</span>
            </a>
          </li>
        )}
        {address && (
          <li className="flex items-center gap-3" data-contact-address>
            <Ico name="pin" />
            <span className="flex flex-col">
              <span className="font-extrabold">{address}</span>
              {hours && <span className="text-white/75">{hours}</span>}
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}

function Ico({ name }: { name: 'phone' | 'mail' | 'pin' }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10"
    >
      <Icon name={name} className="size-5" />
    </span>
  )
}
