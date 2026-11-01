import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getCatalogIndex, getFloorPlans } from '@/lib/catalog/data'
import { buildPlanScenes, PLAN_PATH } from '@/lib/catalog/floorPlan'
import { BRANDS_PATH, OWN_BRAND_SLUG } from '@/lib/catalog/filters'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'
import { getSiteSettings } from '@/lib/site/data'

import { AskQuoteTile } from './AskQuoteTile'
import { TONE_ICON, type Tone } from './tones'

type Tile = {
  title: string
  text: string
  tag: string
  action: string
  icon: IconName
  tone: Tone
  /** A link, or the inquiry drawer. */
  href: string | null
}

const TILE =
  'group/qs flex h-full w-full flex-col gap-3 rounded-3xl bg-card p-5 text-left shadow-[0_20px_50px_-30px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0'

function TileBody({ tile }: { tile: Tile }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cx(
          'flex size-11 items-center justify-center rounded-2xl bg-linear-to-br text-white',
          TONE_ICON[tile.tone],
        )}
      >
        <Icon name={tile.icon} className="size-5" />
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <em className="text-xs font-extrabold text-ink-2 not-italic">{tile.tag}</em>
        <b className="font-display text-lg leading-tight font-extrabold text-ink">{tile.title}</b>
        <small className="text-sm leading-snug text-ink-2">{tile.text}</small>
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-accent-text">
        {tile.action}
        <Icon name="arrow" strokeWidth={2.4} className="size-4" />
      </span>
    </>
  )
}

/**
 * „Szybki start” of the home page v150 (K36 §11, K4-FINAL §2): five shortest ways in, with
 * the counts from the database. Replaces the need tiles (`bzNeeds`) — the block stays the
 * anchor in the layout, its old fields are no longer shown.
 */
export async function QuickStart({
  tenantId,
  planOnPage,
}: {
  tenantId: number
  /** The page has the plan section (`bzPlan`): the tile scrolls to it, else opens `/plan-firmy`. */
  planOnPage: boolean
}) {
  const [index, settings, plans] = await Promise.all([
    getCatalogIndex(tenantId),
    getSiteSettings(tenantId),
    getFloorPlans(tenantId),
  ])
  // Scenes the plan really shows (points of listed cards only, K31d′).
  const scenes = buildPlanScenes(
    plans.records,
    new Set(index.products.map((product) => product.slug)),
  ).length
  const planHrefHere = planOnPage ? '#plan' : PLAN_PATH
  // A promise shows only once confirmed in the panel (`SiteSettings` → „Obietnice”).
  const callback = settings?.biznes?.promises.callbackTime?.trim()
  const total = index.products.length
  const brands = index.brands.filter((brand) => brand.slug !== OWN_BRAND_SLUG).length
  const tiles: Tile[] = [
    {
      title: 'Cała oferta',
      text: 'Kasy, komputery, programy, sieć i serwis — z filtrami po branży i marce.',
      tag: `${total} ${plural(total, ['pozycja', 'pozycje', 'pozycji'])}`,
      action: 'Przeglądaj ofertę',
      icon: 'grid',
      tone: 'blue',
      href: '/oferta',
    },
    {
      title: 'Konfigurator',
      text: 'Kilka pytań o Twoją firmę — dostajesz rozwiązania dobrane do niej.',
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
      text: 'Posnet, Elzab, Apple, Lenovo, Brother i inne — serie, porównania, dobór.',
      tag: `${brands} ${plural(brands, ['marka', 'marki', 'marek'])}`,
      action: 'Zobacz marki',
      icon: 'star',
      tone: 'blue',
      href: BRANDS_PATH,
    },
    {
      title: 'Zapytaj o wycenę',
      text: 'Napisz, czego potrzebujesz — wycenę i dobór dostaniesz na piśmie.',
      tag: callback ? `${callback} w godzinach pracy` : 'wycena na piśmie',
      action: 'Wyślij zapytanie',
      icon: 'chat',
      tone: 'green',
      href: null,
    },
  ]
  // A plan with no scenes has nothing to open.
  const shown = tiles.filter((tile) => tile.href !== planHrefHere || scenes > 0)

  return (
    <section aria-labelledby="szybki-start-h" className="pb-12">
      <Container wide>
        <div className="flex flex-col gap-1 pb-5">
          <p className="text-xs font-black tracking-[0.08em] text-accent-text uppercase">
            Szybki start
          </p>
          <h2 id="szybki-start-h" className="font-display text-2xl font-extrabold text-ink">
            Od czego zaczynasz?
          </h2>
          <p className="text-ink-2">Pięć najkrótszych dróg do tego, czego szukasz.</p>
        </div>
        {/* Phone: a row to swipe (K4-FINAL §7); wider: five columns. */}
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 min-[1080px]:mx-0 min-[1080px]:grid min-[1080px]:grid-cols-5 min-[1080px]:overflow-visible min-[1080px]:px-0">
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
      </Container>
    </section>
  )
}
