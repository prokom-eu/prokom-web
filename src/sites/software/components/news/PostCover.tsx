import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { coverMotif, type CoverMotif } from '@/lib/software/postCovers'

/**
 * The cover of a Software post (decision of Krystian 15.11): a scene of its topic drawn in SVG on
 * the Aurora panel of its category (`.sw-art`, colours only from tokens: `--cover-*`,
 * `--news-art-*`). One component for the card, the featured post and the post header; the scene
 * is drawn in 320 × 200 and shown cropped to its middle 260 × 170 (main object in the middle
 * 170 × 140), so the phone's square
 * thumbnail (`subpages.css`, zoomed in) still shows it. Decorative: the title says it all.
 */
export function PostCover({
  slug,
  category,
  className,
}: {
  slug: string
  category: string
  className?: string
}) {
  const motif = coverMotif(slug, category)
  return (
    <span
      aria-hidden="true"
      data-card-media
      data-cat={category}
      data-cover={motif}
      className={cx('sw-art', className)}
    >
      <i className="sw-art-orb" />
      <CoverScene motif={motif} className="sw-cover" />
    </span>
  )
}

/**
 * The scene alone, drawn by the `cv-*` classes of `subpages.css`: in the page (`PostCover`) and,
 * with those rules inlined, in the sharing image (`sites/software/og/card.tsx`).
 */
export function CoverScene({
  motif,
  className,
  width,
  height,
}: {
  motif: CoverMotif
  className?: string
  width?: number
  height?: number
}) {
  return (
    <svg
      className={className}
      viewBox="30 15 260 170"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <Stars />
      {SCENES[motif]}
    </svg>
  )
}

/** A few faint stars behind every scene (the Aurora sky). */
function Stars() {
  return (
    <g className="cv-stars">
      {[
        [24, 30, 1.2],
        [58, 168, 1],
        [92, 22, 0.8],
        [270, 26, 1.1],
        [298, 92, 0.9],
        [262, 172, 1.2],
        [36, 108, 0.8],
        [214, 18, 0.7],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
    </g>
  )
}

/** A browser window: frame, top bar, three dots. */
function Win({
  x,
  y,
  w,
  h,
  strong = false,
}: {
  x: number
  y: number
  w: number
  h: number
  strong?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} className={strong ? 'cv-p2' : 'cv-p'} />
      <line x1={x} y1={y + 14} x2={x + w} y2={y + 14} className="cv-hair" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 9 + i * 7} cy={y + 7} r={2} className="cv-i2" />
      ))}
    </g>
  )
}

const Bar = ({
  x,
  y,
  w,
  h = 6,
  c = 'cv-i2',
}: {
  x: number
  y: number
  w: number
  h?: number
  c?: string
}) => <rect x={x} y={y} width={w} height={h} rx={h / 2} className={c} />

/** Points of a five-pointed star. */
const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.45
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`
  }).join(' ')

const Check = ({ cx, cy, r = 9 }: { cx: number; cy: number; r?: number }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} className="cv-ok" />
    <polyline
      points={`${cx - r * 0.42},${cy} ${cx - r * 0.08},${cy + r * 0.36} ${cx + r * 0.45},${cy - r * 0.34}`}
      className="cv-on-solid"
    />
  </g>
)

const SCENES: Record<CoverMotif, ReactNode> = {
  // Ile kosztuje strona: the layers of the work and a price tag.
  price: (
    <g>
      <rect x={122} y={52} width={118} height={80} rx={12} className="cv-p" />
      <rect x={108} y={66} width={118} height={82} rx={12} className="cv-p" />
      <rect x={92} y={80} width={124} height={88} rx={12} className="cv-p2" />
      <Bar x={106} y={98} w={58} h={8} c="cv-i" />
      <Bar x={106} y={114} w={88} />
      <Bar x={106} y={127} w={70} />
      <rect x={106} y={144} width={28} height={14} rx={7} className="cv-hs" />
      <circle cx={127} cy={151} r={5} className="cv-i" />
      <Bar x={142} y={148} w={40} />
      <path d="M190 74 C176 66 164 72 156 82" className="cv-l" />
      <g transform="rotate(-16 220 74)" className="cv-glow">
        <path d="M196 56 h44 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-44 l-14 -19 z" className="cv-h" />
        <circle cx={197} cy={75} r={4} className="cv-base" />
        <rect x={210} y={67} width={28} height={6} rx={3} className="cv-base" />
        <rect x={210} y={78} width={18} height={5} rx={2.5} className="cv-base" />
      </g>
    </g>
  ),
  // Excel przestaje wystarczać: a sheet with the selection, rows flowing into a dashboard.
  sheet: (
    <g>
      <rect x={62} y={46} width={160} height={108} rx={10} className="cv-p" />
      <rect x={62} y={46} width={160} height={18} rx={10} className="cv-p2" />
      {[102, 142, 182].map((x) => (
        <line key={x} x1={x} y1={46} x2={x} y2={154} className="cv-hair" />
      ))}
      {[82, 100, 118, 136].map((y) => (
        <line key={y} x1={62} y1={y} x2={222} y2={y} className="cv-hair" />
      ))}
      <rect x={102} y={82} width={40} height={18} className="cv-hs" />
      <rect x={142} y={118} width={40} height={18} className="cv-hs" />
      <rect x={142} y={100} width={40} height={18} className="cv-hl cv-none" />
      <circle cx={182} cy={118} r={3.5} className="cv-h" />
      {[
        [68, 70],
        [108, 70],
        [148, 70],
        [68, 88],
        [68, 106],
        [108, 106],
        [68, 124],
        [108, 142],
        [68, 142],
      ].map(([x, y]) => (
        <Bar key={`${x}-${y}`} x={x!} y={y!} w={26} h={5} />
      ))}
      <g className="cv-glow">
        <rect x={204} y={92} width={78} height={70} rx={12} className="cv-p2" />
        <rect x={216} y={136} width={9} height={14} rx={2} className="cv-i2" />
        <rect x={230} y={126} width={9} height={24} rx={2} className="cv-i2" />
        <rect x={244} y={114} width={9} height={36} rx={2} className="cv-h" />
        <rect x={258} y={104} width={9} height={46} rx={2} className="cv-h" />
        <Bar x={216} y={102} w={30} h={5} c="cv-i" />
      </g>
      <path d="M150 166 C172 180 196 176 214 166" className="cv-hline" />
      <polyline points="206,162 214,166 208,173" className="cv-hline" />
    </g>
  ),
  // Wizytówka czy strona z panelem: a one-page card beside a page with its panel.
  compare: (
    <g>
      <Win x={58} y={64} w={90} h={84} />
      <rect x={68} y={86} width={70} height={26} rx={6} className="cv-i2" />
      <Bar x={68} y={120} w={52} />
      <Bar x={68} y={132} w={38} />
      <g className="cv-glow">
        <Win x={170} y={44} w={104} h={116} strong />
        <rect x={170} y={58} width={28} height={102} className="cv-hs" />
        {[70, 84, 98, 112].map((y, i) => (
          <Bar key={y} x={176} y={y} w={16} h={5} c={i === 1 ? 'cv-i' : 'cv-i2'} />
        ))}
        <Bar x={208} y={70} w={54} h={7} c="cv-i" />
        <Bar x={208} y={84} w={40} />
        {[104, 124, 142].map((y, i) => (
          <g key={y}>
            <rect
              x={208}
              y={y}
              width={24}
              height={12}
              rx={6}
              className={i === 2 ? 'cv-i2' : 'cv-h'}
            />
            <circle cx={i === 2 ? 214 : 226} cy={y + 6} r={4} className="cv-i" />
            <Bar x={238} y={y + 3} w={26} />
          </g>
        ))}
      </g>
      <circle cx={159} cy={106} r={12} className="cv-badge" />
      <path d="M153 103 h12 m-4 -4 l4 4 l-4 4 M165 110 h-12 m4 -4 l-4 4 l4 4" className="cv-thin" />
    </g>
  ),
  // Automatyzacje: a message goes in, the work runs itself, a check comes out.
  flow: (
    <g>
      <path d="M114 100 H130" className="cv-hline cv-dash" />
      <path d="M190 100 H206" className="cv-hline cv-dash" />
      <circle cx={90} cy={100} r={24} className="cv-p2" />
      <rect x={78} y={91} width={24} height={18} rx={3} className="cv-stroke" />
      <polyline points="78,92 90,101 102,92" className="cv-stroke" />
      <g className="cv-glow">
        <circle cx={160} cy={100} r={30} className="cv-hs" />
        <circle cx={160} cy={100} r={18} className="cv-teeth" />
        <circle cx={160} cy={100} r={12} className="cv-stroke-b" />
        <circle cx={160} cy={100} r={4} className="cv-i" />
      </g>
      <circle cx={230} cy={100} r={24} className="cv-p2" />
      <polyline points="219,100 227,108 242,92" className="cv-okline" />
      <rect x={118} y={56} width={30} height={18} rx={5} className="cv-p" />
      <Bar x={124} y={62} w={18} h={5} />
      <rect x={174} y={128} width={34} height={18} rx={5} className="cv-p" />
      <Bar x={180} y={134} w={22} h={5} />
      <circle cx={142} cy={146} r={3} className="cv-h" />
      <circle cx={186} cy={58} r={3} className="cv-h" />
    </g>
  ),
  // Bezpieczeństwo raz w miesiącu: the shield, the month ticked off, the refresh.
  shield: (
    <g>
      <rect x={52} y={62} width={50} height={54} rx={8} className="cv-p" />
      <rect x={52} y={62} width={50} height={12} rx={6} className="cv-p2" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={64 + col * 13}
            cy={84 + row * 11}
            r={3.4}
            className={row * 3 + col < 4 ? 'cv-ok' : 'cv-i2'}
          />
        )),
      )}
      <g className="cv-glow">
        <path
          d="M160 40 L206 58 V98 C206 130 186 152 160 162 C134 152 114 130 114 98 V58 Z"
          className="cv-hs cv-hl"
        />
        <path
          d="M160 56 L192 69 V98 C192 122 178 138 160 146 C142 138 128 122 128 98 V69 Z"
          className="cv-p2"
        />
        <polyline points="143,100 156,113 180,88" className="cv-check" />
      </g>
      <circle cx={240} cy={84} r={18} className="cv-p2" />
      <path d="M230 84 A10 10 0 1 1 240 94" className="cv-hline" />
      <polyline points="236,89 240,94 236,99" className="cv-hline" />
      <rect x={220} y={112} width={40} height={10} rx={5} className="cv-p" />
      <Bar x={226} y={115} w={24} h={4} />
    </g>
  ),
  // Wolna strona na telefonie: the phone, the speed gauge, three web vitals.
  speed: (
    <g>
      <path d="M98 66 l-12 24 h11 l-6 22 l20 -29 h-11 l7 -17 z" className="cv-h cv-glow" />
      <g>
        <rect x={126} y={28} width={68} height={144} rx={16} className="cv-p2" />
        <rect x={150} y={36} width={20} height={5} rx={2.5} className="cv-i2" />
        <path d="M136 98 A24 24 0 0 1 184 98" className="cv-arc" />
        <path d="M136 98 A24 24 0 0 1 174.1 78.6" className="cv-arc-h cv-glow" />
        <line x1={160} y1={98} x2={172} y2={83} className="cv-needle" />
        <circle cx={160} cy={98} r={4} className="cv-i" />
        <Bar x={140} y={114} w={40} />
        <Bar x={140} y={126} w={28} />
        <circle cx={145} cy={150} r={5.5} className="cv-ok" />
        <circle cx={160} cy={150} r={5.5} className="cv-ok" />
        <circle cx={175} cy={150} r={5.5} className="cv-h" />
      </g>
      <circle cx={232} cy={96} r={20} className="cv-spin" />
      <circle cx={232} cy={96} r={20} className="cv-spin-h" />
      <Bar x={214} y={128} w={36} h={5} />
    </g>
  ),
  // Program na zamówienie czy abonament: the scales — own code against the monthly cycle.
  scale: (
    <g>
      <rect x={157} y={70} width={6} height={84} rx={3} className="cv-i2" />
      <rect x={132} y={152} width={56} height={9} rx={4.5} className="cv-i2" />
      <line x1={94} y1={76} x2={226} y2={62} className="cv-beam" />
      <circle cx={160} cy={68} r={7} className="cv-h cv-glow" />
      <polyline points="78,106 94,76 110,106" className="cv-thin" />
      <polyline points="210,92 226,62 242,92" className="cv-thin" />
      <path d="M72 106 h44 a22 9 0 0 1 -44 0 z" className="cv-p2" />
      <path d="M204 92 h44 a22 9 0 0 1 -44 0 z" className="cv-p2" />
      <rect x={80} y={84} width={28} height={22} rx={5} className="cv-hs cv-hl" />
      <polyline points="90,90 86,95 90,100" className="cv-thin-i" />
      <polyline points="98,90 102,95 98,100" className="cv-thin-i" />
      <path d="M216 78 A10 10 0 1 1 226 88" className="cv-hline" />
      <polyline points="222,84 226,88 222,92" className="cv-hline" />
    </g>
  ),
  // Co przygotować przed zamówieniem: the checklist, the photos, the domain.
  checklist: (
    <g>
      <g transform="rotate(-10 82 92)">
        <rect x={56} y={70} width={52} height={42} rx={7} className="cv-p" />
        <polygon points="62,106 76,90 86,100 93,93 102,106" className="cv-hs" />
        <circle cx={94} cy={81} r={4} className="cv-i" />
      </g>
      <rect x={112} y={42} width={96} height={126} rx={12} className="cv-p2" />
      <rect x={140} y={35} width={40} height={14} rx={5} className="cv-h cv-glow" />
      {[74, 102, 130].map((y, i) =>
        i < 2 ? (
          <g key={y}>
            <rect x={126} y={y - 8} width={16} height={16} rx={4} className="cv-ok" />
            <polyline
              points={`${130},${y} ${133},${y + 3} ${139},${y - 4}`}
              className="cv-on-solid"
            />
            <Bar x={150} y={y - 4} w={44} h={7} c="cv-i" />
          </g>
        ) : (
          <g key={y}>
            <rect x={126} y={y - 8} width={16} height={16} rx={4} className="cv-stroke" />
            <Bar x={150} y={y - 4} w={36} h={7} />
          </g>
        ),
      )}
      <Bar x={126} y={150} w={60} h={5} />
      <circle cx={238} cy={118} r={20} className="cv-p cv-stroke" />
      <ellipse cx={238} cy={118} rx={8} ry={20} className="cv-stroke" />
      <line x1={218} y1={118} x2={258} y2={118} className="cv-thin" />
    </g>
  ),
  // Asystent AI na stronie: a question, an answer, a spark.
  chat: (
    <g>
      <rect x={74} y={52} width={124} height={48} rx={16} className="cv-p2" />
      <path d="M90 100 l-6 14 l18 -14 z" className="cv-p2" />
      <Bar x={90} y={66} w={80} h={7} c="cv-i" />
      <Bar x={90} y={80} w={56} />
      <g className="cv-glow">
        <rect x={122} y={110} width={126} height={50} rx={16} className="cv-hs cv-hl" />
        <path d="M232 160 l8 12 l-22 -12 z" className="cv-hs" />
        <Bar x={138} y={124} w={92} h={6} c="cv-i" />
        <Bar x={138} y={137} w={70} h={6} c="cv-i" />
        <Bar x={138} y={148} w={44} h={5} />
      </g>
      <path
        d="M236 40 Q238 56 254 58 Q238 60 236 76 Q234 60 218 58 Q234 56 236 40 Z"
        className="cv-h cv-glow"
      />
      <path
        d="M262 84 Q263 91 270 92 Q263 93 262 100 Q261 93 254 92 Q261 91 262 84 Z"
        className="cv-i"
      />
    </g>
  ),
  // Firma w Mapach Google: the folded map, the road, the pin and the stars.
  map: (
    <g>
      <polygon points="68,66 118,54 118,150 68,162" className="cv-p" />
      <polygon points="118,54 168,66 168,162 118,150" className="cv-p2" />
      <polygon points="168,66 218,54 218,150 168,162" className="cv-p" />
      <path d="M74 140 C98 118 124 128 146 108 S196 90 214 74" className="cv-road" />
      <path d="M90 74 C110 96 150 100 170 132" className="cv-road cv-road-thin" />
      <ellipse cx={154} cy={132} rx={14} ry={4} className="cv-shadow" />
      <g className="cv-glow">
        <path
          d="M154 130 C154 130 132 106 132 90 a22 22 0 0 1 44 0 c0 16 -22 40 -22 40 z"
          className="cv-h"
        />
        <circle cx={154} cy={90} r={8} className="cv-base" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <polygon key={i} points={star(216 + i * 15, 38, 6)} className="cv-h" />
      ))}
    </g>
  ),
  // Zlecenia i grafik ekip: the week planned, crews on their jobs.
  schedule: (
    <g>
      <rect x={62} y={44} width={196} height={116} rx={12} className="cv-p" />
      <rect x={62} y={44} width={196} height={22} rx={11} className="cv-p2" />
      {[101, 140, 180, 219].map((x) => (
        <line key={x} x1={x} y1={66} x2={x} y2={160} className="cv-hair" />
      ))}
      {[72, 111, 150, 190, 229].map((x) => (
        <Bar key={x} x={x} y={52} w={20} h={5} />
      ))}
      {(
        [
          [68, 76, 70, 'cv-h'],
          [186, 76, 66, 'cv-i2'],
          [106, 96, 82, 'cv-hs'],
          [70, 116, 56, 'cv-i2'],
          [146, 116, 106, 'cv-h'],
          [88, 136, 92, 'cv-hs'],
          [196, 136, 56, 'cv-i2'],
        ] as const
      ).map(([x, y, w, c]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={w} height={14} rx={4} className={c} />
          <circle cx={x + 7} cy={y + 7} r={3.5} className="cv-i" />
        </g>
      ))}
    </g>
  ),
  // Kiedy przebudować starą stronę: the crooked old one, the clean new one.
  rebuild: (
    <g>
      <g transform="rotate(-7 106 100)">
        <rect x={64} y={60} width={86} height={82} rx={8} className="cv-old" />
        <rect x={74} y={76} width={50} height={18} rx={2} className="cv-i2" />
        <Bar x={74} y={102} w={64} h={5} />
        <Bar x={80} y={113} w={44} h={5} />
        <Bar x={74} y={124} w={56} h={5} />
        <polyline points="128,60 120,84 132,96 122,120" className="cv-crack" />
      </g>
      <path d="M150 104 H172" className="cv-hline" />
      <polyline points="166,98 172,104 166,110" className="cv-hline" />
      <g className="cv-glow">
        <Win x={176} y={48} w={92} h={106} strong />
        <rect x={186} y={72} width={72} height={30} rx={7} className="cv-hs" />
        <Bar x={192} y={80} w={40} h={6} c="cv-i" />
        {[186, 211, 236].map((x) => (
          <rect key={x} x={x} y={110} width={22} height={18} rx={4} className="cv-p" />
        ))}
        <rect x={186} y={136} width={38} height={10} rx={5} className="cv-h" />
      </g>
    </g>
  ),
  // Kto ma dostępy: the key ring of domain, hosting and code, each key labelled.
  keys: (
    <g>
      <circle cx={160} cy={58} r={18} className="cv-ring" />
      {(
        [
          [140, 80, 22, 'cv-p2'],
          [160, 84, 0, 'cv-h'],
          [180, 80, -22, 'cv-p2'],
        ] as const
      ).map(([x, y, a, head]) => (
        <g
          key={x}
          transform={`translate(${x} ${y}) rotate(${a})`}
          className={head === 'cv-h' ? 'cv-glow' : undefined}
        >
          <circle cx={0} cy={0} r={11} className={head} />
          <circle cx={0} cy={0} r={4} className="cv-base" />
          <rect x={-3} y={10} width={6} height={50} rx={3} className="cv-i" />
          <rect x={3} y={44} width={9} height={5} rx={1.5} className="cv-i" />
          <rect x={3} y={53} width={6} height={5} rx={1.5} className="cv-i" />
        </g>
      ))}
      <rect x={62} y={112} width={54} height={24} rx={7} className="cv-p" />
      <circle cx={72} cy={124} r={3} className="cv-h" />
      <Bar x={80} y={121} w={28} h={6} />
      <rect x={206} y={112} width={54} height={24} rx={7} className="cv-p" />
      <circle cx={216} cy={124} r={3} className="cv-h" />
      <Bar x={224} y={121} w={28} h={6} />
      <path d="M116 124 C126 124 130 112 134 104" className="cv-thin" />
      <path d="M206 124 C196 124 190 112 186 104" className="cv-thin" />
    </g>
  ),
  // Rezerwacje bez prowizji: the calendar with the stay chosen, the room confirmed.
  booking: (
    <g>
      <rect x={64} y={46} width={124} height={114} rx={12} className="cv-p2" />
      <rect x={64} y={46} width={124} height={24} rx={12} className="cv-h" />
      <rect x={88} y={40} width={6} height={14} rx={3} className="cv-i" />
      <rect x={158} y={40} width={6} height={14} rx={3} className="cv-i" />
      {Array.from({ length: 20 }, (_, i) => {
        const col = i % 5
        const row = Math.floor(i / 5)
        const c = i >= 7 && i <= 10 ? 'cv-h' : [2, 3, 15, 16, 17].includes(i) ? 'cv-hs' : 'cv-p'
        return (
          <rect
            key={i}
            x={74 + col * 22}
            y={80 + row * 19}
            width={16}
            height={13}
            rx={3}
            className={c}
          />
        )
      })}
      <g className="cv-glow">
        <rect x={196} y={78} width={68} height={66} rx={12} className="cv-p" />
        <rect x={208} y={116} width={44} height={11} rx={3} className="cv-i" />
        <rect x={210} y={104} width={14} height={9} rx={3} className="cv-i2" />
        <rect x={206} y={98} width={4} height={30} rx={2} className="cv-i" />
      </g>
      <Check cx={260} cy={80} r={10} />
    </g>
  ),
  // Czy potrzebuję sklepu: the cart with goods, a product card with „add”.
  cart: (
    <g>
      <path d="M64 60 h18 l18 66 h82 l16 -48 H94" className="cv-cart" />
      <circle cx={110} cy={146} r={8} className="cv-i" />
      <circle cx={170} cy={146} r={8} className="cv-i" />
      <rect x={108} y={86} width={26} height={30} rx={5} className="cv-h" />
      <rect x={138} y={78} width={22} height={38} rx={5} className="cv-hs cv-hl" />
      <rect x={164} y={92} width={20} height={24} rx={5} className="cv-p2" />
      <g className="cv-glow">
        <rect x={208} y={52} width={60} height={80} rx={12} className="cv-p2" />
        <rect x={216} y={60} width={44} height={30} rx={7} className="cv-hs" />
        <Bar x={216} y={98} w={36} h={6} c="cv-i" />
        <Bar x={216} y={110} w={24} h={5} />
        <circle cx={256} cy={120} r={9} className="cv-h" />
        <path d="M252 120 h8 M256 116 v8" className="cv-plus" />
      </g>
    </g>
  ),
  // System etapami: steps done one by one, the next one dashed, a flag at the top.
  stairs: (
    <g>
      <rect x={70} y={128} width={42} height={34} rx={7} className="cv-p" />
      <rect x={112} y={104} width={42} height={58} rx={7} className="cv-p2" />
      <rect x={154} y={80} width={42} height={82} rx={7} className="cv-hs cv-hl cv-glow" />
      <rect x={196} y={56} width={42} height={106} rx={7} className="cv-future" />
      <Check cx={91} cy={118} r={8} />
      <Check cx={133} cy={94} r={8} />
      <Check cx={175} cy={70} r={8} />
      <line x1={217} y1={56} x2={217} y2={28} className="cv-pole" />
      <polygon points="217,28 242,35 217,42" className="cv-h cv-glow" />
    </g>
  ),
  // Umowa na stronę: the numbered points, the signature, the seal and the pen.
  contract: (
    <g>
      <rect x={100} y={34} width={108} height={136} rx={10} className="cv-p2" />
      <path d="M186 34 h12 a10 10 0 0 1 10 10 v12 z" className="cv-p" />
      <Bar x={114} y={50} w={58} h={8} c="cv-i" />
      {[70, 84, 98, 112, 126].map((y) => (
        <g key={y}>
          <circle cx={117} cy={y + 3} r={3} className="cv-h" />
          <Bar x={126} y={y} w={y === 98 ? 50 : 66} />
        </g>
      ))}
      <path d="M116 152 c8 -12 14 8 22 -4 s12 -10 18 2 s10 6 16 -6" className="cv-sign" />
      <g className="cv-glow">
        <circle cx={204} cy={144} r={19} className="cv-h" />
        <circle cx={204} cy={144} r={12} className="cv-seal" />
        <polyline points="198,144 202,148 210,140" className="cv-on-solid" />
      </g>
      <g transform="rotate(32 238 92)">
        <rect x={232} y={48} width={11} height={70} rx={4} className="cv-i" />
        <polygon points="232,118 243,118 237.5,132" className="cv-hs" />
      </g>
    </g>
  ),
  // Menu restauracji: the phone with the menu, a plate, the QR on the table.
  menu: (
    <g>
      <circle cx={84} cy={110} r={28} className="cv-p" />
      <circle cx={84} cy={110} r={18} className="cv-stroke" />
      <rect x={48} y={88} width={4} height={46} rx={2} className="cv-i2" />
      <g className="cv-glow">
        <rect x={124} y={26} width={72} height={148} rx={16} className="cv-p2" />
      </g>
      <rect x={150} y={34} width={20} height={5} rx={2.5} className="cv-i2" />
      <rect x={134} y={46} width={52} height={26} rx={7} className="cv-hs" />
      {[84, 102, 120, 138].map((y) => (
        <g key={y}>
          <Bar x={134} y={y} w={24} h={6} c="cv-i" />
          <line x1={161} y1={y + 3} x2={172} y2={y + 3} className="cv-dots" />
          <Bar x={175} y={y} w={11} h={6} c="cv-h" />
        </g>
      ))}
      <Bar x={134} y={156} w={52} h={9} c="cv-h" />
      <rect x={212} y={86} width={40} height={40} rx={7} className="cv-p" />
      {[
        [218, 92],
        [238, 92],
        [218, 112],
        [230, 104],
        [240, 114],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={8} rx={1.5} className="cv-i" />
      ))}
    </g>
  ),
  // Aplikacja czy dobra strona: the same layout in the browser and on the phone.
  devices: (
    <g>
      <Win x={60} y={48} w={152} h={102} />
      <rect x={70} y={72} width={82} height={32} rx={7} className="cv-hs" />
      <rect x={160} y={72} width={42} height={32} rx={7} className="cv-p2" />
      {[70, 115, 160].map((x) => (
        <rect key={x} x={x} y={112} width={42} height={28} rx={6} className="cv-p" />
      ))}
      <g className="cv-glow">
        <rect x={196} y={66} width={56} height={104} rx={12} className="cv-p2 cv-hl" />
        <rect x={214} y={72} width={20} height={4} rx={2} className="cv-i2" />
        <rect x={204} y={84} width={40} height={24} rx={6} className="cv-hs" />
        <rect x={204} y={114} width={40} height={14} rx={4} className="cv-p" />
        <rect x={204} y={132} width={40} height={14} rx={4} className="cv-p" />
        {[210, 224, 238].map((x, i) => (
          <circle key={x} cx={x} cy={158} r={3} className={i === 0 ? 'cv-h' : 'cv-i2'} />
        ))}
      </g>
    </g>
  ),
  // Ustawa o dostępności: the figure in the ring, contrast, text size and focus.
  access: (
    <g>
      <circle cx={84} cy={80} r={17} className="cv-stroke" />
      <path d="M84 63 A17 17 0 0 1 84 97 Z" className="cv-i" />
      <g className="cv-glow">
        <circle cx={160} cy={100} r={50} className="cv-hs cv-hl" />
      </g>
      <circle cx={160} cy={72} r={8} className="cv-i" />
      <path d="M134 88 H186 M160 88 V114 L146 138 M160 114 L174 138" className="cv-figure" />
      <rect x={210} y={60} width={52} height={26} rx={9} className="cv-focus" />
      <Bar x={220} y={70} w={32} h={6} c="cv-i" />
      <rect x={222} y={108} width={9} height={30} rx={2} className="cv-i" />
      <rect x={236} y={120} width={7} height={18} rx={2} className="cv-i2" />
      <Bar x={72} y={120} w={28} h={6} />
      <Bar x={72} y={132} w={20} h={6} c="cv-i" />
    </g>
  ),
  // WordPress czy strona od zera: the code of the page itself.
  code: (
    <g>
      <Win x={78} y={44} w={164} h={112} strong />
      {(
        [
          [90, 70, 40, 'cv-h'],
          [100, 82, 66, 'cv-i'],
          [110, 94, 50, 'cv-i2'],
          [110, 106, 76, 'cv-hs'],
          [100, 118, 44, 'cv-i'],
          [90, 130, 30, 'cv-h'],
        ] as const
      ).map(([x, y, w, c]) => (
        <Bar key={y} x={x} y={y} w={w} h={6} c={c} />
      ))}
      <g className="cv-glow">
        <circle cx={238} cy={146} r={22} className="cv-h" />
        <polyline points="230,139 223,146 230,153" className="cv-on-solid" />
        <polyline points="246,139 253,146 246,153" className="cv-on-solid" />
        <line x1={241} y1={137} x2={235} y2={155} className="cv-on-solid" />
      </g>
    </g>
  ),
}
