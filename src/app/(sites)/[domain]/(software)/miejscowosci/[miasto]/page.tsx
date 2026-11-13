import type { Metadata } from 'next'
import { IntentLink as Link } from '@/components/shared/IntentLink'
import { notFound } from 'next/navigation'

import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { META_DESCRIPTION_MAX, metaDescription } from '@/lib/seo/description'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { cardPrice } from '@/lib/software/cardPrice'
import { cityHref } from '@/lib/software/cities'
import { getCityView, getSolutionsIndex } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { Buttons } from '@/sites/software/components/about/Buttons'
import { FaqSection } from '@/sites/software/components/FaqSection'
import { EmText } from '@/sites/software/components/ui/EmText'
import { Glass } from '@/sites/software/components/ui/Glass'
import { PageHero } from '@/sites/software/components/ui/PageHero'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; miasto: string }> }

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'software')
  const { miasto } = await params
  // Unknown, inactive, without its own text or of another site → 404 (no doorway pages).
  const city = isValidSlug(miasto) ? await getCityView(tenant.id, miasto) : null
  return { tenant, city }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, city } = await load(params)
  if (!city) return {}
  const settings = await getSiteSettings(tenant.id)
  const title = city.seo.title ?? `Strony i systemy dla firm ${city.name}`
  // The town's name in the snippet (SEO etap 1): the lead of Rabka spoke of „Orkana 16B” only.
  const lead = metaDescription(city.seo.description ?? city.hero.lead)
  const named = `${lead} ${city.name} i okolice.`
  const description = lead.includes(city.name) || named.length > META_DESCRIPTION_MAX ? lead : named
  return {
    // The panel title is the whole `<title>` (spec. §9: „… | PRO-KOM Software”).
    title: city.seo.title ? { absolute: title } : title,
    description,
    alternates: { canonical: cityHref(city.slug) },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: cityHref(city.slug),
      title,
      description,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * `/miejscowosci/[miasto]` (spec. §6.9, board `Miasto`): hero, „Dla kogo pracujemy
 * najczęściej” with prices from the solutions, „Blisko, czyli prościej”, FAQ with
 * `{cena:<slug>}`, nearby places as plain chips (no links) and the salon CTA. JSON-LD `Service`
 * with `areaServed`; no `LocalBusiness` for a city without a branch.
 */
export default async function CityPage({ params }: Props) {
  const { tenant, city } = await load(params)
  if (!city) notFound()
  const [context, index, origin] = await Promise.all([
    softwareTextContext(tenant.id),
    getSolutionsIndex(tenant.id),
    requestOrigin(),
  ])
  const fill = (value: string | null | undefined) => fillText(value ?? undefined, context)
  const bySlug = new Map(index.solutions.map((solution) => [solution.slug, solution]))
  const faq = city.faq.flatMap(({ question, answer }) => {
    const filled = fill(answer)
    return filled ? [{ question, answer: filled }] : []
  })
  const url = origin + cityHref(city.slug)
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Strona główna', url: `${origin}/` },
      { name: city.name, url },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${city.hero.title}${city.hero.titleAccent ? ` ${city.hero.titleAccent}` : ''}`,
      description: city.hero.lead,
      url,
      provider: { '@id': `${origin}/#organization` },
      areaServed: { '@type': 'City', name: city.name },
    },
  ]
  // No photo of the town yet (SWV8 P0 #2, decision 01.11): the hero shows its badges instead of
  // a „photo to take” placeholder, also on staging.

  return (
    <>
      {jsonLd.map((data, position) => (
        <script
          key={position}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <PageHero
        crumb={city.name}
        eyebrow={city.hero.eyebrow}
        title={city.hero.title}
        em={city.hero.titleAccent}
        lead={city.hero.lead}
        aside={
          city.hero.badges.length > 0 ? (
            <ul className="grid gap-2.5 min-[641px]:grid-cols-2 min-[1081px]:grid-cols-1">
              {city.hero.badges.map((badge, position) => (
                <Glass as="li" key={position} className="rounded-[18px] px-5 py-4">
                  <p className="font-extrabold">{badge.title}</p>
                  {badge.text ? <p className="text-sm text-ink-2">{badge.text}</p> : null}
                </Glass>
              ))}
            </ul>
          ) : undefined
        }
      >
        <Buttons primary={city.hero.ctas[0]} secondary={city.hero.ctas[1]} className="mt-7" />
      </PageHero>

      {city.who.items.length > 0 && city.who.title ? (
        <section className="v-sec">
          <div className="v-wrap">
            <SectionHead
              eyebrow={city.locative ? `Firmy ${city.locative}` : 'Dla kogo'}
              title={city.who.title}
              lead={city.who.lead}
            />
            <ul className="mt-10 grid gap-4 min-[641px]:grid-cols-2 min-[1081px]:grid-cols-4">
              {city.who.items.map((item) => {
                const solution = item.solution ? bySlug.get(item.solution) : undefined
                const price = solution ? cardPrice(solution, index.priceDisplay) : null
                return (
                  <Glass as="li" rise key={item.name} className="flex flex-col gap-2 p-[22px]">
                    <h3 className="font-display text-lg font-extrabold">{item.name}</h3>
                    {item.text ? <p className="text-sm text-ink-2">{item.text}</p> : null}
                    {price && !price.ask ? (
                      <p className="font-extrabold text-accent-text">
                        {[price.head.before, price.head.amount, price.head.after]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                    ) : null}
                    {solution && item.cta ? (
                      <Link
                        href={`/rozwiazania/${solution.slug}`}
                        className="mt-auto inline-flex min-h-11 items-center pt-2 text-sm font-extrabold text-accent-text"
                      >
                        {item.cta}
                      </Link>
                    ) : null}
                  </Glass>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {city.local.items.length > 0 && city.local.title ? (
        <section className="v-sec">
          <div className="v-wrap">
            <SectionHead eyebrow="Dlaczego lokalnie" title={city.local.title} />
            <ul className="mt-10 grid gap-4 min-[761px]:grid-cols-3">
              {city.local.items.map((item) => (
                <Glass as="li" rise key={item.title} className="p-[22px]">
                  <h3 className="font-display text-xl font-extrabold">{item.title}</h3>
                  {item.text ? <p className="mt-2 text-ink-2">{fill(item.text) ?? ''}</p> : null}
                </Glass>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <FaqSection
        id="pytania"
        eyebrow={city.locative ? `Pytania ${city.locative}` : 'Pytania'}
        heading="Najczęściej **pytacie o to**"
        lead={null}
        items={faq}
      />

      {city.nearby.length > 0 ? (
        <section aria-labelledby="okolica-h" className="v-sec">
          <div className="v-wrap">
            <h2 id="okolica-h" className="sw-eyebrow">
              Pracujemy też w okolicy
            </h2>
            {/* Plain chips, no links: other city pages exist only with their own text. */}
            <ul className="mt-3 flex flex-wrap gap-2">
              {city.nearby.map((name) => (
                <li
                  key={name}
                  className={
                    name === city.name ? 'sw-chip border-accent-line text-accent-text' : 'sw-chip'
                  }
                >
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-2">Dalej pracujemy zdalnie, w całej Polsce.</p>
          </div>
        </section>
      ) : null}

      {city.cta.title ? (
        <section data-final-cta className="v-sec">
          <div className="v-wrap">
            <Glass featured className="sw-cta">
              <div className="max-w-[620px]">
                <h2 className="sw-h2 sw-cta-title">
                  <EmText text={city.cta.title} />
                </h2>
                {city.cta.text ? (
                  <p className="mt-3 text-lg text-ink-2 min-[641px]:text-xl">{city.cta.text}</p>
                ) : null}
              </div>
              <Buttons
                primary={city.cta.buttons[0]}
                secondary={city.cta.buttons[1]}
                className="shrink-0"
              />
            </Glass>
          </div>
        </section>
      ) : null}
    </>
  )
}
