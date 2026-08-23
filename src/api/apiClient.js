import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

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

// ponytail: no real session yet (Sanctum auth lands in Fase 5) — this is where
// the Authorization: Bearer <token> header will get attached once it exists.
http.interceptors.request.use((config) => config)

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data
    throw new ApiError(data?.message ?? error.message ?? 'Terjadi kesalahan', error.response?.status, data?.errors)
  }
)

export const apiClient = {
  get: (path, params) => http.get(path, { params }),
  post: (path, body) => http.post(path, body),
  put: (path, body) => http.put(path, body),
  delete: (path) => http.delete(path),
}
