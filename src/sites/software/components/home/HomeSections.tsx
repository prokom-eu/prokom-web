import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import {
  getHomeAreas,
  getOfferViews,
  getSoftwareHome,
  getSolutionsIndex,
} from '@/lib/software/data'
import { compareView } from '@/lib/software/compare'
import { fillText } from '@/lib/software/facts'
import { howWeBuildView, technologiesView } from '@/lib/software/howWeBuild'
import { offerViewsFor } from '@/lib/software/offer'
import { popularCards, popularTabs } from '@/lib/software/popular'
import { livePreviews } from '@/lib/software/previews'
import { processQuote, processStages } from '@/lib/software/process'
import { whyNotWordpressView } from '@/lib/software/whyNotWordpress'
import { Wizard } from '@/sites/software/components/wizard/Wizard'
import { loadWizardProps } from '@/sites/software/components/wizard/wizardProps'

import { Compare } from '../about/Compare'
import { softwareTextContext } from '../textContext'

import { AreasExplorer } from './AreasExplorer'
import { Guarantees } from './Guarantees'
import { HowWeBuild } from './HowWeBuild'
import { LivePreviewPanel } from './LivePreviews'
import { LivePreviewTabs } from './LivePreviewTabs'
import { ProcessExplorer } from './ProcessExplorer'
import { ProcessPanel } from './ProcessVisuals'
import { PopularExplorer } from './PopularExplorer'
import { SectionHead } from './SectionHead'
import { Technologies } from './Technologies'
import { WhyNotWordpress } from './WhyNotWordpress'

/**
 * The fixed sections of the Software start page built in SW5, SW6, SW8a, SW8b and SWR5 (spec. §4) —
 * server parts; each reads its texts from `SoftwareSettings.home` and its lists from the
 * collections of this tenant, and is skipped while they are missing (a section without a heading
 * is worse than none). Anchors: `#oferta`, `#popularne`, `#podglady`, `#proces`, `#dobierz`,
 * `#bez-wordpressa`, `#zasady`, `#realizacje`, `#jak-robimy`, `#technologie` (header links, rail).
 */

export async function AreasSection({ tenantId }: { tenantId: number }) {
  const [home, areas] = await Promise.all([getSoftwareHome(tenantId), getHomeAreas(tenantId)])
  const texts = home?.sections?.areas
  if (!texts || areas.length === 0) return null
  return (
    <section id="oferta" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide>
        <div className="rounded-[32px] border border-border bg-card px-4 py-7 shadow-raised min-[640px]:p-10 min-[1081px]:p-[52px]">
          <SectionHead eyebrow={texts.eyebrow} title={texts.title} lead={texts.lead} />
          <div className="mt-7 min-[640px]:mt-9">
            <AreasExplorer
              areas={areas}
              priceCaption={texts.priceCaption}
              wizardButton={texts.wizardButton}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}

export async function PopularSection({ tenantId }: { tenantId: number }) {
  const [home, index, offers, context] = await Promise.all([
    getSoftwareHome(tenantId),
    getSolutionsIndex(tenantId),
    getOfferViews(tenantId),
    softwareTextContext(tenantId),
  ])
  const texts = home?.sections?.popular
  if (!home || !texts) return null
  const cards = popularCards(home.popular.order, index.solutions)
  if (cards.length === 0) return null
  // Only the windows the 12 cards (and their „Dobrze łączy się z”) can open.
  const views = offerViewsFor(
    offers,
    cards.map((card) => card.slug),
  )
  const after = texts.after.items.flatMap((item) => {
    const text = fillText(item.text, context)
    return text ? [{ ...item, text }] : []
  })
  const [buttonLabel, buttonHref] = texts.after.button

  return (
    <section id="popularne" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide className="flex flex-col gap-6">
        <SectionHead eyebrow={texts.eyebrow} title={texts.title} lead={texts.lead} aside />
        <PopularExplorer
          cards={cards}
          tabs={popularTabs(home.popular.tabs, cards)}
          display={index.priceDisplay}
          offers={views}
          count={texts.count}
          hint={texts.hint}
        />
        <div className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-4 min-[640px]:p-5 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
          <div className="flex flex-col gap-3 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:gap-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2">
              {texts.after.title}
            </p>
            <ul className="grid gap-2 min-[640px]:grid-cols-3 min-[640px]:gap-4">
              {after.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="group flex min-h-11 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">
                      <Icon name={item.icon} className="size-[18px]" />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <b className="text-sm group-hover:underline">{item.title}</b>
                      <small className="text-xs text-ink-2">{item.text}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={buttonHref}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-button px-5 text-sm font-extrabold text-accent-ink"
          >
            {buttonLabel}
          </Link>
        </div>
      </Container>
    </section>
  )
}

export async function WizardSection({ tenantId }: { tenantId: number }) {
  const props = await loadWizardProps(tenantId)
  if (!props) return null
  return (
    <section id="dobierz" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide>
        <Wizard {...props} headingLevel="h2" />
      </Container>
    </section>
  )
}

export async function LivePreviewsSection({ tenantId }: { tenantId: number }) {
  const [home, context] = await Promise.all([
    getSoftwareHome(tenantId),
    softwareTextContext(tenantId),
  ])
  const texts = home?.sections?.livePreviews
  if (!home || !texts) return null
  const previews = livePreviews(home.livePreviews, (text) => fillText(text, context))
  if (previews.length === 0) return null
  return (
    <section id="podglady" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide className="flex flex-col gap-6">
        <SectionHead eyebrow={texts.eyebrow} title={texts.title} lead={texts.lead} aside />
        <LivePreviewTabs
          tabs={previews.map(({ label, icon }) => ({ label, icon }))}
          hint={texts.hint}
          panels={previews.map((preview) => (
            <LivePreviewPanel key={preview.kind} preview={preview} texts={texts} />
          ))}
        />
      </Container>
    </section>
  )
}

export async function ProcessSection({ tenantId }: { tenantId: number }) {
  const [home, context] = await Promise.all([
    getSoftwareHome(tenantId),
    softwareTextContext(tenantId),
  ])
  const texts = home?.sections?.process
  if (!home || !texts) return null
  const fill = (text: string) => fillText(text, context)
  const stages = processStages(home.process, fill)
  const quote = processQuote(home.proceduralMock, fill)
  if (stages.length === 0) return null
  return (
    <section id="proces" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide className="flex flex-col gap-6 min-[640px]:gap-8">
        <SectionHead eyebrow={texts.eyebrow} title={texts.title} lead={texts.lead} aside />
        <ProcessExplorer
          stages={stages.map(({ num, name, duration }) => ({ num, name, duration }))}
          panels={stages.map((stage) => (
            <ProcessPanel key={stage.num} stage={stage} texts={texts} quote={quote} />
          ))}
        />
      </Container>
    </section>
  )
}

export async function WhyNotWordpressSection({ tenantId }: { tenantId: number }) {
  const [home, context] = await Promise.all([
    getSoftwareHome(tenantId),
    softwareTextContext(tenantId),
  ])
  if (!home) return null
  // `{cena:<slug>}` of the rebuild button: the context carries this tenant's „od” prices.
  const view = whyNotWordpressView(home.whyNotWordpress, (text) => fillText(text, context))
  return view ? <WhyNotWordpress view={view} /> : null
}

export async function GuaranteesSection({ tenantId }: { tenantId: number }) {
  const [home, context] = await Promise.all([
    getSoftwareHome(tenantId),
    softwareTextContext(tenantId),
  ])
  const texts = home?.sections?.guarantees
  if (!home || !texts) return null
  const cards = home.guarantees.flatMap((card) => {
    const title = fillText(card.title, context)
    const text = fillText(card.text, context)
    return title && text ? [{ title, text, icon: card.icon }] : []
  })
  if (cards.length === 0) return null
  return <Guarantees texts={texts} cards={cards} />
}

export async function HowWeBuildSection({ tenantId }: { tenantId: number }) {
  const [home, context] = await Promise.all([
    getSoftwareHome(tenantId),
    softwareTextContext(tenantId),
  ])
  const texts = home?.sections?.howWeBuild
  if (!texts) return null
  const view = howWeBuildView(texts, (text) => fillText(text, context))
  return view ? <HowWeBuild view={view} /> : null
}

export async function TechnologiesSection({ tenantId }: { tenantId: number }) {
  const [home, context] = await Promise.all([
    getSoftwareHome(tenantId),
    softwareTextContext(tenantId),
  ])
  const texts = home?.sections?.technologies
  if (!home || !texts) return null
  const view = technologiesView(texts, home.technologies, (text) => fillText(text, context))
  return view ? <Technologies view={view} /> : null
}

/** SW11b — „Freelancer, agencja czy PRO-KOM?” on `/o-firmie` (spec. §6.6, stany/70). */
export async function CompareSection({ tenantId }: { tenantId: number }) {
  const home = await getSoftwareHome(tenantId)
  const texts = home?.sections?.compare
  const view = home && texts ? compareView(home.compare) : null
  if (!texts || !view) return null
  return <Compare view={view} eyebrow={texts.eyebrow} title={texts.title} tabs={texts.tabs} />
}
