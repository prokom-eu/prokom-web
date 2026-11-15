import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import { ogImages } from '@/lib/pages/metadata'
import { postOutline } from '@/lib/posts/content'
import type { PostView } from '@/lib/posts/view'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonLd'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

import { navigation } from '../dane/nawigacja'
import { poradnik as T } from '../dane/poradnik'
import { guideMinutes, guidePost } from '../dane/wpisy'
import { INST_ICONS } from '../icons'
import { InstIcon } from '../InstIcon'
import { CtaBandView } from '../powloka/CtaBandView'
import { JsonLd } from '../sekcje/JsonLd'
import { GuideQuiz } from '../widzety/poradnik/GuideQuiz'
import { updatedLabel } from '../widzety/poradnik/guideMeta'
import { salonsNote } from '../powloka/salons'
import { Arrow } from '../Arrow'
import { InstSection } from '../sekcje/InstSectionLazy'
import { GuidePostStyles } from '../style/LineStyles'

type EditorState = Parameters<typeof RichText>[0]['data']

type Props = { post: PostView; tenantId: number; origin: string }

/** Ids of the post's own parts after the content (the table of contents links to them). */
const IDS = { table: 'porownanie', checklist: 'sprawdz', howWeDo: 'jak-robimy', faq: 'pytania' }

/** The planner with the post's ready description (`?opis=`, runda v6 §3.2). */
const planHref = (opis: string) => `/zaplanuj?opis=${encodeURIComponent(opis)}`

/**
 * A guide post `/poradnik/<slug>` (runda v6 §3, INST-6 PR5): breadcrumbs, the title, lead, reading
 * time and the update date (author: the company), the illustration, the table of contents,
 * „W skrócie”, the content of the panel, then the post's parts written in the repo
 * (`dane/wpisy`): the comparison table, the checklist, „Jak to robimy w PRO-KOM”, the FAQ and the
 * planner button with a ready description; the side column and the band. JSON-LD `Article`,
 * `BreadcrumbList`, `FAQPage`. A post of the panel without repo data shows its content only.
 */
export async function GuidePost({ post, tenantId, origin }: Props) {
  const [site, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const data = guidePost(post.slug)
  const extras = data?.extras
  const outline = postOutline(post.content)
  const anchors = new Map<object, string>(outline.map(({ node, id }) => [node, id]))
  const toc = [
    ...outline.map((o, index) => ({ id: o.id, label: extras?.toc[index] ?? o.title })),
    ...(extras?.table ? [{ id: IDS.table, label: 'Porównanie' }] : []),
    ...(extras?.checklist ? [{ id: IDS.checklist, label: 'Lista kontrolna' }] : []),
    ...(extras ? [{ id: IDS.howWeDo, label: 'Jak to robimy' }] : []),
    ...(extras?.faq.length ? [{ id: IDS.faq, label: 'Pytania' }] : []),
  ]
  const short = post.title.split(': ')[0] ?? post.title
  const minutes = data ? guideMinutes(data) : post.minutes
  const meta = [T.author, updatedLabel(post)].filter(Boolean).join(' · ')
  const eyebrow = ['Poradnik', post.category, T.featured.minutes(minutes)]
    .filter(Boolean)
    .join(' · ')

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const Tag = (node.tag === 'h3' ? 'h3' : 'h2') as 'h2' | 'h3'
      return <Tag id={anchors.get(node)}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
  })

  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const salons = salonsNote(company?.locations ?? [])
  const band = extras
    ? {
        ...navigation.ctaBand,
        eyebrow: extras.band.eyebrow,
        title: extras.band.heading,
        text: extras.band.text,
        button: { label: extras.plan.label, href: planHref(extras.plan.opis) },
      }
    : navigation.ctaBand
  const image = ogImages(post.cover ?? site?.seo.ogImage ?? null, 'instalacje')[0]
  const imageUrl = image ? new URL(image.url, origin).toString() : null

  return (
    <>
      <GuidePostStyles />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Strona główna', url: `${origin}/` },
            { name: 'Poradnik', url: `${origin}/poradnik` },
            { name: short, url: `${origin}${post.href}` },
          ]),
          articleJsonLd({
            headline: post.title,
            description: post.seo.description ?? post.lead,
            url: `${origin}${post.href}`,
            origin,
            datePublished: post.published?.dateTime ?? null,
            dateModified: post.updated?.dateTime ?? post.published?.dateTime ?? null,
            images: imageUrl ? [imageUrl] : [],
          }),
          ...(extras?.faq.length ? [faqJsonLd(extras.faq)] : []),
        ]}
      />
      <section id="hero" className="phero" style={{ paddingBottom: 40 }}>
        <div className="hgrid" />
        <div className="hglow" />
        <div className="wrap" style={{ position: 'relative' }}>
          <nav className="crumb in d1" aria-label="Okruszki">
            <Link href="/">Strona główna</Link>
            <span aria-hidden="true">/</span>
            <Link href="/poradnik">Poradnik</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" style={{ color: 'var(--ink)' }}>
              {short}
            </span>
          </nav>
          <div className="prhead">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                maxWidth: 820,
                marginTop: 22,
              }}
            >
              <span className="eye in d1">{eyebrow}</span>
              <h1 className="h1 in d2">{post.title}</h1>
              {post.lead && <p className="lead in d3">{post.lead}</p>}
              <span className="mut in d4" style={{ fontSize: 14 }}>
                {meta}
              </span>
            </div>
            {extras && (
              <svg
                className="prpic in d3"
                viewBox="0 0 400 260"
                role="img"
                aria-label={extras.art.alt}
              >
                <rect width="400" height="260" rx="24" style={{ fill: 'var(--accent-soft)' }} />
                <g transform="translate(110 40) scale(7.5)">
                  <path
                    d={INST_ICONS[extras.art.icon]}
                    style={{
                      fill: 'none',
                      stroke: 'var(--accent-text)',
                      strokeWidth: 1,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  />
                </g>
              </svg>
            )}
          </div>
        </div>
      </section>

      {/* Round v5 (RUNDA-V5 §9.4): contents, text and side panel come in on scroll. */}
      <InstSection id="tresc" style={{ padding: '0 0 96px' }}>
        <div className="wrap art">
          <nav className="toc ri" aria-label={T.toc}>
            <b
              style={{
                fontSize: 12.5,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-2)',
                padding: '0 12px 6px',
              }}
            >
              {T.toc}
            </b>
            {toc.map((t) => (
              <a key={t.id} href={'#' + t.id}>
                {t.label}
              </a>
            ))}
          </nav>

          <article className="prose ri">
            {extras && (
              <div className="note" style={{ flexDirection: 'column', gap: 8 }}>
                <b style={{ fontSize: 16 }}>{T.summary}</b>
                <ul>
                  {extras.summary.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            <RichText
              data={post.content as unknown as EditorState}
              converters={converters}
              disableContainer
            />
            {extras?.table && (
              <>
                <h2 id={IDS.table}>{extras.table.heading}</h2>
                <div className="prtbl">
                  <table>
                    <caption className="vh">{extras.table.caption}</caption>
                    <thead>
                      <tr>
                        {extras.table.columns.map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {extras.table.rows.map((row) => (
                        <tr key={row.join('|')}>
                          {row.map((cell, i) =>
                            i === 0 ? (
                              <th key={i} scope="row">
                                {cell}
                              </th>
                            ) : (
                              <td key={i}>{cell}</td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {extras?.checklist && (
              <>
                <h2 id={IDS.checklist}>{extras.checklist.heading}</h2>
                <GuideQuiz
                  items={extras.checklist.items}
                  initial={extras.checklist.initial}
                  done={extras.checklist.done}
                  partial={extras.checklist.items.map((_, n) =>
                    extras
                      .checklist!.partial.replace('{n}', String(n))
                      .replace('{all}', String(extras.checklist!.items.length)),
                  )}
                />
              </>
            )}
            {extras && (
              <>
                <h2 id={IDS.howWeDo}>{T.howWeDo}</h2>
                <ul>
                  {extras.howWeDo.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p>
                  <Link href={planHref(extras.plan.opis)} className="btn btn-p">
                    {extras.plan.label}
                  </Link>
                </p>
              </>
            )}
            {extras && extras.faq.length > 0 && (
              <>
                <h2 id={IDS.faq}>{T.faq}</h2>
                <div className="prfaq">
                  {extras.faq.map((f) => (
                    <details key={f.question}>
                      <summary>{f.question}</summary>
                      <p>{f.answer}</p>
                    </details>
                  ))}
                </div>
              </>
            )}
          </article>

          {extras && (
            <aside className="sticky" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                className="card"
                style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <span className="ico">
                  <InstIcon name={extras.art.icon} size={22} />
                </span>
                <b className="h3">{extras.aside.title}</b>
                <span className="mut" style={{ fontSize: 14.5 }}>
                  {extras.aside.text}
                </span>
                <Link href={planHref(extras.plan.opis)} className="btn btn-p">
                  {T.aside.plan}
                </Link>
                <Link href={extras.aside.link.href} className="btn btn-g">
                  {extras.aside.link.label}
                </Link>
              </div>
              <div
                className="card"
                style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <b style={{ fontSize: 15 }}>{T.aside.readAlso}</b>
                {extras.readAlso.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    style={{ fontSize: 14.5, color: 'var(--accent-text)', fontWeight: 800 }}
                  >
                    {r.label} <Arrow />
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </InstSection>
      <CtaBandView band={band} phone={phone} salons={salons} titleId="cta-guide-post-title" page />
    </>
  )
}
