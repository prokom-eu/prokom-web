import type { HeroObject } from '../../dane/glowna'

/**
 * „Pokaż na żywo” on a „Dla kogo” card switches the hero's object (prototype `goObj`). The two
 * live in separate client islands, so the card sends a window event the hero listens to.
 */
export const HERO_OBJECT_EVENT = 'inst-hero-object'

export function showHeroObject(object: HeroObject) {
  window.dispatchEvent(new CustomEvent<HeroObject>(HERO_OBJECT_EVENT, { detail: object }))
}
