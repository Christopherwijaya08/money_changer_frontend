import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
const TOKEN_KEY = 'money-changer-token'

export const API_BASE_URL = BASE_URL

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

const http = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('money-changer-role')
      localStorage.removeItem('money-changer-user-id')
      window.location.href = '/login'
    }

    const data = error.response?.data
    throw new ApiError(data?.message ?? error.message ?? 'Terjadi kesalahan', error.response?.status, data?.errors)
  }
)

export const apiClient = {
  get: (path, params) => http.get(path, { params }),
  post: (path, body) => http.post(path, body),
  put: (path, body) => http.put(path, body),
  delete: (path) => http.delete(path),
  download: (path, params) => http.get(path, { params, responseType: 'blob' }),
}
