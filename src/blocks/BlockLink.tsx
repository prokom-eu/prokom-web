type Link = { label?: string | null; href?: string | null } | null | undefined

/** Link of a block; nothing when the editor left it empty (validated in `fields.ts`). */
export function BlockLink({ link }: { link: Link }) {
  if (!link?.label || !link.href) return null
  return (
    <p>
      <a href={link.href}>{link.label}</a>
    </p>
  )
}
