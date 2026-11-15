/**
 * A commitment „Tytuł — opis” (board `#s4-jak`: „60 minut” / „oddzwaniamy w godzinach pracy”):
 * split at the first dash; without one the whole text is the title.
 */
export function splitCommitment(text: string): { title: string; note: string | null } {
  const at = text.indexOf(' — ')
  return at < 0
    ? { title: text, note: null }
    : { title: text.slice(0, at), note: text.slice(at + 3) }
}
