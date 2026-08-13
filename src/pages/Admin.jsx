import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { loadExpenses, money } from '../constants'

export default function Admin() {
  const { users } = useAuth()

  return (
    <div>
      <h1 className="page-title">Users</h1>
      <div className="card">
        {users.length === 0 ? (
          <p className="empty">No users have signed up yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Password hash (SHA-256)</th>
                <th className="col-amt">Expenses</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const count = loadExpenses(u.username).length
                const total = loadExpenses(u.username).reduce((sum, x) => sum + x.amount, 0)
                return (
                  <tr key={u.username}>
                    <td data-label="Username">{u.username}</td>
                    <td className="hash-cell" data-label="Password hash" title={u.passwordHash}>
                      {u.passwordHash}
                    </td>
                    <td className="col-amt" data-label="Expenses">
                      {count} · {money(total)}
                    </td>
                    <td className="col-actions" data-label="">
                      <Link className="link" to={`/admin/users/${encodeURIComponent(u.username)}`}>
                        View data
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
