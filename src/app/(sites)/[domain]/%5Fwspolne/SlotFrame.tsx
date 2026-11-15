/**
 * Where a line puts its own section in a shared template (spec §6.0) — on the preview pages only:
 * a dashed frame with the slot's name, so the places can be compared with the boards.
 */
export function SlotFrame({ name, dark }: { name: string; dark?: boolean }) {
  return (
    <div className={dark ? '' : 'mx-auto max-w-[1344px] px-5 py-4 min-[768px]:px-8'}>
      <p
        className={
          dark
            ? 'rounded-[22px] border-2 border-dashed border-line-dark-rule p-5 text-sm font-bold text-line-dark-ink'
            : 'rounded-[22px] border-2 border-dashed border-border-input p-5 text-sm font-bold text-ink-2'
        }
        data-slot={name}
      >
        slot: {name}
      </p>
    </div>
  )
}
