'use client'

import type { HeroObject } from '../../dane/glowna'
import { InstIcon } from '../../InstIcon'
import { showHeroObject } from '../../widzety/glowna/heroEvents'

/** „Pokaż na żywo” of a „Dla kogo” card: the hero switches to this object, the page jumps up. */
export function LiveButton({ object, label }: { object: HeroObject; label: string }) {
  return (
    <a href="#start" className="obl" onClick={() => showHeroObject(object)}>
      <InstIcon name="eye" size={15} />
      {label}
    </a>
  )
}
