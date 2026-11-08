import { MESSAGE_MAX } from '../inquiry/limits'

/**
 * Parts a line adds to the contact message (Biznes: the inquiry list „Do zapytania”, plan 0611
 * §8.2). The line's own client component in the form's `formPrefill` slot registers a getter in a
 * `useEffect` (never while rendering: on the server this module is shared by every request);
 * `ContactForm` reads the parts when it sends and tells them once the message went out.
 */
type Attachment = {
  read: () => string | null
  /** After a successful send that carried this part (e.g. empty the inquiry list). */
  onSent?: () => void
}

const attachments = new Set<Attachment>()
const BLANK_LINE = '\n\n'

/** The server's message limit — the attachment is cut to fit, the visitor's text never. */
export const MESSAGE_LIMIT = MESSAGE_MAX

/** Registers a part read at sending; returns the function that removes it. */
export function registerFormAttachment(
  read: Attachment['read'],
  options: { onSent?: () => void } = {},
): () => void {
  const attachment: Attachment = { read, ...options }
  attachments.add(attachment)
  return () => {
    attachments.delete(attachment)
  }
}

/** The parts given now, each with the callback to run once the message carrying it was sent. */
export function collectAttachments(): { texts: string[]; sent: () => void } {
  const given = [...attachments].flatMap((attachment) => {
    const text = attachment.read()?.trim()
    return text ? [{ text, attachment }] : []
  })
  return {
    texts: given.map((item) => item.text),
    sent: () => given.forEach((item) => item.attachment.onSent?.()),
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
