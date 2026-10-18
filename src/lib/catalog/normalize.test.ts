import { describe, expect, it } from 'vitest'

import { normalizeText } from './normalize'

describe('normalizeText', () => {
  it.each([
    ['Kasa Fiskalna', 'kasa fiskalna'],
    ['Łączność ŻÓŁW źdźbło', 'lacznosc zolw zdzblo'],
    ['Posnet Ergo Online', 'posnet ergo online'],
    ['  Wi-Fi /  LTE ', 'wi-fi / lte'],
    ['Ćma ęą ńś', 'cma ea ns'],
  ])('%j → %j', (input, expected) => expect(normalizeText(input)).toBe(expected))
})
