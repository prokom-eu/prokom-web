/**
 * A title template must contain the page-title placeholder exactly once, e.g. `%s | PRO-KOM`.
 * The same `%s` syntax as Next.js `metadata.title.template`, which applies it.
 */
export function isValidTitleTemplate(template: string): boolean {
  return template.trim() !== '' && template.split('%s').length === 2
}
