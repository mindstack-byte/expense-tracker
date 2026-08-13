import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { CATEGORIES, CATEGORY_SLOT, money } from '../constants'
import { groupExpenses } from '../grouping'
import CategoryDonut from '../CategoryDonut'

export default function Dashboard({ expenses }) {
  const { currentUser } = useAuth()
  const total = expenses.reduce((sum, x) => sum + x.amount, 0)

  const monthTotal = useMemo(() => {
    const groups = groupExpenses(expenses, 'monthly')
    return groups[0]?.total ?? 0
  }, [expenses])

  const categoryTotals = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        slot: CATEGORY_SLOT[category],
        total: expenses.filter((x) => x.category === category).reduce((sum, x) => sum + x.amount, 0),
      })).filter((c) => c.total > 0),
    [expenses],
  )

  const recent = useMemo(
    () => [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5),
    [expenses],
  )

  return (
    <div>
      <h1 className="page-title">Welcome back, {currentUser.username}</h1>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Total</span>
          <span className="stat-value">{money(total)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">This month</span>
          <span className="stat-value">{money(monthTotal)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
      </div>

      <CategoryDonut totals={categoryTotals} grandTotal={total} money={money} />

      <div className="card">
        <div className="group-header">
          <span>Recent expenses</span>
          <Link className="link" to="/expenses">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="empty">No expenses yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="col-amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((x) => (
                <tr key={x.id}>
                  <td data-label="Date">{x.date}</td>
                  <td data-label="Description">{x.description}</td>
                  <td data-label="Category">
                    <span className={`badge badge-${x.category.toLowerCase()}`}>{x.category}</span>
                  </td>
                  <td className="col-amt" data-label="Amount">
                    {money(x.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
