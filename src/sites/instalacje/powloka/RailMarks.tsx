'use client'

import { useLayoutEffect } from 'react'

/** A rail icon for a section from words in its id or label (shared icon names, `railIcon`). */
const ICONS: [RegExp, string][] = [
  [/pyta|faq/i, 'q'],
  [/cen|koszt|wycen/i, 'wallet'],
  [/rodo|przepis|prawo|norm/i, 'shield'],
  [/zestaw|pakiet|sprz[eę]t|marki/i, 'box'],
  [/serwis|gwaranc|przegl/i, 'wrench'],
  [/kalkul|liczb/i, 'chart'],
  [/realiz|do[sś]wiadcz/i, 'star'],
  [/etap|proces|krok|jak pracuj/i, 'check'],
  [/kontakt|zapyta|konsult|formularz|wy[sś]lij|zaplanuj/i, 'chat'],
  [/dla kogo|kto|obiekt/i, 'users'],
  [/nowo[sś]|rozwi[aą]z/i, 'rocket'],
  [/mapa|dojazd|teren/i, 'map'],
]
const iconFor = (text: string) => ICONS.find(([words]) => words.test(text))?.[1] ?? null

/**
 * Marks the sections of a subpage for the side rail's „Na tej stronie” (spec §5.1 dodatek 4):
 * the same sections and labels as the anchor bar under the hero, so the two never disagree.
 * A layout effect runs before the rail reads the page (the rail waits a tick after a navigation),
 * and the marks go when the page leaves. No change to the sections' own components.
 */
export function RailMarks({ anchors }: { anchors: { id: string; label: string }[] }) {
  const key = JSON.stringify(anchors.map((anchor) => [anchor.id, anchor.label]))
  useLayoutEffect(() => {
    const marked: { element: HTMLElement; icon: boolean }[] = []
    for (const [id, label] of JSON.parse(key) as [string, string][]) {
      const element = document.getElementById(id)
      if (!element || element.hasAttribute('data-rail-section')) continue
      element.setAttribute('data-rail-section', label)
      // Only an icon this effect gave is taken away with it.
      const icon = element.hasAttribute('data-rail-icon') ? null : iconFor(`${id} ${label}`)
      if (icon) element.setAttribute('data-rail-icon', icon)
      marked.push({ element, icon: icon !== null })
    }
    return () =>
      marked.forEach(({ element, icon }) => {
        element.removeAttribute('data-rail-section')
        if (icon) element.removeAttribute('data-rail-icon')
      })
  }, [key])
  return null
}
