'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { autoThemeNow, useThemeChoice, type ThemeChoice } from '@/components/useTheme'
import { centreOf, revealTheme } from '@/lib/motion/themeReveal'
import { withGamingLast, type SharedLineKey } from '@/lib/shared/lines'
import { onMenuRequest } from '@/lib/shared/menuOpen'
import { requestSearch } from '@/lib/site/searchOpen'
import type { OpeningHours } from '@/lib/shared/openingStatus'
import type { SharedLine } from '@/lib/shared/project'
import { toTelHref } from '@/lib/site/link'

import { OpeningStatus } from './OpeningStatus'

export type MenuSheetProps = {
  /** The line's list (sections, offer, pages) — its own content, as today. */
  children?: ReactNode
  lines: readonly SharedLine[]
  current: SharedLineKey
  phone: string | null
  /** The line's second number (Biznes, runda 1411): „Zadzwoń” then offers both. */
  phone2?: string | null
  hours: OpeningHours
  holidays: readonly string[]
  now: string
  /** Lines with a dark design get the Jasny / Ciemny / Auto switch (ADR-013). */
  themes?: boolean
  /** Media query of the desktop layout: an open sheet closes when it starts to match. */
  desktopQuery?: string
  /**
   * Label of the „Szukaj” button on top of the sheet (FUND-W PR1): up to 1080 px the capsule hides
   * its loupe, so the sheet is the way to the line's search window. Only for lines that mount one.
   */
  search?: string
}

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: 'light', label: 'Jasny' },
  { value: 'dark', label: 'Ciemny' },
  { value: 'auto', label: 'Auto' },
]

/** „Motyw strony” with Jasny / Ciemny / Auto (spec §1.4); the change opens in the circle too. */
function ThemeChoiceSwitch() {
  const [choice, setChoice] = useThemeChoice()
  return (
    <div role="group" aria-labelledby="menu-theme-label" aria-describedby="menu-theme-note">
      <div className="flex items-center justify-between gap-3 text-sm font-bold">
        <span id="menu-theme-label">Motyw strony</span>
        <span className="flex rounded-xl bg-surface-2 p-[3px]">
          {THEMES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={choice === option.value}
              onClick={(event) => {
                const theme = option.value === 'auto' ? autoThemeNow() : option.value
                revealTheme(theme, () => setChoice(option.value), centreOf(event.currentTarget))
              }}
              className={cx(
                'min-h-10 rounded-[9px] px-3 focus-visible:outline-2 focus-visible:outline-accent-text',
                choice === option.value ? 'bg-card text-ink shadow-raised' : 'text-ink-2',
              )}
            >
              {option.label}
            </button>
          ))}
        </span>
      </div>
      <p id="menu-theme-note" className="mt-1.5 text-xs text-ink-2">
        Auto: w nocy ciemny, w dzień jak ustawienia telefonu.
      </p>
    </div>
  )
}

/**
 * Menu sheet of every line on the phone (spec §5 `MenuSheet`, board Telefon): the „Szukaj”
 * button (lines with a search window), the line's own list as a slot, then the shared part —
 * contact card (status, number, „Zadzwoń”), chips of the PRO-KOM lines (with Gaming) and the
 * theme switch. On the shared `BottomSheet` (`<dialog>`: focus kept inside, Esc, a drag down or
 * the backdrop closes it); opened by `requestMenu()`.
 */
export function MenuSheet({
  children,
  lines,
  current,
  phone,
  phone2,
  hours,
  holidays,
  now,
  themes,
  desktopQuery = '(min-width: 1081px)',
  search,
}: MenuSheetProps) {
  const [open, setOpen] = useState(false)
  const searchNext = useRef(false)
  useEffect(() => onMenuRequest(() => setOpen(true)), [])
  // The search window opens only when no other dialog is open: ask for it after the sheet's own
  // effect (a child's effects run first) has closed the `<dialog>`.
  useEffect(() => {
    if (open || !searchNext.current) return
    searchNext.current = false
    requestSearch()
  }, [open])
  const tel = phone ? toTelHref(phone) : null
  const tel2 = phone2 ? toTelHref(phone2) : null

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      title="Menu"
      desktopQuery={desktopQuery}
      dragToClose
      closeOnBack
    >
      <div className="flex flex-col gap-3.5 pb-2" data-menu-sheet>
        {search && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              searchNext.current = true
              setOpen(false)
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-2xl bg-surface-2 px-4 text-left font-bold text-ink-2 shadow-[inset_0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
            data-menu-search
          >
            <Icon name="search" className="size-[18px]" />
            {search}
          </button>
        )}
        {children}
        {phone && tel && phone2 && tel2 && (
          <div
            className="flex flex-col gap-2.5 rounded-2xl bg-line-dark px-3.5 py-3 text-line-dark-ink"
            data-menu-call-card
          >
            <OpeningStatus
              hours={hours}
              holidays={holidays}
              now={now}
              onDark
              className="text-xs whitespace-normal!"
            />
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Numer główny', number: phone, href: tel },
                { label: 'Drugi numer', number: phone2, href: tel2 },
              ].map((item) => (
                <li key={item.href} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs font-bold text-line-dark-text">{item.label}</span>
                    <span className="font-display text-[19px] font-extrabold whitespace-nowrap">
                      {item.number}
                    </span>
                  </span>
                  <a
                    href={item.href}
                    aria-label={`Zadzwoń: ${item.number}`}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-[14px] bg-on-dark px-4 font-extrabold text-on-dark-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text"
                  >
                    Zadzwoń
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {phone && tel && !(phone2 && tel2) && (
          <div
            className="flex items-center justify-between gap-3 rounded-2xl bg-line-dark px-3.5 py-3 text-line-dark-ink"
            data-menu-call-card
          >
            {/* `min-w-0` + a wrapping status: a long „Zamknięte · otwieramy w poniedziałek o 9:00”
                must not push „Zadzwoń” off a 360 px screen (hub H1-2, 14.11). */}
            <span className="flex min-w-0 flex-col gap-[3px]">
              <OpeningStatus
                hours={hours}
                holidays={holidays}
                now={now}
                onDark
                className="text-xs whitespace-normal!"
              />
              <span className="font-display text-[19px] font-extrabold">{phone}</span>
            </span>
            <a
              href={tel}
              className="inline-flex min-h-11 shrink-0 items-center rounded-[14px] bg-on-dark px-4 font-extrabold text-on-dark-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text"
            >
              Zadzwoń
            </a>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {/* A heading only while open (audit 0611 P0.4), as the sheet's title. */}
          <p
            {...(open ? ({ role: 'heading', 'aria-level': 3 } as const) : {})}
            className="text-[11.5px] font-extrabold tracking-[0.12em] text-ink-2 uppercase"
          >
            Linie PRO-KOM
          </p>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {withGamingLast(lines).map((line) => {
              const Tag = line.url ? 'a' : 'span'
              return (
                <li key={line.key} className="shrink-0">
                  <Tag
                    href={line.url ?? undefined}
                    aria-current={line.key === current ? 'page' : undefined}
                    className={cx(
                      'flex min-h-11 items-center gap-[7px] rounded-full border border-border bg-card px-3 text-[13px] font-bold focus-visible:outline-2 focus-visible:outline-accent-text',
                      line.key === current && 'border-accent-text',
                    )}
                  >
                    <i
                      aria-hidden="true"
                      className="block h-[3px] w-3 rounded-[2px]"
                      style={{
                        background:
                          line.key === 'gaming'
                            ? 'var(--gaming-dash)'
                            : (line.color ?? 'currentColor'),
                      }}
                    />
                    {line.name}
                  </Tag>
                </li>
              )
            })}
          </ul>
        </div>
        {themes && <ThemeChoiceSwitch />}
      </div>
    </BottomSheet>
  )
}
