export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other']
export const CATEGORY_SLOT = Object.fromEntries(CATEGORIES.map((c, i) => [c, i + 1]))

export const USERS_KEY = 'users'
export const SESSION_KEY = 'session'
export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD = 'admin786'

export const today = () => new Date().toISOString().slice(0, 10)
export const money = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function expensesKey(username) {
  return `expenses_${username}`
}

export function loadExpenses(username) {
  if (!username) return []
  try {
    return JSON.parse(localStorage.getItem(expensesKey(username))) ?? []
  } catch {
    return []
  }
}

export function saveExpenses(username, expenses) {
  if (!username) return
  localStorage.setItem(expensesKey(username), JSON.stringify(expenses))
}

export async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
