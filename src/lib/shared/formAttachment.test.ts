import { afterEach, describe, expect, it } from 'vitest'

import {
  MESSAGE_LIMIT,
  collectAttachments,
  formAttachments,
  registerFormAttachment,
  withAttachments,
} from './formAttachment'

describe('form attachments (Biznes: the inquiry list joins the contact message)', () => {
  const off: (() => void)[] = []
  afterEach(() => off.splice(0).forEach((unregister) => unregister()))

  it('collects what the registered parts give now, empty ones left out', () => {
    let list: string | null = 'Lista: Posnet Ergo × 1'
    off.push(registerFormAttachment(() => list))
    off.push(registerFormAttachment(() => '  '))
    expect(formAttachments()).toEqual(['Lista: Posnet Ergo × 1'])
    list = null
    expect(formAttachments()).toEqual([])
  })

  it('stops reading a part once unregistered', () => {
    const unregister = registerFormAttachment(() => 'x')
    unregister()
    expect(formAttachments()).toEqual([])
  })

  it('appends the parts under the message, or alone without one', () => {
    expect(withAttachments('Dzień dobry', ['Lista: A'])).toBe('Dzień dobry\n\nLista: A')
    expect(withAttachments('  ', ['Lista: A', 'B'])).toBe('Lista: A\n\nB')
    expect(withAttachments('Treść', [])).toBe('Treść')
  })

  it('runs `onSent` only for the parts that went out with the message', () => {
    const sent: string[] = []
    off.push(registerFormAttachment(() => 'Lista', { onSent: () => sent.push('lista') }))
    off.push(registerFormAttachment(() => null, { onSent: () => sent.push('pusta') }))
    const collected = collectAttachments()
    expect(collected.texts).toEqual(['Lista'])
    collected.sent(withAttachments('Dzień dobry', collected.texts))
    expect(sent).toEqual(['lista'])
  })

  it('keeps a part the message could not carry whole (cut or left out at the limit)', () => {
    const sent: string[] = []
    off.push(
      registerFormAttachment(() => 'Lista: ' + 'a'.repeat(200), {
        onSent: () => sent.push('lista'),
      }),
    )
    const collected = collectAttachments()
    collected.sent(withAttachments('m'.repeat(MESSAGE_LIMIT - 50), collected.texts))
    collected.sent(withAttachments('m'.repeat(MESSAGE_LIMIT), collected.texts))
    expect(sent).toEqual([])
  })

  it('a message close to the limit stays whole; the attachment drops out', () => {
    const message = 'm'.repeat(MESSAGE_LIMIT - 1)
    expect(withAttachments(message, ['Lista: A'])).toBe(message)
    expect(withAttachments('m'.repeat(MESSAGE_LIMIT), ['Lista: A'])).toHaveLength(MESSAGE_LIMIT)
  })

  it('never goes over the server limit: the attachment is cut, the message kept', () => {
    const message = 'm'.repeat(100)
    const result = withAttachments(message, ['a'.repeat(MESSAGE_LIMIT)])
    expect(result.length).toBe(MESSAGE_LIMIT)
    expect(result.startsWith(`${message}\n\n`)).toBe(true)
    expect(result.endsWith('…')).toBe(true)
  })
})
