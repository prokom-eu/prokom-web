import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { cx } from '@/components/ui/cx'
import type { SwLegalBlock as SwLegalBlockData } from '@/payload-types'
import { sectionsByH2, type RichTextData } from '@/lib/posts/content'
import { getSiteSettings } from '@/lib/site/data'
import { splitBold } from '@/lib/site/emphasis'
import { toTelHref } from '@/lib/site/link'
import {
  legalReadingMinutes,
  legalTable,
  type LegalNoteFields,
  type LegalTableFields,
} from '@/lib/software/legal'
import { Glass } from '@/sites/software/components/ui/Glass'
import { PageHero } from '@/sites/software/components/ui/PageHero'

type Body = SwLegalBlockData['body']

type Props = {
  block: SwLegalBlockData
  isFirst: boolean
  /** Last breadcrumb. */
  pageTitle: string
  tenantId: number
  /** The „Wersja robocza…” banner is allowed (outside production). */
  draftAllowed: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Nodes of one section as a rich text value of the same shape. */
function part(body: Body, nodes: unknown[]): Body {
  return { ...body, root: { ...body.root, children: nodes } } as Body
}

/** „Polityka **prywatności.**” → H1 „Polityka” + highlighted „prywatności.”. */
function headingParts(heading: string): { title: string; em: string | null } {
  const parts = splitBold(heading)
  const title = parts
    .filter((p) => !p.bold)
    .map((p) => p.text)
    .join('')
    .trim()
  const em = parts
    .filter((p) => p.bold)
    .map((p) => p.text)
    .join(' ')
    .trim()
  return title ? { title, em: em || null } : { title: em, em: null }
}

function LegalTableView({ fields }: { fields: LegalTableFields }) {
  const { heads, rows } = legalTable(fields)
  if (!heads.length || !rows.length) return null
  return (
    // Scrolls sideways on a phone instead of squeezing the cells (ZMIANY-v24 §10); focusable, so
    // a keyboard can scroll it too.
    <div
      className="sw-ltbl"
      tabIndex={0}
      role="region"
      aria-label={fields.caption || heads.join(', ')}
    >
      <table>
        {fields.caption ? <caption className="sr-only">{fields.caption}</caption> : null}
        <thead>
          <tr>
            {heads.map((head) => (
              <th key={head} scope="col">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index}>
              {cells.map((text, cell) =>
                cell === 0 ? (
                  <th key={cell} scope="row">
                    {text}
                  </th>
                ) : (
                  <td key={cell}>{text}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LegalNoteView({ fields }: { fields: LegalNoteFields }) {
  if (!fields.text?.trim()) return null
  return (
    <div className="sw-lnote" role="note">
      <span aria-hidden="true">!</span>
      <p>{fields.text}</p>
    </div>
  )
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    legalTable: ({ node }: { node: { fields: LegalTableFields } }) => (
      <LegalTableView fields={node.fields} />
    ),
    legalNote: ({ node }: { node: { fields: LegalNoteFields } }) => (
      <LegalNoteView fields={node.fields} />
    ),
  },
})

/**
 * A Software legal page (ZMIANY-v24 §9.6; boards `AU-polityka`, `AU-regulamin`, `AU-cookies`,
 * `AU-dostepnosc`): the subpage hero with badges, then a sticky numbered table of contents with the
 * „Masz pytanie o dane?” card beside the text (chips under the capsule up to 960 px) and the text
 * cut into numbered sections at its h2 headings.
 */
export async function SwLegal({ block, isFirst, pageTitle, tenantId, draftAllowed }: Props) {
  const settings = await getSiteSettings(tenantId)
  const { title, em } = headingParts(block.heading)
  const body = block.body
  const data = body as unknown as RichTextData
  const { intro, sections } = sectionsByH2(data)
  const minutes = legalReadingMinutes(data, [block.heading, block.lead])
  const badges = [
    block.version ? `Wersja ${block.version}` : null,
    block.updated ? `Aktualizacja: ${block.updated}` : null,
    `Czas czytania: ${minutes} min`,
  ].filter((badge): badge is string => Boolean(badge))
  const email = settings?.email ?? null
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null

  return (
    <>
      <PageHero
        crumb={pageTitle}
        eyebrow={block.eyebrow}
        title={title}
        em={em}
        lead={block.lead}
        level={isFirst ? 'h1' : 'h2'}
        className="sw-legal-hero"
      >
        {block.draft && draftAllowed ? (
          <p role="note" className="sw-ldraft">
            <span aria-hidden="true">!</span>
            <span>
              <strong>Wersja robocza do sprawdzenia przed publikacją.</strong> Treść wymaga
              akceptacji szefa albo prawnika.
            </span>
          </p>
        ) : null}
        <ul className="sw-lmeta" aria-label="O dokumencie">
          {badges.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>
      </PageHero>

      <section className="sw-legal" aria-label={pageTitle}>
        <div className={cx('v-wrap', sections.length > 1 && 'sw-lgrid')}>
          {sections.length > 1 ? (
            <>
              <aside className="sw-ltoc">
                <Glass as="div" className="sw-ltoc-in">
                  <nav aria-label="Spis treści">
                    <p className="sw-ltoc-h" aria-hidden="true">
                      Spis treści
                    </p>
                    <ol>
                      {sections.map((section, index) => (
                        <li key={section.id}>
                          <a href={`#${section.id}`}>
                            <span className="sw-ln">{pad(index + 1)}</span>
                            {section.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </Glass>
                {email || tel ? (
                  <Glass as="div" className="sw-lask">
                    {block.askTitle ? <p className="sw-lask-h">{block.askTitle}</p> : null}
                    {block.askText ? <p>{block.askText}</p> : null}
                    {email ? <a href={`mailto:${email}`}>{email}</a> : null}
                    {tel ? <a href={tel}>{phone}</a> : null}
                  </Glass>
                ) : null}
              </aside>
              <nav className="sw-lchips" aria-label="Spis treści — skróty">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </>
          ) : null}
          <article className="sw-prose">
            {intro.length > 0 ? (
              <RichText data={part(body, intro)} converters={converters} className="sw-lintro" />
            ) : null}
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="sw-lsec"
                aria-labelledby={`${section.id}-h`}
              >
                <h2 id={`${section.id}-h`}>
                  <span className="sw-ln">{pad(index + 1)}</span>
                  {section.title}
                </h2>
                {section.nodes.length > 0 ? (
                  <RichText data={part(body, section.nodes)} converters={converters} />
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  )
}
