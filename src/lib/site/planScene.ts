'use client'

// Sets the scene of „Plan Twojej firmy” from elsewhere on the page (the „Firmy każdej wielkości”
// tiles, K31d′) without a shared React tree: the plan listens, a tile asks — like `searchOpen`.
const listeners = new Set<(scene: string) => void>()

/** Called by the plan; returns the unsubscribe. */
export function onPlanSceneRequest(listener: (scene: string) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Shows `scene` on the plan of this page; `false` when no plan listens (no plan on the page). */
export function requestPlanScene(scene: string): boolean {
  for (const listener of listeners) listener(scene)
  return listeners.size > 0
}
