/**
 * Parts a line adds to the contact message (Biznes: the inquiry list „Do zapytania”, plan 0611
 * §8.2). The line's own client component in the form's `formPrefill` slot registers a getter;
 * `ContactForm` reads them when it sends — the shared form never knows what a line attaches.
 */
type Attachment = () => string | null

const attachments = new Set<Attachment>()

/** The server's message limit (`SHARED_MESSAGES.message`: „do 5000 znaków”). */
export const MESSAGE_LIMIT = 5000

/** Registers a getter read at sending; returns the function that removes it. */
export function registerFormAttachment(read: Attachment): () => void {
  attachments.add(read)
  return () => {
    attachments.delete(read)
  }
}

/** The non-empty parts the registered getters give now. */
export function formAttachments(): string[] {
  return [...attachments].flatMap((read) => {
    const text = read()?.trim()
    return text ? [text] : []
  })
}

/** The message with the parts below it, never longer than the limit (the parts are cut). */
export function withAttachments(message: string, parts: readonly string[]): string {
  const extra = parts.join('\n\n')
  if (!extra) return message
  const head = message.trim() ? `${message.trim()}\n\n` : ''
  const full = head + extra
  return full.length <= MESSAGE_LIMIT ? full : `${full.slice(0, MESSAGE_LIMIT - 1)}…`
}
