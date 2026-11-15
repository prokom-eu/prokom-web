import { TAP_AREA } from '@/components/shared/tapArea'
import type { HubLineContact } from '@/lib/prokom/lineContacts'
import { saturdayLines } from '@/lib/prokom/saturday'
import { toTelHref } from '@/lib/site/link'

/**
 * Under the salon card of `/kontakt`: the salon is closed on Saturday, but Tech works then
 * (decision of 15.11). Hours and phone from the panel; no line with Saturday hours = nothing.
 */
export function SaturdayNote({ lines }: { lines: readonly HubLineContact[] }) {
  const open = saturdayLines(lines)
  if (!open.length) return null
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-sm">
      <span className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
        W sobotę
      </span>
      {open.map((entry) => {
        const line = lines.find((item) => item.key === entry.key)
        const tel = line?.phone ? toTelHref(line.phone) : null
        return (
          <p key={entry.key}>
            Czynny tylko <b>{entry.name}</b>: {entry.saturday}.
            {tel && line?.phone && (
              <>
                {' '}
                <a
                  href={tel}
                  className={`font-bold whitespace-nowrap text-accent-text ${TAP_AREA}`}
                >
                  {line.phone}
                </a>
              </>
            )}
          </p>
        )
      })}
    </div>
  )
}
