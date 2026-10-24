import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BzNeedsBlock as BzNeedsBlockData } from '@/payload-types'

import { TONE_ICON } from '../../components/home/tones'
import { DaysUntil } from '../../components/DaysUntil'

type Tone = BzNeedsBlockData['items'][number]['tone']

// Whole class names, so Tailwind finds them (tokens: `--tone-*`, Biznes only).
const TONE: Record<Tone, { icon: string; tag: string; arrow: string }> = {
  green: {
    icon: TONE_ICON.green,
    tag: 'bg-tone-green-tag',
    arrow: 'group-hover/need:bg-tone-green',
  },
  red: {
    icon: TONE_ICON.red,
    tag: 'bg-tone-red-tag',
    arrow: 'group-hover/need:bg-tone-red',
  },
  blue: {
    icon: TONE_ICON.blue,
    tag: 'bg-tone-blue-tag',
    arrow: 'group-hover/need:bg-tone-blue',
  },
  violet: {
    icon: TONE_ICON.violet,
    tag: 'bg-tone-violet-tag',
    arrow: 'group-hover/need:bg-tone-violet',
  },
}

const BADGE = {
  promo: {
    box: 'bg-[color-mix(in_srgb,var(--promo)_16%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--promo)_45%,transparent)]',
    value: 'bg-promo text-promo-ink',
  },
  accent: {
    box: 'bg-accent-soft shadow-[inset_0_0_0_1px_var(--accent-line)]',
    value: 'bg-accent-text text-accent-ink',
  },
} as const

const TAG =
  'absolute top-5 right-4.5 rounded-full px-2.5 py-[7px] font-display text-xs leading-none font-extrabold text-white'

/** Corner of a tile: its tag, otherwise an arrow. */
function Corner({ tag, tone }: { tag?: string | null; tone: Tone }) {
  if (tag) return <span className={cx(TAG, TONE[tone].tag)}>{tag}</span>
  return (
    <span
      aria-hidden="true"
      className={cx(
        'absolute top-5 right-4.5 flex size-[34px] items-center justify-center rounded-full bg-surface-2 text-ink-2 transition-[background-color,color,translate] duration-300 group-hover/need:translate-x-[3px] group-hover/need:text-white',
        TONE[tone].arrow,
      )}
    >
      <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
    </span>
  )
}

/**
 * Four tiles of what a company needs, under the hero (spec. §4 pkt 2): icon in the tile's
 * colour, title, text, up to two badges, an arrow or a tag in the corner. The tag may count
 * days to a date (KSeF) — in the browser, see `DaysUntil`.
 */
export function BzNeedsBlock({ block }: { block: BzNeedsBlockData }) {
  return (
    // Over the hero's lower edge only when it comes right after the hero (board: −56 px).
    <section className="relative z-[5] pb-10 [#start+&]:-mt-10 sm:[#start+&]:-mt-14">
      <Container wide>
        <ul className="grid gap-3 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
          {block.items.map((item, i) => {
            const tone = TONE[item.tone]
            return (
              <li key={item.id ?? i} className="flex">
                <Link
                  href={item.href}
                  data-testid="need-tile"
                  className="group/need relative flex w-full flex-col gap-3.5 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_20px_50px_-30px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'flex size-[52px] items-center justify-center rounded-2xl bg-linear-145 text-white',
                      tone.icon,
                    )}
                  >
                    <Icon name={item.icon} className="size-[26px]" />
                  </span>
                  {item.countdownTo ? (
                    <DaysUntil
                      date={item.countdownTo}
                      className={cx(TAG, tone.tag)}
                      fallback={<Corner tag={item.tag} tone={item.tone} />}
                    />
                  ) : (
                    <Corner tag={item.tag} tone={item.tone} />
                  )}
                  <span className="flex flex-col gap-1.5 pr-5">
                    <span className="font-display text-lg leading-tight font-extrabold text-ink">
                      {item.title}
                    </span>
                    <span className="text-sm leading-snug text-ink-2">{item.text}</span>
                  </span>
                  {item.badges && item.badges.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                      {item.badges.map((badge, j) => (
                        <span
                          key={badge.id ?? j}
                          className={cx(
                            'inline-flex items-center gap-[7px] rounded-full py-1 pr-2.5 pl-1 text-[12.5px] leading-tight font-extrabold text-ink',
                            BADGE[badge.tone].box,
                          )}
                        >
                          <span
                            className={cx(
                              'inline-flex h-6 min-w-[30px] items-center justify-center rounded-full px-1.5 font-display text-[11.5px] leading-none',
                              BADGE[badge.tone].value,
                            )}
                          >
                            {badge.value}
                          </span>
                          {badge.text}
                        </span>
                      ))}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
