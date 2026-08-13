const DAY_FMT = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
const MONTH_FMT = { month: 'long', year: 'numeric' }
const RANGE_FMT = { month: 'short', day: 'numeric' }

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function keyAndLabel(dateStr, mode) {
  const d = new Date(dateStr + 'T00:00:00')

  if (mode === 'monthly') {
    return { key: dateStr.slice(0, 7), label: d.toLocaleDateString(undefined, MONTH_FMT) }
  }

  if (mode === 'weekly') {
    const monday = startOfWeek(d)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return {
      key: monday.toISOString().slice(0, 10),
      label: `${monday.toLocaleDateString(undefined, RANGE_FMT)} – ${sunday.toLocaleDateString(undefined, RANGE_FMT)}, ${sunday.getFullYear()}`,
    }
  }

  if (mode === 'daily') {
    return { key: dateStr, label: d.toLocaleDateString(undefined, DAY_FMT) }
  }

  return { key: 'all', label: 'All expenses' }
}

export function groupExpenses(expenses, mode) {
  const groups = new Map()

  for (const expense of expenses) {
    const { key, label } = keyAndLabel(expense.date, mode)
    if (!groups.has(key)) groups.set(key, { key, label, items: [], total: 0 })
    const group = groups.get(key)
    group.items.push(expense)
    group.total += expense.amount
  }

  return [...groups.values()]
    .sort((a, b) => (a.key < b.key ? 1 : -1))
    .map((g) => ({ ...g, items: g.items.sort((a, b) => (a.date < b.date ? 1 : -1)) }))
}
