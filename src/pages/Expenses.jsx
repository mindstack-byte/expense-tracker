import { useMemo, useState } from 'react'
import { CATEGORIES, money, today } from '../constants'
import { groupExpenses } from '../grouping'

const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

const emptyForm = { description: '', amount: '', category: CATEGORIES[0], date: '' }

export default function Expenses({ expenses, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({ ...emptyForm, date: today() })
  const [editingId, setEditingId] = useState(null)
  const [view, setView] = useState('all')

  const groups = useMemo(() => groupExpenses(expenses, view), [expenses, view])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || !form.date) return

    if (editingId) {
      onUpdate(editingId, { ...form, amount: Number(form.amount) })
      setEditingId(null)
    } else {
      onAdd({ ...form, amount: Number(form.amount) })
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
    onDelete(id)
    if (editingId === id) {
      setEditingId(null)
      setForm({ ...emptyForm, date: today() })
    }
  }

  function handleCancel() {
    setEditingId(null)
    setForm({ ...emptyForm, date: today() })
  }

  return (
    <div>
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
          <button key={v.id} className={v.id === view ? 'active' : ''} onClick={() => setView(v.id)}>
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
