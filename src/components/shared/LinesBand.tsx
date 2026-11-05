import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SharedLineKey } from '@/lib/shared/lines'
import type { SharedLine } from '@/lib/shared/project'

import { LineLogo } from './LineLogo'

export type LinesBandProps = {
  /** Published lines in panel order (`getSharedData().lines`): 5, or 6 once Gaming is published. */
  lines: readonly SharedLine[]
  current: SharedLineKey
  className?: string
}

/** Gaming last, as in the brand bar (spec §2.4). */
const ordered = (lines: readonly SharedLine[]) => [
  ...lines.filter((line) => line.key !== 'gaming'),
  ...lines.filter((line) => line.key === 'gaming'),
]

/**
 * „Jedna firma — linie PRO-KOM” (spec §5 `LinesBand`, board Footer B): a tile per published line
 * with its mark, description and domain; the current one framed in the line colour with „Jesteś
 * tutaj”, Gaming in its own colours (§2.4). Plain links to the other sites (SEO §8). On a phone the
 * tiles form a scrolling row.
 */
export function LinesBand({ lines, current, className }: LinesBandProps) {
  return (
    <section
      aria-labelledby="lines-band-title"
      className={cx('flex flex-col gap-3.5', className)}
      data-lines-band
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <h2
          id="lines-band-title"
          className="text-xs font-extrabold tracking-[0.12em] text-line-dark-ink uppercase"
        >
          Jedna firma — linie PRO-KOM
        </h2>
        <span className="text-[12.5px]">Każda linia ma swój zespół i swój numer</span>
      </div>
      <ul
        className="-mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] min-[900px]:mx-0 min-[900px]:grid min-[900px]:grid-cols-6 min-[900px]:overflow-visible min-[900px]:px-0"
        data-scroll-thin
      >
        {ordered(lines).map((line) => {
          const isCurrent = line.key === current
          const gaming = line.key === 'gaming'
          // A published line without an address is a tile, not a link without href.
          const Tag = line.url ? 'a' : 'div'
          return (
            <li key={line.key} className="w-[150px] shrink-0 snap-start min-[900px]:w-auto">
              <Tag
                href={line.url ?? undefined}
                aria-current={isCurrent ? 'page' : undefined}
                data-line-tile={line.key}
                className={cx(
                  'flex h-full min-h-[100px] flex-col gap-2.5 rounded-[14px] border px-4 py-3.5 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text',
                  gaming
                    ? 'border-gaming-border bg-gaming-bg'
                    : isCurrent
                      ? 'border-on-dark bg-line-dark-current'
                      : 'border-line-dark-rule bg-line-dark-card hover:bg-line-dark-current',
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  {gaming || line.key !== 'zakopane' ? (
                    <LineLogo
                      line={line.key}
                      alt={`PRO-KOM ${line.name}`}
                      on="dark"
                      height={gaming ? 22 : 15}
                    />
                  ) : (
                    <b className="font-display text-sm font-extrabold text-line-dark-ink">
                      PRO-KOM {line.name}
                    </b>
                  )}
                  {isCurrent ? (
                    <span className="rounded-full bg-on-dark px-[7px] py-[3px] text-[10.5px] font-extrabold whitespace-nowrap text-on-dark-ink">
                      Jesteś tutaj
                    </span>
                  ) : (
                    <Icon
                      name="arrow"
                      strokeWidth={2.2}
                      className="size-4 -rotate-45 text-line-dark-text"
                    />
                  )}
                </span>
                {line.description && (
                  <span className="text-[13px] leading-[1.4]">{line.description}</span>
                )}
                {line.domain && (
                  <span
                    className={cx(
                      'mt-auto text-xs font-bold',
                      gaming ? 'text-gaming-gold' : 'text-line-dark-ink',
                    )}
                  >
                    {line.domain}
                  </span>
                )}
              </Tag>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
