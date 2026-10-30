type Props = { eyebrow: string; heading: string; accent?: string; lead?: string }

/** Section head of the prototype (`.shead`): eyebrow, h2 with an accent part, lead on the right. */
export function SectionHead({ eyebrow, heading, accent, lead }: Props) {
  return (
    <div className="shead ri">
      <div>
        <span className="eye">{eyebrow}</span>
        <h2 className="h2">
          {heading}
          {accent && (
            <>
              {' '}
              <span className="acc">{accent}</span>
            </>
          )}
        </h2>
      </div>
      {lead && (
        <p className="lead" style={{ maxWidth: 460 }}>
          {lead}
        </p>
      )}
    </div>
  )
}
