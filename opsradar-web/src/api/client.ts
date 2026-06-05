export type ApiError = Error & { status?: number }

const API_BASE = import.meta.env.VITE_API_BASE || ''

export function getToken() {
  return localStorage.getItem('opsradar_token') || ''
}

export function setToken(token: string) {
  localStorage.setItem('opsradar_token', token)
}

export function clearToken() {
  localStorage.removeItem('opsradar_token')
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('content-type') && options.body) headers.set('content-type', 'application/json')
  const token = getToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!response.ok) {
    const error = new Error((await response.text()) || response.statusText) as ApiError
    error.status = response.status
    throw error
  }
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return (await response.text()) as T
  return response.json()
}

export async function login(username: string, password: string) {
  const response = await api<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  setToken(response.token)
  return response.user
}

export type User = {
  id: string
  username: string
  display_name?: string
  role: string
  permissions: string[]
}

export type Resource = {
  id: string
  name: string
  resource_type: string
  host: string
  port: number
  protocol: string
  status: string
  tags?: string[]
}

export type Task = {
  id: string
  name: string
  status: string
  task_type: string
  summary?: { success?: number; fail?: number }
  created_at: string
}

export type Issue = {
  id: string
  title: string
  status: string
  severity: string
  ai_status: string
  created_at: string
}

export type Report = {
  id: string
  task_id: string
  name: string
  health_score: number
  status: string
  created_at: string
}
