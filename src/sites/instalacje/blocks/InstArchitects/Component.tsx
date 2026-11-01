import type { InstArchitectsBlock as InstArchitectsBlockData } from '@/payload-types'

/** Skeleton of the page (PR `inst/wsp-blok-architekci`); the session I16a brings the rest. */
export function InstArchitectsBlock({ block }: { block: InstArchitectsBlockData }) {
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
