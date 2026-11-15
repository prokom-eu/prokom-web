import { poradnik as T } from '../../dane/poradnik'

const MONTH = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Warsaw',
})

/** „aktualizacja: październik 2026” of a post: the later of its publication and update. */
export function updatedLabel(post: {
  published: { dateTime: string } | null
  updated: { dateTime: string } | null
}): string | null {
  const date = post.updated?.dateTime ?? post.published?.dateTime
  return date ? `${T.updated}: ${MONTH.format(new Date(date))}` : null
}
