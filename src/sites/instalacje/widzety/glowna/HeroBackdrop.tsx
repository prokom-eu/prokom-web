import { HERO_BACKDROP } from './backdrop'
import { heroStars } from './heroModel'

const STARS = heroStars()
  .map(
    (s) =>
      `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" class="star" style="animation-delay: ${s.d}s"/>`,
  )
  .join('')

/**
 * The fixed part of the hero scene, rendered on the server (54 KB of pre-generated SVG stays out
 * of the client bundle) and passed into the live scene as a child. The markup is our own constant
 * from the prototype, not user content.
 */
export function HeroBackdrop() {
  return <g dangerouslySetInnerHTML={{ __html: HERO_BACKDROP.replace('%STARS%', STARS) }} />
}
