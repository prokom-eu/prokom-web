import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { getEnv } from '@/lib/env'
import { MOCKUP_KINDS, mockupVariants } from '@/lib/software/mockups'
import { Mockup } from '@/sites/software/components/mockups/Mockup'
import { Chip, ChipLabel } from '@/sites/software/components/ui/Chip'
import { Glass } from '@/sites/software/components/ui/Glass'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { requireTenant } from '../tenant'
import { DemoSegment } from './DemoSegment'

type Props = { params: Promise<{ domain: string }> }

export const metadata: Metadata = {
  title: 'Software v24 — podgląd fundamentu',
  robots: { index: false, follow: false },
}

/** Every mock-up of the preview: each kind with each variant (`care` has none). */
const ALL = MOCKUP_KINDS.flatMap((kind) => {
  const variants = mockupVariants(kind)
  return variants.length ? variants.map((variant) => ({ kind, variant })) : [{ kind, variant: '' }]
})

/**
 * `/_software` — the v24 „Aurora” foundation of Software (SWA1, PRZEKAZANIE-v24 §3.1): headings,
 * primitives and every mock-up in a few box widths, for comparing with `v24/boards/Vis.dc.html`
 * and for the e2e tests. Local and staging only (404 on production and on other lines), `noindex`,
 * not in the sitemap.
 */
export default async function SoftwarePreviewPage({ params }: Props) {
  const tenant = await requireTenant(params)
  if (getEnv().SITE_ENV === 'production' || tenant.line !== 'software') notFound()

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-24 px-4 py-16 min-[640px]:px-8">
      <section id="naglowki" className="flex flex-col gap-12" data-software-preview="headings">
        <SectionHead
          level="h1"
          eyebrow="Podgląd fundamentu v24"
          title="Software Aurora."
          em="Tokeny, ruch i makiety."
          lead="Strona robocza do porównania z planszami — nie ma jej na produkcji."
        />
        <SectionHead
          eyebrow="Nagłówek sekcji"
          title="Cztery rzeczy, które robimy."
          em="Każda działa od pierwszego dnia."
          lead="Eyebrow, H2 z wyróżnioną drugą częścią i lead — wzór ZMIANY-v24 §2."
        />
      </section>

      <section id="prymitywy" className="flex flex-col gap-8" data-software-preview="primitives">
        <SectionHead eyebrow="Prymitywy" title="Szkło, chipy, segment" em="i przyciski." />
        <ul className="grid gap-5 min-[960px]:grid-cols-3" data-rise-group>
          <Glass as="li" className="p-7">
            <p className="sw-eyebrow">Karta szkła</p>
            <p className="mt-3 text-ink-2">Półprzezroczyste tło na stronie, cienki obrys.</p>
          </Glass>
          <Glass as="li" featured className="p-7">
            <p className="sw-eyebrow">Wyróżniona</p>
            <p className="mt-3 text-ink-2">Fioletowa poświata — jedna karta w grupie.</p>
          </Glass>
          <Glass as="li" className="p-7" data-card="">
            <p className="sw-eyebrow">Z najechaniem</p>
            <p className="mt-3 text-ink-3">Uniesienie i obrys akcentu (mysz).</p>
          </Glass>
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <Chip pressed>Strony</Chip>
          <Chip pressed={false}>Systemy</Chip>
          <Chip pressed={false}>Automatyzacje</Chip>
          <ChipLabel>Etykieta</ChipLabel>
        </div>
        <div className="max-w-md">
          <DemoSegment />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="#makiety">Główny przycisk</Button>
          <Button href="#makiety" variant="secondary">
            Drugi przycisk
          </Button>
        </div>
      </section>

      <section id="makiety" className="flex flex-col gap-10" data-software-preview="mockups">
        <SectionHead
          eyebrow="Makiety"
          title="Każdy rodzaj,"
          em="każdy wariant."
          lead="Scena 640 × 420 skalowana do szerokości pudełka — bez JavaScriptu."
        />
        <div className="grid gap-8 min-[960px]:grid-cols-2">
          <figure className="flex flex-col gap-3">
            <Mockup kind="site" variant="firmowa" phone toast />
            <figcaption className="text-sm text-ink-2">
              site · firmowa + telefon i powiadomienie
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-3">
            <Mockup kind="before" cut={50} />
            <figcaption className="text-sm text-ink-2">before · suwak zatrzymany na 50%</figcaption>
          </figure>
        </div>
        <ul className="grid gap-8 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-3">
          {ALL.map(({ kind, variant }) => (
            <li key={`${kind}-${variant}`} className="flex flex-col gap-3" data-mockup-case="">
              <Mockup kind={kind} variant={variant || null} />
              <span className="text-sm text-ink-2">
                {kind}
                {variant ? ` · ${variant}` : ''}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-end gap-6">
          {[240, 340, 640].map((width) => (
            <figure key={width} style={{ width }} className="flex max-w-full flex-col gap-2">
              <Mockup kind="dash" variant="zamowienia" />
              <figcaption className="text-sm text-ink-2">{width} px</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
