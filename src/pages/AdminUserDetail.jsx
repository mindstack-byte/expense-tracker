import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, CATEGORY_SLOT, loadExpenses, money } from '../constants'
import { groupExpenses } from '../grouping'
import CategoryDonut from '../CategoryDonut'

export default function AdminUserDetail() {
  const { username } = useParams()
  const expenses = useMemo(() => loadExpenses(username), [username])

  const total = expenses.reduce((sum, x) => sum + x.amount, 0)

  const categoryTotals = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        slot: CATEGORY_SLOT[category],
        total: expenses.filter((x) => x.category === category).reduce((sum, x) => sum + x.amount, 0),
      })).filter((c) => c.total > 0),
    [expenses],
  )

  const groups = useMemo(() => groupExpenses(expenses, 'all'), [expenses])

  return (
    <div>
      <Link className="link" to="/admin">
        ← Back to users
      </Link>
      <h1 className="page-title">{username}'s expenses</h1>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Total</span>
          <span className="stat-value">{money(total)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{expenses.length}</span>
        </div>
      </div>

      <CategoryDonut totals={categoryTotals} grandTotal={total} money={money} />

      {expenses.length === 0 ? (
        <p className="empty">This user hasn't added any expenses yet.</p>
      ) : (
        groups.map((group) => (
          <div className="card group" key={group.key}>
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
                {group.items.map((x) => (
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
          </div>
        ))
      )}
    </div>
  )
}
