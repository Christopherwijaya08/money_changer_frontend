import { createContext, useContext, useState } from 'react'

// ponytail: localStorage until the real login API (Fase 5 backend) issues a token
const STORAGE_KEY = 'money-changer-authenticated'
const ROLE_KEY = 'money-changer-role'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY))

  function login(userRole) {
    localStorage.setItem(STORAGE_KEY, 'true')
    localStorage.setItem(ROLE_KEY, userRole)
    setIsAuthenticated(true)
    setRole(userRole)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ROLE_KEY)
    setIsAuthenticated(false)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
