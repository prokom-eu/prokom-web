type Environment = 'production' | 'staging' | 'local'
type Domain = { host: string; environment: Environment }

/**
 * Which domains of a tenant the live preview opens: production domains on a production build,
 * `*.localhost` otherwise. TODO(S10): staging — the staging server runs a production build,
 * so it needs its own signal (e.g. `SITE_ENV` from S7).
 */
export function environmentFor(nodeEnv: string | undefined): Environment {
  return nodeEnv === 'production' ? 'production' : 'local'
}

export function hostForEnvironment(
  domains: readonly Domain[] | null | undefined,
  environment: Environment,
): string | null {
  return domains?.find((domain) => domain.environment === environment)?.host ?? null
}

/**
 * Protocol of the current request: the reverse proxy's `X-Forwarded-Proto` first (Nginx
 * terminates TLS), then the request itself. Unknown values fall back to https.
 */
export function protocolOf(
  forwardedProto: string | null,
  requestProtocol: string,
): 'http' | 'https' {
  const value = (forwardedProto?.split(',')[0] ?? requestProtocol).trim().replace(/:$/, '')
  return value === 'http' ? 'http' : 'https'
}

/** Port of a `Host` header (`panel.localhost:3000` → `3000`), empty for the default port. */
export function portOf(hostHeader: string | null): string {
  return /:(\d{1,5})$/.exec(hostHeader ?? '')?.[1] ?? ''
}

/** Origin (`http://biznes.localhost:3000`). Panel and sites share one server, so one port. */
export function origin(protocol: 'http' | 'https', host: string, port: string): string {
  return `${protocol}://${host}${port ? `:${port}` : ''}`
}
