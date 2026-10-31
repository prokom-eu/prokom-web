import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IndustryPageView } from '@/lib/software/industryPage'

type Page = { page: IndustryPageView }

const eyebrowClass = 'text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text'

/**
 * Hero of an industry page (board `Branza`): breadcrumbs, eyebrow, H1 with its accent, lead,
 * „Złóż system…” (the wizard with the kind of firm) and „Zobacz, co boli…”; on the right the
 * modules around the firm (positions from the panel, floating; still with reduced motion). On a
 * phone the modules are a 2-column grid under the hub card (spec. §6.2).
 */
export function IndustryHero({ page }: Page) {
  return (
    <section aria-labelledby="branza-h" className="overflow-x-clip pt-6 min-[641px]:pt-10">
      <Container wide>
        <nav aria-label="Okruszki" className="text-sm text-ink-2">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center px-1 hover:text-ink">
                Strona główna
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="inline-flex min-h-11 items-center px-1">Branże</li>
            <li aria-hidden="true" className="max-[640px]:hidden">
              ›
            </li>
            <li className="max-[640px]:hidden">
              <span aria-current="page" className="inline-flex min-h-11 items-center px-1">
                {page.name}
              </span>
            </li>
          </ol>
        </nav>
        <div className="mt-3 grid gap-8 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[1081px]:items-center">
          <div>
            <p className={eyebrowClass}>{page.eyebrow}</p>
            <h1
              id="branza-h"
              className="mt-3 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-6xl min-[1081px]:text-[64px]"
            >
              {page.title.plain}
              {page.title.accent && (
                <>
                  {' '}
                  <span className="text-grad-h1">{page.title.accent}</span>
                </>
              )}
            </h1>
            {page.lead && (
              <p className="mt-5 max-w-[56ch] text-lg text-ink-2 min-[641px]:text-xl">
                {page.lead}
              </p>
            )}
            <div className="mt-7 flex flex-col gap-2.5 min-[641px]:flex-row">
              <Link
                href={page.wizard.href}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-button px-6 font-extrabold text-accent-ink shadow-raised active:scale-[0.98] motion-reduce:transition-none"
              >
                {page.wizard.label}
              </Link>
              <a
                href="#problemy"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-border bg-card px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
              >
                Zobacz, co boli i co na to mamy
              </a>
            </div>
          </div>
          <ModuleMap page={page} />
        </div>
      </Container>
    </section>
  )
}

function ModuleMap({ page }: Page) {
  if (page.modules.length === 0) return null
  const hub = page.hub && (
    <div className="flex flex-col items-center justify-center text-center">
      <b className="font-display text-2xl font-extrabold">{page.hub.title}</b>
      {page.hub.caption && <span className="text-sm text-ink-2">{page.hub.caption}</span>}
    </div>
  )
  return (
    <div>
      <h2 className="sr-only">Moduły jednego systemu</h2>
      {/* Desktop: the modules float around the hub at their panel positions. */}
      <div className="relative hidden aspect-[1.25] bg-dots min-[1081px]:block">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 aspect-square w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft p-[9%] shadow-[0_0_0_28px_var(--stage)]"
        >
          <div className="flex size-full items-center justify-center rounded-full border-2 border-accent bg-card">
            {hub}
          </div>
        </div>
        <ul>
          {page.modules.map((module, i) => (
            <li
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 motion-safe:animate-float"
              style={{
                left: `${module.x}%`,
                top: `${module.y}%`,
                animationDelay: `${module.delay}s`,
              }}
            >
              <span className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-2xl border border-accent-line bg-card px-3.5 text-sm font-extrabold shadow-raised">
                {module.icon && (
                  <Icon name={module.icon} className="size-[18px] text-accent-text" />
                )}
                {module.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Phone and tablet: the hub card on top, the modules in two columns. */}
      <div className="min-[1081px]:hidden">
        {hub && (
          <div className="rounded-2xl border border-accent-line bg-accent-soft p-4">{hub}</div>
        )}
        <ul className="mt-2.5 grid grid-cols-2 gap-2">
          {page.modules.map((module, i) => (
            <li
              key={i}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-extrabold"
            >
              {module.icon && (
                <Icon name={module.icon} className="size-[18px] shrink-0 text-accent-text" />
              )}
              {module.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Dark box „Działa bez zasięgu” with its three steps (board `Branza`). */
export function OfflineBox({ page }: Page) {
  const box = page.offline
  if (!box) return null
  return (
    <section aria-labelledby="bez-zasiegu-h" className="py-8 min-[641px]:py-12">
      <Container wide>
        <div className="rounded-[28px] bg-surface-dark p-6 text-white min-[641px]:p-12">
          <div className="grid gap-6 min-[1081px]:grid-cols-[minmax(0,1fr)_auto] min-[1081px]:items-end">
            <div>
              {box.eyebrow && (
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-on-dark">
                  {box.eyebrow}
                </p>
              )}
              <h2
                id="bez-zasiegu-h"
                className="mt-3 max-w-[20ch] font-display text-[32px] font-extrabold leading-[1.05] min-[641px]:text-5xl"
              >
                {box.title}
                {box.accent && (
                  <>
                    {' '}
                    <span className="text-accent-on-dark">{box.accent}</span>
                  </>
                )}
              </h2>
              {box.lead && <p className="mt-4 max-w-[56ch] text-lg text-white/80">{box.lead}</p>}
            </div>
            {box.note && (
              <p className="rounded-2xl border border-white/15 bg-white/5 p-4">
                {box.note.label && (
                  <span className="block text-sm text-white/75">{box.note.label}</span>
                )}
                <b className="mt-1 block font-display text-2xl font-extrabold">{box.note.value}</b>
                {box.note.caption && (
                  <span className="mt-1 block text-sm text-white/75">{box.note.caption}</span>
                )}
              </p>
            )}
          </div>
          {box.steps.length > 0 && (
            <ol
              // Scrolled sideways on a phone: focusable so the keyboard can scroll it (axe).
              tabIndex={0}
              aria-label="Jak działa bez zasięgu"
              className="-mx-6 mt-8 flex snap-x gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:grid-cols-3 min-[641px]:overflow-visible min-[641px]:px-0"
            >
              {box.steps.map((step, i) => (
                <li
                  key={step.title}
                  className="w-[82%] shrink-0 snap-start rounded-2xl border border-white/15 bg-white/5 p-5 min-[641px]:w-auto"
                >
                  <span className="font-display text-2xl font-extrabold text-accent-on-dark">
                    {i + 1}
                  </span>
                  <b className="mt-2 block font-extrabold">{step.title}</b>
                  {step.text && <p className="mt-2 text-sm text-white/80">{step.text}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </Container>
    </section>
  )
}

type ContactProps = Page & {
  phone: { label: string; href: string; caption: string | null } | null
}

/**
 * Dark contact block at the end of the industry page (board `Branza`): free quote, the wizard
 * with the kind of firm, the line's phone. `data-final-cta` — the footer drops its CTA band.
 */
export function IndustryContact({ page, phone }: ContactProps) {
  const { contact } = page
  return (
    <section
      id="kontakt"
      aria-labelledby="kontakt-tytul"
      data-final-cta
      className="py-12 min-[641px]:py-16"
    >
      <Container wide>
        <div className="grid gap-8 rounded-[28px] bg-surface-dark p-6 text-white shadow-raised min-[641px]:p-12 min-[1081px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] min-[1081px]:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-on-dark">
              {contact.eyebrow}
            </p>
            <h2
              id="kontakt-tytul"
              className="mt-3 font-display text-[32px] font-extrabold leading-[1.05] min-[641px]:text-5xl"
            >
              {contact.title}
            </h2>
            {contact.lead && <p className="mt-4 text-lg text-white/80">{contact.lead}</p>}
            {contact.points.length > 0 && (
              <ul className="mt-5 space-y-2">
                {contact.points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-white/85">
                    <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/kontakt"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-button px-6 font-extrabold text-accent-ink shadow-raised active:scale-[0.98] motion-reduce:transition-none"
            >
              Bezpłatna wycena →
            </Link>
            <Link
              href={page.wizard.href}
              className={cx(
                'inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none',
              )}
            >
              Dobierz w 60 sekund
            </Link>
            {phone && (
              <div className="mt-2 border-t border-white/15 pt-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-on-dark">
                  Telefon
                </p>
                <a
                  href={phone.href}
                  className="mt-1 inline-flex min-h-11 items-center font-display text-2xl font-extrabold"
                >
                  {phone.label}
                </a>
                {phone.caption && <p className="text-sm text-white/75">{phone.caption}</p>}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
