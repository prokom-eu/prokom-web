/** Twinkling lights of the hero backdrop: stars, the lights on the slopes and in the village. */
export const TWINKLE_CLASSES = ['star', 'mws', 'vl'] as const
/** Each kind twinkles as this many groups, one animation per group (report 11.11.2026). */
export const TWINKLE_GROUPS = 3

const LIGHT = /<circle ([^>]*?)class="(star|mws|vl)" style="animation-delay: [\d.]+s"\/>/g
/** Consecutive circles of one kind (the stars come right after the slope lights). */
const RUN =
  /<circle [^>]*?class="(star|mws|vl)" style="animation-delay: [\d.]+s"\/>(?:<circle [^>]*?class="\1" style="animation-delay: [\d.]+s"\/>)*/g

/**
 * Turns every run of twinkling circles into `TWINKLE_GROUPS` groups (`<g class="twg tw-<kind>
 * tw<n>">`, circles dealt in turn, so each group is spread over the whole sky) and drops the
 * circles' own `animation-delay`: the browser then runs 9 opacity animations instead of 187
 * (CPU at rest on `/` with the hero in view). The groups get the old phase shift from CSS
 * (`glowna.css`), the circles keep their class for the colour and the day/night fade. Circles
 * of one run never overlap, so their order inside the run does not matter.
 */
export function groupTwinkles(markup: string): string {
  return markup.replace(RUN, (run, kind: string) => {
    const circles = [...run.matchAll(LIGHT)].map((m) => `<circle ${m[1]}class="${m[2]}"/>`)
    const groups = Array.from({ length: TWINKLE_GROUPS }, (_, g) =>
      circles.filter((_, i) => i % TWINKLE_GROUPS === g).join(''),
    )
    return groups
      .map((inner, g) => (inner ? `<g class="twg tw-${kind} tw${g + 1}">${inner}</g>` : ''))
      .join('')
  })
}
