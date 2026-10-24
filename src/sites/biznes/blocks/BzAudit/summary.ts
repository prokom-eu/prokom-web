export type AuditState = 'urgent' | 'fix' | 'watch' | 'term' | 'ok'

/**
 * Summary of the sample audit report, counted from its rows so it always matches them:
 * urgent, to improve (fix, watch, term) and fine.
 */
export function auditSummary(rows: readonly { state: AuditState }[]) {
  return {
    urgent: rows.filter((row) => row.state === 'urgent').length,
    fix: rows.filter((row) => row.state !== 'urgent' && row.state !== 'ok').length,
    ok: rows.filter((row) => row.state === 'ok').length,
  }
}
