import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container } from '@/components/ui/Container'
import { sectionsByH2, type RichTextData } from '@/lib/posts/content'
import type { RichTextBlock as RichTextBlockData } from '@/payload-types'

type Content = RichTextBlockData['content']

/** Nodes of one part of the text as a rich text value of the same shape. */
function part(content: Content, nodes: unknown[]): Content {
  return { ...content, root: { ...content.root, children: nodes } } as Content
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The shared `richText` block in the Software look (board `Polityka`, spec. §6.11): with two or
 * more h2 headings, every section becomes a numbered card and a table of contents leads to them
 * (beside the text from 1081 px, a row of chips scrolled sideways on the phone). A shorter text is one card.
 */
export function SwRichText({ block }: { block: RichTextBlockData }) {
  const content = block.content
  // One id per block: a page may hold two long texts.
  const tocId = `spis-tresci-${block.id ?? 'tekst'}`
  const { intro, sections } = sectionsByH2(content as unknown as RichTextData)

  if (sections.length < 2) {
    return (
      <section className="py-8 min-[641px]:py-12">
        <Container wide>
          <div className="max-w-[760px] rounded-[24px] border border-border bg-card p-[18px] min-[641px]:p-7">
            <RichText data={content} className="rich-text" />
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-8 min-[641px]:py-12">
      <Container wide>
        <div className="grid gap-6 min-[1081px]:grid-cols-[260px_minmax(0,760px)] min-[1081px]:gap-12">
          <nav
            aria-labelledby={tocId}
            className="min-w-0 min-[1081px]:sticky min-[1081px]:top-28 min-[1081px]:self-start min-[1081px]:rounded-[24px] min-[1081px]:border min-[1081px]:border-border min-[1081px]:bg-card min-[1081px]:p-[18px]"
          >
            <h2
              id={tocId}
              className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2"
            >
              Spis treści
            </h2>
            <ol className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-[1081px]:mx-0 min-[1081px]:flex-col min-[1081px]:gap-0 min-[1081px]:overflow-visible min-[1081px]:px-0 min-[1081px]:pb-0">
              {sections.map((section, index) => (
                <li key={section.id} className="shrink-0 snap-start min-[1081px]:shrink">
                  <a
                    href={`#${section.id}`}
                    className="flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-full border border-border bg-card px-3.5 text-sm font-bold min-[1081px]:rounded-xl min-[1081px]:border-0 min-[1081px]:bg-transparent min-[1081px]:whitespace-normal min-[1081px]:px-2.5 min-[1081px]:py-1.5 min-[1081px]:hover:bg-surface-2"
                  >
                    <span className="text-xs font-extrabold text-accent-text">
                      {pad(index + 1)}
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="flex min-w-0 flex-col gap-3">
            {intro.length > 0 ? (
              <RichText data={part(content, intro)} className="rich-text text-lg text-ink-2" />
            ) : null}
            {sections.map((section, index) => (
              <article
                key={section.id}
                aria-labelledby={section.id}
                className="scroll-mt-28 rounded-[24px] border border-border bg-card p-[18px] min-[641px]:p-7"
              >
                <h2
                  id={section.id}
                  className="flex items-baseline gap-3 font-display text-2xl font-extrabold tracking-tight min-[641px]:text-[28px]"
                >
                  <span className="text-xs font-extrabold text-accent-text">{pad(index + 1)}</span>
                  {section.title}
                </h2>
                {section.nodes.length > 0 ? (
                  <RichText data={part(content, section.nodes)} className="rich-text mt-3" />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
