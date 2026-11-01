import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { WhyNotWordpressView } from '@/lib/software/whyNotWordpress'

/**
 * „Dlaczego nie WordPress i PHP” (`#bez-wordpressa`, spec. §4 pkt 8, board `Main`, stany 75, 76,
 * 86). Server only: on a phone the facts are a CSS carousel (84%, the next one peeking in) and
 * the table turns into cards — one row per card, the column names read by screen readers.
 * The table keeps explicit ARIA roles, so changing `display` does not drop its semantics.
 */
export function WhyNotWordpress({ view }: { view: WhyNotWordpressView }) {
  const [theirsColumn, oursColumn] = view.columns
  return (
    <section id="bez-wordpressa" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide>
        <div className="flex flex-col gap-4 overflow-hidden rounded-[28px] border border-border bg-card p-[18px] shadow-raised min-[641px]:gap-[22px] min-[641px]:rounded-[36px] min-[641px]:p-[clamp(22px,4vw,52px)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-[720px] flex-col gap-2.5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[640px]:text-sm">
                {view.eyebrow}
              </p>
              <h2 className="font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[640px]:text-5xl min-[1081px]:text-[56px]">
                {view.title}
              </h2>
            </div>
            {view.lead ? (
              <p className="max-w-[46ch] text-lg text-ink-2 min-[640px]:text-xl">{view.lead}</p>
            ) : null}
          </div>

          {view.facts.length > 0 ? (
            <ul className="-mx-[18px] flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-[18px] pb-2 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:gap-3 min-[641px]:overflow-visible min-[641px]:px-0 min-[641px]:pb-0 min-[1081px]:grid-cols-3">
              {view.facts.map((fact, index) => {
                const ours = index === view.facts.length - 1
                return (
                  <li
                    key={`${index}-${fact.value}`}
                    className={cx(
                      'flex shrink-0 basis-[84%] snap-start flex-col gap-2 rounded-[22px] p-4 min-[641px]:p-5',
                      ours ? 'bg-cta text-white shadow-raised' : 'border border-border bg-card-2',
                    )}
                  >
                    <b
                      className={cx(
                        'font-display text-4xl font-extrabold leading-none tracking-tight min-[641px]:text-[44px]',
                        !ours && 'text-accent-text',
                      )}
                    >
                      {fact.value}
                    </b>
                    <span className="text-[15px] font-semibold leading-normal">{fact.text}</span>
                    <small className={cx('mt-auto text-xs', ours ? 'text-white' : 'text-ink-2')}>
                      {ours ? fact.source : `Źródło: ${fact.source}`}
                    </small>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {view.rows.length > 0 ? (
            <div
              role="table"
              aria-label={`${theirsColumn} a ${oursColumn}`}
              className="flex flex-col overflow-hidden rounded-[22px] border border-border"
            >
              <div
                role="row"
                className="sr-only min-[641px]:not-sr-only min-[641px]:grid min-[641px]:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] min-[641px]:gap-4 min-[641px]:bg-card-2 min-[641px]:px-5 min-[641px]:py-3.5 min-[641px]:text-[12.5px] min-[641px]:font-extrabold min-[641px]:uppercase min-[641px]:tracking-[0.08em] min-[641px]:text-ink-2"
              >
                <span role="columnheader">
                  <span className="sr-only">Cecha</span>
                </span>
                <span role="columnheader">{theirsColumn}</span>
                <span role="columnheader" className="min-[641px]:text-accent-text">
                  {oursColumn}
                </span>
              </div>
              {view.rows.map((row, index) => (
                <div
                  key={`${index}-${row.name}`}
                  role="row"
                  className="grid gap-1.5 border-t border-border px-4 py-3.5 text-[15px] first:border-t-0 min-[641px]:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] min-[641px]:items-center min-[641px]:gap-4 min-[641px]:px-5"
                >
                  <b
                    role="rowheader"
                    className="text-[13px] uppercase tracking-[0.06em] text-ink-2 min-[641px]:text-[15px] min-[641px]:normal-case min-[641px]:tracking-normal min-[641px]:text-ink"
                  >
                    {row.name}
                  </b>
                  <span role="cell" className="flex items-start gap-2.5 leading-snug text-ink-2">
                    <Mark kind="no" />
                    {row.theirs}
                  </span>
                  <span role="cell" className="flex items-start gap-2.5 font-bold leading-snug">
                    <Mark kind="yes" />
                    {row.ours}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {view.cta ? (
            <div className="flex flex-wrap items-center justify-between gap-[18px] rounded-[22px] border border-accent-line bg-accent-soft p-4 min-[641px]:px-[22px] min-[641px]:py-5">
              <div className="max-w-[60ch]">
                <h3 className="mb-1 text-lg font-extrabold">{view.cta.title}</h3>
                {view.cta.text ? (
                  <p className="text-[15px] leading-normal text-ink-soft">{view.cta.text}</p>
                ) : null}
              </div>
              {view.cta.buttons.length > 0 ? (
                <div className="flex w-full flex-col gap-2 min-[641px]:w-auto min-[641px]:flex-row min-[641px]:flex-wrap">
                  {view.cta.buttons.map((button, index) => (
                    <Link
                      key={`${index}-${button.href}`}
                      href={button.href}
                      className={cx(
                        'inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-extrabold',
                        button.primary
                          ? 'bg-button text-accent-ink'
                          : 'border-2 border-border bg-card text-ink hover:border-accent-line',
                      )}
                    >
                      {button.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {view.link ? (
            <Link
              href={view.link.href}
              className="self-start text-[15px] font-extrabold text-accent-text hover:underline"
            >
              {view.link.label}
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

/** ✕ / ✓ next to a cell; the column header says which is which. */
function Mark({ kind }: { kind: 'no' | 'yes' }) {
  return (
    <i
      aria-hidden="true"
      className={cx(
        'mt-px inline-flex size-[22px] shrink-0 items-center justify-center rounded-full',
        kind === 'yes' ? 'bg-ok text-surface' : 'bg-chip text-ink-2',
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={kind === 'yes' ? 3.2 : 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={kind === 'yes' ? 'M5 12l5 5L20 7' : 'M6 6l12 12M18 6L6 18'} />
      </svg>
    </i>
  )
}
