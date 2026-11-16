// KATALOG-SZABLONOW.md — every template as plain text (+ auto-replies), for reading and search.
import { inline } from './dsl.ts'
import type { Content } from './load.ts'
import type { RenderedLine } from './render.ts'

/** `errors` collects problems in auto-replies (e.g. an unknown upper-case variable). */
export function catalogue(content: Content, lines: RenderedLine[], errors: string[] = []): string {
  const out: string[] = [
    '# Katalog szablonów ręcznych odpowiedzi PRO-KOM',
    '',
    'Wygenerowane przez `pnpm szablony:build` z `tools/szablony-maili/tresci/*.yaml` — nie edytuj ręcznie.',
    'Oznaczenia: `[pole]` — Quicktext zapyta przy wstawianiu; `[pole: a / b]` — lista wyboru;',
    '`[UZUPEŁNIJ RAZ: …]` — podmień raz po imporcie; _(usuń, jeśli nie dotyczy)_ — zdanie opcjonalne.',
    '',
  ]
  for (const r of lines) {
    const d = content.dane.linie[r.line]
    out.push(`## ${d.NAZWA} — ${r.templates.length} szablonów`, '')
    for (const g of r.set.groups) {
      out.push(`### ${g.title}`, '')
      for (const t of r.templates.filter((x) => x.groupTitle === g.title)) {
        out.push(
          `#### ${t.template.nazwa} · skrót \`${t.template.skrot}\``,
          '',
          `_Kiedy:_ ${t.template.kiedy}`,
          '',
        )
        if (t.subjectText) out.push(`_Temat:_ ${t.subjectText}`, '')
        out.push(t.text, '')
      }
    }
    out.push(`### Autoodpowiedzi (panel poczty na serwerze)`, '')
    for (const a of content.autoReplies) {
      // Lower-case {placeholders} (e.g. {data od}) stay as text to fill in the mail panel.
      const ctx = {
        line: r.line,
        dane: content.dane,
        mode: 'text' as const,
        errors: [] as string[],
        missing: new Set<string>(),
      }
      const body = a.tresc
        .trim()
        .split('\n')
        .map((l) => inline(ctx, l))
        .join('\n')
      errors.push(...ctx.errors.map((e) => `${r.line}/autoodpowiedz-${a.id}: ${e}`))
      out.push(`#### ${a.nazwa}`, '', '```text', body, '```', '')
    }
  }
  return out.join('\n')
}
