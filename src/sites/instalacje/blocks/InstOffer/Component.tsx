import type { InstOfferBlock as InstOfferBlockData } from '@/payload-types'

/** Skeleton of the page (PR `inst/wsp-bloki-i12`); the session I12 brings the rest. */
export function InstOfferBlock({ block }: { block: InstOfferBlockData; tenantId: number }) {
  return (
    <section id="hero" className="phero">
      <div className="wrap">
        <h1 className="h1">
          {block.hero?.h1a} {block.hero?.h1b && <span className="acc">{block.hero.h1b}</span>}
        </h1>
      </div>
    </section>
  )
}
