import { createContext, useContext, useState } from 'react'

// ponytail: localStorage until the real login API (Fase 5 backend) issues a token
const STORAGE_KEY = 'money-changer-authenticated'
const ROLE_KEY = 'money-changer-role'
const USER_ID_KEY = 'money-changer-user-id'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY))
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem(USER_ID_KEY)
    return stored ? Number(stored) : null
  })

  function login(userRole, id) {
    localStorage.setItem(STORAGE_KEY, 'true')
    localStorage.setItem(ROLE_KEY, userRole)
    localStorage.setItem(USER_ID_KEY, String(id))
    setIsAuthenticated(true)
    setRole(userRole)
    setUserId(id)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(USER_ID_KEY)
    setIsAuthenticated(false)
    setRole(null)
    setUserId(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userId, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
