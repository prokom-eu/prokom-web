'use client'

import { useEffect, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { onAuditScan, SCAN_HOST_FALLBACK } from '@/lib/software/auditScan'

export type ScanRow = { icon: IconName; title: string; text: string | null; status: 'fix' | 'good' }

type Props = {
  title: string
  /** „twojafirma.pl · raport” — the part after the host stays, the host follows the scan. */
  subtitle: string | null
  badge: string | null
  rows: ScanRow[]
}

/** One row after another gets its badge (ms); the bar sweeps over all of them. */
const ROW_STEP_MS = 520

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The sample card „Audyt strony · przykład” of `/audyt` (ZMIANY-v24 §9.1, board `AU-audyt`): the
 * five checks with sample results. „Skanuj podgląd →” in the form (`requestAuditScan`) plays it:
 * the bar sweeps and the rows get their badges one by one. A demonstration, not a result — signed
 * „przykład” and hidden from screen readers like the mock-ups; with reduced motion it only swaps
 * the address. At rest it shows the finished sample, so the page never looks empty.
 */
export function AuditScanCard({ title, subtitle, badge, rows }: Props) {
  const [host, setHost] = useState(SCAN_HOST_FALLBACK)
  /** Rows with their badge shown; `rows.length` = the finished sample. */
  const [shown, setShown] = useState(rows.length)
  const [scanning, setScanning] = useState(false)
  /** Bumped on every scan: a new key restarts the bar even mid-sweep. */
  const [run, setRun] = useState(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const clear = () => {
      for (const timer of timers.current) window.clearTimeout(timer)
      timers.current = []
    }
    const off = onAuditScan((next) => {
      clear()
      setHost(next)
      if (prefersReducedMotion()) {
        setShown(rows.length)
        setScanning(false)
        return
      }
      setShown(0)
      setScanning(true)
      setRun((count) => count + 1)
      rows.forEach((_, i) => {
        timers.current.push(window.setTimeout(() => setShown(i + 1), ROW_STEP_MS * (i + 1)))
      })
      timers.current.push(
        window.setTimeout(() => setScanning(false), ROW_STEP_MS * (rows.length + 1)),
      )
    })
    return () => {
      off()
      clear()
    }
  }, [rows])

  // „twojafirma.pl · raport”: the host before „·” follows the scan; no „·” — the text stays.
  const parts = subtitle?.split('·') ?? []
  const caption =
    parts.length > 1 ? `${host} · ${parts.slice(1).join('·').trim()}` : (subtitle ?? host)
  return (
    <div aria-hidden="true" className="sw-scan" data-scanning={scanning || undefined}>
      <div className="sw-scan-head">
        <div>
          <p className="font-display text-lg font-extrabold">{title}</p>
          <p className="text-xs opacity-85">{caption}</p>
        </div>
        {badge ? <span className="sw-scan-badge">{badge}</span> : null}
      </div>
      <ul key={run} className="sw-scan-rows">
        {rows.map((row, i) => (
          <li key={row.title} className="sw-scan-row">
            <span className="sw-scan-icon">
              <Icon name={row.icon} className="size-4" />
            </span>
            <span className="min-w-0">
              <b className="block text-sm">{row.title}</b>
              {row.text ? <span className="block text-xs text-ink-2">{row.text}</span> : null}
            </span>
            <span
              className={cx(
                'sw-scan-mark',
                i < shown && 'is-on',
                row.status === 'good' && 'is-good',
              )}
            >
              {row.status === 'good' ? 'dobrze' : 'do poprawy'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
