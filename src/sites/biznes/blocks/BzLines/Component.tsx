import { LineLogo } from '@/components/shared/LineLogo'
import { Container } from '@/components/ui/Container'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { BzLinesBlock as BzLinesBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

type Props = { block: BzLinesBlockData; tenantId: number }

/**
 * „Inne linie PRO-KOM” (runda 1411, board `Koniec.dc.html`): three tiles — Instalacje, Software,
 * Tech — with a coloured head (the line's colour and logo from `CompanyData`), a short text of
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
    <section id="linie" aria-labelledby="linie-h" className="scroll-mt-24 py-12 max-md:py-7">
      <Container wide>
        <SectionHead
          id="linie-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.note}
        />
        <ul className="mt-8 grid gap-5 min-[900px]:grid-cols-3" data-lines>
          {tiles.map(({ id, title, text, line }) => (
            <li key={id ?? line.key} className="flex">
              <a
                href={line.url ?? undefined}
                className="bzl group/bzl flex w-full flex-col overflow-hidden rounded-[26px] bg-card shadow-[0_18px_40px_-34px_var(--glow),inset_0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-text"
                data-line-tile={line.key}
              >
                {/* The line's colour (panel data) over a soft band: its logo on a white plaque. */}
                <span
                  className="relative flex h-[132px] items-end px-6 pb-5 max-md:h-[104px]"
                  style={{
                    background: `linear-gradient(135deg, ${line.color ?? 'var(--accent)'}, color-mix(in srgb, ${line.color ?? 'var(--accent)'} 55%, var(--surface-dark)))`,
                  }}
                >
                  <span className="inline-flex h-11 items-center rounded-xl bg-white px-3.5 shadow-[0_8px_18px_-12px_var(--glow)]">
                    <LineLogo line={line.key} alt={line.name} height={24} />
                  </span>
                </span>
                <span className="flex flex-1 flex-col gap-2 px-6 pt-5 pb-6">
                  <b className="font-display text-[21px] leading-tight font-extrabold text-ink font-stretch-108%">
                    {title}
                  </b>
                  <span className="text-[15px] leading-relaxed text-ink-2 min-[900px]:text-[14.5px]">
                    {text}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5 text-[14px] font-extrabold text-accent-text">
                    <span>{line.domain ?? line.name}</span>
                    <span aria-hidden="true" className="bzl-arrow">
                      ↗
                    </span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
