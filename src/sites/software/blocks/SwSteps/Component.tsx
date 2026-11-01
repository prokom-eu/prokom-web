import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { isIconName } from '@/lib/catalog/options'
import { stepItems } from '@/lib/software/aboutBlocks'
import { fillText } from '@/lib/software/facts'
import type { SwStepsBlock as SwStepsBlockData } from '@/payload-types'
import { SectionHead } from '@/sites/software/components/home/SectionHead'
import { softwareTextContext } from '@/sites/software/components/textContext'

type Props = { block: SwStepsBlockData; tenantId: number }

/**
 * A list section of a Software subpage (boards `ONas`, `Wszystko`): big numbers in 4 cards
 * (2 on the phone), cards with an icon in 3 columns, or a timeline beside its heading from
 * 1081 px. Nothing without items left after filling the facts. Big numbers without an eyebrow are
 * the band right under the hero (SWV6, `/o-firmie`): tight top, the heading for screen readers.
 */
export async function SwStepsBlock({ block, tenantId }: Props) {
  const context = await softwareTextContext(tenantId)
  const fill = (value: string | null | undefined) => fillText(value ?? undefined, context)
  const items = stepItems(block.items, fill)
  if (items.length === 0) return null
  const lead = fill(block.lead)
  const head = <SectionHead eyebrow={block.eyebrow ?? ''} title={block.heading} lead={lead} />

  if (block.variant === 'timeline') {
    return (
      <section className="py-12 min-[641px]:py-20">
        <Container wide>
          <div className="grid gap-8 min-[1081px]:grid-cols-[minmax(0,420px)_minmax(0,1fr)] min-[1081px]:gap-16">
            {head}
            <ol className="relative flex flex-col gap-7 border-l-2 border-accent-line pl-6 min-[641px]:gap-9">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="relative grid gap-1 min-[641px]:grid-cols-[140px_minmax(0,1fr)] min-[641px]:gap-x-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[33px] size-4 rounded-full border-[3px] border-accent bg-surface"
                  />
                  {item.marker ? (
                    <span className="min-w-0 break-words font-display text-xl font-extrabold text-accent-text min-[641px]:text-2xl">
                      {item.marker}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span>
                    {item.title ? (
                      <span className="block text-lg font-extrabold">{item.title}</span>
                    ) : null}
                    {item.text ? <span className="mt-1 block text-ink-2">{item.text}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    )
  }

  const stats = block.variant === 'stats'
  const band = stats && !block.eyebrow
  return (
    <section className={band ? 'pb-6 min-[641px]:pb-10' : 'py-12 min-[641px]:py-20'}>
      <Container wide>
        {band ? <h2 className="sr-only">{block.heading}</h2> : head}
        <ul
          className={cx(
            band ? 'grid gap-2.5 min-[641px]:gap-3' : 'mt-6 grid gap-2.5 min-[641px]:gap-3',
            stats ? 'grid-cols-2 min-[1081px]:grid-cols-4' : 'min-[761px]:grid-cols-3',
          )}
        >
          {items.map((item) => (
            <li
              key={item.key}
              className={cx(
                'rounded-[22px] border border-border bg-card',
                stats ? 'p-4 min-[641px]:p-5' : 'p-[22px] shadow-raised',
              )}
            >
              {stats ? (
                <>
                  {item.marker ? (
                    <span className="block font-display text-[34px] font-extrabold leading-none text-grad-h1 min-[641px]:text-5xl">
                      {item.marker}
                    </span>
                  ) : null}
                  {item.text ? (
                    <span className="mt-2 block text-sm text-ink-2">{item.text}</span>
                  ) : null}
                </>
              ) : (
                <>
                  {item.icon && isIconName(item.icon) ? (
                    <span
                      aria-hidden="true"
                      className="grid size-12 place-items-center rounded-[14px] bg-accent-soft text-accent-text"
                    >
                      <Icon name={item.icon} className="size-5" />
                    </span>
                  ) : null}
                  {item.title ? (
                    <h3 className="mt-5 font-display text-xl font-extrabold">{item.title}</h3>
                  ) : null}
                  {item.text ? <p className="mt-2 text-ink-2">{item.text}</p> : null}
                </>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
