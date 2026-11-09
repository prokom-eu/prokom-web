import { describe, expect, it } from 'vitest'

import { withoutRepeatedBlocks } from './repeats'

const section = (variant: string) => ({ blockType: 'bzSection', variant })

describe('withoutRepeatedBlocks (BIZ-3 §10.3, audit 0611 P1-3 GoPOS)', () => {
  it('drops the module list when the package configurator shows the same modules', () => {
    const layout = [section('gopos-venues'), section('gopos-areas'), section('gopos-package')]
    expect(withoutRepeatedBlocks(layout).map((block) => block.variant)).toEqual([
      'gopos-venues',
      'gopos-package',
    ])
  })

  it('keeps the module list on a page without the configurator, and other blocks as they are', () => {
    const layout = [section('gopos-areas'), { blockType: 'faq' }]
    expect(withoutRepeatedBlocks(layout)).toEqual(layout)
  })
})
