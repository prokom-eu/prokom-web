/**
 * IndexNow key (ADR-030). Public by design: the protocol checks it at `https://<host>/<key>.txt`,
 * so it is not a secret — only proof that the submitter controls the host. The same key on every
 * PRO-KOM domain (prokom-web and Tech); `scripts/server/indexnow.py` sends the changed addresses.
 */
export const INDEXNOW_KEY = '1a909fcf3fdf8b994d75221027393cf8' // gitleaks:allow — public by protocol
