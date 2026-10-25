import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BzLinesBlock as BzLinesBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { hasLink } from '../../components/PageLink'

/**
 * „Jedna firma, cztery linie” (plansza OFirmie): a card per PRO-KOM line — name, what it does,
 * a link to its site; this site's card is outlined, named „(ta strona)” for screen readers and its
 * link is `aria-current`.
 */
export function BzLinesBlock({ block }: { block: BzLinesBlockData }) {
  const headingId = `linie-${block.id ?? 'sekcja'}-h`
  return (
    <section aria-labelledby={headingId} className="py-14 sm:py-20">
      <Container wide>
        <SectionHead
          id={headingId}
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />
        <ul className="mt-10 grid gap-3.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
          {block.lines.map((line, i) => (
            <li
              key={line.id ?? i}
              className={cx(
                'flex flex-col gap-2 rounded-[26px] bg-card p-6',
                line.current
                  ? 'shadow-[inset_0_0_0_2px_var(--accent-text)]'
                  : 'shadow-[inset_0_0_0_1px_var(--border)]',
              )}
            >
              <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-text uppercase">
                {line.name}
                {line.current && <span className="sr-only"> (ta strona)</span>}
              </p>
              <h3 className="text-xl leading-tight font-extrabold text-ink">{line.title}</h3>
              {line.text && <p className="text-[15px] leading-relaxed text-ink-2">{line.text}</p>}
              {hasLink(line.link) && (
                <a
                  href={line.link.href}
                  aria-current={line.current ? 'page' : undefined}
                  className="mt-auto inline-flex items-center gap-1.5 pt-3 font-extrabold text-accent-text hover:underline"
                >
                  {line.link.label}
                  <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
