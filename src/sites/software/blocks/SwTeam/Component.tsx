import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { publicImage } from '@/lib/media/public'
import { initials, photoView, teamCards } from '@/lib/software/aboutBlocks'
import { fillText } from '@/lib/software/facts'
import type { SwTeamBlock as SwTeamBlockData } from '@/payload-types'
import { Photo } from '@/sites/software/components/about/Photo'
import { SectionHead } from '@/sites/software/components/home/SectionHead'
import { softwareTextContext } from '@/sites/software/components/textContext'

type Props = { block: SwTeamBlockData; tenantId: number }

/**
 * People and places of a Software subpage (boards `ONas`, `Wszystko`): „Kto z Tobą pracuje” —
 * photo on top, role, name, text (3 columns); a person without a photo gets their initials in an
 * accent circle instead of a placeholder (SWV6, no portraits) — or a place: name, address lines,
 * photo (2 columns). On the phone one column.
 */
export async function SwTeamBlock({ block, tenantId }: Props) {
  const context = await softwareTextContext(tenantId)
  const fill = (value: string | null | undefined) => fillText(value ?? undefined, context)
  const places = block.variant === 'places'
  const cards = teamCards(
    block.members,
    fill,
    (member) => photoView(member, (value) => publicImage(value, tenantId), context.strict),
    // A detail line with a missing fact goes, the card stays; a missing name drops the card.
    { keepCardWithoutLine: true },
  )
  if (cards.length === 0) return null

  return (
    <section className="py-12 min-[641px]:py-20">
      <Container wide>
        <SectionHead eyebrow={block.eyebrow ?? ''} title={block.heading} lead={fill(block.lead)} />
        <ul
          data-reveal-cards
          className={cx(
            'mt-6 grid gap-3',
            places || cards.length === 2 ? 'min-[761px]:grid-cols-2' : 'min-[761px]:grid-cols-3',
          )}
        >
          {cards.map((card) => {
            const monogram = !places && !card.photo?.image
            const photo =
              card.photo && !monogram ? (
                <Photo
                  photo={card.photo}
                  sizes={
                    places ? '(min-width: 761px) 50vw, 100vw' : '(min-width: 761px) 33vw, 100vw'
                  }
                  className={
                    places
                      ? 'mt-4 aspect-[16/7]'
                      : cards.length === 2
                        ? 'aspect-[16/7]'
                        : 'aspect-[4/3]'
                  }
                />
              ) : null
            return (
              <li
                key={card.key}
                className={cx(
                  'flex flex-col rounded-[24px] border border-border bg-card',
                  places ? 'p-[18px] min-[641px]:p-6' : 'p-2.5',
                )}
              >
                {places ? null : photo}
                {monogram ? (
                  <span
                    aria-hidden="true"
                    className="mx-2 mt-3 grid size-14 place-items-center rounded-full bg-accent font-display text-xl font-extrabold text-accent-ink"
                  >
                    {initials(card.name)}
                  </span>
                ) : null}
                <div className={places ? undefined : 'px-2 pt-4 pb-2.5'}>
                  {card.role ? (
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
                      {card.role}
                    </p>
                  ) : null}
                  <h3 className="mt-1 font-display text-xl font-extrabold">{card.name}</h3>
                  {card.text ? <p className="mt-2 text-ink-2">{card.text}</p> : null}
                  {card.details.length > 0 ? (
                    <p className="mt-2 flex flex-col gap-1 text-ink-2">
                      {card.details.map((line, index) => (
                        <span key={index}>{line}</span>
                      ))}
                    </p>
                  ) : null}
                </div>
                {places ? photo : null}
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
