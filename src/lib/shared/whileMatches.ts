/** Layout with the capsule's links and their scroll-spy pill (`wspolne.css`: ≤ 1080 px hides them). */
export const CAPSULE_LINKS_QUERY = '(min-width: 1081px)'

/** Layout with the side rail (`wspolne.css`: `.srail-wrap` from 1400 px). */
export const RAIL_QUERY = '(min-width: 1400px)'

/** The part of `MediaQueryList` used here (a fake one in the tests). */
export type MediaList = {
  readonly matches: boolean
  addEventListener(type: 'change', listener: () => void): void
  removeEventListener(type: 'change', listener: () => void): void
}

/**
 * Runs `start` only while the layout matches and stops it (its returned cleanup) when the layout
 * changes away. A hidden element then costs nothing: no scroll listener and no measuring on every
 * frame of a phone's scroll (AUDYT-PROD-TELEFON §1 #6). Returns the cleanup of the whole thing.
 */
export function whileMatches(media: MediaList, start: () => () => void): () => void {
  let stop: (() => void) | null = null
  const sync = () => {
    if (media.matches && !stop) stop = start()
    else if (!media.matches && stop) {
      stop()
      stop = null
    }
  }
  sync()
  media.addEventListener('change', sync)
  return () => {
    media.removeEventListener('change', sync)
    stop?.()
    stop = null
  }
}
