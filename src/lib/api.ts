import axios, { AxiosError } from 'axios'
import { supabase } from './supabase'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター: JWTトークンを付与
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new ApiError(401, 'Not authenticated')
  config.headers.Authorization = `Bearer ${session.access_token}`
  return config
})

// レスポンスインターセプター: 401時にトークンリフレッシュしてリトライ
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    if (error.response?.status === 401) {
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError || !session) {
        return Promise.reject(new ApiError(401, 'Session expired'))
      }
      originalRequest.headers.Authorization = `Bearer ${session.access_token}`
      return api(originalRequest)
    }

    const status = error.response?.status ?? 500
    const data = error.response?.data as Record<string, unknown> | undefined
    const message = (data?.error as string) ?? error.message ?? 'Unknown error'
    return Promise.reject(new ApiError(status, message))
  },
)
