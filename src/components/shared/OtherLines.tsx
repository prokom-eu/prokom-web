import { cx } from '@/components/ui/cx'
import { withGamingLast, type SharedLineKey } from '@/lib/shared/lines'
import type { SharedLine } from '@/lib/shared/project'

type Props = {
  /** Published lines (`getSharedData().lines`). */
  lines: readonly SharedLine[]
  current: SharedLineKey
  className?: string
}

/**
 * „Inna sprawa? Każda linia ma swój zespół.” (spec §6.1 pkt 5): a tile per other line — not the
 * current one, Gaming last in its own colours (§2.4) — with a 4 px bar in the line's colour on top.
 * Plain links to the other sites (SEO §8); a line without an address is a tile, not a link.
 */
export function OtherLines({ lines, current, className }: Props) {
  const others = withGamingLast(lines.filter((line) => line.key !== current))
  if (others.length === 0) return null
  return (
    <ul
      className={cx(
        'grid gap-3 min-[640px]:grid-cols-2',
        // Four tiles in one row, never three and an orphan (audit 10.11 §5); otherwise three.
        others.length === 4 ? 'min-[1000px]:grid-cols-4' : 'min-[1000px]:grid-cols-3',
        className,
      )}
      data-other-lines
    >
      {others.map((line) => {
        const gaming = line.key === 'gaming'
        const Tag = line.url ? 'a' : 'div'
        return (
          <li key={line.key}>
            <Tag
              href={line.url ?? undefined}
              className={cx(
                'relative flex h-full flex-col gap-2 overflow-hidden rounded-[22px] border p-5 pt-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
                gaming
                  ? 'border-gaming-border bg-gaming-bg text-gaming-ink'
                  : 'border-border bg-card hover:border-accent-text',
              )}
              data-other-line={line.key}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1"
                style={{
                  background: gaming ? 'var(--gaming-dash)' : (line.color ?? 'var(--border)'),
                }}
              />
              <b className="font-display text-lg font-extrabold">
                {line.name.startsWith('PRO-KOM') ? line.name : `PRO-KOM ${line.name}`}
              </b>
              {line.description && (
                <span className={gaming ? undefined : 'text-ink-2'}>{line.description}</span>
              )}
              {line.domain && (
                <span
                  className={cx(
                    'mt-auto text-sm font-bold',
                    gaming ? 'text-gaming-gold' : 'text-accent-text',
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
  )
}
