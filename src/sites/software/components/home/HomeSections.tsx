import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getEnv } from '@/lib/env'
import {
  getHomeAreas,
  getSoftwareFacts,
  getSoftwareHome,
  getSolutionsIndex,
} from '@/lib/software/data'
import { fillText, type TextContext } from '@/lib/software/facts'
import { popularCards, popularTabs } from '@/lib/software/popular'
import { livePreviews } from '@/lib/software/previews'
import { processQuote, processStages } from '@/lib/software/process'
import { Wizard } from '@/sites/software/components/wizard/Wizard'
import { loadWizardProps } from '@/sites/software/components/wizard/wizardProps'

import { AreasExplorer } from './AreasExplorer'
import { LivePreviewPanel } from './LivePreviews'
import { LivePreviewTabs } from './LivePreviewTabs'
import { ProcessExplorer } from './ProcessExplorer'
import { ProcessPanel } from './ProcessVisuals'
import { PopularExplorer } from './PopularExplorer'
import { SectionHead } from './SectionHead'

/**
 * The fixed sections of the Software start page built in SW5 and SW6 (spec. §4 pkt 3–7) — server
 * parts; each reads its texts from `SoftwareSettings.home` and its lists from the collections
 * of this tenant, and is skipped while they are missing (a section without a heading is worse
 * than none). Anchors: `#oferta`, `#popularne`, `#podglady`, `#proces`, `#dobierz` (header
 * links, section rail).
 */

async function textContext(tenantId: number): Promise<TextContext> {
  return {
    tenantId,
    facts: await getSoftwareFacts(tenantId),
    prices: {},
    strict: getEnv().SITE_ENV === 'production',
  }
}

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
  const [home, index, context] = await Promise.all([
    getSoftwareHome(tenantId),
    getSolutionsIndex(tenantId),
    textContext(tenantId),
  ])
  const texts = home?.sections?.popular
  if (!home || !texts) return null
  const cards = popularCards(home.popular.order, index.solutions)
  if (cards.length === 0) return null
  const situationNames = Object.fromEntries(index.situations.map(({ slug, name }) => [slug, name]))
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
          situationNames={situationNames}
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
  const [home, context] = await Promise.all([getSoftwareHome(tenantId), textContext(tenantId)])
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
  const [home, context] = await Promise.all([getSoftwareHome(tenantId), textContext(tenantId)])
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
