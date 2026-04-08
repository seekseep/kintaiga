import { validateActivityDates } from '../rules'

export type BulkParseLineResult =
  | {
      ok: true
      lineNumber: number
      raw: string
      startedAt: string
      endedAt: string
      note: string | null
    }
  | {
      ok: false
      lineNumber: number
      raw: string
      error: string
    }

const DATETIME_RE = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})\s+(\d{1,2}):(\d{2})$/

function parseDatetime(token: string): Date | null {
  const m = token.trim().match(DATETIME_RE)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const hours = Number(m[4])
  const minutes = Number(m[5])
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (hours > 23 || minutes > 59) return null
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0)
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null
  }
  return d
}

function parseLine(raw: string, lineNumber: number): BulkParseLineResult {
  const parts = raw.split(',').map((p) => p.trim())
  if (parts.length < 2 || parts.length > 3) {
    return {
      ok: false,
      lineNumber,
      raw,
      error: '形式は「日時,日時,内容」です',
    }
  }

  const startDate = parseDatetime(parts[0])
  if (!startDate) {
    return { ok: false, lineNumber, raw, error: '開始日時を認識できませんでした' }
  }
  const endDate = parseDatetime(parts[1])
  if (!endDate) {
    return { ok: false, lineNumber, raw, error: '終了日時を認識できませんでした' }
  }

  const validation = validateActivityDates(startDate, endDate)
  if (!validation.valid) {
    return { ok: false, lineNumber, raw, error: validation.error ?? '日時が不正です' }
  }

  const note = parts[2] && parts[2].length > 0 ? parts[2] : null

  return {
    ok: true,
    lineNumber,
    raw,
    startedAt: startDate.toISOString(),
    endedAt: endDate.toISOString(),
    note,
  }
}

export function parseBulkActivities(input: string): BulkParseLineResult[] {
  const lines = input.split(/\r?\n/)
  const results: BulkParseLineResult[] = []
  lines.forEach((line, idx) => {
    if (line.trim().length === 0) return
    results.push(parseLine(line, idx + 1))
  })
  return results
}
