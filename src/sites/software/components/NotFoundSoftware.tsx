import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSoftwareNotFound, getSolutionsIndex } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'

import { Breadcrumbs } from './Breadcrumbs'
import { SectionHead } from './home/SectionHead'
import { MenuSearch } from './MenuSearch'
import { softwareTextContext } from './textContext'

const CATALOG = '/rozwiazania'

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase('pl') + value.slice(1)
}

/**
 * 404 of the Software line — board `NieZnaleziono` (spec. §6.11): search over the solutions
 * index (§8.2) with the popular searches, the wizard card and 6 tiles from
 * `SoftwareSettings.notFound`. `null` without saved texts — `not-found.tsx` then shows the
 * generic page. The status stays 404: `notFound()` runs before streaming starts.
 */
export async function NotFoundSoftware({ tenantId }: { tenantId: number }) {
  const [texts, context, index] = await Promise.all([
    getSoftwareNotFound(tenantId),
    softwareTextContext(tenantId),
    getSolutionsIndex(tenantId),
  ])
  if (!texts) return null

  const fill = (value: string | undefined) => fillText(value, context)
  const lead = fill(texts.lead)
  const wizardText = fill(texts.wizard.text)
  const popular = index.search.popular.slice(0, 4)
  const tiles = texts.places.tiles.flatMap((tile) => {
    const note = fill(tile.note)
    return note ? [{ ...tile, note }] : []
  })

  return (
    <>
      <section className="relative overflow-x-clip pt-6 min-[641px]:pt-10">
        <Container wide>
          <Breadcrumbs current="Nie znaleziono" />
          <div className="mt-2 grid gap-8 min-[1081px]:grid-cols-[minmax(0,1fr)_400px] min-[1081px]:items-end min-[1081px]:gap-12">
            <div>
              <p
                aria-hidden="true"
                className="font-display text-[104px] font-black leading-[0.9] tracking-[-0.05em] text-grad-h1 min-[641px]:text-[176px]"
              >
                404
              </p>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[641px]:text-sm">
                Błąd 404 · strona nie istnieje
              </p>
              <h1 className="mt-3 font-display text-[36px] font-extrabold leading-[1.04] tracking-tight min-[641px]:text-[clamp(44px,5vw,64px)]">
                {texts.title}
                {texts.titleAccent ? (
                  <>
                    {' '}
                    <span className="text-grad-h1 min-[641px]:block">{texts.titleAccent}</span>
                  </>
                ) : null}
              </h1>
              {lead ? (
                <p className="mt-4 max-w-[56ch] text-lg text-ink-2 min-[641px]:text-xl">{lead}</p>
              ) : null}
              <MenuSearch
                placeholder={texts.search.label}
                button={texts.search.button}
                className="mt-6 max-w-[620px]"
              />
              {popular.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-ink-2">{texts.search.popularLabel}</span>
                  {popular.map((term) => (
                    <Link
                      key={term}
                      href={`${CATALOG}?q=${encodeURIComponent(term)}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-bold transition-transform active:scale-[0.98]"
                    >
                      {capitalize(term)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            {wizardText ? (
              <Link
                href={texts.wizard.href}
                className="flex flex-col gap-3 rounded-[26px] bg-(image:--grad-say-no) p-[22px] text-white shadow-raised transition-transform active:scale-[0.99] min-[641px]:p-7"
              >
                <span
                  aria-hidden="true"
                  className="grid size-14 place-items-center rounded-[16px] bg-white/16"
                >
                  <Icon name={texts.wizard.icon ?? 'flash'} className="size-6" />
                </span>
                <span className="font-display text-2xl font-extrabold">{texts.wizard.title}</span>
                <span className="text-white/90">{wizardText}</span>
                <span className="pt-1 font-extrabold">{texts.wizard.cta}</span>
              </Link>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="py-14 min-[641px]:py-20">
        <Container wide>
          <SectionHead eyebrow={texts.places.eyebrow} title={texts.places.title} lead={null} />
          <ul className="mt-6 grid gap-2.5 min-[761px]:grid-cols-2 min-[1081px]:grid-cols-3">
            {tiles.map((tile) => (
              <li key={`${tile.href}-${tile.title}`}>
                <Link
                  href={tile.href}
                  className="flex min-h-[76px] items-center gap-4 rounded-[20px] border border-border bg-card px-4 py-3 transition-transform active:scale-[0.99]"
                >
                  {tile.icon ? (
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-accent-soft text-accent-text"
                    >
                      <Icon name={tile.icon} className="size-5" />
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-extrabold">{tile.title}</span>
                    <span className="text-sm text-ink-2">{tile.note}</span>
                  </span>
                  <Icon name="arrow" strokeWidth={2.2} className="size-5 text-accent-text" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-3 rounded-[20px] bg-surface-2 p-[18px] min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between">
            <p className="text-ink-2">{texts.brokenLink.text}</p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href={texts.brokenLink.href}
                className="inline-flex min-h-12 items-center rounded-2xl border border-border bg-card px-5 font-extrabold"
              >
                {texts.brokenLink.cta}
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-5 font-extrabold"
              >
                <Icon name="home" className="size-5" />
                Strona główna
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
