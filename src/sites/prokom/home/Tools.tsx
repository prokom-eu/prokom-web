import { HeadingText } from '@/components/shared/HeadingText'
import type { HubHome } from '@/lib/prokom/home'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from './Mark'
import type { ToolCount, ToolGroup, ToolPreview } from './toolGroups'

type Props = {
  texts: HubHome['tools']
  groups: ToolGroup[]
  counts: ToolCount[]
  total: number
  /** `/zalatw-online`, or `null` while the page is off — then the card is left out. */
  allHref: string | null
}

/**
 * „Załatw to od razu.” (spec §6.1 pkt 4, board 01 `#narzedzia`): per line its two
 * home tools with a small picture from the tool's `preview`, and the card of all tools with the
 * counts from the data. Server-rendered, no state.
 */
export function Tools({ texts, groups, counts, total, allHref }: Props) {
  if (!groups.length) return null
  return (
    <section
      id="narzedzia"
      data-rail-section
      aria-labelledby="narzedzia-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-sect__head">
        <h2 id="narzedzia-h" className="pk-h2 pk-h2--big pk-sect__intro">
          <HeadingText text={texts.title} emClass="pk-nowrap" />
        </h2>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <div className="pk-tools">
        {groups.map(({ line, tools }) => (
          <div key={line.key} className="pk-tgr" style={lineStyle(line.key)}>
            <div className="pk-tgr__head">
              <span className="pk-tgr__who">
                <Mark label={line.label} size="sm" />
                {line.promise && <span className="pk-tgr__promise">{line.promise}</span>}
              </span>
              {line.url && line.domain && (
                <a href={line.url} className="pk-chip-out">
                  <i aria-hidden="true" className="pk-rec" />
                  {line.domain} <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
            <ul className="pk-tgr__tools" role="list">
              {tools.map((tool) => (
                <li key={tool.key}>
                  <ToolCard tool={tool} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        {allHref && total > 0 && (
          <a href={allHref} className="pk-tgr pk-tgr--all">
            <span className="pk-eb">{texts.all.eyebrow}</span>
            <span className="pk-tgr__all-title">
              {total} {texts.all.title}
            </span>
            <span className="pk-tgr__all-text">{texts.all.text}</span>
            <span className="pk-tgr__counts">
              {counts.map((row) => (
                <span key={row.line} className="pk-count" style={lineStyle(row.line)}>
                  <i aria-hidden="true" />
                  {row.name} <b>{row.count}</b>
                </span>
              ))}
            </span>
            <span className="pk-hbtn pk-hbtn--accent pk-tgr__go">
              {texts.all.cta} <span aria-hidden="true">→</span>
            </span>
          </a>
        )}
        {!allHref && texts.own && <OwnTool texts={texts.own} />}
      </div>
    </section>
  )
}

function ToolCard({ tool }: { tool: ToolGroup['tools'][number] }) {
  const body = (
    <>
      {tool.preview && <Preview preview={tool.preview} />}
      <span className="pk-tlc__title">
        {tool.title}
        {tool.badge && <span className="pk-tlc__badge">{tool.badge}</span>}
      </span>
      <span className="pk-tlc__desc">{tool.desc}</span>
      {tool.cta && (
        <span className="pk-tlc__go">
          {tool.cta} <span aria-hidden="true">↗</span>
        </span>
      )}
    </>
  )
  return tool.url ? (
    <a href={tool.url} className="pk-tlc">
      {body}
    </a>
  ) : (
    <div className="pk-tlc">{body}</div>
  )
}

/** Mocked rows of the request list (illustration only, hidden from readers). */
const LIST_SAMPLE = [
  ['Laptopy', 12],
  ['Monitory', 12],
  ['Telewizory', 8],
] as const

/**
 * The hub's own tool (H9): the sixth tile, in the company green, while the card of all tools waits
 * for `/zalatw-online` — the request list of „Inwestycje i dostawy”.
 */
function OwnTool({ texts }: { texts: NonNullable<HubHome['tools']['own']> }) {
  return (
    <div className="pk-tgr pk-tgr--own" style={lineStyle('prokom')}>
      <div className="pk-tgr__head">
        <span className="pk-tgr__who">
          <Mark size="sm" />
          <span className="pk-tgr__promise">{texts.eyebrow}</span>
        </span>
      </div>
      <div className="pk-own">
        <span aria-hidden="true" className="pk-tv pk-tv--qty">
          {LIST_SAMPLE.map(([name, qty], index) => (
            <span key={name} className="pk-tv__row" data-on={index === 2 ? '' : undefined}>
              <span>{name}</span>
              <span className="pk-tv__ctl">
                <i>−</i>
                <b>{qty}</b>
                <i>+</i>
              </span>
            </span>
          ))}
          <span className="pk-tv__sum">
            <span>Twoja lista</span>
            <b>32 szt.</b>
          </span>
        </span>
        <div className="pk-own__body">
          <h3 className="pk-tlc__title">{texts.title}</h3>
          <p className="pk-tlc__desc">{texts.text}</p>
          <ol className="pk-own__steps">
            {texts.steps.map((step, index) => (
              <li key={step}>
                <b aria-hidden="true">{index + 1}</b>
                {step}
              </li>
            ))}
          </ol>
          <a href={texts.href} className="pk-tlc__go pk-own__go">
            {texts.cta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}

/** The tool's small picture; its words are illustration only (hidden from readers). */
function Preview({ preview }: { preview: ToolPreview }) {
  switch (preview.kind) {
    case 'list':
      return (
        <span aria-hidden="true" className="pk-tv pk-tv--list">
          {preview.items.map((item, index) => (
            <span key={item} className="pk-tv__row" data-on={index === 0 ? '' : undefined}>
              <b>{String(index + 1).padStart(2, '0')}</b>
              <span>{item}</span>
              <i />
            </span>
          ))}
        </span>
      )
    case 'tiles':
      return (
        <span aria-hidden="true" className="pk-tv pk-tv--tiles">
          {preview.items.map((item, index) => (
            <span key={item} data-on={index === 0 ? '' : undefined}>
              {item}
            </span>
          ))}
        </span>
      )
    case 'rows':
      return (
        <span aria-hidden="true" className="pk-tv pk-tv--rows">
          {preview.rows.map((row) => (
            <span key={row.label} className="pk-tv__row">
              <span>{row.label}</span>
              <span className="pk-vp">
                <i className="pk-rec" />
                {row.state}
              </span>
            </span>
          ))}
        </span>
      )
    case 'steps':
      return (
        <span aria-hidden="true" className="pk-tv pk-tv--steps">
          <span className="pk-tv__bar">
            {preview.steps.map((step, index) => (
              <i
                key={step}
                data-state={
                  index < preview.done ? 'done' : index === preview.done ? 'now' : undefined
                }
              />
            ))}
          </span>
          <span className="pk-tv__names">
            {preview.steps.map((step, index) => (
              <span key={step} data-now={index === preview.done ? '' : undefined}>
                {step}
              </span>
            ))}
          </span>
        </span>
      )
    case 'win':
      return (
        <span aria-hidden="true" className="pk-tv pk-tv--win">
          <span className="pk-tv__chrome">
            <i />
            <i />
            <span>{preview.text}</span>
          </span>
          <span className="pk-tv__page">
            <span className="pk-tv__copy">
              <i className="pk-sk pk-sk--title" />
              <i className="pk-sk" />
              <i className="pk-sk pk-sk--short" />
              <i className="pk-sk pk-sk--btn" />
            </span>
            <span className="pk-tv__shot" />
          </span>
        </span>
      )
  }
}
