import { validateActivityDates } from '../rules'

export type BulkParseLineResult =
  | {
      ok: true
      lineNumber: number
      raw: string
      startedAt: string
      endedAt: string | null
      note: string | null
    }
  | {
      ok: false
      lineNumber: number
      raw: string
      error: string
    }

type ParsedDate = { year: number; month: number; day: number }
type ParsedTime = { hours: number; minutes: number }

const DATE_RE = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/
const TIME_COLON_RE = /^(\d{1,2}):(\d{2})$/
const TIME_HHMM_RE = /^(\d{4})$/

function parseDateToken(token: string): ParsedDate | null {
  const m = token.match(DATE_RE)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  // 実在日チェック
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null
  }
  return { year, month, day }
}

function parseTimeToken(token: string): ParsedTime | null {
  let m = token.match(TIME_COLON_RE)
  if (m) {
    const hours = Number(m[1])
    const minutes = Number(m[2])
    if (hours > 23 || minutes > 59) return null
    return { hours, minutes }
  }
  m = token.match(TIME_HHMM_RE)
  if (m) {
    const hours = Number(token.slice(0, 2))
    const minutes = Number(token.slice(2, 4))
    if (hours > 23 || minutes > 59) return null
    return { hours, minutes }
  }
  return null
}

function parseBaseDate(baseDate: string): ParsedDate | null {
  // baseDate: "YYYY-MM-DD"
  const m = baseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  return parseDateToken(`${m[1]}-${m[2]}-${m[3]}`)
}

function buildDate(date: ParsedDate, time: ParsedTime): Date {
  return new Date(date.year, date.month - 1, date.day, time.hours, time.minutes, 0, 0)
}

type Token =
  | { kind: 'datetime'; date: ParsedDate; time: ParsedTime }
  | { kind: 'date'; date: ParsedDate }
  | { kind: 'time'; time: ParsedTime }
  | { kind: 'text'; value: string }

function tokenizeLine(line: string): Token[] {
  // 区切り文字: タブ / カンマ / パイプ / 連続スペース / ハイフン・チルダ・全角チルダ
  // ただし日付の `-` と `/` は内部で使うので、まず大きな区切りで割る
  const chunks = line
    .split(/[\t,|]+|\s*[-~〜]\s*|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const tokens: Token[] = []

  for (const chunk of chunks) {
    // 1チャンク内が単一スペースで複数語ある場合
    // 「日付 時刻」の組を datetime として優先的に拾い、残りを単独トークンに
    const parts = chunk.split(/\s+/).filter((s) => s.length > 0)
    let i = 0
    while (i < parts.length) {
      const cur = parts[i]
      const next = parts[i + 1]
      const date = parseDateToken(cur)
      if (date && next) {
        const time = parseTimeToken(next)
        if (time) {
          tokens.push({ kind: 'datetime', date, time })
          i += 2
          continue
        }
      }
      if (date) {
        tokens.push({ kind: 'date', date })
        i += 1
        continue
      }
      const time = parseTimeToken(cur)
      if (time) {
        tokens.push({ kind: 'time', time })
        i += 1
        continue
      }
      tokens.push({ kind: 'text', value: cur })
      i += 1
    }
  }

  return tokens
}

function parseLine(
  raw: string,
  lineNumber: number,
  baseDate: ParsedDate | null,
): BulkParseLineResult {
  const tokens = tokenizeLine(raw)
  const datetimes = tokens.filter((t): t is Extract<Token, { kind: 'datetime' }> => t.kind === 'datetime')
  const dates = tokens.filter((t): t is Extract<Token, { kind: 'date' }> => t.kind === 'date')
  const times = tokens.filter((t): t is Extract<Token, { kind: 'time' }> => t.kind === 'time')
  const texts = tokens.filter((t): t is Extract<Token, { kind: 'text' }> => t.kind === 'text')

  let startDate: Date | null = null
  let endDate: Date | null = null

  if (datetimes.length >= 2) {
    startDate = buildDate(datetimes[0].date, datetimes[0].time)
    endDate = buildDate(datetimes[1].date, datetimes[1].time)
  } else if (datetimes.length === 1 && times.length >= 1) {
    startDate = buildDate(datetimes[0].date, datetimes[0].time)
    endDate = buildDate(datetimes[0].date, times[0].time)
  } else if (datetimes.length === 1) {
    startDate = buildDate(datetimes[0].date, datetimes[0].time)
  } else if (dates.length >= 1 && times.length >= 2) {
    startDate = buildDate(dates[0].date, times[0].time)
    endDate = buildDate(dates[0].date, times[1].time)
  } else if (dates.length >= 1 && times.length === 1) {
    startDate = buildDate(dates[0].date, times[0].time)
  } else if (times.length >= 2) {
    if (!baseDate) {
      return { ok: false, lineNumber, raw, error: '基準日が必要です' }
    }
    startDate = buildDate(baseDate, times[0].time)
    endDate = buildDate(baseDate, times[1].time)
  } else if (times.length === 1) {
    if (!baseDate) {
      return { ok: false, lineNumber, raw, error: '基準日が必要です' }
    }
    startDate = buildDate(baseDate, times[0].time)
  } else {
    return { ok: false, lineNumber, raw, error: '日時を認識できませんでした' }
  }

  if (!startDate) {
    return { ok: false, lineNumber, raw, error: '開始日時を構築できませんでした' }
  }

  const validation = validateActivityDates(startDate, endDate)
  if (!validation.valid) {
    return { ok: false, lineNumber, raw, error: validation.error ?? '日時が不正です' }
  }

  const note = texts.length > 0 ? texts.map((t) => t.value).join(' ') : null

  return {
    ok: true,
    lineNumber,
    raw,
    startedAt: startDate.toISOString(),
    endedAt: endDate ? endDate.toISOString() : null,
    note,
  }
}

export function parseBulkActivities(
  input: string,
  options: { baseDate: string },
): BulkParseLineResult[] {
  const baseDate = parseBaseDate(options.baseDate)
  const lines = input.split(/\r?\n/)
  const results: BulkParseLineResult[] = []
  lines.forEach((line, idx) => {
    if (line.trim().length === 0) return
    results.push(parseLine(line, idx + 1, baseDate))
  })
  return results
}
