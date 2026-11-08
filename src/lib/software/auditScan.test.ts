import { describe, expect, it } from 'vitest'

import { onAuditScan, requestAuditScan, scanHost, SCAN_HOST_FALLBACK } from './auditScan'

describe('scanHost (demo scan card of /audyt, ZMIANY-v24 §9.1)', () => {
  it('shows the bare host of what was typed', () => {
    expect(scanHost('https://www.pensjonat-gorce.pl/oferta?x=1')).toBe('pensjonat-gorce.pl')
    expect(scanHost('pensjonat-gorce.pl')).toBe('pensjonat-gorce.pl')
    expect(scanHost('  HTTP://Firma.PL  ')).toBe('firma.pl')
  })

  it('falls back to the sample address for an empty or broken entry', () => {
    expect(scanHost('')).toBe(SCAN_HOST_FALLBACK)
    expect(scanHost('to nie jest adres')).toBe(SCAN_HOST_FALLBACK)
    expect(scanHost('javascript:alert(1)')).toBe(SCAN_HOST_FALLBACK)
  })

  it('cuts a very long host so the card keeps its layout', () => {
    expect(scanHost(`${'a'.repeat(80)}.pl`).length).toBeLessThanOrEqual(40)
  })
})

describe('scan channel', () => {
  it('passes the host to the card and stops after unsubscribing', () => {
    const seen: string[] = []
    const off = onAuditScan((host) => seen.push(host))
    requestAuditScan('firma.pl')
    off()
    requestAuditScan('inna.pl')
    expect(seen).toEqual(['firma.pl'])
  })
})
