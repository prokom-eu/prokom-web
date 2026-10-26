/**
 * Where the Software frame switches from the phone layer (bottom bar, sheets) to the desktop
 * header (spec. §3.1–3.2: phone and tablet up to 1080 px). Tailwind uses `min-[1081px]:` for the
 * same width; scripts use this query.
 */
export const DESKTOP_QUERY = '(min-width: 1081px)'

/** `true` when the desktop header is shown (only call in the browser). */
export const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches

/**
 * Focus for a closing „Twój projekt” whose button is gone (the list was emptied): the visible
 * quote link of the header marked `data-project-fallback` (desktop or phone).
 */
export function focusProjectFallback() {
  const candidates = document.querySelectorAll<HTMLElement>('[data-project-fallback]')
  ;[...candidates].find((element) => element.offsetParent !== null)?.focus()
}
