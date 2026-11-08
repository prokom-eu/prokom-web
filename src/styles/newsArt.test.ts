import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { POST_CATEGORIES } from '../lib/catalog/options'

// ZMIANY-v24 §1 pkt 4: the pictures of the news categories are the only place of Software with
// other hues. Each Software category needs its colour and its background, or its picture falls
// back to the violet one without anyone noticing.
const tokens = readFileSync(path.join(process.cwd(), 'src/styles/tokens.css'), 'utf8')

describe('news category pictures (SWA4c)', () => {
  const software = POST_CATEGORIES.filter(({ line }) => line === 'software')

  it.each(software.map(({ value }) => value))('%s has its colour and background', (value) => {
    expect(tokens).toMatch(new RegExp(`--news-art-${value}:`))
    expect(tokens).toMatch(new RegExp(`--news-art-${value}-bg:`))
  })
})
