export type PaginatedResponse<T> = {
  items: T[]
  limit: number
  offset: number
  size: number
}

export type PaginationParams = {
  limit?: number
  offset?: number
}
