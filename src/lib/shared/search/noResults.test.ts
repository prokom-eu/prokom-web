import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createNoResultsReporter } from './noResults'

describe('createNoResultsReporter', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reports once the empty state stays for the delay', () => {
    const report = vi.fn()
    const reporter = createNoResultsReporter(report, 1000)
    reporter.update(true)
    vi.advanceTimersByTime(999)
    expect(report).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(report).toHaveBeenCalledTimes(1)
  })

  it('skips prefixes typed on the way to a phrase with results', () => {
    const report = vi.fn()
    const reporter = createNoResultsReporter(report, 1000)
    reporter.update(true)
    vi.advanceTimersByTime(500)
    reporter.update(false)
    vi.advanceTimersByTime(5000)
    expect(report).not.toHaveBeenCalled()
  })

  it('reports at most once per opening, again after reset', () => {
    const report = vi.fn()
    const reporter = createNoResultsReporter(report, 1000)
    reporter.update(true)
    vi.advanceTimersByTime(1000)
    reporter.update(true)
    vi.advanceTimersByTime(5000)
    expect(report).toHaveBeenCalledTimes(1)
    reporter.reset()
    reporter.update(true)
    vi.advanceTimersByTime(1000)
    expect(report).toHaveBeenCalledTimes(2)
  })

  it('reset and dispose cancel a pending report', () => {
    const report = vi.fn()
    const reporter = createNoResultsReporter(report, 1000)
    reporter.update(true)
    reporter.dispose()
    vi.advanceTimersByTime(5000)
    expect(report).not.toHaveBeenCalled()
  })
})
