import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { isIconName } from '@/lib/catalog/options'
import { publicImage } from '@/lib/media/public'
import { photoView } from '@/lib/software/aboutBlocks'
import { fillText } from '@/lib/software/facts'
import type { SwPageHeroBlock as SwPageHeroBlockData } from '@/payload-types'
import { Buttons } from '@/sites/software/components/about/Buttons'
import { Photo } from '@/sites/software/components/about/Photo'
import { Breadcrumbs } from '@/sites/software/components/Breadcrumbs'
import { softwareTextContext } from '@/sites/software/components/textContext'

type Props = { block: SwPageHeroBlockData; tenantId: number; isFirst: boolean; pageTitle: string }

/**
 * Hero of a Software subpage (boards `ONas`, `Wszystko`): breadcrumbs, eyebrow, H1 with the
 * accent part, lead, two buttons; beside it from 1081 px (under it on the phone) the collage of
 * photos with its badge, or the PRO-KOM lines around „Twoja firma”.
 */
export async function SwPageHeroBlock({ block, tenantId, isFirst, pageTitle }: Props) {
  const context = await softwareTextContext(tenantId)
  const fill = (value: string | null | undefined) => fillText(value ?? undefined, context)
  const Heading = isFirst ? 'h1' : 'h2'
  const lead = fill(block.lead)

  const photos =
    block.visual === 'photos'
      ? (block.photos ?? []).flatMap((photo) => {
          const view = photoView(photo, (value) => publicImage(value, tenantId), context.strict)
          return view ? [{ key: photo.id ?? photo.photoCaption, view }] : []
        })
      : []
  const badge = block.visual === 'photos' && block.badge?.title ? block.badge : null
  const nodes = block.visual === 'lines' ? (block.nodes ?? []) : []
  const hasVisual = photos.length > 0 || nodes.length > 0

  return (
    <section className="relative overflow-x-clip pt-6 pb-10 min-[641px]:pt-10 min-[641px]:pb-16">
      <Container wide>
        {isFirst ? <Breadcrumbs current={pageTitle} /> : null}
        <div
          className={cx(
            'mt-4 grid gap-8',
            hasVisual &&
              'min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,660px)] min-[1081px]:items-center min-[1081px]:gap-12',
          )}
        >
          <div>
            {block.eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[641px]:text-sm">
                {block.eyebrow}
              </p>
            ) : null}
            <Heading className="mt-3 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,68px)]">
              {block.title}
              {block.titleAccent ? (
                <>
                  {' '}
                  <span className="text-grad-h1">{block.titleAccent}</span>
                </>
              ) : null}
            </Heading>
            {lead ? (
              <p className="mt-5 max-w-[56ch] text-lg text-ink-2 min-[641px]:text-xl">{lead}</p>
            ) : null}
            <Buttons primary={block.primary} secondary={block.secondary} className="mt-7" />
          </div>

          {photos.length > 0 ? (
            <div className="relative">
              <div className="grid grid-cols-2 gap-2.5 min-[641px]:gap-3 min-[1081px]:grid-rows-2">
                {photos.map(({ key, view }, index) => (
                  <Photo
                    key={key}
                    photo={view}
                    eager={isFirst && index === 0}
                    sizes={
                      index === 0
                        ? '(min-width: 1081px) 360px, 100vw'
                        : '(min-width: 1081px) 290px, 50vw'
                    }
                    className={cx(
                      index === 0
                        ? 'col-span-2 aspect-[16/10] min-[1081px]:col-span-1 min-[1081px]:row-span-2 min-[1081px]:aspect-auto min-[1081px]:min-h-[460px]'
                        : 'aspect-square min-[1081px]:aspect-auto',
                    )}
                  />
                ))}
              </div>
              {badge ? (
                <div className="mt-2.5 rounded-[18px] border border-border bg-card px-4 py-3 shadow-raised min-[1081px]:absolute min-[1081px]:top-1/2 min-[1081px]:-left-4 min-[1081px]:mt-0 min-[1081px]:w-[200px] min-[1081px]:-translate-y-1/2">
                  {badge.status ? (
                    <p className="flex items-center gap-1.5 text-xs font-extrabold text-ok-text">
                      <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                      {badge.status}
                    </p>
                  ) : null}
                  <p className="mt-1 font-display text-lg font-extrabold">{badge.title}</p>
                  {badge.text ? <p className="text-xs text-ink-2">{badge.text}</p> : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {nodes.length > 0 ? (
            <div className="relative grid grid-cols-2 gap-3 min-[641px]:gap-x-24 min-[641px]:gap-y-36 min-[641px]:px-4 min-[641px]:py-6">
              {block.hub?.title ? (
                <div
                  aria-hidden="true"
                  className="col-span-2 mx-auto grid size-40 place-items-center rounded-full bg-accent-soft ring-[18px] ring-accent-line/40 min-[641px]:absolute min-[641px]:top-1/2 min-[641px]:left-1/2 min-[641px]:col-span-1 min-[641px]:-translate-x-1/2 min-[641px]:-translate-y-1/2 min-[641px]:size-44"
                >
                  <span className="grid size-32 place-items-center rounded-full border-2 border-accent bg-card text-center min-[641px]:size-36">
                    <span>
                      <span className="block font-display text-xl font-extrabold">
                        {block.hub.title}
                      </span>
                      {block.hub.text ? (
                        <span className="block text-xs text-ink-2">{block.hub.text}</span>
                      ) : null}
                    </span>
                  </span>
                </div>
              ) : null}
              {nodes.map((node) => (
                <div
                  key={node.id ?? node.name}
                  className={cx(
                    'relative rounded-[18px] bg-card p-3.5 shadow-raised',
                    node.current ? 'border-2 border-accent' : 'border border-border',
                  )}
                >
                  <p className="flex items-center gap-2 font-extrabold">
                    {node.icon && isIconName(node.icon) ? (
                      <span
                        aria-hidden="true"
                        className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent-text"
                      >
                        <Icon name={node.icon} className="size-4" />
                      </span>
                    ) : null}
                    {node.name}
                  </p>
                  {node.text ? <p className="mt-1.5 text-xs text-ink-2">{node.text}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
