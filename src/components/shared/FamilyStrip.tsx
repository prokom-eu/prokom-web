import { cx } from '@/components/ui/cx'
import { withGamingLast, type SharedLineKey } from '@/lib/shared/lines'
import type { SharedLine } from '@/lib/shared/project'

import { LineLogo } from './LineLogo'

type Props = {
  /** Published lines (`getSharedData().lines`), Gaming last. */
  lines: readonly SharedLine[]
  current: SharedLineKey
  className?: string
}

/**
 * „Pięć linii i marka PRO-KOM Gaming” (spec §6.2 pkt 5, `FamilyStrip`): a bar of segments in the
 * line colours (the current one wider), then a card per line — the current in the accent tint with
 * „Jesteś tutaj”, Gaming in its own colours (§2.4). Plain links to the other sites (SEO §8).
 */
export function FamilyStrip({ lines, current, className }: Props) {
  const ordered = withGamingLast(lines)
  return (
    <div className={cx('flex flex-col gap-5', className)} data-family-strip>
      <div aria-hidden="true" className="flex h-2.5 gap-1 overflow-hidden rounded-full">
        {ordered.map((line) => (
          <span
            key={line.key}
            className={line.key === current ? 'flex-[2.5]' : 'flex-1'}
            style={{
              background:
                line.key === 'gaming' ? 'var(--gaming-dash)' : (line.color ?? 'var(--border)'),
            }}
          />
        ))}
      </div>
      <ul className="grid gap-3 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-3">
        {ordered.map((line) => {
          const isCurrent = line.key === current
          const gaming = line.key === 'gaming'
          const Tag = line.url ? 'a' : 'div'
          return (
            <li key={line.key}>
              <Tag
                href={line.url ?? undefined}
                aria-current={isCurrent ? 'page' : undefined}
                className={cx(
                  'flex h-full flex-col gap-2 rounded-[22px] border p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
                  gaming
                    ? 'border-gaming-border bg-gaming-bg text-gaming-ink'
                    : isCurrent
                      ? 'border-accent-text bg-accent-soft'
                      : 'border-border bg-card hover:border-accent-text',
                )}
                data-family-line={line.key}
              >
                <span className="flex items-start justify-between gap-2">
                  {line.key !== 'zakopane' ? (
                    <LineLogo
                      line={line.key}
                      alt={`PRO-KOM ${line.name}`}
                      on={gaming ? 'dark' : 'auto'}
                      height={gaming ? 26 : 22}
                    />
                  ) : (
                    <b className="font-display font-extrabold">PRO-KOM {line.name}</b>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-extrabold whitespace-nowrap text-accent-ink">
                      Jesteś tutaj
                    </span>
                  )}
                </span>
                {(line.descriptionLong || line.description) && (
                  <span className={gaming ? undefined : 'text-ink-2'}>
                    {line.descriptionLong || line.description}
                  </span>
                )}
                {line.domain && (
                  <span
                    className={cx(
                      'mt-auto text-sm font-bold',
                      // On the accent tint the accent text is 4.49:1 in Biznes dark — the current card uses ink.
                      gaming ? 'text-gaming-gold' : isCurrent ? 'text-ink' : 'text-accent-text',
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
    </div>
  )
}
