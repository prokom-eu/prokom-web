import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePageTags } from '../pages/revalidate'
import { catalogTagsToRevalidate } from './tags'

/**
 * Hooks of the collections behind the catalog index (ADR-012 §2.4). The seed sets
 * `context.seed`: it writes outside a Next.js request, where nothing can be revalidated.
 */
export const revalidateCatalogAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
}) => {
  if (!req.context.seed) {
    revalidatePageTags(catalogTagsToRevalidate(doc, previousDoc), req.payload)
  }
  return doc
}

export const revalidateCatalogAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  // Deleted = no longer public: the tags of the removed document's tenants.
  if (!req.context.seed) revalidatePageTags(catalogTagsToRevalidate({}, doc), req.payload)
  return doc
}

export const catalogRevalidationHooks = {
  afterChange: [revalidateCatalogAfterChange],
  afterDelete: [revalidateCatalogAfterDelete],
}
