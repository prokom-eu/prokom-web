import { describe, expect, it } from 'vitest'

import { createMotionGate, type GateElement } from './motionGate'

/** An element with a class list, children and the attributes the gate sets. */
function el(className = '', children: GateElement[] = []): GateElement & { attrs: Set<string> } {
  const attrs = new Set<string>()
  const self = {
    attrs,
    classes: new Set(className.split(' ').filter(Boolean)),
    matches: (selector: string) => selector === '.mk' && self.classes.has('mk'),
    querySelectorAll: (selector: string) => {
      const found: GateElement[] = []
      const walk = (list: GateElement[]) =>
        list.forEach((child) => {
          if (child.matches(selector)) found.push(child)
          walk((child as { kids?: GateElement[] }).kids ?? [])
        })
      walk(children)
      return found
    },
    kids: children,
    toggleAttribute: (name: string, force: boolean) => {
      if (force) attrs.add(name)
      else attrs.delete(name)
      return force
    },
  }
  return self
}

function observer() {
  const watched = new Set<GateElement>()
  return {
    watched,
    observe: (target: GateElement) => void watched.add(target),
    unobserve: (target: GateElement) => void watched.delete(target),
  }
}

describe('createMotionGate', () => {
  it('watches every mock-up of an added subtree, the root itself included', () => {
    const inner = el('mk')
    const deep = el('mk')
    const root = el('mk', [inner, el('card', [deep])])
    const io = observer()
    createMotionGate(io).add(root)
    expect([...io.watched]).toEqual([root, inner, deep])
  })

  it('a mock-up away from the screen stands still, on the screen it moves again', () => {
    const mock = el('mk')
    const io = observer()
    const gate = createMotionGate(io)
    gate.add(mock)
    gate.sync([{ target: mock, isIntersecting: false }])
    expect(mock.attrs.has('data-still')).toBe(true)
    gate.sync([{ target: mock, isIntersecting: true }])
    expect(mock.attrs.has('data-still')).toBe(false)
  })

  it('forgets removed mock-ups (a closed offer window)', () => {
    const mock = el('mk')
    const holder = el('dialog', [mock])
    const io = observer()
    const gate = createMotionGate(io)
    gate.add(holder)
    expect(io.watched.has(mock)).toBe(true)
    gate.remove(holder)
    expect(io.watched.size).toBe(0)
  })

  it('ignores nodes that are not elements (text added to the page)', () => {
    const io = observer()
    const gate = createMotionGate(io)
    gate.add({} as GateElement)
    expect(io.watched.size).toBe(0)
  })
})
