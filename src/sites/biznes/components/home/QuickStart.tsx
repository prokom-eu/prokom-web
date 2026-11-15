import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getCatalogIndex, getFloorPlans } from '@/lib/catalog/data'
import { buildPlanScenes, PLAN_PATH } from '@/lib/catalog/floorPlan'
import { BRANDS_PATH, brandCount } from '@/lib/catalog/filters'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'

import { AskQuoteTile } from './AskQuoteTile'
import { QuickStartSearch } from './QuickStartSearch'

/** Colour of a card (board `Start.dc.html`): the four tones and navy for the inquiry. */
type CardTone = 'blue' | 'violet' | 'green' | 'red' | 'navy'

type Tile = {
  title: string
  text: string
  tag: string
  action: string
  icon: IconName
  tone: CardTone
  /** A link, or the inquiry drawer. */
  href: string | null
}

/**
 * Per tone: the soft icon tile, the label and action colour, the top bar and the arrow disc
 * (tokens `--tone-*`). The `--tone-*-tag` colours are made for white text and stay dark at
 * night: on the night card they give ~3.1–3.6:1, so there label and action take the ink colours
 * (AA) and the tone stays on the icon tile and the bar.
 */
const TONE: Record<CardTone, { icon: string; tag: string; bar: string; go: string }> = {
  blue: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-blue)_14%,transparent)] text-tone-blue-tag',
    tag: 'text-tone-blue-tag',
    bar: 'bg-tone-blue-tag',
    go: 'bg-[color-mix(in_srgb,var(--tone-blue)_14%,transparent)]',
  },
  violet: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-violet)_14%,transparent)] text-tone-violet-tag',
    tag: 'text-tone-violet-tag',
    bar: 'bg-tone-violet-tag',
    go: 'bg-[color-mix(in_srgb,var(--tone-violet)_14%,transparent)]',
  },
  green: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-green)_14%,transparent)] text-tone-green-tag',
    tag: 'text-tone-green-tag',
    bar: 'bg-tone-green-tag',
    go: 'bg-[color-mix(in_srgb,var(--tone-green)_14%,transparent)]',
  },
  red: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-red)_14%,transparent)] text-tone-red-tag',
    tag: 'text-tone-red-tag',
    bar: 'bg-tone-red-tag',
    go: 'bg-[color-mix(in_srgb,var(--tone-red)_14%,transparent)]',
  },
  navy: {
    icon: 'bg-surface-2 text-ink',
    tag: 'text-ink',
    bar: 'bg-ink',
    go: 'bg-surface-2',
  },
}
const DARK_TAG = '[[data-theme=dark]_&]:text-ink-2'
const DARK_ACTION = '[[data-theme=dark]_&]:text-ink'

// One bar of five columns on a desktop (rules between them); below 1080 px a row of cards to
// swipe, each ≈ 78 % wide so the next one peeks in (§5), equal heights.
const TILE =
  'group/qs relative flex h-full w-full flex-col gap-2 p-6 pb-5 text-left transition-colors duration-300 hover:bg-surface-2 max-[1079px]:rounded-3xl max-[1079px]:bg-card max-[1079px]:shadow-[inset_0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-text'

function TileBody({ tile }: { tile: Tile }) {
  const tone = TONE[tile.tone]
  return (
    <>
      {/* The bar grows along the top on hover (board `.sk .bar`); transform and opacity only. */}
      <span
        aria-hidden="true"
        className={cx(
          'absolute inset-x-6 top-0 h-[3px] origin-left scale-x-25 rounded-b-[3px] opacity-0 transition-[transform,opacity] duration-450 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/qs:scale-x-100 group-hover/qs:opacity-100 motion-reduce:transition-none',
          tone.bar,
        )}
      />
      <span
        aria-hidden="true"
        className={cx(
          'mb-1.5 flex size-12 items-center justify-center rounded-[14px] transition-transform duration-400 group-hover/qs:-translate-y-[3px] group-hover/qs:-rotate-4 motion-reduce:transition-none',
          tone.icon,
        )}
      >
        <Icon name={tile.icon} className="size-6" />
      </span>
      <em
        className={cx(
          'text-[11.5px] font-extrabold tracking-[0.14em] uppercase not-italic',
          tone.tag,
          DARK_TAG,
        )}
      >
        {tile.tag}
      </em>
      <b className="font-display text-[19px] leading-tight font-extrabold text-ink font-stretch-108%">
        {tile.title}
      </b>
      <small className="text-[15px] leading-normal text-ink-2 min-[1080px]:text-[13.5px]">
        {tile.text}
      </small>
      {/* Pinned to the bottom: a dashed rule and the action with its arrow disc. */}
      <span
        className={cx(
          'mt-auto flex items-center justify-between border-t border-dashed border-border pt-3.5 text-[14px] font-extrabold',
          tone.tag,
          DARK_ACTION,
        )}
      >
        {tile.action}
        <span
          aria-hidden="true"
          className={cx(
            'flex size-[30px] items-center justify-center rounded-full transition-transform duration-350 group-hover/qs:translate-x-1 motion-reduce:transition-none',
            tone.go,
          )}
        >
          <Icon name="arrow" strokeWidth={2.4} className="size-3.5" />
        </span>
      </span>
    </>
  )
}

/**
 * „Od czego zaczynasz” of the home page (runda 1411, board `Start.dc.html`; K36 §11 before):
 * a navy panel with the field that opens the site's search (Ctrl K) and five shortest ways in,
 * with the counts from the database. The `bzNeeds` block stays the anchor in the layout, its old
 * fields are no longer shown. Phone (§5): the panel with the field on top, the five cards in a
 * row to swipe under it.
 */
export async function QuickStart({
  tenantId,
  planOnPage,
}: {
  tenantId: number
  /** The page has the plan section (`bzPlan`): the tile scrolls to it, else opens `/plan-firmy`. */
  planOnPage: boolean
}) {
  const [index, plans] = await Promise.all([getCatalogIndex(tenantId), getFloorPlans(tenantId)])
  // Scenes the plan really shows (points of listed cards only, K31d′).
  const scenes = buildPlanScenes(
    plans.records,
    new Set(index.products.map((product) => product.slug)),
  ).length
  const planHrefHere = planOnPage ? '#plan' : PLAN_PATH
  const total = index.products.length
  const brands = brandCount(index)
  const tiles: Tile[] = [
    {
      title: 'Cała oferta',
      text: 'Kasy, komputery, programy, sieć i serwis, z filtrami po branży i marce.',
      tag: `${total} ${plural(total, ['pozycja', 'pozycje', 'pozycji'])}`,
      action: 'Przeglądaj ofertę',
      icon: 'grid',
      tone: 'blue',
      href: '/oferta',
    },
    {
      title: 'Konfigurator',
      text: 'Odpowiesz na kilka pytań o firmę i dostaniesz rozwiązania dobrane do niej.',
      tag: 'ok. 1 minuta',
      action: 'Dobierz teraz',
      icon: 'compass',
      tone: 'violet',
      href: CONFIGURATOR_PATH,
    },
    {
      title: 'Plan Twojej firmy',
      text: 'Kliknij urządzenie na planie sklepu, lokalu lub biura i zobacz, co tam pasuje.',
      tag: `${scenes} ${plural(scenes, ['rodzaj firmy', 'rodzaje firm', 'rodzajów firm'])}`,
      action: 'Otwórz plan',
      icon: 'map',
      tone: 'green',
      href: planHrefHere,
    },
    {
      title: 'Salony marek',
      text: 'Posnet, Elzab, Apple, Lenovo, Brother i inne: serie, porównania, dobór.',
      tag: `${brands} ${plural(brands, ['marka', 'marki', 'marek'])}`,
      action: 'Zobacz marki',
      icon: 'star',
      tone: 'red',
      href: BRANDS_PATH,
    },
    {
      title: 'Zapytaj o wycenę',
      text: 'Napisz, czego potrzebujesz. Dobierzemy, wycenimy i odeślemy mailem.',
      // Plan 0611 §7.1 pkt 9: no call-back promise here (hero, „Jak pracujemy”, the form).
      tag: 'Wycena na mailu',
      action: 'Wyślij zapytanie',
      icon: 'mail',
      tone: 'navy',
      href: null,
    },
  ]
  // A plan with no scenes has nothing to open.
  const shown = tiles.filter((tile) => tile.href !== planHrefHere || scenes > 0)

  return (
    <section aria-labelledby="szybki-start-h" className="pb-14 max-md:pb-6" data-quick-start>
      <Container wide>
        <div className="flex flex-col gap-3 min-[1080px]:grid min-[1080px]:grid-cols-[300px_minmax(0,1fr)] min-[1080px]:gap-0 min-[1080px]:overflow-hidden min-[1080px]:rounded-[26px] min-[1080px]:bg-card min-[1080px]:shadow-[0_34px_60px_-44px_var(--glow),inset_0_0_0_1px_var(--border)]">
          <div
            data-surface="dark"
            className="flex flex-col gap-3 rounded-3xl bg-surface-dark p-5 text-white min-[1080px]:rounded-none min-[1080px]:px-[26px] min-[1080px]:py-7"
          >
            <p className="text-[11.5px] font-extrabold tracking-[0.16em] text-accent-on-dark uppercase">
              Szybki start
            </p>
            <h2
              id="szybki-start-h"
              className="font-display text-[24px] leading-[1.05] min-[1080px]:text-[27px] font-extrabold tracking-[-0.02em] font-stretch-112%"
            >
              Od czego zaczynasz?
            </h2>
            <p className="text-[15px] leading-normal text-white/80 min-[1080px]:text-[13.5px]">
              Pięć najkrótszych dróg do tego, czego szukasz.
            </p>
            <div className="min-[1080px]:mt-auto">
              <QuickStartSearch />
            </div>
          </div>
          <ul
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] min-[1080px]:mx-0 min-[1080px]:grid min-[1080px]:grid-cols-5 min-[1080px]:gap-0 min-[1080px]:divide-x min-[1080px]:divide-border min-[1080px]:overflow-visible min-[1080px]:px-0 min-[1080px]:pb-0"
            aria-label="Od czego zaczynasz"
          >
            {shown.map((tile) => (
              <li
                key={tile.title}
                className="flex w-[78%] shrink-0 snap-start min-[640px]:w-[45%] min-[1080px]:w-auto"
              >
                {tile.href === null ? (
                  <AskQuoteTile className={TILE}>
                    <TileBody tile={tile} />
                  </AskQuoteTile>
                ) : (
                  <Link href={tile.href} className={TILE}>
                    <TileBody tile={tile} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
