import { Button } from '@/components/ui/Button'
import { TextLink } from '@/components/ui/TextLink'

type Link = { label?: string | null; href?: string | null } | null | undefined

/**
 * Link of a block — a button (calls to action) or a text link (cards). Nothing when the editor
 * left it empty (validated in `fields.ts`), so an empty `href` never becomes a link to itself.
 */
export function BlockLink({ link, as = 'button' }: { link: Link; as?: 'button' | 'text' }) {
  if (!link?.label || !link.href) return null
  return (
    <p className="mt-6">
      {as === 'button' ? (
        <Button href={link.href}>{link.label}</Button>
      ) : (
        <TextLink href={link.href}>{link.label}</TextLink>
      )}
    </p>
  )
}
