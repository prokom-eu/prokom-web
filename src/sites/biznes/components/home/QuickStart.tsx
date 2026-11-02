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
import { getSiteSettings } from '@/lib/site/data'

import { AskQuoteTile } from './AskQuoteTile'
import type { Tone } from './tones'

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

// One bar of five columns (board `Web-start`, prompt 2 W2): no card per tile, thin rules
// between them; on a phone a row of cards to swipe (K4-FINAL §7).
const TILE =
  'group/qs flex h-full w-full flex-col gap-2.5 p-5 text-left transition-colors hover:bg-surface-2 max-[1079px]:rounded-3xl max-[1079px]:bg-card max-[1079px]:shadow-[inset_0_0_0_1px_var(--border)] min-[1080px]:px-5 min-[1080px]:py-6'

/** Soft tile of the icon and the colour of the label, per tone (tokens `--tone-*`). */
const TONE: Record<Tone, { icon: string; tag: string }> = {
  blue: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-blue)_14%,transparent)] text-tone-blue-tag',
    tag: 'text-tone-blue-tag',
  },
  violet: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-violet)_14%,transparent)] text-tone-violet-tag',
    tag: 'text-tone-violet-tag',
  },
  green: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-green)_14%,transparent)] text-tone-green-tag',
    tag: 'text-tone-green-tag',
  },
  red: {
    icon: 'bg-[color-mix(in_srgb,var(--tone-red)_14%,transparent)] text-tone-red-tag',
    tag: 'text-tone-red-tag',
  },
}

// The `--tone-*-tag` colours are made for white text on them and stay dark at night: on the
// night card (`--card`) they give ~3.1–3.6:1. There the label and action take the ink colours
// (AA); the tone stays on the icon tile.
const DARK_TAG = '[[data-theme=dark]_&]:text-ink-2'
const DARK_ACTION = '[[data-theme=dark]_&]:text-ink'

function TileBody({ tile }: { tile: Tile }) {
  const tone = TONE[tile.tone]
  return (
    <>
      <span
        aria-hidden="true"
        className={cx('flex size-10 items-center justify-center rounded-xl', tone.icon)}
      >
        <Icon name={tile.icon} className="size-5" />
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <em
          className={cx(
            'text-[11.5px] font-extrabold tracking-[0.08em] uppercase not-italic',
            tone.tag,
            DARK_TAG,
          )}
        >
          {tile.tag}
        </em>
        <b className="text-[17px] leading-tight font-extrabold text-ink">{tile.title}</b>
        <small className="text-[13.5px] leading-snug text-ink-2">{tile.text}</small>
      </span>
      <span
        className={cx(
          'inline-flex items-center gap-2 text-sm font-extrabold',
          tone.tag,
          DARK_ACTION,
        )}
      >
        {tile.action}
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_currentColor] transition-transform group-hover/qs:translate-x-0.5 motion-reduce:transition-none"
        >
          <Icon name="arrow" strokeWidth={2.4} className="size-3.5" />
        </span>
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
      text: 'Napisz, czego potrzebujesz. Dobierzemy i wycenimy.',
      // K4-FINAL §1 (audit 01.11): the confirmed 60 minutes, or the panel's own wording.
      tag: callback ? `${callback} w godzinach pracy` : 'oddzwaniamy w ciągu 60 minut',
      action: 'Wyślij zapytanie',
      icon: 'chat',
      tone: 'green',
      href: null,
    },
  ]
  // A plan with no scenes has nothing to open.
  const shown = tiles.filter((tile) => tile.href !== planHrefHere || scenes > 0)

  return (
    <section aria-labelledby="szybki-start-h" className="pb-14">
      <Container wide>
        <div className="flex flex-col overflow-hidden min-[1080px]:flex-row min-[1080px]:rounded-[26px] min-[1080px]:bg-card min-[1080px]:shadow-[0_30px_60px_-36px_var(--glow),inset_0_0_0_1px_var(--border)]">
          <div
            data-surface="dark"
            className="flex flex-col gap-2 rounded-3xl bg-surface-dark p-5 text-white max-[1079px]:mb-3 min-[1080px]:w-[180px] min-[1080px]:shrink-0 min-[1080px]:justify-center min-[1080px]:rounded-none min-[1080px]:px-6"
          >
            <p className="text-[11.5px] font-extrabold tracking-[0.14em] text-white/75 uppercase">
              Szybki start
            </p>
            <h2
              id="szybki-start-h"
              className="font-display text-[19px] leading-tight font-extrabold font-stretch-112%"
            >
              Od czego zaczynasz?
            </h2>
            <p className="text-[13.5px] leading-snug text-white/75">
              Pięć najkrótszych dróg do tego, czego szukasz.
            </p>
          </div>
          {/* Phone: a row to swipe; wider: five columns with rules between them. */}
          <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 min-[1080px]:mx-0 min-[1080px]:grid min-[1080px]:flex-1 min-[1080px]:grid-cols-5 min-[1080px]:gap-0 min-[1080px]:divide-x min-[1080px]:divide-border min-[1080px]:overflow-visible min-[1080px]:px-0 min-[1080px]:pb-0">
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
