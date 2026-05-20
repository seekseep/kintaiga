import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import {
  exportOrganization as exportOrganizationService,
  importOrganization as importOrganizationService,
} from '@/services/organization'
import type { OrganizationExportPayload } from '@/services/organization/exportOrganization/schema'
import type { ImportOrganizationResult } from '@/services/organization/importOrganization'

export const exportOrganizationData = createServerFn({ method: 'GET' })
  .inputValidator((organizationName: string) => organizationName)
  .handler(async ({ data: organizationName }): Promise<OrganizationExportPayload> => {
    const executor = await getOrganizationExecutor(organizationName)
    return exportOrganizationService({ db }, executor)
  })

export const importOrganizationData = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      organizationName: string
      body: { payload: OrganizationExportPayload; overwriteConfiguration?: boolean }
    }) => data,
  )
  .handler(async ({ data }): Promise<ImportOrganizationResult> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    return importOrganizationService({ db }, executor, data.body)
  })
