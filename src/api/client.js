const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const API_BASE_URL = BASE_URL

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE_URL + path)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
    })
  }

  const isFormData = body instanceof FormData
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const data = response.status === 204 ? null : await response.json()

  if (!response.ok) {
    throw new ApiError(data?.message ?? 'Terjadi kesalahan', response.status, data?.errors)
  }

  return data
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
