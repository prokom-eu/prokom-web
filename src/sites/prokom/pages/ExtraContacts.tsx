import { TAP_AREA } from '@/components/shared/tapArea'
import type { HubBranch } from '@/lib/prokom/data'
import { toTelHref } from '@/lib/site/link'

const CARD = 'flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-sm'
const KICKER = 'text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase'

function Phone({ number }: { number: string }) {
  const tel = toTelHref(number)
  return tel ? (
    <a href={tel} className={`font-bold whitespace-nowrap text-accent-text ${TAP_AREA}`}>
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
      <ul className="flex flex-col gap-1.5">
        {phones.map((phone) => (
          <li key={phone.number} className="flex flex-wrap justify-between gap-x-4">
            <span>{phone.label}</span>
            <Phone number={phone.number} />
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
        {branch.street}, {branch.postalCode} {branch.city}
        {branch.phone && (
          <>
            {' · '}
            <Phone number={branch.phone} />
          </>
        )}
      </p>
      {branch.note && <p className="text-ink-2">{branch.note}</p>}
    </div>
  )
}
