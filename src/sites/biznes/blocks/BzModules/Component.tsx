import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { publicImage } from '@/lib/media/public'
import type { BzModulesBlock as BzModulesBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { ModuleTabs } from './ModuleTabs'

type Props = { block: BzModulesBlockData; tenantId: number }

/**
 * Module explorer (spec. §6.5 pkt 4, plansza Gopos): the list on the left, the chosen module in
 * a navy panel on the right — subtitle, name, description, three points and the picture.
 */
export function BzModulesBlock({ block, tenantId }: Props) {
  const headingId = `moduly-${block.id ?? 'sekcja'}-h`
  const panels = block.modules.map((module, i) => {
    const image = publicImage(module.image, tenantId)
    return (
      <div
        key={module.id ?? i}
        data-surface="dark"
        className="grid h-full items-center gap-8 rounded-[32px] bg-surface-dark bg-[radial-gradient(ellipse_at_85%_90%,color-mix(in_srgb,var(--tone-green)_22%,transparent),transparent_55%)] p-6 text-white sm:p-10 min-[700px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-4">
          {module.subtitle && (
            <p className="text-[13px] font-extrabold tracking-[0.1em] text-ok uppercase">
              {module.subtitle}
            </p>
          )}
          <h3 className="font-display text-[clamp(1.7rem,2.6vw,2.2rem)] leading-tight font-extrabold">
            {module.name}
          </h3>
          <p className="leading-relaxed text-white/80">{module.description}</p>
          {module.points && module.points.length > 0 && (
            <ul className="flex flex-col gap-2">
              {module.points.map((point, j) => (
                <li key={point.id ?? j} className="flex items-center gap-2.5 text-[15px]">
                  <Icon name="check" strokeWidth={2.6} className="size-4 shrink-0 text-ok" />
                  {point.text}
                </li>
              ))}
            </ul>
          )}
        </div>
        {image && (
          <div className="flex justify-center">
            <MediaImage
              image={image}
              sizes="(min-width: 1080px) 360px, 80vw"
              className="h-auto max-h-[300px] w-auto max-w-full object-contain"
            />
          </div>
        )}
      </div>
    )
  })

  return (
    <section aria-labelledby={headingId} className="bg-surface-2 py-14 sm:py-20">
      <Container wide>
        <SectionHead
          id={headingId}
          eyebrow={block.eyebrow}
          heading={block.heading}
          eyebrowClassName="text-ok-text"
        />
        <div className="mt-9">
          <ModuleTabs
            tabs={block.modules.map(({ name, subtitle, icon }) => ({ name, subtitle, icon }))}
            panels={panels}
          />
        </div>
      </Container>
    </section>
  )
}
