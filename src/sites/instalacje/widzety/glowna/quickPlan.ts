import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'
import { sourceFromHref } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'

import { glownaSekcje, PLAN_OBJECTS, type PlanObject } from '../../dane/glownaSekcje'
import type { ServiceKey } from '../../dane/types'

/**
 * The quick plan form of the home page (`#zaplanuj`, `Main.js → kz`) as pure functions: the
 * travel zone from the town, the order of the errors, the ticket's ring, the link to the full
 * planner and the request body (ADR-003 contract, ADR-I002 §4: services → `topics`).
 */

export type PlanState = {
  services: ServiceKey[]
  object: PlanObject | null
  town: string
  name: string
  phone: string
  consent: boolean
}

export type PlanErrorKey = 'services' | 'name' | 'phone' | 'consent'

/** The prototype's `norm()`: lower case, no Polish letters, only letters, digits and spaces. */
function norm(text: string): string {
  const map: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
  }
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9 ]+/g, ' ')
    .trim()
}

/** Travel zone of a town (1:1 with the prototype's patterns); `null` without a town. */
export function travelZone(town: string): string | null {
  const t = norm(town)
  if (!t) return null
  if (/rabk|chabow|jordan|mszan|raba|spytk|lubien|skomiel|niedzwi|ponic|olszow/.test(t)) {
    return 'Rabka-Zdrój i okolice'
  }
  if (/zakop|poron|koscieli|bukow|bialk|bialy dun|murzas/.test(t)) return 'Zakopane i Tatry'
  if (/nowy targ|nowy tar|szaflar|czarny dun|jablon|czorszt|szczawn|kroscien|orawa|spisz/.test(t)) {
    return 'Podhale'
  }
  return 'Małopolska · dojazd ustalimy'
}

export const phoneDigits = (phone: string) => phone.replace(/\D/g, '').length

/** At least 9 digits: a Polish number the office can call back (prototype `kDig >= 9`). */
export const phoneReady = (phone: string) => phoneDigits(phone) >= 9

/**
 * First missing answer, in the order of the form (prototype: services, phone, consent — the
 * name sits before the phone; the inquiry contract needs it). Object and town stay optional.
 */
export function planError(state: PlanState): PlanErrorKey | null {
  if (state.services.length === 0) return 'services'
  if (!state.name.trim()) return 'name'
  if (!phoneReady(state.phone)) return 'phone'
  if (!state.consent) return 'consent'
  return null
}

/** Fill of the ticket's ring in % — the prototype's five parts (the name is not one of them). */
export function planProgress(state: PlanState): number {
  const parts = [
    state.services.length > 0,
    state.object !== null,
    state.town.trim() !== '',
    phoneReady(state.phone),
    state.consent,
  ]
  return Math.round((parts.filter(Boolean).length / parts.length) * 100)
}

const objectOf = (key: PlanObject | null) => PLAN_OBJECTS.find((o) => o.key === key) ?? null

/** The full planner with the choices so far (`fullHref`; office and hall → company). */
export function plannerHref({ object, services }: Pick<PlanState, 'object' | 'services'>): string {
  const query: string[] = []
  const planner = objectOf(object)?.planner
  if (planner) query.push(`obiekt=${planner}`)
  if (services.length > 0) query.push(`uslugi=${services.join(',')}`)
  return `/zaplanuj${query.length > 0 ? `#${query.join('&')}` : ''}`
}

/**
 * Body of `POST /api/inquiry`: a contact inquiry („Instalacje — strona główna”) — no new
 * inquiry type before I11 (ADR-I001). Services as their panel names in `topics`, the town in
 * `city`; the object and the zone go into the message, which a contact inquiry needs.
 */
export function planBody(
  state: PlanState,
  {
    href,
    formToken,
    website,
    serviceNames,
  }: {
    href: string
    formToken: string
    website: string
    serviceNames: Partial<Record<ServiceKey, string>>
  },
) {
  const town = state.town.trim()
  const zone = travelZone(town)
  const object = objectOf(state.object)
  const message = [
    'Prośba o oddzwonienie ze strony głównej.',
    object && `Obiekt: ${object.label}`,
    zone && `Strefa dojazdu: ${zone}`,
  ]
    .filter(Boolean)
    .join('\n')
  return {
    type: 'contact' as const,
    category: glownaSekcje.plan.category,
    source: sourceFromHref(href),
    // The schema takes at most 10 topics — exactly the 10 services today (`SERVICE_KEYS`).
    topics: state.services.map((key) => serviceNames[key] ?? key),
    ...(town ? { city: town } : {}),
    name: state.name.trim(),
    phone: state.phone.trim(),
    message,
    consent: { accepted: state.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: website,
    formToken,
  }
}
