import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { metaDescription } from '@/lib/seo/description'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { cardPrice } from '@/lib/software/cardPrice'
import { cityHref } from '@/lib/software/cities'
import { getCityView, getSolutionsIndex } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { Buttons } from '@/sites/software/components/about/Buttons'
import { Photo } from '@/sites/software/components/about/Photo'
import { Breadcrumbs } from '@/sites/software/components/Breadcrumbs'
import { FaqSection } from '@/sites/software/components/FaqSection'
import { SectionHead } from '@/sites/software/components/home/SectionHead'
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
  const title = city.seo.title ?? `Strony i systemy dla firm ${city.name}`
  const description = metaDescription(city.seo.description ?? city.hero.lead)
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
  // A placeholder until a photo is chosen — never on production; no salon claimed here.
  const photo = context.strict
    ? null
    : {
        image: null,
        caption: `Zdjęcie z miejscowości ${city.name}: firma klienta albo okolica`,
        tone: 'violet' as const,
      }

  return (
    <>
      {jsonLd.map((data, position) => (
        <script
          key={position}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <section className="pt-6 pb-10 min-[641px]:pt-10 min-[641px]:pb-16">
        <Container wide>
          <Breadcrumbs current={city.name} />
          <div className="mt-4 grid gap-8 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,540px)] min-[1081px]:items-center min-[1081px]:gap-14">
            <div>
              {city.hero.eyebrow ? (
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[641px]:text-sm">
                  {city.hero.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-3 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,68px)]">
                {city.hero.title}
                {city.hero.titleAccent ? (
                  <>
                    {' '}
                    <span className="text-grad-h1">{city.hero.titleAccent}</span>
                  </>
                ) : null}
              </h1>
              <p className="mt-5 max-w-[56ch] text-lg text-ink-2 min-[641px]:text-xl">
                {city.hero.lead}
              </p>
              <Buttons primary={city.hero.ctas[0]} secondary={city.hero.ctas[1]} className="mt-7" />
            </div>
            {photo || city.hero.badges.length > 0 ? (
              <div className="relative">
                {photo ? (
                  <Photo
                    photo={photo}
                    sizes="(min-width: 1081px) 540px, 100vw"
                    className="aspect-[6/5]"
                  />
                ) : null}
                {city.hero.badges.length > 0 ? (
                  <ul className="mt-3 grid gap-2.5 min-[641px]:grid-cols-2 min-[1081px]:absolute min-[1081px]:inset-x-[-16px] min-[1081px]:top-4 min-[1081px]:mt-0">
                    {city.hero.badges.map((badge, index) => (
                      <li
                        key={index}
                        className="rounded-[16px] border border-border bg-card px-4 py-3 shadow-raised min-[1081px]:w-fit min-[1081px]:self-start min-[1081px]:even:ml-auto min-[1081px]:even:mt-20"
                      >
                        <p className="text-sm font-extrabold">{badge.title}</p>
                        {badge.text ? <p className="text-xs text-ink-2">{badge.text}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {city.who.items.length > 0 && city.who.title ? (
        <section className="py-12 min-[641px]:py-20">
          <Container wide>
            <SectionHead
              eyebrow={city.locative ? `Firmy ${city.locative}` : 'Dla kogo'}
              title={city.who.title}
              lead={city.who.lead}
            />
            <ul className="mt-6 grid gap-3 min-[641px]:grid-cols-2 min-[1081px]:grid-cols-4">
              {city.who.items.map((item) => {
                const solution = item.solution ? bySlug.get(item.solution) : undefined
                const price = solution ? cardPrice(solution, index.priceDisplay) : null
                return (
                  <li
                    key={item.name}
                    className="flex flex-col gap-2 rounded-[22px] border border-border bg-card p-[22px]"
                  >
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
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      ) : null}

      {city.local.items.length > 0 && city.local.title ? (
        <section className="py-12 min-[641px]:py-20">
          <Container wide>
            <SectionHead eyebrow="Dlaczego lokalnie" title={city.local.title} lead={null} />
            <ul className="mt-6 grid gap-3 min-[761px]:grid-cols-3">
              {city.local.items.map((item) => (
                <li
                  key={item.title}
                  className="rounded-[22px] border border-border bg-card p-[22px] shadow-raised"
                >
                  <h3 className="font-display text-xl font-extrabold">{item.title}</h3>
                  {item.text ? <p className="mt-2 text-ink-2">{fill(item.text) ?? ''}</p> : null}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <FaqSection
        id="pytania"
        eyebrow={city.locative ? `Pytania ${city.locative}` : 'Pytania'}
        heading="Najczęściej pytacie o to"
        lead={null}
        items={faq}
      />

      {city.nearby.length > 0 ? (
        <section aria-labelledby="okolica-h" className="pb-12 min-[641px]:pb-16">
          <Container wide>
            <h2
              id="okolica-h"
              className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[641px]:text-sm"
            >
              Pracujemy też w okolicy
            </h2>
            {/* Plain chips, no links: other city pages exist only with their own text. */}
            <ul className="mt-3 flex flex-wrap gap-2">
              {city.nearby.map((name) => (
                <li
                  key={name}
                  className={
                    name === city.name
                      ? 'rounded-full bg-button px-4 py-2.5 text-sm font-extrabold text-accent-ink'
                      : 'rounded-full border border-border bg-card px-4 py-2.5 text-sm font-extrabold'
                  }
                >
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-2">Dalej pracujemy zdalnie, w całej Polsce.</p>
          </Container>
        </section>
      ) : null}

      {city.cta.title ? (
        <section data-final-cta className="pb-12 min-[641px]:pb-20">
          <Container wide>
            <div className="flex flex-col gap-6 rounded-[28px] border border-accent-line bg-accent-soft p-[22px] min-[641px]:p-12 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
              <div className="max-w-[620px]">
                <h2 className="font-display text-[30px] font-extrabold leading-[1.05] tracking-tight min-[641px]:text-[40px]">
                  {city.cta.title}
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
            </div>
          </Container>
        </section>
      ) : null}
    </>
  )
}
