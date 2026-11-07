/**
 * An old site against the new one with a slider (ZMIANY-v24 §8 `before`). Without `cut` the
 * slider sweeps by itself (CSS, stopped with reduced motion); with `cut` (0–100) it stands still;
 * with `cut="parent"` it follows the `--mk-cut` of an outer element (the bento's slider).
 */
export function MockBefore({ cut }: { cut?: number | 'parent' }) {
  const still = cut !== undefined
  return (
    <div className="mk-frame">
      <div
        className="mk-ba"
        data-wipe={still ? undefined : ''}
        style={
          typeof cut === 'number' ? ({ '--mk-cut': `${cut}%` } as React.CSSProperties) : undefined
        }
      >
        <div className="mk-old">
          <div className="mk-oldsite">
            <div className="mk-oldsite-head">
              *** TWOJA FIRMA - Witamy na naszej stronie !!! ***
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div className="mk-oldsite-menu">
                <span>Strona główna</span>
                <span>O firmie</span>
                <span>Oferta</span>
                <span>Cennik (PDF)</span>
                <span>Galeria</span>
                <span>Kontakt</span>
                <span>NOWOŚĆ!!!</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="mk-oldsite-box">
                  Zapraszamy do zapoznania się z naszą ofertą. Strona w budowie...
                </div>
                <div className="mk-oldsite-img">
                  <i />
                  <i />
                  <i />
                </div>
                <p style={{ margin: '10px 0 0' }}>Tel: 18 26 xx xxx (pon-pt 8-15)</p>
                <p style={{ margin: '4px 0 0', fontSize: 10 }}>
                  Odwiedzin: 004217 · Najlepiej oglądać w 1024x768 · IE 6.0
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mk-new mk-site">
          <div className="mk-nav">
            <b className="mk-brand">
              <i />
              Twoja Firma
            </b>
            <span className="mk-links">
              <span>Oferta</span>
              <span>O firmie</span>
              <span>Kontakt</span>
            </span>
            <span className="mk-cta">Zapytaj o wycenę</span>
          </div>
          <div className="mk-hero mk-new-hero">
            <div className="mk-blob" />
            <div className="mk-copy">
              <div className="mk-eyebrow">NOWA STRONA · TE SAME ADRESY</div>
              <div className="mk-title">Twoja strona, tylko szybsza i nowoczesna</div>
              <div className="mk-actions">
                <span>Zapytaj o wycenę →</span>
              </div>
            </div>
            <div className="mk-widget">
              <div className="mk-widget-head">
                <b>Szybki kontakt</b>
              </div>
              <div className="mk-rows">
                <div>
                  <span>Szybkość</span>
                  <b className="mk-ok">1,9 s</b>
                </div>
                <div>
                  <span>Na telefonie</span>
                  <b>wygodnie</b>
                </div>
              </div>
              <div className="mk-button">Zamów wycenę</div>
            </div>
          </div>
          <div className="mk-features">
            {[
              ['Oferta', 'czytelna'],
              ['Opinie', 'klientów'],
              ['Kontakt', 'jednym kliknięciem'],
            ].map(([title, note]) => (
              <div key={title} className="mk-card mk-feature">
                <span>
                  <b>{title}</b>
                  <small>{note}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mk-knob">
          <span>⇆</span>
        </div>
      </div>
      <span className="mk-badge" data-side="before">
        PRZED · 6,8 s
      </span>
      <span className="mk-badge" data-side="after">
        PO · 1,9 s
      </span>
    </div>
  )
}
