/*
 * Small drawings shared by the hero tiles and the line scene (illustration only, hidden from
 * readers where they sit): a tick, a camera feed with a scene, the Wi-Fi arcs.
 */

/** A small tick for statuses and finished steps. */
export function Tick() {
  return (
    <svg viewBox="0 0 12 12" className="pk-tick" aria-hidden="true">
      <path d="M2.5 6.2 5 8.6 9.6 3.6" />
    </svg>
  )
}

/** A camera feed: a simple scene (a door with a passer-by, a parked car), REC, LIVE, viewfinder. */
export function CamScene({ scene }: { scene: number }) {
  return (
    <span className="pk-cam">
      <svg viewBox="0 0 100 64" preserveAspectRatio="xMidYMid slice" className="pk-cam__scene">
        {scene === 0 ? (
          <>
            <rect x="36" y="10" width="28" height="46" rx="2" className="pk-cam__shape" />
            <rect x="40" y="14" width="20" height="38" rx="1" className="pk-cam__shade" />
            <g className="pk-cam__walker">
              <circle cx="20" cy="30" r="4" />
              <rect x="16" y="35" width="8" height="16" rx="3" />
            </g>
          </>
        ) : (
          <>
            <path d="M0 52h100" className="pk-cam__line" />
            <path
              d="M22 46c2-8 6-12 14-12h22c8 0 12 4 16 12h4v6H18v-6z"
              className="pk-cam__shape"
            />
            <circle cx="32" cy="52" r="5" className="pk-cam__shade" />
            <circle cx="66" cy="52" r="5" className="pk-cam__shade" />
          </>
        )}
      </svg>
      <span className="pk-cam__vf" />
      <b>
        <i className="pk-rec" />
        REC
      </b>
      <small className="pk-cam__live">LIVE</small>
    </span>
  )
}

/** Wi-Fi in a room: arcs of the signal and its strength. */
export function WifiArcs({ strength }: { strength: number }) {
  return (
    <span className="pk-wifi">
      <svg viewBox="0 0 40 30" className="pk-wifi__arcs">
        <path d="M4 12a23 23 0 0 1 32 0" />
        <path d="M10 18a14 14 0 0 1 20 0" />
        <path d="M16 24a6 6 0 0 1 8 0" />
      </svg>
      <small>{strength}%</small>
    </span>
  )
}
