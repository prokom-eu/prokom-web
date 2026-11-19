import Image from 'next/image'
import type { CSSProperties } from 'react'

import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { Icon } from '@/components/ui/Icon'
import type { HubAbout } from '@/lib/prokom/about'
import type { HubBrands, VisibleNetwork } from '@/lib/prokom/brands'

import { BRAND_LOGOS } from '../home/brandArt'

import { lineStyle } from '../lineColors'

/**
 * „Nasza historia” of pro-kom.eu/o-firmie (16.11): the story in two paragraphs with a quote and
 * the way from 2004 to today's five lines — under the facts of the shared about page.
 */
export function AboutStory({ about }: { about: HubAbout }) {
  return (
    <section aria-labelledby="pk-story-h" className={`${PAGE_CONTAINER} pk-story`}>
      <div className="pk-story__grid">
        <div className="pk-story__text">
          <p className="pk-story__eb">{about.eyebrow}</p>
          <h2 id="pk-story-h" className="pk-story__title">
            {about.title}
          </h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="pk-story__p">
              {paragraph}
            </p>
          ))}
          <figure className="pk-story__quote">
            <blockquote>{about.quote}</blockquote>
            <figcaption>{about.quoteBy}</figcaption>
          </figure>
        </div>
        <ol className="pk-story__steps">
          {about.steps.map((step, index) => (
            <li key={step.mark} style={{ '--i': index } as CSSProperties}>
              <span className="pk-story__mark">{step.mark}</span>
              <b>{step.title}</b>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/**
 * „Co nas wyróżnia” and the authorizations (statuses only as agreed — K4-FINAL §1, `brands`):
 * four value cards, then the authorized partners of the lines from the panel.
 */
export function AboutValues({
  about,
  brands,
  network,
}: {
  about: HubAbout
  brands: HubBrands | null
  /** The partner network (ALSEN) while its fact is visible — a badge after the authorizations. */
  network: VisibleNetwork | null
}) {
  const authorizations = brands?.authorizations ?? []
  return (
    <section aria-labelledby="pk-values-h" className={`${PAGE_CONTAINER} pk-values`}>
      <p className="pk-story__eb">{about.valuesEyebrow}</p>
      <h2 id="pk-values-h" className="pk-story__title pk-values__title">
        {about.valuesTitle}
      </h2>
      <ul className="pk-values__grid">
        {about.values.map((value, index) => (
          <li key={value.title} className="pk-value">
            <span className="pk-value__no" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="pk-value__icon">
              <Icon name={value.icon} className="size-[22px]" />
            </span>
            <b>{value.title}</b>
            <span>{value.text}</span>
          </li>
        ))}
      </ul>
      {(authorizations.length > 0 || network) && (
        <div className="pk-abauth">
          <p className="pk-abauth__title">{about.authorizationsTitle}</p>
          <ul className="pk-abauth__list">
            {authorizations.map((row) => (
              <li key={row.name} style={lineStyle(row.line)}>
                <Icon name="shield" className="size-[18px]" />
                <span>
                  <small>{row.status}</small>
                  <b>{row.name}</b>
                </span>
              </li>
            ))}
            {network && (
              <li style={lineStyle(network.line)}>
                <Icon name="shield" className="size-[18px]" />
                <a href={`#${network.slug}`}>
                  <small>
                    {network.status} · {network.label}
                  </small>
                  <b>{network.name}</b>
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  )
}

/**
 * „Autoryzowany partner ALSEN” (runda 1811, D4): a short section with the logo and a link to the
 * network's site; anchor `#alsen` — the old pro-kom.eu partnership page lands here (301).
 */
export function AboutNetwork({ network }: { network: VisibleNetwork | null }) {
  if (!network) return null
  const logo = BRAND_LOGOS[network.name]
  return (
    <section
      id={network.slug}
      data-rail-section={network.name}
      aria-labelledby="pk-net-h"
      className={`${PAGE_CONTAINER} pk-abnet`}
      style={lineStyle(network.line)}
    >
      <div className="pk-abnet__card">
        <span className="pk-abnet__plate">
          {logo ? (
            <Image
              src={logo.src}
              width={logo.width}
              height={logo.height}
              alt={network.name}
              sizes="220px"
            />
          ) : (
            <b>{network.name}</b>
          )}
        </span>
        <div className="pk-abnet__text">
          <p className="pk-story__eb">{network.label}</p>
          <h2 id="pk-net-h" className="pk-story__title pk-abnet__title">
            {network.aboutTitle}
          </h2>
          {network.paragraphs.map((paragraph) => (
            <p key={paragraph} className="pk-story__p">
              {paragraph}
            </p>
          ))}
          <a href={network.website} target="_blank" rel="noopener" className="pk-abnet__link">
            {network.linkLabel} <span aria-hidden="true">↗</span>
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
        </div>
      </div>
    </section>
  )
}
