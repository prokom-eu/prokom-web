'use client'

import { labelKey } from '@/lib/analytics/events'
import { track } from '@/lib/analytics/track'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { activeSection, type InstMenu } from '@/lib/instalacje/menu'

import type { Navigation } from '../dane/types'
import { InstIcon } from '../InstIcon'
import { useShell } from './ShellProvider'

type Props = { navigation: Navigation; menu: InstMenu }

/**
 * Phone bottom bar (≤ 760 px, MOBILE-APLIKACJA §3; `zrodlo/footer.html` → `.bnav`): Start ·
 * Usługi · Zaplanuj (raised) · Dla kogo · Więcej. The active tab is the page's section or the
 * tab of the open sheet; the bar fades out under the open sheet.
 */
export function TabBar({ navigation, menu }: Props) {
  const pathname = usePathname()
  const { sheet, toggleSheet } = useShell()
  const section = activeSection(pathname, menu, navigation)

  return (
    <nav className={sheet ? 'bnav bnsh' : 'bnav'} aria-label="Szybka nawigacja">
      {navigation.bottomBar.map((item) => {
        const icon = (
          <span className="bni">
            <InstIcon name={item.icon} size={21} strokeWidth={2.1} />
          </span>
        )
        if ('href' in item) {
          const active = !item.featured && section.tab === 'home' && !sheet
          return (
            <Link
              key={item.label}
              href={item.href}
              className={item.featured ? 'mid' : active ? 'act' : undefined}
              aria-current={active ? 'page' : undefined}
              onClick={() => track('pasek_klik', { pozycja: labelKey(item.label) })}
            >
              {icon}
              <span>{item.label}</span>
            </Link>
          )
        }
        const active = sheet ? sheet === item.sheet : section.tab === item.sheet
        return (
          <button
            key={item.label}
            type="button"
            className={active ? 'act' : undefined}
            aria-haspopup="dialog"
            aria-expanded={sheet === item.sheet}
            onClick={() => {
              // Statistics (ADR-020): the tab by its label key; opening a sheet is „menu_otworz”.
              track('pasek_klik', { pozycja: labelKey(item.label) })
              if (sheet !== item.sheet) track('menu_otworz')
              toggleSheet(item.sheet)
            }}
          >
            {icon}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
