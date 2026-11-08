'use client'

import { liveChipText } from '@/lib/biznes/procurement/logic'

import { ProcIcon } from './icons'
import { useProcurement } from './ProcurementConfigurator'

/** Text of the hero's `live` chip (§3): „12 × kawalerka · 84 szt.” from the configurator. */
export function LiveChipText() {
  const { state, data } = useProcurement()
  return <span>{liveChipText(state, data)}</span>
}

/**
 * The class card's button (7′, AGD): stretched over the card, so the whole card picks the
 * class (and the offer variant); the card's content stays server-rendered beside it.
 */
export function ClassPick({ index, name }: { index: number; name: string }) {
  const { state, dispatch, notify } = useProcurement()
  const on = state.cls === index
  return (
    <button
      type="button"
      className="zp-var-pick"
      aria-pressed={on}
      aria-label={`Klasa ${name}`}
      onClick={() => {
        dispatch({ type: 'cls', index })
        notify(`Klasa „${name}” — zestaw i podgląd oferty zaktualizowane`)
      }}
    >
      <span aria-hidden="true">
        {on && <ProcIcon name="check" />}
        {on ? 'Wybrana' : 'Wybierz'}
      </span>
    </button>
  )
}
