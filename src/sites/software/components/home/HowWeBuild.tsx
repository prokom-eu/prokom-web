import { Container } from '@/components/ui/Container'
import type { HowWeBuildKind, HowWeBuildView } from '@/lib/software/howWeBuild'

import { SectionHead } from './SectionHead'

/**
 * „Jak robimy” (`#jak-robimy`, spec. §4 pkt 8, board `Main`): lead and three cards — speed,
 * safety, Google and AI — each with its picture, a badge and „Zyskujesz”; the threshold source
 * under them. Its own background (accent tint) sets it apart from the white „Dlaczego nie
 * WordPress” after it (rhythm). Server only: on a phone the cards are a CSS carousel (84%).
 * The pictures are drawn in code from tokens and hidden from screen readers.
 */
export function HowWeBuild({ view }: { view: HowWeBuildView }) {
  return (
    <section id="jak-robimy" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide>
        <div className="flex flex-col gap-6 overflow-hidden rounded-[28px] border border-accent-line bg-accent-soft p-[18px] min-[641px]:gap-8 min-[641px]:rounded-[36px] min-[641px]:p-[clamp(22px,4vw,60px)]">
          <SectionHead eyebrow={view.eyebrow} title={view.title} lead={view.lead} />
          <ul className="-mx-[18px] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[18px] pb-2 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:grid-cols-2 min-[641px]:gap-4 min-[641px]:overflow-visible min-[641px]:px-0 min-[641px]:pb-0 min-[1081px]:grid-cols-3">
            {view.cards.map((card) => (
              <li
                key={card.kind}
                className="flex shrink-0 basis-[84%] snap-start flex-col gap-2.5 rounded-[26px] border border-border bg-card p-[18px] pb-[22px] shadow-raised"
              >
                <div
                  aria-hidden="true"
                  className="relative mb-2 flex h-[176px] items-center justify-center overflow-hidden rounded-[18px] bg-card-2"
                >
                  <Picture kind={card.kind} />
                  {card.badge ? (
                    <span className="absolute bottom-2.5 left-3 rounded-[9px] bg-ink px-2.5 py-1 font-display text-sm font-extrabold text-surface">
                      {card.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className="px-1 font-display text-[28px] font-extrabold leading-none tracking-tight">
                  {card.name}
                </h3>
                <p className="px-1 text-[15.5px] leading-relaxed text-ink-2">{card.text}</p>
                <p className="mt-auto flex items-start gap-2.5 rounded-[14px] bg-ok/10 p-3 text-[14.5px] font-bold leading-snug">
                  <span className="mt-px grid size-[22px] shrink-0 place-items-center rounded-full bg-ok-text text-surface">
                    <Check />
                  </span>
                  <span>
                    <small className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-ok-text">
                      {view.gainLabel}
                    </small>
                    {card.gain}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          {view.source || view.result ? (
            <p className="text-xs text-ink-2">
              {[view.source, view.result].filter(Boolean).join(' ')}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

function Check() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

/** A label of the shield picture with its tick. */
function Tick({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={`absolute whitespace-nowrap rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-extrabold text-ink shadow-raised ${className}`}
    >
      <span className="text-ok-text">✓ </span>
      {text}
    </span>
  )
}

/** The board's pictures: a speed gauge in the green, a shield with its jobs, a search result. */
function Picture({ kind }: { kind: HowWeBuildKind }) {
  if (kind === 'speed') {
    return (
      <svg viewBox="0 0 200 120" className="h-auto w-[78%]">
        <path
          d="M20 110A80 80 0 0 1 180 110"
          fill="none"
          className="stroke-surface-2"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M20 110A80 80 0 0 1 180 110"
          fill="none"
          className="stroke-ok-text"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="251"
          strokeDashoffset="75"
        />
        <line
          x1="100"
          y1="110"
          x2="100"
          y2="40"
          className="stroke-ink"
          strokeWidth="4"
          strokeLinecap="round"
          transform="rotate(48 100 110)"
        />
        <circle cx="100" cy="110" r="8" className="fill-ink" />
      </svg>
    )
  }
  if (kind === 'safe') {
    return (
      <div className="relative flex size-full items-center justify-center">
        <svg
          width="70"
          height="70"
          viewBox="0 0 24 24"
          fill="none"
          className="stroke-accent-text"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
          <path d="M8.5 12l2.5 2.5 4.5-5" />
        </svg>
        <Tick text="kopia · 03:00" className="left-3 top-4" />
        <Tick text="aktualizacje" className="right-3 top-10" />
        <Tick text="monitoring" className="bottom-10 left-[36%]" />
      </div>
    )
  }
  return (
    <div className="flex w-[86%] flex-col gap-1.5">
      <p className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-bold text-ink">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="text-ink-2"
        >
          <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />
        </svg>
        remont łazienki Rabka
      </p>
      <p className="flex flex-col gap-0.5 rounded-[10px] border-2 border-accent-text bg-card px-3 py-2 shadow-raised">
        <span className="text-[9.5px] text-ok-text">twojafirma.pl</span>
        <b className="text-xs text-accent-text">Remonty łazienek · Rabka-Zdrój</b>
        <span className="mt-1 flex gap-1">
          {['szybka', 'na telefon', 'czytelna dla AI'].map((tag) => (
            <i
              key={tag}
              className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[9px] font-extrabold not-italic text-accent-text"
            >
              {tag}
            </i>
          ))}
        </span>
      </p>
      <p className="flex flex-col gap-0.5 rounded-[10px] border border-border bg-card px-3 py-2">
        <span className="text-[9.5px] text-ink-2">portal-ogloszen.pl</span>
        <b className="text-xs text-ink-2">Remonty – ogłoszenia</b>
      </p>
    </div>
  )
}
