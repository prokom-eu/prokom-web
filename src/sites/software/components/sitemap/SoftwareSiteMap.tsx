import type { SiteMapSection } from '@/lib/seo/siteLinks'
import type { SiteMapGroup } from '@/lib/software/siteMap'

import { SearchTrigger } from '../SearchTrigger'
import { Glass } from '../ui/Glass'
import { PageHero } from '../ui/PageHero'

const Arrow = () => <span aria-hidden="true">→</span>

/**
 * `/mapa-strony` of Software (board `AU-mapa`, ZMIANY-v24 §9.6): six cards of the board, then every
 * other address of the sitemap list (solutions, industries, cities, posts), so nothing in
 * `sitemap.xml` is missing here. Plain `<a>`: hundreds of `next/link`s would all prefetch.
 */
export function SoftwareSiteMap({
  title,
  groups,
  rest,
}: {
  title: string
  groups: readonly SiteMapGroup[]
  rest: readonly SiteMapSection[]
}) {
  return (
    <>
      <PageHero
        crumb={title}
        title="Mapa"
        em="strony."
        lead="Każda podstrona prokomsoftware.pl na jednym ekranie. Wolisz szukać? Naciśnij Ctrl K."
      />
      <section className="sw-smap" aria-label={title}>
        <div className="v-wrap">
          <div className="sw-smap-grid">
            {groups.map((group) => (
              <Glass
                key={group.id}
                as="section"
                className="sw-smap-card"
                aria-labelledby={`mapa-${group.id}`}
              >
                <h2 id={`mapa-${group.id}`}>{group.title}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}
                      >
                        {link.label}
                        {link.external ? <span className="sr-only"> (nowe okno)</span> : null}
                        <Arrow />
                      </a>
                    </li>
                  ))}
                  {group.search ? (
                    <li>
                      <SearchTrigger>
                        Wyszukiwarka (Ctrl K)
                        <Arrow />
                      </SearchTrigger>
                    </li>
                  ) : null}
                </ul>
              </Glass>
            ))}
          </div>

          {rest.length > 0 ? (
            <div className="sw-smap-rest">
              {rest.map((section) => (
                <Glass
                  key={section.id}
                  as="section"
                  className="sw-smap-card"
                  aria-labelledby={`mapa-${section.id}`}
                >
                  <h2 id={`mapa-${section.id}`}>{section.title}</h2>
                  {section.links.length > 0 ? (
                    <ul className="sw-smap-cols">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href}>{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {section.groups?.map((group) => (
                    <div key={group.title}>
                      <h3>{group.title}</h3>
                      <ul className="sw-smap-cols">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <a href={link.href}>{link.label}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </Glass>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
