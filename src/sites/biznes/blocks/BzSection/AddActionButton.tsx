'use client'

import { cartActions, openCartDrawer, useCart } from '@/lib/cart/store'

/**
 * „Umów prezentację”, „Przygotujcie moją firmę”: one product on the inquiry list with a note
 * (the toast says so). Once listed, the click opens the list — the next step in sight.
 */
export function AddActionButton({
  slug,
  label,
  note,
  className,
}: {
  slug: string
  label: string
  note?: string
  className?: string
}) {
  const listed = useCart().some((item) => item.id === slug)
  return (
    <button
      type="button"
      onClick={() => {
        // A new position shows the toast; one already listed opens the list instead.
        if (listed) openCartDrawer()
        else cartActions.addItems([{ id: slug, q: 1, uwaga: note }], () => note ?? label)
      }}
      className={className}
    >
      {label}
      {listed && <span className="text-[13px] font-bold opacity-80">· w zapytaniu</span>}
    </button>
  )
}
