import type { CSSProperties } from 'react'

import { LineLogo } from '@/components/shared/LineLogo'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { BzLinesBlock as BzLinesBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

type Props = { block: BzLinesBlockData; tenantId: number }

/**
 * „Inne linie PRO-KOM” (runda 1411, board `Koniec.dc.html`): three tiles — Instalacje, Software,
 * Tech — on a light panel; white tiles with the line's logo, its colour only in a corner glow, the
 * arrow and the dot of the address (15.11, „ładniej, na wyższym poziomie”), a short text of
 * our own and the line's address; each tile links to the line's site in the same tab. A line not
 * published in the panel (or without an address) has no tile. Phone (§5): the tiles one under
 * another.
 */
export async function BzLinesBlock({ block, tenantId }: Props) {
  const shared = await getSharedData(tenantId)
  const lines = shared?.lines ?? []
  const tiles = (block.lines ?? []).flatMap((tile) => {
    const line = lines.find((item) => item.key === tile.line)
    return line?.url ? [{ ...tile, line }] : []
  })
  if (tiles.length === 0) return null
  return (
    <section
      id="linie"
      aria-labelledby="linie-h"
      className="scroll-mt-24 py-12 max-md:py-7"
      data-lines-section
    >
      <Container wide>
        <div className="rounded-[32px] border border-border bg-surface-2 p-10 max-md:rounded-[24px] max-md:p-5">
          <SectionHead
            id="linie-h"
            eyebrow={block.eyebrow}
            heading={block.heading}
            lead={block.note}
          />
          <ul className="mt-8 grid gap-4 min-[900px]:grid-cols-3 max-md:mt-6" data-lines>
            {tiles.map(({ id, title, text, line }) => (
              <li key={id ?? line.key} className="flex">
                <a
                  href={line.url ?? undefined}
                  className="bzl group/bzl relative isolate flex w-full flex-col gap-3 overflow-hidden rounded-[24px] bg-card p-7 shadow-[0_18px_40px_-34px_var(--glow),inset_0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-text max-md:p-5"
                  style={{ '--line': line.color ?? 'var(--accent)' } as CSSProperties}
                  data-line-tile={line.key}
                >
                  {/* The line's colour (panel data) only as a soft glow in the corner. */}
                  <span
                    aria-hidden="true"
                    className="bzl-glow pointer-events-none absolute -top-24 -right-24 -z-10 size-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--line)_22%,transparent),transparent)]"
                  />
                  <span className="flex items-center justify-between gap-3">
                    <LineLogo line={line.key} alt={line.name} height={26} />
                    <span
                      aria-hidden="true"
                      className="bzl-arrow grid size-10 shrink-0 place-items-center rounded-full bg-[var(--line)] text-white shadow-[0_10px_22px_-12px_var(--line)]"
                    >
                      <Icon name="arrow" strokeWidth={2.4} className="size-4 -rotate-45" />
                    </span>
                  </span>
                  <b className="mt-4 font-display text-[22px] leading-tight font-extrabold text-ink font-stretch-108% max-md:mt-2">
                    {title}
                  </b>
                  <span className="text-[15px] leading-relaxed text-ink-2 min-[900px]:text-[14.5px]">
                    {text}
                  </span>
                  <span className="mt-auto flex items-center gap-2 pt-3 text-[14px] font-extrabold text-ink">
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full bg-[var(--line)]"
                    />
                    {line.domain ?? line.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
