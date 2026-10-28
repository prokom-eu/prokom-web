'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, type CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'
import { cardIcon, productHref } from '@/lib/catalog/card'
import type { CatalogIndex, IndexImage, IndexProduct } from '@/lib/catalog/catalogIndex'
import {
  pickWizardRule,
  seriesColumns,
  seriesVideo,
  type ShowroomSeries,
  type ShowroomView,
} from '@/lib/catalog/showroom'
import { plural } from '@/lib/plural'

import { ProductCard } from '../catalog/ProductCard'
import { PathIcon } from '../product/PathIcon'
import { ProductStage, STAGE_SHADOW, StageFallback } from '../ProductStage'
import { VideoFacade } from '../VideoFacade'
import { ShowroomHeading } from './ShowroomHeading'

type Props = {
  brand: string
  view: ShowroomView
  /** Index with only this brand's products (the page never sends the whole catalog). */
  index: CatalogIndex
  /** Poster of the series film: the first photo of the hero. */
  poster: IndexImage | null
}

const count = (n: number) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])}`

/**
 * The interactive part of the showroom (`k31/screens/Web-Marka-1440`, K31-ZMIANY §5): segments
 * → series tiles (a click filters the grid, a second click clears it) → the cards → the
 * comparison of the segment's series (chosen row highlighted) → the wizard in 3 questions → the
 * film of the chosen series. The choice lives in the browser; the page keeps one address.
 */
export function ShowroomBody({ brand, view, index, poster }: Props) {
  const [segmentKey, setSegmentKey] = useState(view.segments[0]!.key)
  const [seriesName, setSeriesName] = useState<string | null>(null)
  const bySlug = useMemo(
    () => new Map(index.products.map((product) => [product.slug, product])),
    [index.products],
  )
  const segment = view.segments.find((item) => item.key === segmentKey) ?? view.segments[0]!
  const chosen = segment.series.find((series) => series.name === seriesName) ?? null
  const products = (chosen ? [chosen] : segment.series)
    .flatMap((series) => series.products)
    .flatMap((slug) => bySlug.get(slug) ?? [])
  const video = seriesVideo(view.videos, [
    ...(chosen ? [chosen.name] : []),
    ...segment.series.map((series) => series.name),
  ])
  const columns = seriesColumns(segment.series.length)

  return (
    <>
      <section id="salon" aria-labelledby="salon-oferta" className="scroll-mt-24">
        <h2 id="salon-oferta" className="sr-only">
          Oferta {brand}
        </h2>
        <div
          role="group"
          aria-label="Działy"
          className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {view.segments.map((item) => {
            const pressed = item.key === segment.key
            const n = new Set(item.series.flatMap((series) => series.products)).size
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={pressed}
                onClick={() => {
                  setSegmentKey(item.key)
                  setSeriesName(null)
                }}
                className={cx(
                  'inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-2xl px-4 text-[15px] font-extrabold whitespace-nowrap focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
                  pressed
                    ? 'bg-ink text-surface'
                    : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                )}
              >
                {item.icon && <PathIcon d={item.icon} className="size-[18px] max-sm:hidden" />}
                {item.name}
                <span
                  className={cx(
                    'rounded-lg px-1.5 py-0.5 text-xs',
                    pressed ? 'bg-surface/15' : 'bg-surface-2 text-ink-2',
                  )}
                >
                  {n}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 mb-4 flex items-baseline justify-between gap-3 sm:hidden">
          <h3 className="font-display text-2xl font-extrabold">Serie</h3>
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-ink-2">
            dotknij, żeby filtrować
          </span>
        </div>
        <ul
          aria-label={`Serie: ${segment.name}`}
          style={{ '--cols': columns } as CSSProperties}
          className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        >
          {segment.series.map((series) => (
            <li key={series.name} className="w-[46%] shrink-0 sm:w-auto">
              <SeriesTile
                series={series}
                icon={segment.icon}
                photo={series.image ? (bySlug.get(series.image)?.image ?? null) : null}
                pressed={chosen === series}
                onPick={() => setSeriesName(chosen === series ? null : series.name)}
              />
            </li>
          ))}
        </ul>

        <div className="mt-10 mb-5 flex items-baseline justify-between gap-4">
          <h3
            className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold"
            aria-live="polite"
          >
            {chosen?.name ?? segment.name}
          </h3>
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-ink-2">
            {count(products.length)}
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, position) => (
            <li key={product.slug} className="flex">
              <ProductCard product={product} index={index} position={position} meta="series" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="salon-porownanie">
        <ShowroomHeading id="salon-porownanie" eyebrow="Porównanie serii">
          {view.compareTitle ?? `Która seria ${brand} dla Ciebie?`}
        </ShowroomHeading>
        <div className="overflow-x-auto rounded-3xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs tracking-[0.08em] text-ink-2 uppercase">
                <th scope="col" className="px-5 py-4 font-extrabold">
                  Seria
                </th>
                <th scope="col" className="px-5 py-4 font-extrabold">
                  Dla kogo
                </th>
                <th scope="col" className="px-5 py-4 font-extrabold">
                  Co ją wyróżnia
                </th>
                <th scope="col" className="px-5 py-4 font-extrabold">
                  Klasa
                </th>
                <th scope="col" className="px-5 py-4 font-extrabold">
                  W katalogu
                </th>
              </tr>
            </thead>
            <tbody>
              {segment.series.map((series) => (
                <tr
                  key={series.name}
                  aria-current={chosen === series ? 'true' : undefined}
                  className={cx(
                    'border-t border-border align-top',
                    chosen === series && 'bg-accent-soft',
                  )}
                >
                  <th scope="row" className="px-5 py-4 font-display font-extrabold text-ink">
                    {series.name}
                  </th>
                  <td className="px-5 py-4 text-ink-2">{series.audience}</td>
                  <td className="px-5 py-4 text-ink-2">{series.highlight}</td>
                  <td className="px-5 py-4">
                    {series.tier && (
                      <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-2">
                        {series.tier}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-ink-2">
                    {series.products.length} poz.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {view.rules.length > 0 && view.wizard.length > 0 && (
        <ShowroomWizard view={view} bySlug={bySlug} index={index} />
      )}

      {video && (
        <section aria-labelledby="salon-film">
          <ShowroomHeading id="salon-film" eyebrow="Film producenta">
            Poznaj serię {video.series}
          </ShowroomHeading>
          <div className="max-w-[980px]">
            <VideoFacade
              key={video.id}
              video={video}
              label={`Film ${brand}`}
              poster={
                poster && (
                  <Image
                    src={poster.url}
                    alt=""
                    width={poster.width}
                    height={poster.height}
                    unoptimized
                    className="max-h-full w-auto max-w-full object-contain opacity-80"
                  />
                )
              }
            />
            <p className="mt-3 text-xs leading-relaxed text-ink-2">
              Film z oficjalnego kanału producenta. Odtwarza się dopiero po kliknięciu (YouTube w
              trybie bez plików cookie).
            </p>
          </div>
        </section>
      )}
    </>
  )
}

function SeriesTile({
  series,
  icon,
  photo,
  pressed,
  onPick,
}: {
  series: ShowroomSeries
  icon: string | null
  photo: IndexImage | null
  pressed: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPick}
      className={cx(
        'flex h-full w-full flex-col gap-1.5 rounded-3xl bg-card p-3 text-left transition-shadow focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text sm:p-4',
        pressed
          ? 'shadow-[inset_0_0_0_2px_var(--accent-text),0_18px_36px_-24px_var(--glow)]'
          : 'shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
      )}
    >
      {/* The tier sits above the picture, never on it (K31-ZMIANY §5 pkt 2). */}
      <span className="flex min-h-6 justify-end">
        {series.tier && (
          <span
            className={cx(
              'rounded-full px-2.5 py-1 text-[0.7rem] leading-none font-extrabold',
              pressed ? 'bg-accent-text text-accent-ink' : 'bg-surface-2 text-ink-2',
            )}
          >
            {series.tier}
          </span>
        )}
      </span>
      <ProductStage as="span" className="h-24 rounded-2xl sm:h-28">
        {photo ? (
          <Image
            src={photo.url}
            alt=""
            width={photo.width}
            height={photo.height}
            unoptimized
            className={cx(
              'relative h-auto max-h-[78%] w-auto max-w-[80%] object-contain',
              STAGE_SHADOW,
            )}
          />
        ) : icon ? (
          <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-accent-text shadow-[inset_0_0_0_1px_var(--border)]">
            <PathIcon d={icon} className="size-7" />
          </span>
        ) : null}
      </ProductStage>
      <span className="mt-1 font-display text-base leading-tight font-extrabold text-ink">
        {series.name}
      </span>
      {series.audience && (
        <span className="line-clamp-2 text-xs leading-snug text-ink-2 sm:text-[13px]">
          {series.audience}
        </span>
      )}
      <span className="mt-auto pt-1 text-[13px] font-extrabold text-accent-text">
        {count(series.products.length)} →
      </span>
    </button>
  )
}

/**
 * „Dobór w 3 pytaniach” (`#dobor`): one answer per question (the first preselected, as on the
 * board), the first matching rule → its series, why, and up to 2 cards; „to podpowiedź”.
 */
function ShowroomWizard({
  view,
  bySlug,
  index,
}: {
  view: ShowroomView
  bySlug: Map<string, IndexProduct>
  index: CatalogIndex
}) {
  const [answers, setAnswers] = useState(() => view.wizard.map(() => 0))
  const keys = view.wizard.map(
    (question, position) => question.options[answers[position] ?? 0]!.key,
  )
  const rule = pickWizardRule(view.rules, keys)
  const picks = (rule?.products ?? []).flatMap((slug) => bySlug.get(slug) ?? []).slice(0, 2)

  return (
    <section
      id="dobor"
      aria-labelledby="salon-dobor"
      className="grid scroll-mt-24 gap-6 rounded-[32px] bg-surface-2 p-5 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10"
    >
      <div>
        <ShowroomHeading id="salon-dobor" eyebrow="Dobór w 3 pytaniach">
          {view.wizardTitle ?? 'Który model dla Ciebie?'}
        </ShowroomHeading>
        <div className="flex flex-col gap-6">
          {view.wizard.map((question, position) => (
            <fieldset key={question.question}>
              <legend className="mb-3 font-extrabold text-ink">{question.question}</legend>
              <div className="flex flex-wrap gap-2.5">
                {question.options.map((option, choice) => {
                  const pressed = answers[position] === choice
                  return (
                    <button
                      key={option.key}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() =>
                        setAnswers((current) =>
                          current.map((value, at) => (at === position ? choice : value)),
                        )
                      }
                      className={cx(
                        'min-h-11 rounded-xl px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
                        pressed
                          ? 'bg-accent-text text-accent-ink'
                          : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>
      {rule && (
        <div
          aria-live="polite"
          className="flex flex-col gap-3 self-start rounded-3xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)] sm:p-7"
        >
          <p className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
            Podpowiadamy
          </p>
          <p className="font-display text-[1.6rem] leading-tight font-extrabold">{rule.series}</p>
          <p className="text-[15px] leading-relaxed text-ink-2">{rule.why}</p>
          {picks.length > 0 && (
            <ul className="flex flex-col gap-2.5">
              {picks.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={productHref(product.slug)}
                    className="flex items-center gap-3 rounded-2xl bg-surface-2 p-2.5 hover:shadow-[inset_0_0_0_1px_var(--ink-3)]"
                  >
                    <ProductStage as="span" className="size-16 shrink-0 rounded-xl">
                      {product.image ? (
                        <Image
                          src={product.image.url}
                          alt=""
                          width={product.image.width}
                          height={product.image.height}
                          unoptimized
                          className="relative h-auto max-h-[80%] w-auto max-w-[80%] object-contain"
                        />
                      ) : (
                        <StageFallback icon={cardIcon(product, index)} size="sm" />
                      )}
                    </ProductStage>
                    <span className="min-w-0">
                      <span className="block text-sm leading-snug font-extrabold text-ink">
                        {product.name}
                      </span>
                      {product.benefit && (
                        <span className="mt-0.5 line-clamp-2 block text-xs text-ink-2">
                          {product.benefit}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[13px] leading-normal text-ink-3">
            To podpowiedź, nie wyrok — ostateczny model dobierzemy po krótkiej rozmowie.
          </p>
        </div>
      )}
    </section>
  )
}
