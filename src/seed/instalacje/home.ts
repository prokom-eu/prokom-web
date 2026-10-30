import type { Payload } from 'payload'

import Main from '../../../seed/prokominstalacje/strony-zrzut/Main.json'
import { HOME_SLUG } from '../../lib/pages/slug'
import type { Page } from '../../payload-types'
import { SEED_CONTEXT } from '../config'
import { mergeLayout } from '../layout'

type Block = NonNullable<Page['layout']>[number]
type InstHome = Extract<Block, { blockType: 'instHome' }>

const NBSP = ' '

/**
 * The home page block with the hero texts of the prototype (`zrodlo/pages/Main.body.html`,
 * `#start` — the package's `Main.json` has no hero texts, ADR-I002 §5). Non-breaking spaces
 * as in the prototype.
 */
export function instalacjeHomeBlock(): InstHome {
  return {
    blockType: 'instHome',
    hero: {
      eyebrow: 'Rabka-Zdrój · Zakopane · Podhale i Małopolska',
      kicker: `Monitoring, alarmy, Wi-Fi i${NBSP}smart home na Podhalu`,
      h1a: 'Twój obiekt',
      h1b: `na${NBSP}żywo.`,
      lead:
        `Kamery, alarm, sieć, zamki, ładowarka, nagłośnienie i${NBSP}sterowanie budynkiem. ` +
        `Projektujemy wszystko razem, montujemy i${NBSP}serwisujemy jako jedna firma ` +
        `z${NBSP}Rabki i${NBSP}Zakopanego. Wybierz obiekt obok i${NBSP}zobacz, co robi każda instalacja.`,
      trust: [
        { icon: 'check', text: 'Na Podhalu od 2004 r.' },
        { icon: 'pin', text: 'Salony w Rabce i Zakopanem' },
        { icon: 'doc', text: 'Wycena na piśmie' },
      ],
    },
  }
}

/**
 * SEO of the home page from the package. The full title: the layout's title template applies
 * to subpages only, so the start page carries the line name itself.
 */
export const HOME_SEO = { title: Main._title, description: Main._description }

/** The layout after seeding: the sample page is replaced, a missing `instHome` inserted. */
export function mergeInstalacjeHome(
  existing: readonly Block[] | null | undefined,
  seed: readonly Block[],
): Block[] | null {
  return mergeLayout(existing, seed, { own: (block) => block.blockType.startsWith('inst') })
}

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void
const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

/**
 * Creates the published home page of the tenant, or gives the existing one (the sample page of
 * `pnpm seed`, or one an editor laid out) the blocks it lacks and the SEO when it has none.
 * Blocks and SEO edited in the panel are kept.
 */
export async function seedInstalacjeHome(payload: Payload, tenantId: number, count: Count) {
  const seed = [instalacjeHomeBlock()]
  const {
    docs: [home],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: HOME_SLUG } }] },
    limit: 1,
    draft: true,
    ...local,
  })
  if (!home) {
    await payload.create({
      collection: 'pages',
      data: {
        tenant: tenantId,
        title: 'Strona główna',
        slug: HOME_SLUG,
        seo: HOME_SEO,
        layout: seed,
        _status: 'published',
      },
      ...local,
    })
    count('home', 'created')
    return
  }
  const layout = mergeInstalacjeHome(home.layout, seed)
  const seo = home.seo?.title?.trim() ? null : HOME_SEO
  if (!layout && !seo) {
    count('home', 'skipped')
    return
  }
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { ...(layout ? { layout } : {}), ...(seo ? { seo } : {}), _status: 'published' },
    ...local,
  })
  count('home', 'updated')
}
