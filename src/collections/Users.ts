import { ValidationError } from 'payload'
import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  CollectionConfig,
} from 'payload'

import { adminOnly, adminOnlyField, adminOrSelf, ROLES } from '../lib/auth/access'
import { passwordProblem } from '../lib/auth/password'

// `updateByID` runs `beforeOperation` with `operation: 'update'`.
const PASSWORD_OPERATIONS = new Set(['create', 'update', 'resetPassword'])

/**
 * Payload hard-codes a 3-character minimum when hashing. `beforeOperation` is the one hook
 * that also runs for `resetPassword` (which skips `beforeValidate`), so the policy lives here.
 */
const enforcePasswordPolicy: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (!PASSWORD_OPERATIONS.has(operation)) return args
  const data = 'data' in args ? (args.data as { password?: unknown } | undefined) : undefined
  const problem = passwordProblem(data?.password, { emptyMeansUnchanged: operation === 'update' })
  if (problem) {
    throw new ValidationError({
      collection: 'users',
      errors: [{ message: problem, path: 'password' }],
      req,
    })
  }
  return args
}

/** The very first account (created on the "create first user" screen) becomes an admin. */
const firstUserIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  return totalDocs === 0 ? { ...data, role: 'admin' } : data
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role'],
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    create: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOnly,
  },
  hooks: {
    beforeOperation: [enforcePasswordPolicy],
    beforeChange: [firstUserIsAdmin],
  },
  fields: [
    // Email and password are added by `auth`.
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: ROLES.map((role) => ({ label: role === 'admin' ? 'Admin' : 'Edytor', value: role })),
      access: {
        update: adminOnlyField,
      },
    },
  ],
}
