import { offerHref, priceLine, solutionHref } from '@/lib/software/priceCards'
import type { SoftwareHeroV24 } from '@/lib/software/home'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'
import { Mockup } from '@/sites/software/components/mockups/Mockup'

import type { StageSlide } from './HeroStage'
import { HeroStage } from './HeroStageLazy'

type Props = { hero: SoftwareHeroV24; index: SolutionsIndex; isFirst?: boolean }

/**
 * Hero v24 of the Software start page (ZMIANY-v24 §4.1–4.1a, board `AU-pc`): the cosmic layer, the
 * pill and the band of industries from the server; the H1 word, the choice panel,
 * the carousel and the caption in `HeroStage`. All mock-ups are rendered at once here (no loading
 * on a slide change) and handed to the client as children — it does not ship their code.
 */
export function HeroV24({ hero, index, isFirst = true }: Props) {
  const slides: StageSlide[] = hero.slides.map((slide) => ({
    word: slide.word,
    wordShort: slide.wordShort,
    name: slide.name,
    text: slide.text,
    icon: slide.icon,
    // Its page for search engines, its offer window on a click (SEO etap 1).
    href: solutionHref(slide.solution),
    open: offerHref(slide.solution),
    // „od 2 490 zł” and the term from `Solutions`; no price → a badge (SWA14 §4.1).
    ...priceLine(slide.solution, index),
  }))
  const windows = hero.slides.map((slide) => (
    <Mockup
      key={slide.solution + slide.name}
      kind={slide.mockup.kind}
      variant={slide.mockup.variant}
    />
  ))

  return (
    <section id="start" className="hx">
      <div className="hx-cos" aria-hidden="true">
        <div className="s1" />
        <div className="s2" />
        <div className="rb a" />
        <div className="rb b" />
        <div className="rb c" />
        <div className="orb">
          <i />
        </div>
        <div className="orb b2">
          <i />
        </div>
        <div className="beam" />
        <div className="planet" />
      </div>
      <div className="hx-wrap">
        <span className="hx-pill">
          {hero.pill} <b>{hero.pillBadge}</b>
        </span>
      </div>
      <HeroStage
        title={hero.title}
        lead={hero.lead}
        query={hero.query}
        queryHint={hero.queryHint}
        offer={hero.offer}
        slides={slides}
        windows={windows}
        isFirst={isFirst}
      />
      <div className="hx-mq">
        <ul>
          {hero.industries.map((name) => (
            <li key={name}>{name}</li>
          ))}
          {/* The second copy closes the loop of the moving band; screen readers read one. */}
          {hero.industries.map((name) => (
            <li key={`${name}-copy`} aria-hidden="true">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
