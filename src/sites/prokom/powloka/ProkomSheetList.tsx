import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/shared/icons'

import type { HubLink } from '../shell'

type Props = {
  links: (HubLink & { icon: IconName })[]
  /** „Cała oferta” (`/linie`) — `null` until the page exists. */
  offerHref: string | null
}

/**
 * The hub's part of the menu sheet (spec §5.4, board Naglowek „Menu PRO-KOM”): „Cała oferta” and
 * „Zacznij od siebie”. The lines, phone, opening hours and theme come from the shared `MenuSheet`
 * around it (its chips „Linie PRO-KOM” — the board's tiles would need a shared option, STAN).
 */
export function ProkomSheetList({ links, offerHref }: Props) {
  return (
    <nav aria-label="Menu PRO-KOM" className="pk-sheet">
      {offerHref && (
        <Link href={offerHref} className="pk-sheet__all">
          Cała oferta PRO-KOM →
        </Link>
      )}
      <p className="pk-sheet__head">Zacznij od siebie</p>
      <ul className="pk-sheet__links">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="pk-sheet__link">
              <Icon name={link.icon} className="size-5" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
