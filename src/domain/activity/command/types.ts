import { z } from 'zod/v4'

export const CommandTargetSchema = z.enum(['both', 'start', 'end'])

export const ShiftCommandSchema = z.object({
  type: z.literal('shift'),
  target: CommandTargetSchema,
  offsetMinutes: z.number().refine((v) => v !== 0, 'オフセットは0以外を指定してください'),
})

export const SetTimeCommandSchema = z.object({
  type: z.literal('set_time'),
  target: z.enum(['start', 'end']),
  hours: z.number().min(0).max(23),
  minutes: z.number().min(0).max(59),
})

export const SetDateCommandSchema = z.object({
  type: z.literal('set_date'),
  target: CommandTargetSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const ActivityCommandSchema = z.discriminatedUnion('type', [
  ShiftCommandSchema,
  SetTimeCommandSchema,
  SetDateCommandSchema,
])

export type CommandTarget = z.infer<typeof CommandTargetSchema>
export type ShiftCommand = z.infer<typeof ShiftCommandSchema>
export type SetTimeCommand = z.infer<typeof SetTimeCommandSchema>
export type SetDateCommand = z.infer<typeof SetDateCommandSchema>
export type ActivityCommand = z.infer<typeof ActivityCommandSchema>

export type ParseResult =
  | { ok: true; command: ActivityCommand }
  | { ok: false; error: string }

export type ActivityInput = {
  id: string
  startedAt: string
  endedAt: string | null
}

export type ActivityPreview = {
  startedAt: string
  endedAt: string | null
}
