import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { publicImage } from '@/lib/media/public'
import type { BzOrderFlowBlock as BzOrderFlowBlockData } from '@/payload-types'

import { hasLink, PageLink } from '../../components/PageLink'

type Props = { block: BzOrderFlowBlockData; tenantId: number }

/**
 * „Jak to działa” (spec. §6.5 pkt 5, plansza Gopos), `#jak-to-dziala`: a navy card with the
 * system on its hardware, then one order in four steps joined by a line, and two buttons.
 */
export function BzOrderFlowBlock({ block, tenantId }: Props) {
  const image = publicImage(block.image, tenantId)
  const steps = block.steps ?? []
  return (
    <section
      id="jak-to-dziala"
      aria-labelledby="jak-to-dziala-h"
      className="scroll-mt-24 py-6 sm:py-10"
    >
      <Container wide>
        <div
          data-surface="dark"
          className="overflow-hidden rounded-[36px] bg-surface-dark bg-[radial-gradient(ellipse_at_80%_0%,color-mix(in_srgb,var(--accent-on-dark)_24%,transparent),transparent_60%)] p-6 text-white sm:p-10 min-[1080px]:p-14"
        >
          <div className="grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              {block.eyebrow && (
                <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark uppercase">
                  {block.eyebrow}
                </p>
              )}
              <h2
                id="jak-to-dziala-h"
                className="font-display text-[clamp(2.1rem,4.2vw,3.6rem)] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-110%"
              >
                {block.heading}
              </h2>
              {block.lead && (
                <p className="max-w-[54ch] text-lg leading-relaxed text-white/80">{block.lead}</p>
              )}
              {block.badges && block.badges.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {block.badges.map((badge, i) => (
                    <li
                      key={badge.id ?? i}
                      className="rounded-full bg-white/10 px-3.5 py-2 text-sm font-bold"
                    >
                      {badge.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {image && (
              <div className="relative flex justify-center">
                <MediaImage
                  image={image}
                  sizes="(min-width: 1080px) 520px, 90vw"
                  className="h-auto max-h-[340px] w-auto max-w-full object-contain"
                />
              </div>
            )}
          </div>

          {steps.length > 0 && (
            <div className="relative mt-12">
              <span
                aria-hidden="true"
                className="absolute top-14 right-[12%] left-[12%] hidden h-px bg-white/15 min-[1080px]:block"
              />
              <ol className="relative grid gap-8 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
                {steps.map((step, i) => {
                  const stepImage = publicImage(step.image, tenantId)
                  return (
                    <li
                      key={step.id ?? i}
                      className="relative flex flex-col items-center gap-2 text-center"
                    >
                      {i === 0 && block.ticket && (
                        <span className="absolute -top-4 z-10 -translate-x-6 rounded-lg bg-white px-2.5 py-1 text-[12px] font-extrabold text-surface-dark">
                          {block.ticket}
                        </span>
                      )}
                      <span className="flex size-28 items-center justify-center rounded-[26px] bg-white/[0.06] ring-1 ring-white/15 ring-inset">
                        {stepImage && (
                          <MediaImage
                            image={stepImage}
                            sizes="96px"
                            className="h-auto max-h-20 w-auto max-w-[80px] object-contain"
                          />
                        )}
                      </span>
                      {step.label && (
                        <span className="mt-2 text-[12px] font-extrabold tracking-[0.14em] text-accent-on-dark uppercase">
                          {step.label}
                        </span>
                      )}
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      {step.text && (
                        <p className="max-w-[24ch] text-[15px] leading-snug text-white/75">
                          {step.text}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {(block.note || hasLink(block.primary) || hasLink(block.secondary)) && (
            <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-white/15 pt-8">
              {block.note && <p className="text-white/80">{block.note}</p>}
              <div className="flex flex-wrap gap-3">
                {hasLink(block.primary) && (
                  <PageLink href={block.primary.href} kind="light">
                    {block.primary.label}
                  </PageLink>
                )}
                {hasLink(block.secondary) && (
                  <PageLink href={block.secondary.href} kind="outlineDark">
                    {block.secondary.label}
                  </PageLink>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
