import { Container } from '@/components/ui/Container'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzOnePartnerBlock as BzOnePartnerBlockData } from '@/payload-types'

import { OnePartnerSwitch } from './OnePartnerSwitch'

type Props = { block: BzOnePartnerBlockData; tenantId: number }

const texts = (rows: { text: string }[] | null | undefined) => (rows ?? []).map((row) => row.text)

/**
 * „Pięć firm czy jedna” (spec. §4 pkt 8, ZMIANY-v20 §2.5), the short version: no 6 → 1 bar and
 * no summary sentence; the buttons sit in the left column under the rows. Navy in both themes.
 */
export async function BzOnePartnerBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
  const phone = settings?.phone ?? null
  const mock = block.phone

  const header = (
    <div className="flex flex-col gap-4">
      {(block.eyebrowA || block.eyebrowB) && (
        <p className="flex items-center gap-2.5 text-[13px] font-extrabold tracking-[0.12em] uppercase">
          {block.eyebrowA && <span className="text-tone-red-2">{block.eyebrowA}</span>}
          {block.eyebrowA && block.eyebrowB && (
            <span aria-hidden="true" className="size-1.5 rounded-full bg-white/40" />
          )}
          {block.eyebrowB && <span className="text-accent-on-dark">{block.eyebrowB}</span>}
        </p>
      )}
      <h2
        id="jeden-h"
        className="font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-white font-stretch-110%"
      >
        {block.heading}
        {block.headingAccent && (
          <>
            {' '}
            <span className="text-accent-on-dark">{block.headingAccent}</span>
          </>
        )}
      </h2>
      {block.lead && (
        <p className="max-w-[56ch] text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-white/80">
          {block.lead}
        </p>
      )}
    </div>
  )

  return (
    <section id="jeden" aria-labelledby="jeden-h" className="py-8 sm:py-12">
      <Container wide>
        <div
          data-surface="dark"
          className="overflow-hidden rounded-[30px] bg-surface-dark px-5 py-10 text-white sm:rounded-[36px] sm:px-10 sm:py-14 min-[1080px]:px-16"
        >
          <OnePartnerSwitch
            header={header}
            data={{
              separateLabel: block.separateLabel,
              oneLabel: block.oneLabel,
              separateTag: block.separateTag ?? null,
              oneTag: block.oneTag ?? null,
              rows: (block.rows ?? []).map(({ label, icon, separate, one }) => ({
                label,
                icon,
                separate,
                one,
              })),
              cta: { label: block.cta.label, href: block.cta.href },
              phone,
              tel: phone ? toTelHref(phone) : null,
              mock: {
                groupLabel: mock?.groupLabel ?? null,
                proNote: mock?.proNote ?? null,
                watchLabel: mock?.watchLabel ?? null,
                contacts: (mock?.contacts ?? []).map(({ name, note }) => ({
                  name,
                  note: note ?? null,
                })),
                chips: texts(mock?.chips),
                watch: (mock?.watch ?? []).map(({ label, value, tone }) => ({
                  label,
                  value,
                  tone,
                })),
              },
              separateBubbles: texts(block.separateBubbles),
              oneBubbles: texts(block.oneBubbles),
            }}
          />
        </div>
      </Container>
    </section>
  )
}
