import { TAP_AREA } from '@/components/shared/tapArea'
import type { HubBranch } from '@/lib/prokom/data'
import { toTelHref } from '@/lib/site/link'

const CARD = 'flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-sm'
const KICKER = 'text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase'

/** `label` names the number for screen readers („Biuro (stacjonarny): 18 267 65 11”). */
function Phone({ number, label }: { number: string; label: string }) {
  const tel = toTelHref(number)
  return tel ? (
    <a
      href={tel}
      aria-label={`${label}: ${number}`}
      className={`font-bold whitespace-nowrap text-accent-text ${TAP_AREA}`}
    >
      {number}
    </a>
  ) : (
    <span className="font-bold whitespace-nowrap">{number}</span>
  )
}

/**
 * Landlines of the hub (decision 15.11): the same numbers as the Google business profile, kept
 * modest under the salon card of `/kontakt` — the main numbers stay the hub's two.
 */
export function ExtraPhones({ phones }: { phones: readonly { label: string; number: string }[] }) {
  if (!phones.length) return null
  return (
    <div className={CARD}>
      <span className={KICKER}>Numery stacjonarne</span>
      <ul className="flex flex-col gap-3">
        {phones.map((phone, index) => (
          <li key={`${index}-${phone.number}`} className="flex flex-wrap justify-between gap-x-4">
            <span>{phone.label}</span>
            <Phone number={phone.number} label={phone.label} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The Zakopane point: only the Tech service there (decision 15.11), so no hours or map. */
export function BranchNote({ branch }: { branch: HubBranch | null }) {
  if (!branch) return null
  return (
    <div className={CARD}>
      <span className={KICKER}>{branch.name}</span>
      <p>
        {branch.street}, {[branch.postalCode, branch.city].filter(Boolean).join(' ')}
        {branch.phone && (
          <>
            {' · '}
            <Phone number={branch.phone} label={branch.name} />
          </>
        )}
      </p>
      {branch.note && <p className="text-ink-2">{branch.note}</p>}
    </div>
  )
}

/**
 * „Punkt partnerski ALSEN” under the salon card (runda 1811, D4) — only once Krystian confirms the
 * salon is the network's point (its fact approved); links to the section on `/o-firmie`.
 */
export function PartnerPointNote({ text, href }: { text: string | null; href: string }) {
  if (!text) return null
  return (
    <p className="text-sm text-ink-2">
      <a
        href={href}
        className={`font-bold text-accent-text underline-offset-4 hover:underline ${TAP_AREA}`}
      >
        {text}
      </a>
    </p>
  )
}
