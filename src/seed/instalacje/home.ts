import type { Payload } from 'payload'

import Main from '../../../seed/prokominstalacje/strony-zrzut/Main.json'
import { HOME_SLUG } from '../../lib/pages/slug'
import type { Page } from '../../payload-types'
import { SEED_CONTEXT } from '../config'
import { mergeLayout } from '../layout'

type Block = NonNullable<Page['layout']>[number]
type InstHome = Extract<Block, { blockType: 'instHome' }>

const NBSP = ' '

/** The hero's texts (INST-6 PR2, runda v6 §2: the H1 says the service and the region). */
export const HOME_HERO_TEXTS = {
  eyebrow: 'Rabka-Zdrój · Podhale i Małopolska',
  kicker: `Projekt, montaż i${NBSP}serwis w${NBSP}jednej firmie`,
  h1a: `Monitoring, alarmy, Wi-Fi i${NBSP}smart home`,
  h1b: `na${NBSP}Podhalu`,
  lead:
    `Instalujemy w${NBSP}domach, pensjonatach, hotelach i${NBSP}firmach na Podhalu ` +
    `i${NBSP}w${NBSP}Małopolsce. Wybierz obiekt obok i${NBSP}zobacz, co robi każda instalacja.`,
}

/**
 * The home page block (`zrodlo/pages/Main.body.html`, `#start` — the package's `Main.json` has
 * no hero texts, ADR-I002 §5), texts of INST-6. Non-breaking spaces after one-letter words.
 */
export function instalacjeHomeBlock(): InstHome {
  return {
    blockType: 'instHome',
    hero: {
      ...HOME_HERO_TEXTS,
      trust: [
        { icon: 'check', text: 'Na Podhalu od 2004 r.' },
        { icon: 'pin', text: 'Salon w Rabce-Zdroju' },
        { icon: 'doc', text: 'Wycena na piśmie' },
      ],
    },
  }
}

/**
 * SEO of the home page, written here (P3-23: the package's title had 66 characters; INST-6: the
 * description 140–155). The full title — the layout's title template applies to subpages only,
 * so the start page carries the line name itself.
 */
export const HOME_SEO = {
  title: 'Monitoring, alarmy i Wi-Fi Rabka-Zdrój | PRO-KOM Instalacje',
  description:
    'Monitoring, alarmy, Wi-Fi i smart home Ampio dla domów, pensjonatów i firm na Podhalu. ' +
    'Projekt, montaż z 24-miesięczną gwarancją i serwis z Rabki-Zdroju.',
}

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
  // SEO when the page has none, or still the package's former title (P3-23: 66 characters).
  const former = home.seo?.title === Main._title
  const seo = home.seo?.title?.trim() && !former ? null : HOME_SEO
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
