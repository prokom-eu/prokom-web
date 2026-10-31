import type { InstContactBlock, InstPlannerBlock, InstServiceDeskBlock } from '@/payload-types'

type Props = { hero: (InstPlannerBlock | InstContactBlock | InstServiceDeskBlock)['hero'] }

/**
 * The h1 of a form page until its session brings the full page (I11: Zaplanuj, Kontakt,
 * Serwis). `id="hero"` like the other pages, for the comparison tool.
 */
export function FormPageHero({ hero }: Props) {
  return (
    <section id="hero" className="phero">
      <div className="wrap">
        {hero?.eyebrow && <span className="eye">{hero.eyebrow}</span>}
        <h1 className="h1">
          {hero?.h1a}
          {hero?.h1b && (
            <>
              {' '}
              <span className="acc">{hero.h1b}</span>
            </>
          )}
        </h1>
        {hero?.lead && <p className="lead">{hero.lead}</p>}
      </div>
    </section>
  )
}
