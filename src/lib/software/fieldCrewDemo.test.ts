import { describe, expect, it } from 'vitest'

import {
  type DemoState,
  demoReducer,
  demoTexts,
  doneCount,
  INITIAL_DEMO,
  MAX_PHOTOS,
} from './fieldCrewDemo'

const run = (state: DemoState, ...actions: Parameters<typeof demoReducer>[1][]) =>
  actions.reduce(demoReducer, state)

describe('field crew demo — state (board Rozwiazanie)', () => {
  it('opens on site with half of the tasks done and plays on its own', () => {
    expect(INITIAL_DEMO).toMatchObject({ step: 1, photos: 2, touched: false })
    expect(doneCount(INITIAL_DEMO)).toBe(2)
    const next = run(INITIAL_DEMO, { type: 'auto' })
    expect(next).toMatchObject({ step: 2, signed: false, photos: 3, touched: false })
    expect(doneCount(next)).toBe(4)
  })

  it('loops after „done” and starts the job again', () => {
    const done = run(INITIAL_DEMO, { type: 'auto' }, { type: 'auto' })
    expect(done).toMatchObject({ step: 3, signed: true })
    expect(run(done, { type: 'auto' })).toMatchObject({ step: 0, photos: 1, signed: false })
  })

  it('stops playing once the visitor clicks', () => {
    const picked = run(INITIAL_DEMO, { type: 'pick', step: 3 })
    expect(picked).toMatchObject({ step: 3, touched: true })
    expect(run(picked, { type: 'auto' })).toBe(picked)
  })

  it('ticks the remaining tasks before going to the protocol', () => {
    const ticked = run(INITIAL_DEMO, { type: 'next' })
    expect(ticked.step).toBe(1)
    expect(doneCount(ticked)).toBe(4)
    expect(run(ticked, { type: 'next' }).step).toBe(2)
  })

  it('asks for the signature before finishing', () => {
    const atProtocol = run(INITIAL_DEMO, { type: 'pick', step: 2 })
    const signed = run(atProtocol, { type: 'next' })
    expect(signed).toMatchObject({ step: 2, signed: true })
    expect(run(signed, { type: 'next' }).step).toBe(3)
  })

  it('opens the next job from „done”', () => {
    const done = run(INITIAL_DEMO, { type: 'pick', step: 3 })
    const next = run(done, { type: 'next' })
    expect(next).toMatchObject({ step: 0, signed: false, photos: 1 })
    expect(doneCount(next)).toBe(0)
  })

  it('toggles one task, ignores an index out of range', () => {
    const toggled = run(INITIAL_DEMO, { type: 'toggleTask', index: 2 })
    expect(toggled.tasks).toEqual([true, true, true, false])
    expect(run(toggled, { type: 'toggleTask', index: 0 }).tasks).toEqual([false, true, true, false])
    expect(run(INITIAL_DEMO, { type: 'toggleTask', index: 9 })).toBe(INITIAL_DEMO)
  })

  it('adds photos up to the limit', () => {
    const many = run(
      INITIAL_DEMO,
      ...Array.from({ length: 6 }, () => ({ type: 'addPhoto' }) as const),
    )
    expect(many.photos).toBe(MAX_PHOTOS)
  })

  it('restarts from the way to the client', () => {
    const restarted = run(INITIAL_DEMO, { type: 'restart' })
    expect(restarted).toMatchObject({ step: 0, photos: 1, signed: false, touched: true })
  })
})

describe('field crew demo — texts', () => {
  it('counts the tasks on the button and in the card on site', () => {
    const texts = demoTexts(INITIAL_DEMO)
    expect(texts.button).toBe('Odhacz zadania (2/4)')
    expect(texts.cardB.title).toBe('2/4 zadań odhaczonych')
    expect(texts.log).toBe('08:05 · na miejscu · 2 zdjęć · 2/4 zadań')
    expect(texts.hint).toBe('Przechodzi samo. Kliknij, żeby przejąć.')
  })

  it('moves the job between the board columns', () => {
    expect(demoTexts(run(INITIAL_DEMO, { type: 'pick', step: 0 })).columns).toEqual([2, 2, 1, 3])
    expect(demoTexts(INITIAL_DEMO).columns).toEqual([2, 1, 2, 3])
    expect(demoTexts(run(INITIAL_DEMO, { type: 'pick', step: 3 })).columns).toEqual([2, 1, 1, 4])
  })

  it('changes the protocol texts after the signature', () => {
    const atProtocol = run(INITIAL_DEMO, { type: 'pick', step: 2 })
    expect(demoTexts(atProtocol).button).toBe('Poproś klienta o podpis')
    const signed = run(atProtocol, { type: 'sign' })
    expect(demoTexts(signed)).toMatchObject({
      button: 'Zakończ zlecenie',
      cardA: { title: 'Protokół PDF u klienta' },
      hint: 'Twój wybór. Klikaj po telefonie.',
    })
  })
})
