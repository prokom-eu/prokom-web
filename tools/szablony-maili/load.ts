import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import {
  type AutoReply,
  type Dane,
  type LineId,
  type Template,
  type TemplateFile,
  daneSchema,
  templateFileSchema,
} from './schema.ts'

export const TOOL_DIR = dirname(fileURLToPath(import.meta.url))
export const REPO_DIR = join(TOOL_DIR, '..', '..')
const CONTENT_DIR = join(TOOL_DIR, 'tresci')

/** Shared templates without `linie` go to the four website lines (never to Tech). */
const DEFAULT_SHARED_LINES: readonly string[] = ['biznes', 'instalacje', 'software', 'prokom']

export interface Group {
  key: string
  title: string
  templates: Template[]
}

export interface LineSet {
  line: LineId
  groups: Group[]
  /** Flat list in menu order. */
  templates: Template[]
  warnings: string[]
}

export interface Content {
  dane: Dane
  shared: TemplateFile
  lines: Record<LineId, TemplateFile>
  autoReplies: AutoReply[]
}

function readYaml(file: string): unknown {
  return parse(readFileSync(join(CONTENT_DIR, file), 'utf8'))
}

export function loadContent(): Content {
  const dane = daneSchema.parse(readYaml('dane.yaml'))
  const shared = templateFileSchema.parse(readYaml('wspolne.yaml'))
  const lines = {
    biznes: templateFileSchema.parse(readYaml('biznes.yaml')),
    instalacje: templateFileSchema.parse(readYaml('instalacje.yaml')),
    software: templateFileSchema.parse(readYaml('software.yaml')),
    prokom: templateFileSchema.parse(readYaml('prokom.yaml')),
  }
  return { dane, shared, lines, autoReplies: shared.autoodpowiedzi ?? [] }
}

/** Merges shared templates (by `linie`) with the line's own: shared groups 1–7 first, then line groups. */
export function lineSet(content: Content, line: LineId): LineSet {
  const warnings: string[] = []
  const sharedForLine = content.shared.szablony.filter((t) =>
    (t.linie ?? DEFAULT_SHARED_LINES).includes(line),
  )
  const own = content.lines[line]
  const groups: Group[] = []
  for (const [file, list] of [
    [content.shared, sharedForLine],
    [own, own.szablony],
  ] as const) {
    for (const [key, title] of Object.entries(file.grupy)) {
      const templates = list.filter((t) => t.grupa === key)
      if (templates.length > 0) groups.push({ key, title, templates })
    }
  }

  // Shortcuts must be unique within a line: add a numeric suffix on collision.
  const used = new Set<string>()
  const renamed = groups.map((g) => ({
    ...g,
    templates: g.templates.map((t) => {
      let skrot = t.skrot
      for (let n = 2; used.has(skrot); n++) skrot = `${t.skrot}${n}`
      if (skrot !== t.skrot)
        warnings.push(`${line}: shortcut "${t.skrot}" taken, "${t.id}" gets "${skrot}"`)
      used.add(skrot)
      return skrot === t.skrot ? t : { ...t, skrot }
    }),
  }))
  return { line, groups: renamed, templates: renamed.flatMap((g) => g.templates), warnings }
}
