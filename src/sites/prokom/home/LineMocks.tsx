import { useId, type ReactNode } from 'react'

/*
 * The Tech and Gaming pictures of the hub (Krystian 16.11: "bardziej premium"): a repair
 * progress ring and a frame graph. Illustration only — no figures, hidden from readers by the
 * caller; colours from the line tokens in CSS.
 */

/** A ring that fills to `value` (0–100) around its content, e.g. the device under repair. */
export function ProgressRing({ value, children }: { value: number; children: ReactNode }) {
  const left = 100 - Math.max(0, Math.min(100, value))
  return (
    <span className="pk-prog">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle className="pk-prog__bg" cx="20" cy="20" r="17" />
        <circle
          className="pk-prog__fg"
          cx="20"
          cy="20"
          r="17"
          pathLength={100}
          style={{ strokeDashoffset: left }}
        />
      </svg>
      {children}
    </span>
  )
}

/** Frame rate over a test run: an even line with small dips, like a good benchmark. */
const RAW_FPS = Array.from({ length: 25 }, (_, i) => {
  const wave = Math.sin(i * 0.9) * 0.14 + Math.sin(i * 2.3 + 1) * 0.04
  const dip = i === 9 || i === 17 ? -0.22 : 0
  return wave + dip
})
const LOW = Math.min(...RAW_FPS)
const HIGH = Math.max(...RAW_FPS)
/** The readings spread over 25–85% of the graph's height. */
const FPS_POINTS = RAW_FPS.map((v) => 0.25 + ((v - LOW) / (HIGH - LOW)) * 0.6)

/** A smooth path (Catmull-Rom as cubic Béziers) through points of 0–1 on a `w`×`h` box. */
export function smoothPath(points: readonly number[], w: number, h: number): string {
  if (points.length < 2) return ''
  const step = w / (points.length - 1)
  const xy = points.map((v, i) => [i * step, h - v * h] as const)
  let d = `M${xy[0]![0].toFixed(1)} ${xy[0]![1].toFixed(1)}`
  for (let i = 0; i < xy.length - 1; i++) {
    const p0 = xy[i - 1] ?? xy[i]!
    const p1 = xy[i]!
    const p2 = xy[i + 1]!
    const p3 = xy[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

const W = 300
const H = 100

/** The frame graph: gradient area, glowing line, grid, a scanning cursor and the live point. */
export function FpsGraph({ size }: { size: 'sm' | 'lg' }) {
  const id = useId().replace(/:/g, '')
  // The small tile keeps every other reading, flatter: a calm line at its size.
  const points =
    size === 'sm'
      ? FPS_POINTS.filter((_, i) => i % 2 === 0).map((v) => 0.55 + (v - 0.55) * 0.55)
      : FPS_POINTS
  const line = smoothPath(points, W, H)
  const last = points[points.length - 1] ?? 0
  return (
    <span className="pk-fps" data-size={size}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
            <stop className="pk-fps__stop" offset="0" />
            <stop className="pk-fps__stop pk-fps__stop--end" offset="1" />
          </linearGradient>
        </defs>
        {size === 'lg' &&
          [25, 50, 75].map((y) => (
            <line key={y} className="pk-fps__grid" x1="0" x2={W} y1={y} y2={y} />
          ))}
        <path className="pk-fps__area" d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#${id}a)`} />
        <path className="pk-fps__line" d={line} pathLength={100} />
      </svg>
      <i className="pk-fps__scan" />
      <i className="pk-fps__dot" style={{ bottom: `${(last * 100).toFixed(2)}%` }} />
    </span>
  )
}
