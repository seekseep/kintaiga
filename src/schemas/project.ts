import { z } from 'zod/v4'
import { RoundingDirectionSchema, AggregationUnitSchema } from './_helpers'
import { ROUNDING_INTERVALS } from '@/domain/config'

export const ProjectRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  roundingInterval: z.number().nullable(),
  roundingDirection: RoundingDirectionSchema.nullable(),
  aggregationUnit: AggregationUnitSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  roundingInterval: z.number().nullable(),
  roundingDirection: RoundingDirectionSchema.nullable(),
  aggregationUnit: AggregationUnitSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProjectRecord = z.infer<typeof ProjectRecordSchema>
export type Project = z.infer<typeof ProjectSchema>

// UserProjectStatement: ユーザーから見たプロジェクトの状態
export const MembershipStatusSchema = z.enum(['joined', 'suspended', 'none'])
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>

export const UserProjectStatementSchema = ProjectSchema.extend({
  membershipStatus: MembershipStatusSchema,
})
export type UserProjectStatement = z.infer<typeof UserProjectStatementSchema>

// Request body schemas
export const CreateProjectParametersSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
})
export const UpdateProjectParametersSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  roundingInterval: z.number().refine(v => (ROUNDING_INTERVALS as readonly number[]).includes(v)).nullable().optional(),
  roundingDirection: RoundingDirectionSchema.nullable().optional(),
  aggregationUnit: AggregationUnitSchema.nullable().optional(),
})

export type CreateProjectBody = z.infer<typeof CreateProjectParametersSchema>
export type UpdateProjectBody = z.infer<typeof UpdateProjectParametersSchema>
