import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import { defineServerFn } from '@/lib/server-fn'
import {
  exportOrganization as exportOrganizationService,
  importOrganization as importOrganizationService,
} from '@/services/organization'
import type { OrganizationExportPayload } from '@/services/organization/exportOrganization/schema'
import type { ImportOrganizationResult } from '@/services/organization/importOrganization'

export const exportOrganizationData = defineServerFn(
  async (organizationName: string): Promise<OrganizationExportPayload> => {
    const executor = await getOrganizationExecutor(organizationName)
    return exportOrganizationService({ db }, executor)
  },
)

export const importOrganizationData = defineServerFn(
  async ({
    organizationName,
    body,
  }: {
    organizationName: string
    body: { payload: OrganizationExportPayload; overwriteConfiguration?: boolean }
  }): Promise<ImportOrganizationResult> => {
    const executor = await getOrganizationExecutor(organizationName)
    return importOrganizationService({ db }, executor, body)
  },
)
