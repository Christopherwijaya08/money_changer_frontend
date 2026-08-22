import { createContext, useContext, useState } from 'react'

// ponytail: localStorage flag until the real login API (Fase 5 backend) issues a token
const STORAGE_KEY = 'money-changer-authenticated'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')

  function login() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsAuthenticated(true)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
