import { RichText } from '@payloadcms/richtext-lexical/react'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import type { BrandView } from '@/lib/catalog/brand'
import { plural } from '@/lib/plural'

import { Breadcrumbs, type Crumb } from '../Breadcrumbs'
import { PageLink } from '../PageLink'

const LABEL = 'text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase'

/**
 * Top of the brand page (`k3/screens/Web-Marka*`): H1 „{marka} w PRO-KOM”, the short
 * description, „Zobacz N pozycji” and „Strona producenta”; on the right the logo on a white
 * tile in both themes (official files have a white background), or the name as text when the
 * brand has no logo (K3-KATALOG §6 — no invented graphics).
 */
export function BrandHero({
  brand,
  crumbs,
  count,
}: {
  brand: BrandView
  crumbs: Crumb[]
  count: number
}) {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-8 sm:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_90%_10%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[1080px]:gap-14">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-[clamp(2.3rem,4.4vw,4rem)] leading-[1] font-extrabold tracking-[-0.025em] font-stretch-112%">
              {brand.name} w PRO-KOM
            </h1>
            {brand.shortDescription && (
              <p className="max-w-[54ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-ink-2">
                {brand.shortDescription}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <PageLink href="#produkty" arrow>
                Zobacz {count} {plural(count, ['pozycję', 'pozycje', 'pozycji'])}
              </PageLink>
              {brand.website && (
                <PageLink href={brand.website} kind="outline" external>
                  Strona producenta
                </PageLink>
              )}
            </div>
          </div>
          <div className="flex min-h-48 items-center justify-center rounded-[32px] bg-white p-10 shadow-[inset_0_0_0_1px_var(--border)] sm:min-h-64">
            {brand.logo ? (
              <MediaImage
                image={brand.logo}
                sizes="(min-width: 1080px) 320px, 60vw"
                eager
                // A fixed height: brand files are small (~20 px logos of the cards), `w-auto` scales.
                className="h-16 w-auto max-w-[75%] object-contain sm:h-24"
              />
            ) : (
              // Text in the logo tile: always on white, so the navy of the light buttons.
              <p
                aria-hidden="true"
                className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold text-surface-dark"
              >
                {brand.name}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

/**
 * Description, „Linie produktów” and „Fakty” with the source at each row (K3-KATALOG §6); the
 * country of origin as the first fact. Nothing renders without any of them.
 */
export function BrandAbout({ brand }: { brand: BrandView }) {
  const facts = [
    ...(brand.country
      ? [{ label: 'Kraj pochodzenia', value: brand.country, sourceUrl: null }]
      : []),
    ...brand.facts,
  ]
  if (!brand.description && brand.productLines.length === 0 && facts.length === 0) return null
  return (
    <Container wide className="pb-14 sm:pb-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-8">
          {brand.description && (
            <section aria-labelledby="opis-marki-h">
              <h2 id="opis-marki-h" className="sr-only">
                O marce {brand.name}
              </h2>
              <RichText data={brand.description} className="rich-text max-w-3xl text-ink-2" />
            </section>
          )}
          {brand.productLines.length > 0 && (
            <section aria-labelledby="linie-h">
              <h2 id="linie-h" className="font-display text-xl font-extrabold text-ink">
                Linie produktów
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {brand.productLines.map((line) => (
                  <li
                    key={line}
                    className="rounded-full bg-card px-4 py-2 text-sm font-bold text-ink shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {facts.length > 0 && (
          <section
            aria-labelledby="fakty-h"
            className="self-start rounded-[26px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)] sm:p-7"
          >
            <h2 id="fakty-h" className="font-display text-xl font-extrabold text-ink">
              Fakty
            </h2>
            <dl className="mt-4 divide-y divide-border">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4"
                >
                  <dt className={LABEL}>{fact.label}</dt>
                  <dd className="text-ink">
                    {fact.value}
                    {fact.sourceUrl && (
                      <>
                        {' '}
                        <a
                          href={fact.sourceUrl}
                          rel="noopener"
                          className="inline-flex min-h-6 items-center text-sm font-bold text-accent-text underline-offset-2 hover:underline"
                        >
                          źródło<span className="sr-only">: {fact.label}</span>
                        </a>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </Container>
  )
}
