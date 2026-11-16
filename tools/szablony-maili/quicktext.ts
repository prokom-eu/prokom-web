// Quicktext export format (same as the v1 package that was imported and tested in Thunderbird).
import type { RenderedLine } from './render.ts'

/** CDATA that survives a literal "]]>" in the content (split into two sections). */
export function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

export function quicktextXml(rendered: RenderedLine): string {
  const out = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<quicktext version="2">',
    '  <filetype>templates</filetype>',
  ]
  for (const group of rendered.set.groups) {
    out.push('  <menu>', `    <title>${cdata(group.title)}</title>`, '    <texts>')
    for (const r of rendered.templates.filter((x) => x.groupTitle === group.title)) {
      out.push(
        '      <text shortcut="" type="1">',
        `        <name>${cdata(r.template.nazwa)}</name>`,
        `        <body>${cdata(r.xmlBody)}</body>`,
        `        <subject>${cdata(r.subjectXml)}</subject>`,
        `        <attachments>${cdata('')}</attachments>`,
        `        <keyword>${cdata(r.template.skrot)}</keyword>`,
        '      </text>',
      )
    }
    out.push('    </texts>', '  </menu>')
  }
  out.push('</quicktext>', '')
  return out.join('\n')
}
