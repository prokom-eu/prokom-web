import { useId, type CSSProperties } from 'react'

import type { SiteVariant } from '@/lib/software/mockups'

/**
 * Pictures behind the hero of a site mock-up (ZMIANY-v24 §8, board `Vis.dc.html`): map with a pin
 * (wizytówka), aurora (firmowa), globe PL/EN/DE (rozbudowana), target (landing), the Gorce at night
 * (pensjonat), a steaming plate (restauracja), speed lines (przebudowa). Colours from `--mk-*`.
 */

const fill = (token: string): CSSProperties => ({ fill: `var(${token})` })
const stroke = (token: string): CSSProperties => ({ stroke: `var(${token})` })
const stop = (token: string): CSSProperties => ({ stopColor: `var(${token})` })

const BOX = { className: 'mk-art', viewBox: '0 0 640 260', preserveAspectRatio: 'xMidYMid slice' }

function Wizytowka() {
  return (
    <svg {...BOX} aria-hidden="true">
      <g fill="none" style={stroke('--mk-a-acc')}>
        <path d="M-20 205 L660 150" strokeOpacity=".07" strokeWidth="12" />
        <path d="M390 -20 L335 280" strokeOpacity=".07" strokeWidth="12" />
        <path
          d="M-20 92 L660 58 M205 -20 L245 280 M560 -20 L600 280"
          strokeOpacity=".05"
          strokeWidth="4"
        />
      </g>
      <path
        d="M246 246 C300 196 320 214 352 178 S420 128 476 118"
        style={stroke('--mk-a-acc')}
        strokeOpacity=".5"
        strokeWidth="2.4"
        strokeDasharray="1 7"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="354" cy="236" r="26" style={fill('--mk-a-acc')} fillOpacity=".09" />
      <circle cx="354" cy="236" r="13" style={fill('--mk-a-acc')} fillOpacity=".16" />
      <circle cx="354" cy="236" r="5" style={fill('--mk-a-acc')} />
    </svg>
  )
}

function Firmowa() {
  const id = useId()
  return (
    <svg {...BOX} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}a`}>
          <stop offset="0" style={stop('--mk-violet-2')} stopOpacity=".55" />
          <stop offset="1" style={stop('--mk-violet-2')} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}b`}>
          <stop offset="0" style={stop('--mk-art-teal')} stopOpacity=".28" />
          <stop offset="1" style={stop('--mk-art-teal')} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}d`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" style={fill('--mk-white')} fillOpacity=".07" />
        </pattern>
      </defs>
      <rect width="640" height="260" fill={`url(#${id}d)`} />
      <ellipse className="drift" cx="560" cy="30" rx="260" ry="190" fill={`url(#${id}a)`} />
      <ellipse cx="250" cy="300" rx="260" ry="120" fill={`url(#${id}b)`} />
      <g fill="none" style={stroke('--mk-violet-pale')} strokeOpacity=".18">
        <circle cx="560" cy="40" r="150" />
        <circle cx="560" cy="40" r="210" strokeDasharray="3 6" />
      </g>
    </svg>
  )
}

function Rozbudowana() {
  return (
    <svg {...BOX} aria-hidden="true">
      <g fill="none" style={stroke('--mk-f-acc-text')} strokeOpacity=".16" strokeWidth="1.3">
        <circle cx="372" cy="292" r="128" />
        <ellipse cx="372" cy="292" rx="64" ry="128" />
        <ellipse cx="372" cy="292" rx="110" ry="128" />
        <path d="M244 292 H500 M256 236 H488 M290 186 H454" />
      </g>
      <g style={fill('--mk-f-acc-text')}>
        <circle cx="300" cy="200" r="4" fillOpacity=".5" />
        <circle cx="430" cy="178" r="4" fillOpacity=".5" />
        <circle cx="352" cy="232" r="5" />
      </g>
      <path
        d="M300 200 Q326 210 352 232 Q392 196 430 178"
        fill="none"
        style={stroke('--mk-f-acc-text')}
        strokeOpacity=".45"
        strokeWidth="1.6"
        strokeDasharray="2 5"
      />
      <g
        fontFamily="Manrope, sans-serif"
        fontSize="9"
        fontWeight="800"
        style={fill('--mk-f-acc-text')}
        fillOpacity=".6"
      >
        <text x="288" y="192">
          EN
        </text>
        <text x="436" y="172">
          DE
        </text>
        <text x="360" y="246">
          PL
        </text>
      </g>
    </svg>
  )
}

function Landing() {
  return (
    <svg {...BOX} aria-hidden="true">
      <g fill="none" style={stroke('--mk-d-acc')}>
        <circle cx="318" cy="236" r="28" strokeOpacity=".35" strokeWidth="2" />
        <circle cx="318" cy="236" r="58" strokeOpacity=".2" />
        <circle cx="318" cy="236" r="92" strokeOpacity=".12" />
        <circle cx="318" cy="236" r="130" strokeOpacity=".07" />
      </g>
      <circle cx="318" cy="236" r="7" style={fill('--mk-d-acc')} />
      <path
        d="M250 150 L312 230"
        style={stroke('--mk-d-acc')}
        strokeOpacity=".55"
        strokeWidth="2"
        strokeDasharray="3 6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Stars of the night sky over the Gorce: x, y, radius, delay of the twinkle (s). */
const STARS: [number, number, number, number][] = [
  [250, 30, 1.2, 0],
  [300, 70, 1, 1.1],
  [352, 22, 1.4, 0.5],
  [205, 58, 0.9, 2],
  [470, 236, 1, 1.6],
  [560, 232, 1.2, 0.8],
  [620, 40, 1, 2.4],
  [400, 96, 0.8, 1.3],
]

function Pensjonat() {
  const id = useId()
  return (
    <svg {...BOX} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}m`}>
          <stop offset="0" style={stop('--mk-art-moon')} stopOpacity=".55" />
          <stop offset="1" style={stop('--mk-art-moon')} stopOpacity="0" />
        </radialGradient>
      </defs>
      {STARS.map(([cx, cy, r, delay]) => (
        <circle
          key={`${cx}-${cy}`}
          className="tw"
          cx={cx}
          cy={cy}
          r={r}
          fillOpacity=".7"
          style={{ ...fill('--mk-b-page'), animationDelay: `${delay}s` }}
        />
      ))}
      <circle cx="338" cy="40" r="46" fill={`url(#${id}m)`} />
      <circle cx="338" cy="40" r="12" style={fill('--mk-art-moon-core')} />
      <path
        d="M-10 262 L-10 200 L60 160 L120 190 L190 130 L250 175 L320 140 L400 185 L470 150 L560 190 L650 160 L650 262Z"
        style={fill('--mk-art-hill')}
      />
      <path
        d="M-10 262 L-10 222 L80 196 L160 222 L240 184 L330 214 L420 190 L520 222 L600 200 L650 214 L650 262Z"
        style={fill('--mk-art-hill-2')}
      />
      <path
        d="M-10 262 L-10 242 L120 228 L260 246 L400 226 L540 244 L650 232 L650 262Z"
        style={fill('--mk-art-hill-3')}
      />
    </svg>
  )
}

function Restauracja() {
  return (
    <svg {...BOX} aria-hidden="true">
      <g fill="none" style={stroke('--mk-c-acc')}>
        <circle cx="300" cy="270" r="60" strokeOpacity=".12" strokeWidth="2" />
        <circle cx="300" cy="270" r="94" strokeOpacity=".08" strokeWidth="1.5" />
        <circle cx="300" cy="270" r="130" strokeOpacity=".05" />
        <path
          className="drift"
          d="M282 216 c-10 -14 10 -22 0 -36 M304 210 c-10 -14 10 -22 0 -36 M326 216 c-10 -14 10 -22 0 -36"
          strokeOpacity=".28"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
      <g style={fill('--mk-art-leaf')} fillOpacity=".22">
        <path d="M560 220 c30 -20 60 -10 70 10 c-30 14 -55 8 -70 -10z" />
        <path d="M590 250 c20 -30 50 -32 62 -20 c-22 22 -44 26 -62 20z" />
      </g>
    </svg>
  )
}

function Przebudowa() {
  const id = useId()
  return (
    <svg {...BOX} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}l`} x1="0" x2="1">
          <stop offset="0" style={stop('--mk-violet-2')} stopOpacity="0" />
          <stop offset="1" style={stop('--mk-violet-2')} stopOpacity=".55" />
        </linearGradient>
      </defs>
      <g className="drift" stroke={`url(#${id}l)`} strokeLinecap="round">
        <path d="M180 70 H420" strokeWidth="2" />
        <path d="M240 110 H440" strokeWidth="3" />
        <path d="M150 150 H400" strokeWidth="1.5" />
        <path d="M260 196 H460" strokeWidth="2.5" />
        <path d="M300 236 H500" strokeWidth="1.5" />
      </g>
      <circle cx="560" cy="40" r="170" style={fill('--mk-violet-2')} fillOpacity=".08" />
    </svg>
  )
}

const ARTS: Partial<Record<SiteVariant, () => React.JSX.Element>> = {
  wizytowka: Wizytowka,
  firmowa: Firmowa,
  rozbudowana: Rozbudowana,
  landing: Landing,
  pensjonat: Pensjonat,
  restauracja: Restauracja,
  przebudowa: Przebudowa,
}

/** The picture of the variant, or the plain blob of the board for the others. */
export function HeroArt({ variant }: { variant: SiteVariant }) {
  const Art = ARTS[variant]
  return Art ? <Art /> : <div className="mk-blob" />
}
