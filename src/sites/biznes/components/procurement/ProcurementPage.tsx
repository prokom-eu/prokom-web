import Link from 'next/link'

import { fillHours } from '@/lib/biznes/procurement/hours'
import type { ProcurementPageData } from '@/lib/biznes/procurement/schema'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { breadcrumbJsonLd, faqJsonLd, serializeJsonLd, serviceJsonLd } from '@/lib/seo/jsonLd'
import { toTelHref } from '@/lib/site/link'
import { Breadcrumbs, type Crumb } from '@/sites/biznes/components/Breadcrumbs'

import { HeroBrands, ProcurementHero } from './Hero'
import { ProcIcon } from './icons'
import { FaqSearch, PageNav } from './ProcurementIslands'
import { ProcImage, type ResolvedBrand } from './parts'
import {
  BrandsGrid,
  Care,
  Categories,
  Classes,
  Combo,
  Facts,
  Guide,
  Industries,
  Programs,
  Shell,
  Steps,
  Versus,
  Who,
} from './Sections'

/** Everything the template needs besides the page JSON, read by the block from the panel. */
export type ProcurementContext = {
  /** Address of this page (`/agd-rtv-dla-firm`) and the site origin for JSON-LD. */
  path: string
  origin: string
  phone: string | null
  email: string | null
  /** Opening hours from the company data, short („pn–pt 9:00–17:00”); `null` without hours. */
  hours: string | null
  provider: string
  images: Record<number, IndexImage>
  /** Brand of the data → logo and link (same order as the data list). */
  resolveBrand: (brand: { name: string; partner?: string; image?: number | null }) => ResolvedBrand
  /** Listed products per category slug (IT „Co dostarczamy”). */
  categoryCounts: Record<string, number>
  /** The other procurement page is published (the cross card shows only then). */
  crossPublished: boolean
  /** Example brands per class (block field, §0 pkt 6), by class index. */
  classHints: readonly string[]
}

/** Where the service is offered (ZAOPATRZENIE §1). */
const AREA_SERVED = ['Podhale', 'Małopolska'] as const

/**
 * „Zaopatrzenie firm” template (ZAOPATRZENIE §2): the sections in the spec's order, each only
 * when its data exists. The configurator, offer preview, schedule and form are islands of
 * B2-1c — here their sections carry the headings and an empty `data-procurement-slot`.
 */
export function ProcurementPage({
  data,
  context,
}: {
  data: ProcurementPageData
  context: ProcurementContext
}) {
  const { images } = context
  const crumbs: Crumb[] = [
    { name: 'Start', href: '/' },
    { name: 'Oferta', href: '/oferta' },
    // ZAOPATRZENIE §1: no `/zaopatrzenie-firm` page — the crumb leads to the offer.
    { name: 'Zaopatrzenie firm', href: '/oferta' },
    { name: data.hero.crumb, href: context.path },
  ]
  const faq = data.faq.map((item) => ({ q: item.q, a: fillHours(item.a, context.hours) }))
  const brands = data.brands.list.map(context.resolveBrand)
  const tel = context.phone ? toTelHref(context.phone) : null

  // Anchors of the sections this page renders: the bar links only to those.
  const rendered = new Set<string>(['zestaw', 'oferta', 'steps', 'formularz'])
  if (data.who) rendered.add('who')
  if (data.categories) rendered.add('cats')
  if (data.guide.list.length > 0) rendered.add('guide')
  if (data.versus.rows.length > 0) rendered.add('vs')
  if (data.programs) rendered.add('progs')
  if (data.combo) rendered.add('combo')
  if (brands.length > 0) rendered.add('brands')
  if (faq.length > 0) rendered.add('faq')
  const links = data.nav.filter((link) => rendered.has(link.anchor))

  const jsonLd = [
    serviceJsonLd({
      name: data.hero.title,
      description: data.hero.lead,
      url: context.origin + context.path,
      provider: context.provider,
      priceFrom: null,
      areaServed: AREA_SERVED,
    }),
    ...(faq.length > 0 ? [faqJsonLd(faq.map(({ q, a }) => ({ question: q, answer: a })))] : []),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: context.origin + href }))),
  ]

  return (
    <div className="zp" data-procurement={data.variant}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="zp-wrap">
        <div className="zp-crumbs">
          <Breadcrumbs items={crumbs} />
        </div>
        <ProcurementHero hero={data.hero} phone={context.phone} images={images} />
        <HeroBrands label={data.hero.marquee} brands={brands} />
      </div>
      {links.length > 0 && (
        <PageNav links={links} cta={{ anchor: 'formularz', label: 'Wyślij zapytanie' }} />
      )}

      {data.who && <Who who={data.who} seasons={data.seasons} images={images} />}
      {data.categories && (
        <Categories categories={data.categories} counts={context.categoryCounts} images={images} />
      )}
      <Shell id="zestaw" head={data.configurator} slot="configurator" />
      <Shell id="oferta" head={data.offer} slot="offer">
        {data.classes && data.classes.list.length > 0 && (
          <Classes classes={data.classes} hints={context.classHints} />
        )}
      </Shell>
      <Guide guide={data.guide} />
      <Versus versus={data.versus} />
      <Steps steps={data.steps} />
      {data.programs && (
        <Programs programs={data.programs} brands={data.programs.list.map(context.resolveBrand)} />
      )}
      {data.industries && <Industries industries={data.industries} />}
      {data.care && <Care care={data.care} />}
      {data.combo && <Combo combo={data.combo} images={images} />}
      <BrandsGrid head={data.brands} brands={brands} />
      <Facts facts={data.facts} documents={data.documents} />

      {faq.length > 0 && (
        <section id="faq" aria-labelledby="zp-faq-h" className="zp-blk zp-wrap">
          <div className="zp-head" data-reveal="">
            <div>
              <p className="zp-eyebrow">Pytania</p>
              <h2 id="zp-faq-h">Zanim wyślesz zapytanie</h2>
            </div>
            {context.phone && tel && (
              <p className="zp-head-lead">
                Nie ma tu Twojego pytania? Zadzwoń: <a href={tel}>{context.phone}</a>
                {context.hours && `, ${context.hours}`}.
              </p>
            )}
          </div>
          <FaqSearch
            empty={
              context.phone
                ? `Nie mamy jeszcze odpowiedzi na to pytanie. Zadzwoń: ${context.phone} albo napisz w formularzu niżej.`
                : 'Nie mamy jeszcze odpowiedzi na to pytanie. Napisz w formularzu niżej.'
            }
          >
            {faq.map((item, i) => (
              <details key={`${i}-${item.q}`} open={i === 0}>
                <summary>
                  {item.q}
                  <span className="zp-faq-plus" aria-hidden="true">
                    <ProcIcon name="plus" />
                  </span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </FaqSearch>
        </section>
      )}

      <section id="formularz" aria-labelledby="zp-form-h" className="zp-blk zp-wrap">
        <div className="zp-formx">
          <div className="zp-form-side">
            <p className="zp-eyebrow">Zapytanie · tylko dla firm</p>
            <h2 id="zp-form-h">{data.form.heading}</h2>
            {data.form.lead && <p>{data.form.lead}</p>}
            <ul className="zp-contact">
              {context.phone && tel && (
                <li>
                  <a href={tel}>
                    <span className="zp-contact-icon">
                      <ProcIcon name="phone" />
                    </span>
                    {context.phone}
                  </a>
                </li>
              )}
              {context.email && (
                <li>
                  <a href={`mailto:${context.email}`}>
                    <span className="zp-contact-icon">
                      <ProcIcon name="mail" />
                    </span>
                    {context.email}
                  </a>
                </li>
              )}
              {context.hours && (
                <li>
                  <span className="zp-contact-row">
                    <span className="zp-contact-icon">
                      <ProcIcon name="clock" />
                    </span>
                    {context.hours}
                  </span>
                </li>
              )}
            </ul>
          </div>
          <div className="zp-form-slot" data-procurement-slot="form" />
        </div>
        {data.cross && context.crossPublished && (
          <Link href={`/${data.cross.page}`} className="zp-cross zp-card">
            <span className="zp-cross-pics" aria-hidden="true">
              {data.cross.images.map((id, i) => (
                <ProcImage key={i} id={id} images={images} decorative />
              ))}
            </span>
            <span>
              <b>{data.cross.title}</b>
              <span className="zp-cross-text">{data.cross.text}</span>
            </span>
            <span className="zp-cross-arrow" aria-hidden="true">
              <ProcIcon name="arrow" />
            </span>
          </Link>
        )}
      </section>
    </div>
  )
}
