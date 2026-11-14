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
 * „Załatw to od razu. Bez dzwonienia.” (spec §6.1 pkt 4, board 01 `#narzedzia`): per line its two
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
            <span className="pk-btn pk-btn--accent pk-tgr__go">
              {texts.all.cta} <span aria-hidden="true">→</span>
            </span>
          </a>
        )}
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

/** The tool's small picture; its words are illustration only (hidden from readers). */
function Preview({ preview }: { preview: ToolPreview }) {
  switch (preview.kind) {
    case 'list':
      return (
        <span aria-hidden="true" className="pk-tv pk-tv--list">
          {preview.items.map((item, index) => (
            <span key={item} className="pk-tv__row">
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
          {preview.items.map((item) => (
            <span key={item}>{item}</span>
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
            <i className="pk-sk pk-sk--title" />
            <i className="pk-sk" />
            <i className="pk-sk pk-sk--short" />
          </span>
        </span>
      )
  }
}
