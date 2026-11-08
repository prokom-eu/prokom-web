import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { MENU_IMAGES, MENU_MEDIA_DIR, menuImageUpdate } from './menuImages'

describe('mega menu thumbnails (plan 0611 §8.1 pkt 3)', () => {
  it('every mapped thumbnail is in the package', () => {
    for (const file of Object.values(MENU_IMAGES)) {
      expect(existsSync(path.resolve(MENU_MEDIA_DIR, file)), file).toBe(true)
    }
  })

  it('fills an empty field only — a thumbnail chosen in the panel stays', () => {
    expect(menuImageUpdate(null, 7)).toBe(7)
    expect(menuImageUpdate(undefined, 7)).toBe(7)
    expect(menuImageUpdate(3, 7)).toBeNull()
    expect(menuImageUpdate({ id: 3 }, 7)).toBeNull()
    expect(menuImageUpdate(null, undefined)).toBeNull()
  })
})
