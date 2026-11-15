import { describe, expect, it } from 'vitest'

import {
  type Autoplay,
  autoplayStep,
  INITIAL_AIM,
  installerAim,
  MODE_START,
  noteKey,
  scene,
  signal,
} from './antennaModel'
import { quizResult } from './quiz'

describe('aiming simulator', () => {
  it('starts without a signal, as the prototype renders it (22 %, 0 %, SZUKAM)', () => {
    const s = signal(INITIAL_AIM)
    expect(s).toMatchObject({ level: 22, quality: 0, lock: false, beam: 'off' })
    expect(noteKey(INITIAL_AIM, s)).toBe('satNone')
  })

  it('locks on Hot Bird with the installer angles', () => {
    const aim = installerAim(INITIAL_AIM)
    expect(aim).toMatchObject({ az: 189, el: 33 })
    expect(signal(aim)).toMatchObject({ level: 96, quality: 100, lock: true, beam: 'ok' })
    expect(noteKey(aim, signal(aim))).toBe('satLock')
  })

  it('says „almost” a few degrees off the satellite', () => {
    const aim = { ...INITIAL_AIM, az: 187, el: 32 }
    expect(signal(aim).beam).toBe('mid')
    expect(noteKey(aim, signal(aim))).toBe('satNear')
  })

  it('needs the higher mast for a stable terrestrial signal', () => {
    const low = { ...MODE_START.dvb, az: 230 }
    expect(signal(low).lock).toBe(false)
    expect(noteKey(low, signal(low))).toBe('dvbBlocked')
    const high = installerAim(MODE_START.dvb)
    expect(high.mast).toBe(true)
    expect(signal(high).lock).toBe(true)
  })

  it('draws the same geometry as the prototype', () => {
    const s = scene(INITIAL_AIM)
    expect(s).toMatchObject({ ox: 470, oy: 138, mast: { x: 467.5, y: 138, h: 38 } })
    expect(s.dish).toBe('translate(470 138) rotate(-155)')
    expect(s.target).toEqual({ x: '302.3', y: '29.1' })
    expect(scene({ ...MODE_START.dvb, mast: true }).oy).toBe(94)
  })

  it('autoplays towards the target, then switches to the terrestrial antenna', () => {
    let s: Autoplay = { ...INITIAL_AIM, hold: 0 }
    s = autoplayStep(s)
    expect(s).toMatchObject({ az: 177, el: 27 })
    for (let i = 0; i < 4; i += 1) s = autoplayStep(s)
    expect(s).toMatchObject({ az: 189, el: 33 })
    for (let i = 0; i < 7; i += 1) s = autoplayStep(s)
    expect(s).toMatchObject({ mode: 'dvb', az: 200, el: 0, mast: false, hold: 0 })
  })

  it('raises the mast after aiming at the transmitter', () => {
    let s: Autoplay = { mode: 'dvb', az: 230, el: 0, mast: false, hold: 0 }
    for (let i = 0; i < 4; i += 1) s = autoplayStep(s)
    expect(s.mast).toBe(true)
  })
})

describe('TV quiz', () => {
  it('asks to answer first', () => {
    expect(quizResult(-1, -1)).toBe('start')
  })

  it('trusts the reception test over the purchase date', () => {
    expect(quizResult(1, 0)).toBe('receives')
    expect(quizResult(0, 1)).toBe('noSignal')
  })

  it('answers from the purchase date alone', () => {
    expect(quizResult(0, -1)).toBe('newTv')
    expect(quizResult(1, -1)).toBe('olderTv')
    expect(quizResult(2, -1)).toBe('unknown')
    expect(quizResult(-1, 2)).toBe('unknown')
  })
})
