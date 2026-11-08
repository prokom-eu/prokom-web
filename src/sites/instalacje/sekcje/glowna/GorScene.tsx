import type { ReactNode } from 'react'

/**
 * Mini scenes of the „Na Podhalu…” cards (RUNDA-V5 §5): a small dark stage instead of an icon in
 * a circle. Colours come from the `--sx-*` tokens of `[data-inst-sx]`; the part marked `.gsa`
 * plays once (600 ms) when the card is pointed at or focused (`podhale-proces.css`).
 */
const RIDGE = 'M0 64V44l16-12 12 8 18-20 14 12 12-8 16 14 14-10 18 14v26z'

function Stage({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" focusable="false">
      <rect width="120" height="64" className="gsky" />
      <path d={RIDGE} className="gmt" />
      {children}
    </svg>
  )
}

const FLAKES = [
  [14, 8],
  [30, 4],
  [52, 10],
  [70, 6],
  [88, 12],
  [104, 5],
  [22, 18],
  [96, 20],
] as const

/** `name`: snow, storm, off, home, cal or pin; anything else draws an empty stage. */
export function GorScene({ name }: { name: string }) {
  switch (name) {
    case 'snow':
      return (
        <Stage>
          <path d="M44 20l12-12 12 12M60 44l16-12 12 8" className="gsnow" />
          <rect x="74" y="26" width="22" height="10" rx="3" className="gbody" />
          <circle cx="78" cy="31" r="2.6" className="glens" />
          <path d="M96 31h6v12" className="gline" />
          <g className="gsa gsa-fall">
            {FLAKES.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" className="gflake" />
            ))}
          </g>
        </Stage>
      )
    case 'storm':
      return (
        <Stage>
          <path
            d="M34 26a10 10 0 0 1 19-5 8 8 0 0 1 14 3 7 7 0 0 1 1 14H36a6 6 0 0 1-2-12z"
            className="gcloud"
          />
          <path d="M54 38l-6 12h7l-4 10 12-15h-7l4-7z" className="gsa gsa-flash gbolt" />
          <rect x="82" y="38" width="16" height="12" rx="2" className="gbody" />
          <path d="M86 44h8" className="gok" />
        </Stage>
      )
    case 'off':
      return (
        <Stage>
          <path d="M46 52V36l14-10 14 10v16z" className="gwall" />
          <rect x="56" y="42" width="8" height="10" className="gwin" />
          <g className="gsa gsa-signal">
            <path d="M52 20a12 12 0 0 1 16 0" className="garc" />
            <path d="M47 15a19 19 0 0 1 26 0" className="garc" />
            <path d="M42 10a26 26 0 0 1 36 0" className="garc" />
          </g>
          <circle cx="60" cy="24" r="2" className="gok-dot" />
        </Stage>
      )
    case 'home':
      return (
        <Stage>
          <path d="M40 52V34l18-14 18 14v18z" className="gwall" />
          <path d="M36 36l22-18 22 18" className="groof" />
          <rect x="47" y="38" width="9" height="8" className="gwin gsa gsa-glow" />
          <rect x="61" y="38" width="9" height="8" className="gwin-d" />
          <rect x="86" y="24" width="6" height="22" rx="3" className="gbody" />
          <circle cx="89" cy="46" r="5" className="gwarm" />
          <path d="M89 42V30" className="gwarm-l gsa gsa-rise" />
        </Stage>
      )
    case 'cal':
      return (
        <Stage>
          <rect x="40" y="14" width="40" height="38" rx="4" className="gbody" />
          <path d="M40 24h40" className="gline-d" />
          <path d="M50 10v8M70 10v8" className="gline-d" />
          <path d="M50 38l7 6 13-13" className="gcheck gsa gsa-draw" pathLength={1} />
        </Stage>
      )
    case 'pin':
      return (
        <Stage>
          <path d="M14 56c22-10 40 4 60-6s30-2 38-6" className="groad" />
          <g className="gsa gsa-drop">
            <path d="M60 40c-8-8-12-13-12-19a12 12 0 0 1 24 0c0 6-4 11-12 19z" className="gpin" />
            <circle cx="60" cy="21" r="4" className="gpin-c" />
          </g>
        </Stage>
      )
    default:
      return <Stage>{null}</Stage>
  }
}
