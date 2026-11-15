import { Icon } from '@/components/ui/Icon'
import { HUB_LINE_LABELS } from '@/lib/prokom/lines'
import type { IconName } from '@/lib/shared/icons'

import { Tick } from '../home/art'
import { lineStyle } from '../lineColors'

/*
 * Pictures beside the headings of the hub's subpages (Krystian 15.11: subpages „premium” like the
 * home page). Illustration only — hidden from readers, their words are not content; colours of
 * the lines through `lineStyle`, the rest from tokens.
 */

type Row = {
  line: 'biznes' | 'instalacje' | 'software' | 'tech' | 'gaming' | 'prokom'
  icon: IconName
  label: string
  /** `switch` draws a toggle; any other text is a ticked status. */
  state: string
}

/** „Dla domu”: the home as an app — light, alarm, Wi-Fi, a phone in repair, a gaming PC. */
const HOME_ROWS: Row[] = [
  { line: 'instalacje', icon: 'spark', label: 'Światło w salonie', state: 'switch' },
  { line: 'instalacje', icon: 'shield', label: 'Alarm', state: 'uzbrojony' },
  { line: 'instalacje', icon: 'site', label: 'Wi-Fi w całym domu', state: 'działa' },
  { line: 'tech', icon: 'phone', label: 'Naprawa telefonu', state: 'do odbioru' },
  { line: 'gaming', icon: 'pc', label: 'Komputer do gier', state: 'złożony' },
]

/** „Inwestycje i dostawy”: a request list being filled in. */
const LIST_ROWS: { line: Row['line']; label: string; qty: number }[] = [
  { line: 'biznes', label: 'Laptopy', qty: 24 },
  { line: 'biznes', label: 'Monitory', qty: 24 },
  { line: 'biznes', label: 'Telewizory do pokoi', qty: 18 },
  { line: 'biznes', label: 'Lodówki', qty: 18 },
  { line: 'instalacje', label: 'Punkty Wi-Fi', qty: 6 },
]

/** „Współpraca”: one project run through its stages by the lines. */
const STAGES: { line: Row['line']; title: string; state: 'done' | 'now' | 'next' }[] = [
  { line: 'instalacje', title: 'Projekt instalacji', state: 'done' },
  { line: 'biznes', title: 'Dostawa sprzętu', state: 'done' },
  { line: 'instalacje', title: 'Montaż i konfiguracja', state: 'now' },
  { line: 'software', title: 'System i strona obiektu', state: 'next' },
  { line: 'tech', title: 'Serwis po odbiorze', state: 'next' },
]

export function HeroArt({ kind }: { kind: 'home' | 'deliveries' | 'cooperation' }) {
  if (kind === 'home') {
    return (
      <div aria-hidden="true" className="pk-sart pk-app pk-app--big" style={lineStyle('prokom')}>
        <span className="pk-app__bar">
          <i className="pk-app__logo" />
          <span>Twój dom</span>
          <em>
            <i /> wszystko w porządku
          </em>
        </span>
        <span className="pk-app__rows">
          {HOME_ROWS.map((row) => (
            <span
              key={row.label}
              className="pk-vr pk-vr--big pk-app__row"
              style={lineStyle(row.line)}
            >
              <b className="pk-app__ico">
                <Icon name={row.icon} />
              </b>
              <span className="pk-app__label">{row.label}</span>
              {row.state === 'switch' ? (
                <i className="pk-sw" />
              ) : (
                <span className="pk-vp">
                  <Tick />
                  {row.state}
                </span>
              )}
            </span>
          ))}
        </span>
        <span className="pk-app__sync">
          <i />
        </span>
      </div>
    )
  }
  if (kind === 'deliveries') {
    const total = LIST_ROWS.reduce((sum, row) => sum + row.qty, 0)
    return (
      <div aria-hidden="true" className="pk-sart pk-slist" style={lineStyle('prokom')}>
        <span className="pk-app__bar">
          <i className="pk-app__logo" />
          <span>Lista zapytania · hotel</span>
          <em>
            <i /> w przygotowaniu
          </em>
        </span>
        <span className="pk-slist__rows">
          {LIST_ROWS.map((row, i) => (
            <span
              key={row.label}
              className="pk-slist__row"
              style={lineStyle(row.line)}
              data-new={i === LIST_ROWS.length - 1 ? '' : undefined}
            >
              <i className="pk-slist__dot" />
              <span className="pk-slist__label">{row.label}</span>
              <span className="pk-tv__ctl">
                <i>−</i>
                <b>{row.qty}</b>
                <i>+</i>
              </span>
            </span>
          ))}
        </span>
        <span className="pk-slist__sum">
          <span>Razem w jednej ofercie</span>
          <b>{total} szt.</b>
        </span>
      </div>
    )
  }
  return (
    <div aria-hidden="true" className="pk-sart pk-stl" style={lineStyle('prokom')}>
      <span className="pk-app__bar">
        <i className="pk-app__logo" />
        <span>Projekt · pensjonat</span>
        <em>
          <i /> w toku
        </em>
      </span>
      <ol className="pk-stl__list">
        {STAGES.map((stage) => (
          <li key={stage.title} style={lineStyle(stage.line)} data-state={stage.state}>
            <span className="pk-stl__mark">{stage.state === 'done' ? <Tick /> : null}</span>
            <span className="pk-stl__title">{stage.title}</span>
            <span className="pk-stl__line">
              {stage.line === 'prokom' ? 'PRO-KOM' : HUB_LINE_LABELS[stage.line]}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
