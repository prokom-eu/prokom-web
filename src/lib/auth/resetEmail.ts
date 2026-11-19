import { esc } from '../mail/html/esc'

/**
 * Link of the panel's "reset password" e-mail. Payload builds it from the request (`http://` behind
 * nginx, not on the `csrf` list) and falls back to a relative `/admin/reset/…` that does not work
 * in a mailbox (audit AB4) — so the panel address is set here. Locally: http with the dev port.
 */
export function panelResetUrl(
  token: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const host = env.PANEL_HOST ?? 'panel.localhost'
  const local = (env.SITE_ENV ?? 'local') === 'local'
  const origin = local ? `http://${host}:${env.PORT ?? '3000'}` : `https://${host}`
  return `${origin}/admin/reset/${encodeURIComponent(token)}`
}

export function panelResetEmailHtml(
  token: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const url = esc(panelResetUrl(token, env))
  return [
    '<p>Dzień dobry,</p>',
    '<p>ktoś poprosił o nowe hasło do panelu PRO-KOM. Link działa przez godzinę:</p>',
    `<p><a href="${url}">${url}</a></p>`,
    '<p>Jeśli to nie Ty, zignoruj tę wiadomość — hasło się nie zmieni.</p>',
  ].join('\n')
}
