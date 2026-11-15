import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePageTags } from '../pages/revalidate'
import { solutionsTagsToRevalidate } from './tags'

/**
 * Hooks of the collections behind the solutions index (`Solutions`, `SoftwareSettings`). The
 * seed sets `context.seed`: it writes outside a Next.js request, where nothing can be revalidated.
 */
const afterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (!req.context.seed) {
    revalidatePageTags(solutionsTagsToRevalidate(doc, previousDoc), req.payload)
  }
  return doc
}

const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  // Deleted = no longer public: the tags of the removed document's tenant.
  if (!req.context.seed) revalidatePageTags(solutionsTagsToRevalidate({}, doc), req.payload)
  return doc
}

export const solutionsRevalidationHooks = {
  afterChange: [afterChange],
  afterDelete: [afterDelete],
}
