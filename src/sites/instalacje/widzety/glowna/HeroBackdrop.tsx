import { HERO_BACKDROP } from './backdrop'
import { heroStars } from './heroModel'
import { groupTwinkles } from './twinkle'

const STARS = heroStars()
  .map(
    (s) =>
      `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" class="star" style="animation-delay: ${s.d}s"/>`,
  )
  .join('')
// Twinkling lights animate as 9 groups, not one by one (`twinkle.ts`).
const MARKUP = groupTwinkles(HERO_BACKDROP.replace('%STARS%', STARS))

/**
 * The fixed part of the hero scene, rendered on the server (54 KB of pre-generated SVG stays out
 * of the client bundle) and passed into the live hero as a child. The markup is our own constant
 * from the prototype, not user content.
 */
export function HeroBackdrop() {
  // `id`: the phone rule of `glowna.css` (the backdrop inside the building scene).
  return <g id="hx-bd" dangerouslySetInnerHTML={{ __html: MARKUP }} />
}
