import { createContext, useContext, useEffect, useState } from 'react'
import { ADMIN_PASSWORD, ADMIN_USERNAME, SESSION_KEY, USERS_KEY, hashPassword } from './constants'

const AuthContext = createContext(null)

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? []
  } catch {
    return []
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [currentUser, setCurrentUser] = useState(loadSession)

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser))
    else localStorage.removeItem(SESSION_KEY)
  }, [currentUser])

  async function signup(usernameInput, password) {
    const username = usernameInput.trim()
    if (!username || !password) return { ok: false, error: 'Username and password are required.' }
    if (username.toLowerCase() === ADMIN_USERNAME) return { ok: false, error: 'That username is reserved.' }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: 'That username is already taken.' }
    }
    const passwordHash = await hashPassword(password)
    setUsers([...users, { username, passwordHash }])
    setCurrentUser({ username, role: 'user' })
    return { ok: true, role: 'user' }
  }

  async function login(usernameInput, password) {
    const username = usernameInput.trim()
    const passwordHash = await hashPassword(password)

    if (username === ADMIN_USERNAME && passwordHash === (await hashPassword(ADMIN_PASSWORD))) {
      setCurrentUser({ username: ADMIN_USERNAME, role: 'admin' })
      return { ok: true, role: 'admin' }
    }

    let match = users.find((u) => u.username === username && u.passwordHash === passwordHash)

    // migrate any pre-hash accounts (plain-text `password` field) on next successful login
    if (!match) {
      const legacy = users.find((u) => u.username === username && u.password === password)
      if (legacy) {
        match = { username: legacy.username }
        setUsers(users.map((u) => (u.username === username ? { username: u.username, passwordHash } : u)))
      }
    }

    if (!match) return { ok: false, error: 'Invalid username or password.' }
    setCurrentUser({ username: match.username, role: 'user' })
    return { ok: true, role: 'user' }
  }

  function logout() {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, users, signup, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
