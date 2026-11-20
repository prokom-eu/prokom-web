import Image from 'next/image'
import Link from 'next/link'

import { brandHref } from '@/lib/catalog/brand'
import type { EquipmentExtras } from '@/lib/instalacje/equipmentMenu'

import type { MegaPromo } from '../dane/types'

// Server components of the „Sprzęt ▾” mega menu (INST-K3), rendered in `Frame.tsx` and handed to the
// client header as nodes: the header chunk is shared by the line frames (and so loaded on
// Software), so this markup and `next/image` must not live in it.

/**
 * The side panel of „Sprzęt ▾” (INST-K3): the first ready bundles with the way to all of them and
 * to the whole offer — in place of the plain promo once the line has bundles.
 */
export function EquipmentPanel({ more, promo }: { more: EquipmentExtras; promo: MegaPromo }) {
  return (
    <div className="megap megaeq">
      <span className="eye text-[12px]">Gotowe zestawy</span>
      <ul className="megaeq-list" role="list">
        {more.bundles.map((bundle) => (
          <li key={bundle.slug}>
            <Link href={bundle.href}>
              <b>{bundle.name}</b>
              <span>{bundle.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/zestawy" className="btn btn-p btn-s self-start">
        Wszystkie zestawy ({more.bundleCount}) →
      </Link>
      <Link href={promo.button.href} className="megal">
        {promo.button.label}
      </Link>
    </div>
  )
}

/** The salon logos under the departments of „Sprzęt ▾” (INST-K3). */
export function SalonStrip({ more }: { more: EquipmentExtras }) {
  return (
    <div className="megasal">
      <span className="megah">Salony marek</span>
      <ul role="list">
        {more.salons.map((salon) => (
          <li key={salon.slug}>
            <Link href={brandHref(salon.slug)} aria-label={`Salon ${salon.name}`}>
              {salon.logo ? (
                <Image
                  src={salon.logo.src}
                  alt=""
                  width={salon.logo.width}
                  height={salon.logo.height}
                  unoptimized
                />
              ) : (
                <b>{salon.name}</b>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/marki" className="megal">
        Wszystkie marki →
      </Link>
    </div>
  )
}
