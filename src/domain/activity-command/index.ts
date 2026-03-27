import { ActivityCommandSchema } from './types'
import type { CommandTarget, ActivityCommand, ParseResult, ActivityInput, ActivityPreview } from './types'

export type { CommandTarget, ShiftCommand, SetTimeCommand, SetDateCommand, ActivityCommand, ParseResult, ActivityInput, ActivityPreview } from './types'
export { ActivityCommandSchema, ShiftCommandSchema, SetTimeCommandSchema, SetDateCommandSchema, CommandTargetSchema } from './types'

function parseTarget(raw: string | undefined): CommandTarget {
  return (raw?.toLowerCase() as 'start' | 'end') ?? 'both'
}

function tokenize(input: string): { ok: true; command: unknown } | { ok: false; error: string } {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: 'コマンドを入力してください' }

  // set_date: [target] date YYYY-MM-DD
  const dateMatch = trimmed.match(/^(?:(start|end)\s+)?date\s+(\d{4}-\d{2}-\d{2})$/i)
  if (dateMatch) {
    const dateStr = dateMatch[2]
    if (isNaN(new Date(dateStr + 'T00:00:00').getTime())) return { ok: false, error: '無効な日付です' }
    return { ok: true, command: { type: 'set_date', target: parseTarget(dateMatch[1]), date: dateStr } }
  }

  // set_time: (start|end) HH:MM
  const timeMatch = trimmed.match(/^(start|end)\s+(\d{1,2}):(\d{2})$/i)
  if (timeMatch) {
    return {
      ok: true,
      command: {
        type: 'set_time',
        target: timeMatch[1].toLowerCase(),
        hours: parseInt(timeMatch[2], 10),
        minutes: parseInt(timeMatch[3], 10),
      },
    }
  }

  // shift: [target] (+|-)Nh|m
  const shiftMatch = trimmed.match(/^(?:(start|end)\s+)?([+-]\d+)(h|m)$/i)
  if (shiftMatch) {
    const value = parseInt(shiftMatch[2], 10)
    const offsetMinutes = shiftMatch[3].toLowerCase() === 'h' ? value * 60 : value
    return { ok: true, command: { type: 'shift', target: parseTarget(shiftMatch[1]), offsetMinutes } }
  }

  return { ok: false, error: '認識できないコマンドです' }
}

export function parseCommand(input: string): ParseResult {
  const tokenized = tokenize(input)
  if (!tokenized.ok) return tokenized

  const result = ActivityCommandSchema.safeParse(tokenized.command)
  if (!result.success) {
    const issue = result.error.issues[0]
    return { ok: false, error: issue?.message ?? 'バリデーションエラー' }
  }
  return { ok: true, command: result.data }
}

function affectsField(target: CommandTarget, field: 'start' | 'end'): boolean {
  return target === 'both' || target === field
}

function transformField(
  iso: string | null,
  field: 'start' | 'end',
  target: CommandTarget,
  transform: (d: Date) => Date
): string | null {
  if (!affectsField(target, field) || iso === null) return iso
  return transform(new Date(iso)).toISOString()
}

export function applyCommand(
  command: ActivityCommand,
  activity: { startedAt: string; endedAt: string | null }
): ActivityPreview {
  const apply = (field: 'start' | 'end', iso: string | null) => {
    switch (command.type) {
      case 'shift': {
        const offsetMs = command.offsetMinutes * 60 * 1000
        return transformField(iso, field, command.target, (d) => new Date(d.getTime() + offsetMs))
      }
      case 'set_time':
        return transformField(iso, field, command.target, (d) => {
          d.setUTCHours(command.hours, command.minutes, 0, 0)
          return d
        })
      case 'set_date': {
        const [year, month, day] = command.date.split('-').map(Number)
        return transformField(iso, field, command.target, (d) => {
          d.setUTCFullYear(year, month - 1, day)
          return d
        })
      }
    }
  }

  return {
    startedAt: apply('start', activity.startedAt)!,
    endedAt: apply('end', activity.endedAt),
  }
}

export function computePreview(
  command: ActivityCommand,
  activities: ActivityInput[]
): Map<string, ActivityPreview> {
  return new Map(activities.map((a) => [a.id, applyCommand(command, a)]))
}
