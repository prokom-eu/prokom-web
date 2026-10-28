'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useTheme } from '@/components/useTheme'
import { LINE_THEME_COLORS } from '@/lib/brand/themeColor'

import type { SheetTab } from '../dane/types'
import { nextHeaderHidden } from './headerHide'

/** Phone layout of the shell (MOBILE-APLIKACJA §1). */
const PHONE_QUERY = '(max-width: 760px)'
/** Marks the history entry pushed when the sheet opens, so „back” closes the sheet. */
const SHEET_STATE = 'instSheet'
const LOCK_CLASS = 'pk-lock'

type Shell = {
  /** Open tab of the menu sheet, `null` = closed. */
  sheet: SheetTab | null
  openSheet: (tab: SheetTab) => void
  /** Same tab again closes it (prototype `openSheet`). */
  toggleSheet: (tab: SheetTab) => void
  /** × / backdrop / Esc / gesture — also drops the history entry of the sheet. */
  closeSheet: () => void
  /** Leaving through a link: the next page replaces the sheet, no history step back. */
  closeSheetForLink: () => void
  headerHidden: boolean
}

const ShellContext = createContext<Shell | null>(null)

export function useShell(): Shell {
  const shell = useContext(ShellContext)
  if (!shell) throw new Error('useShell outside <ShellProvider>')
  return shell
}

/**
 * State of the Instalacje shell shared by the header, the bottom bar and the menu sheet:
 * - the sheet: page scroll locked while open (`html.pk-lock`), an entry in the history so the
 *   browser's „back” closes it (MOBILE-APLIKACJA §4);
 * - the phone header hidden while scrolling down (`nextHeaderHidden`), also as
 *   `html[data-hdr-hidden]` for the anchor bar;
 * - the browser bar colour (`theme-color`) following a theme chosen by hand.
 */
export function ShellProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetTab | null>(null)
  const [headerHidden, setHeaderHidden] = useState(false)
  const pushed = useRef(false)
  const sheetOpen = sheet !== null

  const openSheet = useCallback((tab: SheetTab) => {
    setSheet(tab)
    if (!pushed.current) {
      window.history.pushState({ ...window.history.state, [SHEET_STATE]: true }, '')
      pushed.current = true
    }
  }, [])

  const closeSheet = useCallback(() => {
    setSheet(null)
    if (pushed.current) {
      pushed.current = false
      window.history.back()
    }
  }, [])

  const closeSheetForLink = useCallback(() => {
    setSheet(null)
    if (pushed.current) {
      pushed.current = false
      // The link's navigation pushes the next page over this entry; make the entry the page
      // itself again, so „back” from the next page does not land on a closed sheet.
      const { [SHEET_STATE]: _sheet, ...state } = window.history.state ?? {}
      window.history.replaceState(state, '')
    }
  }, [])

  const toggleSheet = useCallback(
    (tab: SheetTab) => (sheet === tab ? closeSheet() : openSheet(tab)),
    [sheet, closeSheet, openSheet],
  )

  // „Back” while the sheet is open: the browser already left the entry, only close it.
  useEffect(() => {
    const onPop = () => {
      if (!pushed.current) return
      pushed.current = false
      setSheet(null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle(LOCK_CLASS, sheetOpen)
    return () => root.classList.remove(LOCK_CLASS)
  }, [sheetOpen])

  // Hidden header: a passive listener, state set only when it changes.
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY)
    let lastY = window.scrollY
    let hidden = false
    const update = () => {
      const next = nextHeaderHidden({
        y: window.scrollY,
        lastY,
        hidden,
        narrow: phone.matches,
        sheetOpen,
      })
      lastY = next.lastY
      if (next.hidden !== hidden) {
        hidden = next.hidden
        setHeaderHidden(hidden)
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    phone.addEventListener('change', update)
    return () => {
      window.removeEventListener('scroll', update)
      phone.removeEventListener('change', update)
    }
  }, [sheetOpen])

  useEffect(() => {
    document.documentElement.toggleAttribute('data-hdr-hidden', headerHidden)
  }, [headerHidden])

  // `theme-color` follows the system theme (one `<meta>` per scheme, layout); a theme chosen by
  // hand (`html[data-theme]`, set only by a choice) wins over both.
  const [theme] = useTheme()
  useEffect(() => {
    const colors = LINE_THEME_COLORS.instalacje
    if (!colors) return
    const chosen = document.documentElement.getAttribute('data-theme')
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      const scheme = meta.media.includes('dark') ? 'dark' : 'light'
      meta.content = chosen === 'light' || chosen === 'dark' ? colors[chosen] : colors[scheme]
    }
  }, [theme])

  const value = useMemo(
    () => ({ sheet, openSheet, toggleSheet, closeSheet, closeSheetForLink, headerHidden }),
    [sheet, openSheet, toggleSheet, closeSheet, closeSheetForLink, headerHidden],
  )
  return <ShellContext value={value}>{children}</ShellContext>
}
