export type PaginatedResponse<T> = {
  items: T[]
  limit: number
  offset: number
  size: number
}

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

export function parsePagination(url: URL) {
  const limitParam = url.searchParams.get('limit')
  const offsetParam = url.searchParams.get('offset')

  const limit = Math.min(
    Math.max(limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  )
  const offset = Math.max(offsetParam ? parseInt(offsetParam, 10) : 0, 0)

  return { limit, offset }
}

export function paginatedResponse<T>(
  items: T[],
  size: number,
  pagination: { limit: number; offset: number },
): PaginatedResponse<T> {
  return {
    items,
    limit: pagination.limit,
    offset: pagination.offset,
    size,
  }
}
