/**
 * Name of the hidden field humans never fill in. Own module: the browser form needs it, and
 * `spam.ts` uses `node:crypto`, which must stay out of the client bundle.
 */
export const HONEYPOT_FIELD = 'website'
