import { cardPrice } from '@/lib/software/cardPrice'
import type { SoftwareHeroV24 } from '@/lib/software/home'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'
import { Mockup } from '@/sites/software/components/mockups/Mockup'

import { HeroStage, type StageSlide } from './HeroStage'

type Props = { hero: SoftwareHeroV24; index: SolutionsIndex }

/** „od 2 490 zł” and the term of the slide's solution; a solution off the index asks for a quote. */
function priceOf(slug: string, index: SolutionsIndex): Pick<StageSlide, 'price' | 'term'> {
  const solution = index.solutions.find((item) => item.slug === slug)
  if (!solution)
    return { price: index.priceDisplay.fallback, term: index.priceDisplay.termFallback }
  const { head, term } = cardPrice(solution, index.priceDisplay)
  return { price: [head.before, head.amount, head.after].filter(Boolean).join(' '), term }
}

/**
 * Hero v24 of the Software start page (ZMIANY-v24 §4.1–4.1a, board `AU-pc`): the cosmic layer, the
 * pill, trust figures and the band of industries from the server; the H1 word, the choice panel,
 * the carousel and the caption in `HeroStage`. All mock-ups are rendered at once here (no loading
 * on a slide change) and handed to the client as children — it does not ship their code.
 */
export function HeroV24({ hero, index }: Props) {
  const slides: StageSlide[] = hero.slides.map((slide) => ({
    word: slide.word,
    name: slide.name,
    text: slide.text,
    icon: slide.icon,
    href: `/rozwiazania?rozwiazanie=${slide.solution}`,
    ...priceOf(slide.solution, index),
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
      />
      <ul className="hx-trust">
        {hero.trust.map((item) => (
          <li key={item.v}>
            <b>{item.v}</b>
            <span>{item.l}</span>
          </li>
        ))}
      </ul>
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
