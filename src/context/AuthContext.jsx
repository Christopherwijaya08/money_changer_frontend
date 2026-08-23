import { createContext, useContext, useState } from 'react'
import { apiClient } from '../api/apiClient'

export const TOKEN_KEY = 'money-changer-token'
const ROLE_KEY = 'money-changer-role'
const USER_ID_KEY = 'money-changer-user-id'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY))
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem(USER_ID_KEY)
    return stored ? Number(stored) : null
  })

  function login(newToken, user) {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(ROLE_KEY, user.role)
    localStorage.setItem(USER_ID_KEY, String(user.id))
    setToken(newToken)
    setRole(user.role)
    setUserId(user.id)
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(USER_ID_KEY)
    setToken(null)
    setRole(null)
    setUserId(null)
  }

  async function logout() {
    try {
      await apiClient.post('/logout')
    } catch {
      // ponytail: token may already be invalid — clear local session regardless
    }
    clearSession()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
