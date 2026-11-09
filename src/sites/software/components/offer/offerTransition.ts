/**
 * The card's mock-up grows into the offer window's mock-up (OKNO-OFERTY-PREMIUM §2.5): a shared
 * element of the View Transitions API. Without the API, with reduced motion or on the phone (a
 * sheet comes from the bottom there) the window simply opens with its own entrance.
 */

type ViewTransition = { finished: Promise<void> }
type WithTransitions = Document & {
  startViewTransition?: (update: () => Promise<void>) => ViewTransition
}

/** The window's mock-up takes the name while this attribute is on `<html>` (CSS). */
const FLAG = 'data-offer-transition'
const NAME = 'sw-offer-shot'
/** Only the mock-up is captured, not the whole page: the page keeps rendering live (CSS). */
const ROOT_FLAG = 'data-offer-vt'
/** The window shows up within a few frames; never hold the page longer than this. */
const WAIT_MS = 500

export function openOfferFrom(card: HTMLElement, open: () => void): void {
  const doc = document as WithTransitions
  const picture = card.querySelector<HTMLElement>('.v-card-th')
  const still =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(max-width: 767px)').matches
  if (!doc.startViewTransition || !picture || still) {
    open()
    return
  }
  picture.style.viewTransitionName = NAME
  const root = document.documentElement
  root.setAttribute(ROOT_FLAG, '')
  const transition = doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        // The old picture is captured: the name moves to the window's mock-up.
        picture.style.viewTransitionName = ''
        root.setAttribute(FLAG, '')
        open()
        const start = performance.now()
        // Timers, not frames: frames are held while the transition waits for the new state.
        const wait = () => {
          const ready = document.querySelector('dialog[open] .sw-offer-shot')
          if (ready || performance.now() - start > WAIT_MS) resolve()
          else window.setTimeout(wait, 16)
        }
        wait()
      }),
  )
  void transition.finished.finally(() => {
    root.removeAttribute(FLAG)
    root.removeAttribute(ROOT_FLAG)
    picture.style.viewTransitionName = ''
  })
}

const DEVICE_FLAG = 'data-offer-device'

/**
 * „Komputer | Telefon” (§2.2): the browser frame morphs into the phone frame (its size and
 * corners) instead of a swap of pictures. `update` must change the DOM synchronously.
 */
export function switchDevice(update: () => void): void {
  const doc = document as Document & {
    startViewTransition?: (update: () => void) => ViewTransition
  }
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update()
    return
  }
  const root = document.documentElement
  root.setAttribute(DEVICE_FLAG, '')
  const transition = doc.startViewTransition(update)
  void transition.finished.finally(() => root.removeAttribute(DEVICE_FLAG))
}
