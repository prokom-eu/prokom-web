'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { SlidingPill } from '@/components/motion/SlidingPill'
import type { InstMenu, MenuColumn } from '@/lib/instalacje/menu'

import { Arrow } from '../Arrow'
import type { Navigation } from '../dane/types'
import { hue } from '../hue'
import { InstIcon } from '../InstIcon'
import { solutionsText } from './offerText'

type Tab = 'services' | 'objects' | 'more'

const TABS: { key: Tab; label: string }[] = [
  { key: 'services', label: 'Usługi' },
  { key: 'objects', label: 'Dla kogo' },
  { key: 'more', label: 'Strony' },
]

function Tiles({ columns }: { columns: MenuColumn[] }) {
  return columns.map((column) => (
    <div key={column.label}>
      <span className="mgh">{column.label}</span>
      <div className="mgrid">
        {column.items.map((item) => (
          <Link key={item.key} href={item.href} style={hue(item.color)}>
            <span className="mhi2">
              <InstIcon name={item.icon} size={18} />
            </span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  ))
}

/**
 * The line's part of the shared menu sheet (L1-I, spec §5 `MenuSheet` — „lista linii = slot
 * linii”): the coloured tiles of services and objects from I14 behind three tabs, and the pages.
 * Contact, status, the lines and the theme switch are the shared part of the sheet below it.
 */
export function InstSheetList({ navigation, menu }: { navigation: Navigation; menu: InstMenu }) {
  const [tab, setTab] = useState<Tab>('services')
  const tabs = useRef<HTMLDivElement>(null)

  return (
    <div className="isheet">
      <div ref={tabs} className="mtabs" role="group" aria-label="Sekcje menu">
        <SlidingPill container={tabs} active={tab} className="inst-pill" radius={12} />
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={tab === item.key ? 'mtab on' : 'mtab'}
            aria-pressed={tab === item.key}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'services' && (
        <>
          <Tiles columns={menu.services} />
          <Link href="/uslugi" className="mall">
            Pełna oferta: {solutionsText(menu.offer.solutions)} <Arrow />
          </Link>
        </>
      )}
      {tab === 'objects' && <Tiles columns={menu.objects} />}
      {tab === 'more' && (
        <div className="mshl">
          {navigation.more.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="mhi2">
                <InstIcon name={item.icon} size={18} />
              </span>
              <span>
                <b>{item.label}</b>
                {item.caption && <small>{item.caption}</small>}
              </span>
              <i>
                <InstIcon name="chevronRight" size={16} />
              </i>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
