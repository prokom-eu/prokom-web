import { cx } from '@/components/ui/cx'
import { toDirectionsHref, toMapsHref } from '@/lib/site/link'

/**
 * Towns of the area diagram, placed as on the board (percent of the box, Rabka in the middle).
 * A picture of the geography, hidden from screen readers; the towns served are content —
 * `SiteSettings.biznes.serviceAreas`, listed in the card.
 */
const TOWNS = [
  { name: 'Kraków', x: 48, y: 10 },
  { name: 'Myślenice', x: 54, y: 25 },
  { name: 'Jordanów', x: 24, y: 44 },
  { name: 'Mszana Dolna', x: 72, y: 40 },
  { name: 'Limanowa', x: 86, y: 30 },
  { name: 'Nowy Sącz', x: 88, y: 60 },
  { name: 'Nowy Targ', x: 62, y: 78 },
  { name: 'Zakopane', x: 50, y: 91 },
  { name: 'Szczawnica', x: 84, y: 84 },
] as const
const CENTER = { x: 50, y: 54 }

const LABEL = 'text-xs font-black tracking-[0.06em] text-accent-text uppercase'

type Props = {
  /** Small label above the diagram, e.g. „Dojeżdżamy na całe Podhale i Małopolskę”. */
  label?: string | null
  companyName: string
  /** „ul. Orkana 16B, Rabka-Zdrój” — the badge in the middle. */
  street: string | null
  /** Full address for the Google Maps links; without it no buttons. */
  fullAddress: string | null
  /**
   * `dark` (board `Web-kontakt`): the diagram on navy, the label and „Wyznacz trasę” in a strip
   * at the bottom; meant as the top of a card (`className` sets its corners).
   */
  variant?: 'light' | 'dark'
  className?: string
}

/**
 * The area served as a static diagram (towns around Rabka) with links to Google Maps — no
 * embedded map, so nothing loads from Google before cookie consent (spec. §6.9). Shared by
 * the K4 Kontakt page (`bzSection`) and „Gdzie nas znaleźć” (`bzLocation`).
 */
export function AreaMap({
  label,
  companyName,
  street,
  fullAddress,
  variant = 'light',
  className,
}: Props) {
  if (variant === 'dark') {
    return (
      <DarkAreaMap
        label={label}
        companyName={companyName}
        street={street}
        fullAddress={fullAddress}
        className={className}
      />
    )
  }
  return (
    <div className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[28px] bg-surface-2 p-5 shadow-[inset_0_0_0_1px_var(--border)] sm:min-h-[560px]">
      {label && <p className={LABEL}>{label}</p>}
      <div className="relative mt-2 min-h-[340px] flex-1">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full text-accent-text/50"
          preserveAspectRatio="none"
        >
          {TOWNS.map((town) => (
            <line
              key={town.name}
              x1={`${CENTER.x}%`}
              y1={`${CENTER.y}%`}
              x2={`${town.x}%`}
              y2={`${town.y}%`}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div aria-hidden="true">
          {TOWNS.map((town) => (
            <span
              key={town.name}
              style={{ left: `${town.x}%`, top: `${town.y}%` }}
              // Towns at the right edge hang to the left, so a phone does not cut them.
              className={`absolute ${town.x > 80 ? '-translate-x-[85%]' : '-translate-x-1/2'} -translate-y-1/2 rounded-full bg-card px-2 py-0.5 text-xs font-bold sm:px-2.5 sm:py-1 sm:text-[13px] whitespace-nowrap text-ink shadow-[0_6px_14px_-8px_var(--glow),inset_0_0_0_1px_var(--border)]`}
            >
              {town.name}
            </span>
          ))}
        </div>
        <div
          style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
          className="absolute flex -translate-x-1/2 -translate-y-[14px] flex-col items-center gap-3"
        >
          <span
            aria-hidden="true"
            className="size-7 rounded-full border-[6px] border-accent-text/25 bg-accent-text"
          />
          {street && (
            // Too wide for the diagram on a phone; the address is in the card beside it.
            <span
              data-surface="dark"
              className="hidden rounded-xl bg-surface-dark px-4 py-2 text-center text-sm text-white sm:block"
            >
              <b className="block">{companyName}</b>
              <span className="text-[13px] text-white/80">{street}</span>
            </span>
          )}
        </div>
      </div>
      {fullAddress && (
        <div className="relative mt-4 flex flex-wrap justify-center gap-3">
          <a
            href={toMapsHref(fullAddress)}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center rounded-xl bg-accent-text px-4 font-bold text-accent-ink hover:bg-ink hover:text-surface"
          >
            Otwórz w Mapach Google
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
          <a
            href={toDirectionsHref(fullAddress)}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center rounded-xl bg-card px-4 font-bold text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]"
          >
            Wyznacz trasę →<span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
        </div>
      )}
    </div>
  )
}

/** The dark diagram of the Kontakt page (board `Web-kontakt`): towns as text on navy. */
function DarkAreaMap({
  label,
  companyName,
  street,
  fullAddress,
  className,
}: Omit<Props, 'variant'>) {
  return (
    <div
      data-surface="dark"
      className={cx(
        'relative flex flex-col overflow-hidden bg-surface-dark bg-[radial-gradient(70%_60%_at_50%_45%,color-mix(in_srgb,var(--accent-text)_35%,transparent),transparent_70%)] text-white',
        className,
      )}
    >
      <div className="relative mx-5 mt-5 min-h-[300px] flex-1 sm:min-h-[330px]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full text-white/15"
          preserveAspectRatio="none"
        >
          {TOWNS.map((town) => (
            <line
              key={town.name}
              x1={`${CENTER.x}%`}
              y1={`${CENTER.y}%`}
              x2={`${town.x}%`}
              y2={`${town.y}%`}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          ))}
        </svg>
        <div aria-hidden="true">
          {TOWNS.map((town) => (
            <span
              key={town.name}
              style={{ left: `${town.x}%`, top: `${town.y}%` }}
              className={`absolute ${town.x > 80 ? '-translate-x-[85%]' : '-translate-x-1/2'} flex -translate-y-1/2 items-center gap-1.5 text-xs font-bold whitespace-nowrap text-white/85 sm:text-[13px]`}
            >
              <span className="size-1.5 rounded-full bg-white/60" />
              {town.name}
            </span>
          ))}
        </div>
        <div
          style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
          className="absolute flex -translate-x-1/2 -translate-y-[12px] items-center gap-3"
        >
          <span
            aria-hidden="true"
            className="size-6 shrink-0 rounded-full border-[5px] border-white/25 bg-accent-on-dark shadow-[0_0_0_10px_color-mix(in_srgb,var(--accent-on-dark)_20%,transparent)]"
          />
          {street && (
            // Too wide for the diagram on a phone; the address is in the card below.
            <span className="hidden rounded-xl bg-white px-3 py-1.5 text-left text-[12.5px] leading-tight text-surface-dark shadow-[0_14px_30px_-14px_var(--glow)] sm:block">
              <b className="block font-extrabold">{companyName}</b>
              {street}
            </span>
          )}
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
        {label && (
          <p className="max-w-[26ch] text-xs font-extrabold tracking-[0.08em] text-white/85 uppercase">
            {label}
          </p>
        )}
        {fullAddress && (
          <a
            href={toDirectionsHref(fullAddress)}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-extrabold tracking-[0.04em] text-surface-dark uppercase hover:bg-accent-on-dark"
          >
            Wyznacz trasę<span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
        )}
      </div>
    </div>
  )
}
