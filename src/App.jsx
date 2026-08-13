import { useEffect, useMemo, useState } from 'react'
import { groupExpenses } from './grouping'
import CategoryDonut from './CategoryDonut'

const STORAGE_KEY = 'expenses'
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other']
const CATEGORY_SLOT = Object.fromEntries(CATEGORIES.map((c, i) => [c, i + 1]))
const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

const emptyForm = { description: '', amount: '', category: CATEGORIES[0], date: '' }
const today = () => new Date().toISOString().slice(0, 10)
const money = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function loadExpenses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export default function App() {
  const [expenses, setExpenses] = useState(loadExpenses)
  const [form, setForm] = useState({ ...emptyForm, date: today() })
  const [editingId, setEditingId] = useState(null)
  const [view, setView] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  }, [expenses])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || !form.date) return

    if (editingId) {
      setExpenses(expenses.map((x) => (x.id === editingId ? { ...x, ...form, amount: Number(form.amount) } : x)))
      setEditingId(null)
    } else {
      setExpenses([{ id: crypto.randomUUID(), ...form, amount: Number(form.amount) }, ...expenses])
    }
    setForm({ ...emptyForm, date: today() })
  }

  function handleEdit(expense) {
    setEditingId(expense.id)
    setForm({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
    })
  }

  function handleDelete(id) {
    setExpenses(expenses.filter((x) => x.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setForm({ ...emptyForm, date: today() })
    }
  }

  function handleCancel() {
    setEditingId(null)
    setForm({ ...emptyForm, date: today() })
  }

  const total = expenses.reduce((sum, x) => sum + x.amount, 0)
  const groups = useMemo(() => groupExpenses(expenses, view), [expenses, view])
  const categoryTotals = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        slot: CATEGORY_SLOT[category],
        total: expenses.filter((x) => x.category === category).reduce((sum, x) => sum + x.amount, 0),
      })).filter((c) => c.total > 0),
    [expenses],
  )

  return (
    <div className="app">
      <header className="header">
        <h1>Expense Tracker</h1>
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
      </header>

      <CategoryDonut totals={categoryTotals} grandTotal={total} money={money} />

      <form className="card expense-form" onSubmit={handleSubmit}>
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input name="date" type="date" value={form.date} onChange={handleChange} />
        <button className="btn-primary" type="submit">
          {editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button className="btn-ghost" type="button" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </form>

      <div className="view-toggle">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={v.id === view ? 'active' : ''}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {groups.length === 0 && <p className="empty">No expenses yet — add one above.</p>}

      {groups.map((group) => (
        <div className="card group" key={group.key}>
          {view !== 'all' && (
            <div className="group-header">
              <span>{group.label}</span>
              <span>{money(group.total)}</span>
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="col-amt">Amount</th>
                <th className="col-actions"></th>
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
                  <td className="col-actions" data-label="">
                    <button className="icon-btn" onClick={() => handleEdit(x)} aria-label="Edit">
                      ✎
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(x.id)} aria-label="Delete">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
