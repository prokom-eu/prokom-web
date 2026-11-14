/** Cache tag of all hub content of one tenant (collections `hub-*`, `HubSettings`; ADR-006). */
export const hubTag = (tenantId: number) => `tenant:${tenantId}:hub`
