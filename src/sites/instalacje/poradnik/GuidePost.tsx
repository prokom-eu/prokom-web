import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import { postOutline } from '@/lib/posts/content'
import type { PostView } from '@/lib/posts/view'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

import { navigation } from '../dane/nawigacja'
import { GUIDE_EXTRAS, poradnik as T } from '../dane/poradnik'
import { LEGAL_NOTE } from '../dane/prawo'
import { InstIcon } from '../InstIcon'
import { CtaBandView } from '../powloka/CtaBandView'
import { JsonLd } from '../sekcje/JsonLd'
import { GuideQuiz } from '../widzety/poradnik/GuideQuiz'
import { updatedLabel } from '../widzety/poradnik/guideMeta'

import '../widzety/firma/firma.css'

type EditorState = Parameters<typeof RichText>[0]['data']

type Props = { post: PostView; tenantId: number; origin: string }

const ROLES_ID = 'podzial'
const QUIZ_ID = 'test'

/**
 * A guide post `/poradnik/<slug>` (`PoradnikRodo.body.html`): breadcrumbs, the title with its
 * accent after the colon, lead and the update date (author: the company — no person in the panel
 * yet), the table of contents, „W skrócie”, the content of the panel, the widgets of the post
 * (`dane/poradnik.ts`), the legal sentence (spec §2.10), the side column and the band.
 * JSON-LD `Article` + `BreadcrumbList`.
 */
export async function GuidePost({ post, tenantId, origin }: Props) {
  const [site, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const extras = GUIDE_EXTRAS[post.slug]
  const outline = postOutline(post.content)
  const anchors = new Map<object, string>(outline.map(({ node, id }) => [node, id]))
  const toc = [
    ...outline.map((o, index) => ({ id: o.id, label: extras?.toc[index] ?? o.title })),
    ...(extras?.roles
      ? [{ id: ROLES_ID, label: extras.toc[outline.length] ?? extras.roles.heading }]
      : []),
    ...(extras?.quiz
      ? [
          {
            id: QUIZ_ID,
            label: extras.toc[outline.length + (extras.roles ? 1 : 0)] ?? extras.quiz.heading,
          },
        ]
      : []),
  ]
  const cut = post.title.indexOf(': ')
  const [head, accent] =
    cut > 0 ? [post.title.slice(0, cut + 1), post.title.slice(cut + 2)] : [post.title, null]
  const short = cut > 0 ? post.title.slice(0, cut) : post.title
  const meta = [T.author, updatedLabel(post)].filter(Boolean).join(' · ')
  const eyebrow = ['Poradnik', post.category, T.featured.minutes(post.minutes)]
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
  const salons = (company?.locations ?? []).map((l) => `${l.city}, ${l.street}`).join(' · ')
  const band = extras
    ? {
        ...navigation.ctaBand,
        eyebrow: extras.band.eyebrow,
        title: extras.band.heading,
        text: extras.band.text,
      }
    : navigation.ctaBand

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Start', url: `${origin}/` },
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
            images: [],
          }),
        ]}
      />
      <section id="hero" className="phero" style={{ paddingBottom: 40 }}>
        <div className="hgrid" />
        <div className="hglow" />
        <div className="wrap" style={{ position: 'relative' }}>
          <nav className="crumb in d1" aria-label="Okruszki">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <Link href="/poradnik">Poradnik</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" style={{ color: 'var(--ink)' }}>
              {short}
            </span>
          </nav>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxWidth: 900,
              marginTop: 22,
            }}
          >
            <span className="eye in d1">{eyebrow}</span>
            <h1 className="h1 in d2">
              {head}
              {accent && (
                <>
                  {' '}
                  <span className="acc">{accent}</span>
                </>
              )}
            </h1>
            {post.lead && <p className="lead in d3">{post.lead}</p>}
            <span className="mut in d4" style={{ fontSize: 14 }}>
              {meta}
            </span>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 96px' }}>
        <div className="wrap art">
          <nav className="toc" aria-label={T.toc}>
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
          <article className="prose">
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
            {extras?.roles && (
              <>
                <h2 id={ROLES_ID}>{extras.roles.heading}</h2>
                <div className="g2" style={{ gap: 12 }}>
                  {[extras.roles.we, extras.roles.you].map((col) => (
                    <div
                      key={col.title}
                      className="card"
                      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}
                    >
                      <b>{col.title}</b>
                      <ul>
                        {col.items.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
            {extras?.quiz && (
              <>
                <h2 id={QUIZ_ID}>{extras.quiz.heading}</h2>
                <GuideQuiz
                  items={extras.quiz.items}
                  initial={extras.quiz.initial}
                  done={extras.quiz.done}
                  partial={extras.quiz.items.map((_, n) =>
                    extras.quiz!.partial(n, extras.quiz!.items.length),
                  )}
                />
              </>
            )}
            <p className="src" style={{ marginTop: 14 }}>
              {LEGAL_NOTE}
            </p>
          </article>
          {extras && (
            <aside className="sticky" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                className="card"
                style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <span className="ico">
                  <InstIcon name={extras.aside.icon} size={22} />
                </span>
                <b className="h3">{extras.aside.title}</b>
                <span className="mut" style={{ fontSize: 14.5 }}>
                  {extras.aside.text}
                </span>
                <Link href="/zaplanuj" className="btn btn-p">
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
                    {r.label} →
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>
      <CtaBandView band={band} phone={phone} salons={salons} titleId="cta-guide-post-title" page />
    </>
  )
}
