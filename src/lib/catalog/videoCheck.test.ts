import { describe, expect, it } from 'vitest'

import {
  checkVideos,
  oembedStatus,
  oembedUrl,
  switchOff,
  switchedOffMail,
  type CheckedRecord,
} from './videoCheck'

const A = 'aaaaaaaaaaa'
const B = 'bbbbbbbbbbb'
const C = 'ccccccccccc'

describe('oEmbed answer (ADR-016)', () => {
  it('switches off only on 401 (private, no embedding) and 404 (removed)', () => {
    expect(oembedStatus(200)).toBe('available')
    expect(oembedStatus(401)).toBe('unavailable')
    expect(oembedStatus(404)).toBe('unavailable')
  })

  it('leaves the film alone when YouTube or the network fails', () => {
    expect(oembedStatus(500)).toBe('unknown')
    expect(oembedStatus(503)).toBe('unknown')
    expect(oembedStatus(429)).toBe('unknown')
    expect(oembedStatus(400)).toBe('unknown')
    expect(oembedStatus(null)).toBe('unknown')
  })

  it('asks YouTube about the watch address', () => {
    expect(oembedUrl(A)).toBe(
      `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${A}&format=json`,
    )
  })
})

describe('checking the films', () => {
  it('asks once per film, only about active ones', async () => {
    const asked: string[] = []
    const result = await checkVideos(
      [
        { youtubeId: A, active: true },
        { youtubeId: A, active: true },
        { youtubeId: B, active: false },
        { youtubeId: C },
      ],
      async (url) => {
        asked.push(url)
        return url.includes(A) ? 404 : null
      },
    )
    expect(asked).toHaveLength(2)
    expect([...result.unavailable]).toEqual([A])
    expect(result.checked).toBe(2)
    expect(result.unknown).toBe(1)
  })

  it('switches off the unavailable films of a record and keeps the rest as they are', () => {
    const videos = [
      { youtubeId: A, title: 'A', active: true, id: 'row-1' },
      { youtubeId: B, title: 'B', active: true, id: 'row-2' },
      { youtubeId: C, title: 'C', active: false, id: 'row-3' },
    ]
    const result = switchOff(videos, new Set([A, C]))
    expect(result.videos).toEqual([
      { youtubeId: A, title: 'A', active: false, id: 'row-1' },
      { youtubeId: B, title: 'B', active: true, id: 'row-2' },
      { youtubeId: C, title: 'C', active: false, id: 'row-3' },
    ])
    // C was already off: not news.
    expect(result.switched.map((video) => video.youtubeId)).toEqual([A])
    expect(switchOff(videos, new Set()).switched).toEqual([])
  })
})

describe('mail to the administrators', () => {
  const records: CheckedRecord[] = [
    { where: 'Produkt „Posnet Ergo”', films: [{ youtubeId: A, title: 'Ergo — prezentacja' }] },
    { where: 'Salon Lenovo', films: [{ youtubeId: B, title: 'ThinkPad T14' }] },
  ]

  it('lists every switched-off film once, with where it was', () => {
    const mail = switchedOffMail(records)
    expect(mail.subject).toBe('Filmy YouTube niedostępne: 2')
    expect(mail.text).toContain('Produkt „Posnet Ergo”: Ergo — prezentacja (aaaaaaaaaaa)')
    expect(mail.text).toContain('Salon Lenovo: ThinkPad T14 (bbbbbbbbbbb)')
    expect(mail.text).toContain('Panel')
    expect(mail.text).not.toContain('ręcznie')
  })

  it('lists films of a product with an unpublished draft apart: switched off by hand', () => {
    const mail = switchedOffMail([
      ...records,
      {
        where: 'Produkt „Dell Pro 7”',
        films: [{ youtubeId: 'ccccccccccc', title: 'Dell Pro 7' }],
        manual: true,
      },
    ])
    expect(mail.subject).toBe('Filmy YouTube niedostępne: 3')
    const [auto, manual] = mail.text.split('ręcznie')
    expect(auto).toContain('Salon Lenovo')
    expect(manual).toContain('Produkt „Dell Pro 7”: Dell Pro 7 (ccccccccccc)')
  })
})
