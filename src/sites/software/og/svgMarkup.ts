import { isValidElement, type ReactNode } from 'react'

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Markup of a plain SVG React tree: intrinsic elements and function components without hooks
 * (the cover scenes of `news/PostCover`). Route handlers may not import `react-dom/server`
 * (Next refuses it), so the sharing image serialises the scene itself; `svgMarkup.test.ts`
 * checks the result against `renderToStaticMarkup` for every scene.
 */
export function svgMarkup(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return escape(String(node))
  if (Array.isArray(node)) return node.map(svgMarkup).join('')
  if (!isValidElement<Record<string, unknown> & { children?: ReactNode }>(node)) {
    throw new Error('svgMarkup: unsupported node')
  }
  const { type, props } = node
  if (typeof type === 'function') {
    return svgMarkup((type as (props: unknown) => ReactNode)(props))
  }
  if (typeof type !== 'string') {
    // A fragment: its children only.
    return svgMarkup(props.children)
  }
  const attributes = Object.entries(props)
    .filter(([name, value]) => name !== 'children' && value !== undefined && value !== null)
    .map(([name, value]) => ` ${name === 'className' ? 'class' : name}="${escape(String(value))}"`)
    .join('')
  return `<${type}${attributes}>${svgMarkup(props.children)}</${type}>`
}
