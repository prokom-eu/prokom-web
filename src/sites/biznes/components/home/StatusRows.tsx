import { cx } from '@/components/ui/cx'
import type { ShowcaseStatus } from '@/lib/catalog/catalogIndex'

/** Status bars of a card (Opieka IT: „Kopia danych z nocy · sprawdzona”), on light or navy. */
export function StatusRows({ rows, dark }: { rows: ShowcaseStatus[]; dark?: boolean }) {
  return (
    <ul className="flex w-full flex-col gap-2">
      {rows.map((row, i) => (
        <li
          key={i}
          className={cx(
            'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13px] font-extrabold',
            dark
              ? 'bg-white/5 text-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_12%,transparent)]'
              : 'bg-card text-ink shadow-[0_10px_24px_-16px_var(--glow)]',
          )}
        >
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cx(
                'size-2 shrink-0 rounded-full',
                row.tone === 'ok' ? 'bg-ok' : 'bg-promo',
              )}
            />
            {row.label}
          </span>
          <span className={cx('text-xs font-bold', dark ? 'text-white/70' : 'text-ink-3')}>
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  )
}
