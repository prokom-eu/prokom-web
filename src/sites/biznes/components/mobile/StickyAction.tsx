import type { ReactNode } from 'react'

/** Main button of the bar: full width, 52 px, accent (MOBILE-APLIKACJA §1). */
export const STICKY_ACTION_BUTTON =
  'inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-accent-text px-5 font-extrabold text-accent-ink disabled:opacity-70'

/**
 * Sticky action of a phone screen below 768 px (MOBILE-APLIKACJA §1): „Dodaj do zapytania”,
 * „Zapytaj o ten zestaw”, „Wyślij zapytanie”, the post's CTA. Translucent like the tab bar and
 * above the safe area; while it is on the page the tab bar hides (`data-sticky-action`,
 * globals.css), so the bottom of the screen holds one bar; one layer above it where `:has` is
 * missing. The button it replaces in the page content hides below 768 px (`max-md:hidden`).
 */
export function StickyAction({ children }: { children: ReactNode }) {
  return (
    <div
      data-sticky-action
      className="fixed inset-x-0 bottom-0 z-[31] border-t border-border bg-surface/90 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-md backdrop-saturate-150 md:hidden"
    >
      {children}
    </div>
  )
}
