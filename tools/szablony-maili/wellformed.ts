// Minimal well-formedness check for the generated HTML and XML (tests only; no parser dependency).

const VOID = new Set(['br', 'img', 'meta', 'hr', 'input', 'link'])
const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g

/** Returns problems found: unclosed, unexpected or mismatched tags. Empty = OK. */
export function tagProblems(markup: string): string[] {
  const src = markup
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  const stack: string[] = []
  const problems: string[] = []
  for (const m of src.matchAll(TAG_RE)) {
    const [, closing, rawName = '', selfClosing] = m
    const name = rawName.toLowerCase()
    if (VOID.has(name) || selfClosing) continue
    if (!closing) {
      stack.push(name)
      continue
    }
    const open = stack.pop()
    if (open !== name) {
      problems.push(`</${name}> closes <${open ?? 'nothing'}>`)
      if (open) stack.push(open)
    }
  }
  return [...problems, ...stack.map((t) => `<${t}> not closed`)]
}
