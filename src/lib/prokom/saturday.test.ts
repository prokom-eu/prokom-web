import { describe, expect, it } from 'vitest'

import { saturdayLines } from './saturday'

const line = (key: string, hours: string | null) => ({ key, name: `PRO-KOM ${key}`, hours })

describe('saturdayLines', () => {
  it('gives the lines whose hours include Saturday', () => {
    expect(
      saturdayLines([
        line('biznes', 'pn–pt 9:00–17:00'),
        line('tech', 'pn–pt 9:00–17:00, sob. 9:00–14:00'),
      ]),
    ).toEqual([{ key: 'tech', name: 'PRO-KOM tech', saturday: 'sob. 9:00–14:00' }])
  })

  it('reads „sobota” and „so.” too, and skips lines without hours', () => {
    expect(
      saturdayLines([line('a', 'sobota 10:00–13:00'), line('b', null), line('c', 'so. 9–12')]),
    ).toEqual([
      { key: 'a', name: 'PRO-KOM a', saturday: 'sobota 10:00–13:00' },
      { key: 'c', name: 'PRO-KOM c', saturday: 'so. 9–12' },
    ])
  })

  it('gives nothing when no line works on Saturday', () => {
    expect(saturdayLines([line('biznes', 'pn–pt 9:00–17:00')])).toEqual([])
  })
})
