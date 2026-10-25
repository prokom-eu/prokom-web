import { APIError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'

import { tenantIdOf } from './id'
import type { Line } from './lines'
import { lineOfTenant } from './lineOf'

/**
 * `beforeValidate` of a collection that only one line has (Biznes settings, Software solutions,
 * …): a save for a tenant of another line is refused with `message` (400). The data would never
 * show up there, so storing it would only mislead the editor.
 */
export function onlyLineTenant(line: Line, message: string): CollectionBeforeValidateHook {
  return async ({ data, originalDoc, req }) => {
    const tenantId = tenantIdOf(data?.tenant ?? originalDoc?.tenant)
    if (tenantId === null) return data // the plugin's tenant field reports the missing tenant
    if ((await lineOfTenant(tenantId, req)) !== line) {
      throw new APIError(message, 400, null, true)
    }
    return data
  }
}
