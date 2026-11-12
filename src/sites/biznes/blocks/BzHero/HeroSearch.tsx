'use client'

import { requestSearch } from '@/lib/site/searchOpen'

import { SearchIcon } from '../../components/SearchIcon'

/** Search field of the phone hero (board App-Start `.hero .srch`): opens the site search. */
export function HeroSearch({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => requestSearch()}
      className={className}
    >
      <SearchIcon size={20} />
      Szukaj: kasa, laptop, KSeF…
    </button>
  )
}
