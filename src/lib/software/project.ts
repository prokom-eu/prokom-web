/**
 * „Twój projekt” of the Software site (spec. §3.1, §8.1; ADR-014 rozstrz. 9): solutions added
 * from the cards, kept in the browser under one key `pk-project` as `[{ id, name }]`. The name
 * is stored so the list shows without asking the API. Pure functions; `./projectStore` keeps
 * them in `localStorage`.
 */

export const PROJECT_KEY = 'pk-project'
export const MAX_PROJECT_ITEMS = 30

/** „Wyślij do wyceny →”: the contact form with the project list (spec. §3.1, v21). */
export const PROJECT_SEND_HREF = '/kontakt?projekt=1#formularz'

/**
 * Names sent with the last inquiry from `/kontakt`, for `/dziekujemy` („Wysłane razem z: …”):
 * `sessionStorage` (this tab only) as `{ nr, names }` — shown only on the thanks page of that
 * inquiry number, so a later inquiry (audit, wizard) never shows a stale list.
 */
export const PROJECT_SENT_KEY = 'pk-project-sent'
const MAX_NAME = 120

export type ProjectItem = { id: string; name: string }
export type Project = readonly ProjectItem[]

const cleanName = (name: string) => name.trim().slice(0, MAX_NAME)

/** The stored list, whatever the browser holds: broken entries and duplicates are dropped. */
export function parseProject(raw: string | null): ProjectItem[] {
  let data: unknown
  try {
    data = raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const seen = new Set<string>()
  const project: ProjectItem[] = []
  for (const entry of data) {
    if (project.length === MAX_PROJECT_ITEMS) break
    if (typeof entry !== 'object' || entry === null) continue
    const { id, name } = entry as Record<string, unknown>
    if (typeof id !== 'string' || !id || seen.has(id) || typeof name !== 'string') continue
    const trimmed = cleanName(name)
    if (!trimmed) continue
    seen.add(id)
    project.push({ id, name: trimmed })
  }
  return project
}

/** Add when missing, remove when present — the „+ Dodaj do wyceny” / „✓ W wycenie” switch. */
export function toggle(
  project: Project,
  id: string,
  name: string,
): { project: Project; added: boolean } {
  if (project.some((item) => item.id === id)) return { project: remove(project, id), added: false }
  if (project.length >= MAX_PROJECT_ITEMS) return { project, added: false }
  return { project: [...project, { id, name: cleanName(name) }], added: true }
}

export function remove(project: Project, id: string): Project {
  return project.filter((item) => item.id !== id)
}

/** `PROJECT_SENT_KEY` as stored by the contact form. */
export function sentRecord(number: string, names: readonly string[]): string {
  return JSON.stringify({ nr: number, names })
}

/** Names of `PROJECT_SENT_KEY` for the inquiry `number`; anything else is no list. */
export function parseSent(raw: string | null, number: string | null): string[] {
  if (!raw || !number) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return []
  const { nr, names } = data as Record<string, unknown>
  if (nr !== number || !Array.isArray(names)) return []
  return names.filter((name): name is string => typeof name === 'string' && name.trim() !== '')
}
