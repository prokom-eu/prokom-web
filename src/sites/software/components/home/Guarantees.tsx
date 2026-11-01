import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import type { SoftwareHomeSections } from '@/lib/software/home'

export type GuaranteeCard = { title: string; text: string; icon: string }

type Props = {
  texts: NonNullable<SoftwareHomeSections['guarantees']>
  cards: GuaranteeCard[]
}

/**
 * „Zasady, których się trzymamy” (`#zasady`, spec. §4 pkt 12, board `Main`): the guarantee cards
 * and the „Czasem powiemy: tego nie buduj.” block on the flat `bg-cta` (ADR-015 v23 pkt 1) — v21:
 * centred, with its eyebrow pill and „Zapytaj, co się opłaca →”. Icons are SVG paths from
 * `SoftwareSettings.home.guarantees`, like the board. One column on a phone.
 */
export function Guarantees({ texts, cards }: Props) {
  return (
    <section id="zasady" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide className="flex flex-wrap items-stretch gap-6">
        <div className="flex min-w-0 flex-[2_1_640px] flex-col gap-7">
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[640px]:text-sm">
              {texts.eyebrow}
            </p>
            <h2
              data-reveal
              className="font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[640px]:text-5xl min-[1081px]:text-[56px]"
            >
              {texts.title}
            </h2>
          </div>
          <ul
            data-reveal-cards
            className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]"
          >
            {cards.map((card, index) => (
              <li
                key={`${index}-${card.title}`}
                className="flex gap-3 rounded-[20px] border border-border bg-card p-3.5 transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-accent-line motion-reduce:transition-none motion-reduce:hover:translate-y-0 min-[641px]:gap-3.5 min-[641px]:p-5"
              >
                <span className="grid size-[46px] shrink-0 place-items-center rounded-[14px] bg-accent-soft text-accent-text">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={card.icon} />
                  </svg>
                </span>
                <span className="flex flex-col gap-1">
                  <b className="text-base">{card.title}</b>
                  <span className="text-sm text-ink-2">{card.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col items-start justify-center gap-3.5 rounded-[28px] bg-cta p-[22px] text-white shadow-raised min-[641px]:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-extrabold">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.01" />
            </svg>
            {texts.sayNo.eyebrow}
          </p>
          <p className="font-display text-[30px] font-extrabold leading-none min-[641px]:text-[40px]">
            {texts.sayNo.title}
          </p>
          <p className="text-base">{texts.sayNo.text}</p>
          <Link
            href={texts.sayNo.link[1]}
            className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-4 text-sm font-extrabold text-accent-text"
          >
            {texts.sayNo.link[0]}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  )
}
