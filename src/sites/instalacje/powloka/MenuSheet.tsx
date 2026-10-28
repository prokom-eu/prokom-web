'use client'

import Link from 'next/link'

import { BottomSheet } from '@/components/BottomSheet'
import type { InstMenu, MenuColumn } from '@/lib/instalacje/menu'
import type { OpeningHours, OpeningStatus } from '@/lib/site/hours'

import type { Navigation, SheetTab } from '../dane/types'
import { InstIcon } from '../InstIcon'
import { hue } from './Header'
import { HoursLive } from './HoursLive'
import { solutionsText } from './offerText'
import { useShell } from './ShellProvider'
import { ThemeTile } from './ThemeButton'

/** The sheet serves phones and tablets; from 1101 px the header has the mega menu (spec §4). */
const DESKTOP_QUERY = '(min-width: 1101px)'

/** Phone: from the bottom, full width; tablet (761–1100 px): centred, at most 560 px. */
const PANEL =
  'mshp inset-x-0 bottom-0 top-auto mx-auto w-full max-w-[560px] max-h-[min(88vh,860px)] rounded-t-[28px] min-[761px]:inset-y-0 min-[761px]:my-auto min-[761px]:h-fit min-[761px]:max-h-[84vh] min-[761px]:rounded-[28px]'
const BACKDROP = 'backdrop:bg-[var(--inst-scrim)] backdrop:backdrop-blur-[3px]'

const TABS: SheetTab[] = ['services', 'objects', 'more']

type Props = {
  navigation: Navigation
  menu: InstMenu
  hours: OpeningHours | null
  status: OpeningStatus | null
  phone: { label: string; href: string } | null
}

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
 * Menu sheet of phones and tablets (MOBILE-APLIKACJA §4; `zrodlo/footer.html` → `.msh`): three
 * tabs — services, objects, more — and „Zaplanuj instalację” at the bottom. Closes with ×, the
 * backdrop, a pull down, Esc and the browser's „back” (`ShellProvider`).
 */
export function MenuSheet({ navigation, menu, hours, status, phone }: Props) {
  const { sheet, openSheet, closeSheet, closeSheetForLink } = useShell()
  const tab = sheet ?? 'services'

  const header = (
    <div className="mt-3 flex items-center gap-2">
      <div className="mtabs" role="group" aria-label="Sekcje menu">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            className={tab === item ? 'mtab on' : 'mtab'}
            aria-pressed={tab === item}
            onClick={() => openSheet(item)}
          >
            {navigation.sheetTabs[item]}
          </button>
        ))}
      </div>
      <button type="button" className="iconb mshx" aria-label="Zamknij" onClick={closeSheet}>
        <InstIcon name="x" size={18} />
      </button>
    </div>
  )

  const footer = (
    <Link href={navigation.cta.href} className="btn btn-p">
      {navigation.cta.label}
    </Link>
  )

  return (
    <BottomSheet
      open={sheet !== null}
      onClose={closeSheet}
      title="Menu"
      desktopQuery={DESKTOP_QUERY}
      header={header}
      footer={footer}
      panelClassName={PANEL}
      backdropClassName={BACKDROP}
      dragToClose
    >
      {/* A followed link leaves through the next page, not through „back” (capture: before the
          sheet's own close on a link click). */}
      <div
        onClickCapture={(event) => {
          if ((event.target as Element).closest('a')) closeSheetForLink()
        }}
      >
        {tab === 'services' && (
          <>
            <Tiles columns={menu.services} />
            <Link href="/uslugi" className="mall">
              Pełna oferta: {solutionsText(menu.offer.solutions)} →
            </Link>
          </>
        )}
        {tab === 'objects' && <Tiles columns={menu.objects} />}
        {tab === 'more' && (
          <>
            {hours && status && (
              <div className="mshlive">
                <HoursLive hours={hours} initial={status} strong />
              </div>
            )}
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
            <div className="mshrow">
              {phone && (
                <a href={phone.href} className="mshc">
                  <InstIcon name="phone" size={18} />
                  <span>
                    <small>Zadzwoń</small>
                    <b>{phone.label}</b>
                  </span>
                </a>
              )}
              <ThemeTile />
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
