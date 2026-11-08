import { MESSAGE_MAX } from '../inquiry/limits'

/**
 * Parts a line adds to the contact message (Biznes: the inquiry list „Do zapytania”, plan 0611
 * §8.2). The line's own client component in the form's `formPrefill` slot registers a getter in a
 * `useEffect` (never while rendering: on the server this module is shared by every request);
 * `ContactForm` reads the parts when it sends and tells them once the message went out.
 */
type Attachment = {
  read: () => string | null
  /**
   * Slugs sent as the inquiry's list (Software „Twój projekt”, SWA5b): with them the inquiry is a
   * `list` and its items reach the office as records, not only as text.
   */
  items?: () => readonly string[]
  /** After a successful send that carried this part (e.g. empty the inquiry list). */
  onSent?: () => void
}

const attachments = new Set<Attachment>()
const listeners = new Set<() => void>()
const BLANK_LINE = '\n\n'

/**
 * Tells the form the parts changed: it shows „(opcjonalnie)” at the message while a part carries
 * items (as the server accepts it then). A line calls it when its list changes.
 */
export function notifyFormAttachments(): void {
  listeners.forEach((listener) => listener())
}

/** For `useSyncExternalStore` in the form; returns the function that stops listening. */
export function subscribeFormAttachments(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The server's message limit — the attachment is cut to fit, the visitor's text never. */
export const MESSAGE_LIMIT = MESSAGE_MAX

/** Registers a part read at sending; returns the function that removes it. */
export function registerFormAttachment(
  read: Attachment['read'],
  options: { onSent?: () => void; items?: () => readonly string[] } = {},
): () => void {
  const attachment: Attachment = { read, ...options }
  attachments.add(attachment)
  notifyFormAttachments()
  return () => {
    attachments.delete(attachment)
    notifyFormAttachments()
  }
}

/**
 * The parts given now. `sent(message)`: after a successful send of `message`, runs `onSent` only
 * for the parts it carries whole — a part cut or left out at the limit is kept (Biznes keeps the
 * inquiry list the office did not get); a part with items went out as the list, so it counts as
 * sent. `items`: the slugs of every part, each once.
 */
export function collectAttachments(): {
  texts: string[]
  items: string[]
  sent: (message: string) => void
} {
  const given = [...attachments].flatMap((attachment) => {
    const text = attachment.read()?.trim() ?? ''
    const items = attachment.items?.() ?? []
    return text || items.length ? [{ text, items, attachment }] : []
  })
  return {
    texts: given.flatMap((item) => (item.text ? [item.text] : [])),
    items: [...new Set(given.flatMap((item) => item.items))],
    sent: (message) =>
      given.forEach(
        (item) =>
          (item.items.length > 0 || message.includes(item.text)) && item.attachment.onSent?.(),
      ),
  }
}

/** The non-empty parts the registered getters give now. */
export function formAttachments(): string[] {
  return collectAttachments().texts
}

/**
 * The message with the parts below it, never longer than the limit: only the parts are cut
 * (with „…”); with no room left for them the message goes alone.
 */
export function withAttachments(message: string, parts: readonly string[]): string {
  const extra = parts.join(BLANK_LINE)
  if (!extra) return message
  const head = message.trim() ? `${message.trim()}${BLANK_LINE}` : ''
  const room = MESSAGE_LIMIT - head.length
  if (extra.length <= room) return head + extra
  if (room <= 1) return message.trim()
  return `${head}${extra.slice(0, room - 1)}…`
}
