import type { SharedSalon } from '@/lib/shared/project'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toDirectionsHref } from '@/lib/site/link'

type Props = {
  salons: readonly SharedSalon[]
  company: string
}

/**
 * The line's second salon (Zakopane) in a slot of the shared Kontakt / O firmie (MAPA-DZIS
 * „Dodatki linii”): address, hours and the route. Rendered only for published salons outside
 * the template's own card (`otherSalons`) — with one salon (today) it renders nothing.
 */
export function OtherSalons({ salons, company }: Props) {
  if (!salons.length) return null
  return (
    <ul className="grid gap-3" aria-label="Inne salony" data-other-salons>
      {salons.map((salon) => {
        const address = `${salon.street}, ${salon.postalCode} ${salon.city}`
        return (
          <li
            key={salon.key ?? salon.name}
            className="flex flex-col gap-1 rounded-[22px] bg-card p-5 text-ink shadow-raised"
          >
            <span className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
              Salon · {salon.city}
            </span>
            <b className="font-display text-lg font-extrabold">{salon.street}</b>
            <span className="text-ink-2">
              {salon.postalCode} {salon.city}
            </span>
            {salon.hours.length > 0 && (
              <span className="text-sm text-ink-2">{hoursSummary(salon.hours)}</span>
            )}
            <a
              href={toDirectionsHref(`${company}, ${address}`)}
              target="_blank"
              rel="noopener"
              className="mt-1 font-bold text-accent-text underline-offset-4 hover:underline"
            >
              Wyznacz trasę →<span className="sr-only"> (nowe okno)</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
