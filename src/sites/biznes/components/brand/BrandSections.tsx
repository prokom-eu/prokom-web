import { RichText } from '@payloadcms/richtext-lexical/react'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import type { BrandView } from '@/lib/catalog/brand'
import { plural } from '@/lib/plural'
import { BZ_H1, BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

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
    <section className="relative overflow-hidden pt-6 pb-12 max-md:pt-4 max-md:pb-10 min-[768px]:pt-8 min-[768px]:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_90%_10%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        {/* Phone: no breadcrumbs, the top bar names the brand (as the salons). */}
        <div className="max-md:hidden">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="mt-6 max-md:mt-0 grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[1080px]:gap-14">
          <div className="flex flex-col gap-6">
            <h1 className={BZ_H1}>{brand.name} w PRO-KOM</h1>
            {brand.shortDescription && (
              <p className={`${BZ_LEAD} max-w-[54ch] text-ink-2`}>{brand.shortDescription}</p>
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
          <div className="flex min-h-48 items-center justify-center rounded-[32px] bg-white p-10 shadow-[inset_0_0_0_1px_var(--border)] max-md:min-h-32 max-md:rounded-[24px] max-md:p-6 min-[768px]:min-h-64">
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

/**
 * The one call to action at the end of a brand page without a salon (audit 0611 P1-4): instead
 * of the steps, the form and a help card in the grid — on a phone these made the page longer
 * than on a computer. `#kontakt` stays the anchor of the page.
 */
export function BrandCta({
  brand,
  callbackTime,
  phone,
}: {
  brand: string
  callbackTime: string | null
  phone: { label: string; href: string } | null
}) {
  return (
    <section id="kontakt" aria-labelledby="marka-cta-h" className="scroll-mt-24 pb-16 sm:pb-24">
      <Container wide>
        <div
          data-surface="dark"
          className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[26px] bg-surface-dark bg-[radial-gradient(circle_at_90%_0%,var(--glow),transparent_55%)] p-7 text-white sm:rounded-[32px] sm:p-10 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex max-w-[60ch] flex-col gap-2.5">
            <h2 id="marka-cta-h" className={`${BZ_H2} text-white`}>
              Interesuje Cię {brand}? Dobierzemy i wycenimy.
            </h2>
            <p className="leading-relaxed text-white/80">
              Dodaj produkty do zapytania albo napisz, czego szukasz. Wycena na piśmie, bez
              zobowiązań.{callbackTime ? ` ${callbackTime} w godzinach pracy.` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PageLink href="/kontakt#formularz" kind="light" arrow>
              Napisz do nas
            </PageLink>
            {phone && (
              <a
                href={phone.href}
                className="inline-flex min-h-[52px] items-center rounded-2xl px-6 font-extrabold text-white ring-[1.5px] ring-white/35 ring-inset hover:bg-white/10"
              >
                {phone.label}
              </a>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
