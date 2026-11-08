import { Fragment, type CSSProperties, type ReactNode } from 'react'

import type { ProcurementPageData } from '@/lib/biznes/procurement/schema'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { categoryHref } from '@/lib/catalog/category'
import { plural } from '@/lib/plural'

import { ProcIcon } from './icons'
import { BrandMark, Figure, ProcImage, SectionHead, SmartLink, type ResolvedBrand } from './parts'
import { WhoTabs } from './ProcurementIslands'

type Data = ProcurementPageData
type Images = Record<number, IndexImage>

const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']

/** Width share of a picture in the „Dla kogo” stage: by its shape (a TV wider than a fridge). */
function flexOf(id: number | null, images: Images): number {
  const image = id ? images[id] : undefined
  if (!image) return 1
  return Math.min(1.8, Math.max(0.6, image.width / image.height))
}

/** Full names for screen readers (the month row itself is hidden from them). */
const MONTH_NAMES = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
]

function Seasons({ seasons }: { seasons: NonNullable<Data['seasons']> }) {
  return (
    <div className="zp-season zp-card">
      <b>{seasons.heading}</b>
      <ol className="zp-months" aria-hidden="true">
        {MONTHS.map((month, i) => (
          <li key={month} className={seasons.peak.includes(i + 1) ? 'is-peak' : 'is-ok'}>
            {month}
          </li>
        ))}
      </ol>
      <p className="sr-only">
        {seasons.peakLabel}: {seasons.peak.map((month) => MONTH_NAMES[month - 1]).join(', ')}.{' '}
        {seasons.goodLabel}.
      </p>
      <p className="zp-legend" aria-hidden="true">
        <span>
          <i className="is-peak" aria-hidden="true" />
          {seasons.peakLabel}
        </span>
        <span>
          <i className="is-ok" aria-hidden="true" />
          {seasons.goodLabel}
        </span>
      </p>
    </div>
  )
}

/** 4. „Dla kogo” (AGD): tabs with a stage of pictures, points and the seasons on Hotels. */
export function Who({
  who,
  seasons,
  images,
}: {
  who: NonNullable<Data['who']>
  seasons: Data['seasons']
  images: Images
}) {
  return (
    <section id="who" aria-labelledby="zp-who-h" className="zp-blk zp-wrap">
      <SectionHead id="zp-who-h" eyebrow={who.eyebrow} heading={who.heading} lead={who.lead} />
      <WhoTabs
        id="zp-who"
        label={who.eyebrow ?? who.heading}
        tabs={who.tabs.map((tab) => ({ title: tab.title, icon: <ProcIcon name={tab.icon} /> }))}
        panels={who.tabs.map((tab, k) => (
          <Fragment key={`${k}-${tab.title}`}>
            <div className="zp-stage">
              <div className="zp-stage-row">
                {tab.images.map((id, j) => (
                  <div key={j} style={{ flex: flexOf(id, images) }}>
                    <ProcImage id={id} images={images} />
                  </div>
                ))}
              </div>
              <div className="zp-cap">
                <b>{tab.caption.title}</b>
                <p>{tab.caption.text}</p>
              </div>
            </div>
            <div className="zp-points">
              <div className="zp-who-txt">
                <h3>{tab.heading}</h3>
                <p>{tab.text}</p>
              </div>
              {tab.points.map((point, k) => (
                <div key={`${k}-${point.title}`} className="zp-point zp-card">
                  <span className="zp-point-n">
                    <ProcIcon name="check" />
                  </span>
                  <div>
                    <b>{point.title}</b>
                    <span>{point.sub}</span>
                  </div>
                </div>
              ))}
              {tab.seasons && seasons && <Seasons seasons={seasons} />}
            </div>
          </Fragment>
        ))}
      />
    </section>
  )
}

/** 4′. „Co dostarczamy” (IT): categories with the number of items in the catalog. */
export function Categories({
  categories,
  counts,
  images,
}: {
  categories: NonNullable<Data['categories']>
  counts: Record<string, number>
  images: Images
}) {
  return (
    <section id="cats" aria-labelledby="zp-cats-h" className="zp-blk zp-wrap">
      <SectionHead
        id="zp-cats-h"
        eyebrow={categories.eyebrow}
        heading={categories.heading}
        lead={categories.lead}
      />
      <ul className="zp-cats" data-reveal-cards="">
        {categories.list.map((item, k) => {
          const count = item.category ? (counts[item.category] ?? 0) : 0
          const body = (
            <>
              <div>
                <h3>{item.name}</h3>
                <p>{item.brands}</p>
                {(count > 0 || item.note) && (
                  <span className="zp-go">
                    {item.note ??
                      `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])} w katalogu`}
                    <ProcIcon name="arrow" />
                  </span>
                )}
              </div>
              <div className="zp-cat-pic">
                <ProcImage id={item.image} images={images} decorative />
              </div>
            </>
          )
          return (
            <li key={`${k}-${item.name}`}>
              {item.category ? (
                <SmartLink href={categoryHref(item.category)} className="zp-cat zp-card">
                  {body}
                </SmartLink>
              ) : (
                <div className="zp-cat zp-card">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Sections whose interactive part comes in B2-1c: the heading and an empty slot for the island. */
export function Shell({
  id,
  head,
  slot,
  children,
}: {
  id: string
  head: { eyebrow?: string; heading: string; lead?: string }
  slot: 'configurator' | 'offer'
  children?: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`zp-${id}-h`} className="zp-blk zp-wrap">
      <SectionHead id={`zp-${id}-h`} {...head} />
      <div data-procurement-slot={slot} />
      {children}
    </section>
  )
}

/** 7′. Three classes (AGD): static cards for now; choosing a class drives the configurator later. */
export function Classes({
  classes,
  hints,
}: {
  classes: NonNullable<Data['classes']>
  hints: readonly string[]
}) {
  return (
    <div className="zp-vars-wrap">
      <h3 className="sr-only">{classes.heading}</h3>
      <ul className="zp-vars" data-reveal-cards="">
        {classes.list.map((item, i) => (
          <li key={`${i}-${item.name}`} className="zp-var">
            <span className="zp-var-tag">{item.name}</span>
            <h4>{item.for}</h4>
            <p>{item.text}</p>
            {item.points.length > 0 && (
              <ul>
                {item.points.map((point) => (
                  <li key={point}>
                    <ProcIcon name="check" />
                    {point}
                  </li>
                ))}
              </ul>
            )}
            {hints[i]?.trim() && <p className="zp-var-hint">np. {hints[i]!.trim()}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 8. „Na co patrzymy”: numbered cards with icons. */
export function Guide({ guide }: { guide: Data['guide'] }) {
  if (guide.list.length === 0) return null
  return (
    <section id="guide" aria-labelledby="zp-guide-h" className="zp-blk zp-wrap">
      <SectionHead
        id="zp-guide-h"
        eyebrow={guide.eyebrow}
        heading={guide.heading}
        lead={guide.lead}
      />
      <ul className="zp-guide" data-reveal-cards="">
        {guide.list.map((item, i) => (
          <li key={`${i}-${item.title}`} className="zp-gd zp-card">
            <span className="zp-gd-no" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="zp-gd-icon">
              <ProcIcon name={item.icon} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** 9. „Z nami i bez”: a table (role semantics as the prototype); cards on a phone. */
export function Versus({ versus }: { versus: Data['versus'] }) {
  if (versus.rows.length === 0) return null
  return (
    <section id="vs" aria-labelledby="zp-vs-h" className="zp-blk zp-wrap">
      <SectionHead
        id="zp-vs-h"
        eyebrow={versus.eyebrow}
        heading={versus.heading}
        lead={versus.lead}
      />
      <div className="zp-vs" role="table" aria-labelledby="zp-vs-h" data-reveal="">
        <div className="zp-vs-row zp-vs-head" role="row">
          <div role="columnheader">Sytuacja</div>
          <div className="is-bad" role="columnheader">
            ✕ Kupujesz sam
          </div>
          <div className="is-good" role="columnheader">
            ✓ Zamawiasz przez PRO-KOM
          </div>
        </div>
        {versus.rows.map((row, k) => (
          <div key={`${k}-${row.title}`} className="zp-vs-row" role="row">
            <div className="zp-vs-sit" role="rowheader">
              <span className="zp-vs-icon">
                <ProcIcon name={row.icon} />
              </span>
              {row.title}
            </div>
            <div className="zp-vs-bad" role="cell">
              <span className="zp-vs-tag">Sam: </span>
              {row.without}
            </div>
            <div className="zp-vs-good" role="cell">
              <span className="zp-vs-tag">Z PRO-KOM: </span>
              {row.with}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** 10. „Jak pracujemy”: four steps; the schedule (gantt) comes in B2-1c into its slot. */
export function Steps({ steps }: { steps: Data['steps'] }) {
  return (
    <section id="steps" aria-labelledby="zp-steps-h" className="zp-blk zp-wrap">
      <SectionHead
        id="zp-steps-h"
        eyebrow={steps.eyebrow}
        heading={steps.heading}
        lead={steps.lead}
      />
      <ol className="zp-steps" data-reveal-cards="">
        {steps.items.map((step, i) => (
          <li key={`${i}-${step.title}`} className="zp-step zp-card">
            <span className="zp-step-no" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <div data-procurement-slot="gantt" />
    </section>
  )
}

/** 11. Programs (IT): the text and the partner logos with what we install. */
export function Programs({
  programs,
  brands,
}: {
  programs: NonNullable<Data['programs']>
  brands: ResolvedBrand[]
}) {
  return (
    <section id="progs" aria-labelledby="zp-progs-h" className="zp-blk zp-wrap">
      <div className="zp-progs zp-card" data-reveal="">
        <div>
          {programs.eyebrow && <p className="zp-eyebrow">{programs.eyebrow}</p>}
          <h2 id="zp-progs-h">{programs.heading}</h2>
          {programs.lead && <p>{programs.lead}</p>}
        </div>
        <ul className="zp-plogos">
          {programs.list.map((item, i) => {
            const brand = brands[i]
            return (
              <li key={`${i}-${item.name}`}>
                {brand && <BrandMark brand={brand} />}
                <small>{item.text}</small>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** 12. Industries (IT): cards leading to the industry pages. */
export function Industries({ industries }: { industries: NonNullable<Data['industries']> }) {
  return (
    <section aria-labelledby="zp-ind-h" className="zp-blk zp-wrap">
      <SectionHead
        id="zp-ind-h"
        eyebrow={industries.eyebrow}
        heading={industries.heading}
        lead={industries.lead}
      />
      <ul className="zp-whos" data-reveal-cards="">
        {industries.list.map((item, k) => {
          const body = (
            <>
              <span className="zp-wcard-icon">
                <ProcIcon name={item.icon} />
              </span>
              <b>{item.name}</b>
              <span>{item.text}</span>
            </>
          )
          return (
            <li key={`${k}-${item.name}`}>
              {item.href ? (
                <SmartLink href={item.href} className="zp-wcard zp-card">
                  {body}
                </SmartLink>
              ) : (
                <div className="zp-wcard zp-card">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** 13. After the delivery (IT): the Opieka IT band with a sample status panel. */
export function Care({ care }: { care: NonNullable<Data['care']> }) {
  return (
    <div className="zp-wrap zp-blk-plain">
      <section className="zp-stay" aria-labelledby="zp-care-h" data-reveal="">
        <div>
          {care.eyebrow && <p className="zp-eyebrow">{care.eyebrow}</p>}
          <h2 id="zp-care-h">{care.heading}</h2>
          {care.lead && <p>{care.lead}</p>}
          {care.actions.length > 0 && (
            <div className="zp-acts">
              {care.actions.map((action, i) => (
                <SmartLink
                  key={action.href}
                  href={action.href}
                  className={i === 0 ? 'zp-btn zp-btn-white' : 'zp-btn zp-btn-ghost'}
                >
                  {action.label}
                  {i > 0 && <ProcIcon name="arrow" />}
                </SmartLink>
              ))}
            </div>
          )}
        </div>
        {care.rows.length > 0 && (
          <ul className="zp-panel" aria-label="Przykładowy raport opieki">
            {care.rows.map((row, k) => (
              <li key={`${k}-${row.title}`}>
                <span className="zp-panel-icon">
                  <ProcIcon name={row.icon} />
                </span>
                <div>
                  <b>{row.title}</b>
                  <small>{row.sub}</small>
                </div>
                <span className={`zp-tag is-${row.status}`}>{row.label}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/** 14. „Apartament to nie tylko AGD”: intro card and tiles with pictures and links. */
export function Combo({ combo, images }: { combo: NonNullable<Data['combo']>; images: Images }) {
  return (
    <section id="combo" aria-labelledby="zp-combo-h" className="zp-blk zp-wrap">
      <div className="zp-combo">
        <div className="zp-combo-intro zp-card" data-reveal="">
          <div>
            {combo.eyebrow && <p className="zp-eyebrow">{combo.eyebrow}</p>}
            <h2 id="zp-combo-h">{combo.heading}</h2>
            {combo.lead && <p>{combo.lead}</p>}
          </div>
          <SmartLink href={combo.link.href} className="zp-txtlink">
            {combo.link.label}
            <ProcIcon name="arrow" />
          </SmartLink>
        </div>
        <ul className="zp-combo-tiles" data-reveal-cards="">
          {combo.list.map((item, k) => {
            const body = (
              <>
                <div className="zp-pic">
                  <ProcImage id={item.image} images={images} decorative />
                </div>
                <b>{item.title}</b>
                <span>{item.text}</span>
                <span className="zp-ct-tag">{item.note}</span>
              </>
            )
            return (
              <li key={`${k}-${item.title}`}>
                {item.href ? (
                  <SmartLink href={item.href} className="zp-ct zp-card">
                    {body}
                  </SmartLink>
                ) : (
                  <div className="zp-ct zp-card">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** 15. Brands: a grid of colourful logos with a sweep of light on hover. */
export function BrandsGrid({ head, brands }: { head: Data['brands']; brands: ResolvedBrand[] }) {
  if (brands.length === 0) return null
  return (
    <section id="brands" aria-labelledby="zp-brands-h" className="zp-blk zp-wrap">
      <SectionHead
        id="zp-brands-h"
        eyebrow={head.eyebrow}
        heading={head.heading}
        lead={head.lead}
      />
      <ul className="zp-brands" data-reveal-cards="">
        {brands.map((brand, k) => (
          <li key={`${k}-${brand.name}`}>
            {brand.href ? (
              <SmartLink href={brand.href} className="zp-brand">
                <BrandMark brand={brand} />
              </SmartLink>
            ) : (
              <span className="zp-brand">
                <BrandMark brand={brand} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** 16. Facts (counting up) and „Z każdą dostawą”. */
export function Facts({
  facts,
  documents,
}: {
  facts: Data['facts']
  documents: Data['documents']
}) {
  if (facts.length === 0 && documents.list.length === 0) return null
  return (
    <section aria-label="Dlaczego PRO-KOM" className="zp-blk zp-wrap">
      {facts.length > 0 && (
        <ul className="zp-facts" data-reveal-cards="">
          {facts.map((fact, k) => (
            <li key={`${k}-${fact.label}`} className="zp-fact zp-card">
              <Figure text={fact.value} />
              <span>{fact.label}</span>
            </li>
          ))}
        </ul>
      )}
      {documents.list.length > 0 && (
        <div
          className="zp-docs zp-card"
          style={{ '--docs': documents.list.length } as CSSProperties}
          data-reveal=""
        >
          <h3>{documents.heading}</h3>
          <ul>
            {documents.list.map((doc, k) => (
              <li key={`${k}-${doc.title}`}>
                <span className="zp-docs-icon">
                  <ProcIcon name={doc.icon} />
                </span>
                <span>
                  <b>{doc.title}</b>
                  <span>{doc.sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
