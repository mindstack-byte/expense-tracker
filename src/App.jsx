import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { loadExpenses, saveExpenses } from './constants'
import { AuthProvider, useAuth } from './AuthContext'
import RequireAuth from './RequireAuth'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import AdminUserDetail from './pages/AdminUserDetail'

const navLinkClass = ({ isActive }) => (isActive ? 'active' : '')

function Shell() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState(() => loadExpenses(currentUser?.username))

  useEffect(() => {
    setExpenses(loadExpenses(currentUser?.username))
  }, [currentUser?.username])

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') saveExpenses(currentUser.username, expenses)
  }, [expenses, currentUser])

  function addExpense(entry) {
    setExpenses((prev) => [{ id: crypto.randomUUID(), ...entry }, ...prev])
  }

  function updateExpense(id, entry) {
    setExpenses((prev) => prev.map((x) => (x.id === id ? { ...x, ...entry } : x)))
  }

  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((x) => x.id !== id))
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <nav className="navbar">
        <span className="brand">Expense Tracker</span>
        <div className="nav-right">
          {currentUser?.role === 'admin' && (
            <div className="nav-links">
              <NavLink to="/admin" className={navLinkClass}>
                Users
              </NavLink>
            </div>
          )}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="nav-links">
              <NavLink to="/" end className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/expenses" className={navLinkClass}>
                Expenses
              </NavLink>
            </div>
          )}
          {currentUser ? (
            <div className="nav-user">
              <span className="nav-username">
                {currentUser.username}
                {currentUser.role === 'admin' ? ' · admin' : ''}
              </span>
              <button className="btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="nav-links">
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                Sign up
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard expenses={expenses} />
            </RequireAuth>
          }
        />
        <Route
          path="/expenses"
          element={
            <RequireAuth>
              <Expenses expenses={expenses} onAdd={addExpense} onUpdate={updateExpense} onDelete={deleteExpense} />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth adminOnly>
              <Admin />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users/:username"
          element={
            <RequireAuth adminOnly>
              <AdminUserDetail />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
