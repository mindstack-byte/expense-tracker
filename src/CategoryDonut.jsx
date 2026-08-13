const SIZE = 200
const RADIUS = 80
const STROKE = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 3

export default function CategoryDonut({ totals, grandTotal, money }) {
  if (totals.length === 0) {
    return (
      <div className="card donut-card">
        <h2 className="card-title">By category</h2>
        <p className="empty">Add an expense to see the breakdown.</p>
      </div>
    )
  }

  let cumulative = 0
  const segments = totals.map((c) => {
    const frac = c.total / grandTotal
    const rawLen = frac * CIRCUMFERENCE
    const dash = Math.max(rawLen - GAP, 0)
    const segment = {
      ...c,
      frac,
      dashArray: `${dash} ${CIRCUMFERENCE - dash}`,
      dashOffset: -cumulative,
    }
    cumulative += rawLen
    return segment
  })

  return (
    <div className="card donut-card">
      <h2 className="card-title">By category</h2>
      <div className="donut-body">
        <div className="donut-wrap">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label="Spending by category">
            <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
              <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--gridline)" strokeWidth={STROKE} />
              {segments.map((s) => (
                <circle
                  key={s.category}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeDasharray={s.dashArray}
                  strokeDashoffset={s.dashOffset}
                  style={{ stroke: `var(--series-${s.slot})` }}
                >
                  <title>{`${s.category}: ${money(s.total)} (${Math.round(s.frac * 100)}%)`}</title>
                </circle>
              ))}
            </g>
          </svg>
          <div className="donut-center">
            <span className="donut-total-label">Total</span>
            <span className="donut-total-value">{money(grandTotal)}</span>
          </div>
        </div>

        <ul className="donut-legend">
          {segments.map((s) => (
            <li key={s.category}>
              <span className="swatch" style={{ background: `var(--series-${s.slot})` }} />
              <span className="legend-label">{s.category}</span>
              <span className="legend-pct">{Math.round(s.frac * 100)}%</span>
              <span className="legend-value">{money(s.total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
