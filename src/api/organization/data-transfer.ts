'use server'

import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import {
  exportOrganization as exportOrganizationService,
  importOrganization as importOrganizationService,
} from '@/services/organization'
import type { OrganizationExportPayload } from '@/services/organization/exportOrganization/schema'
import type { ImportOrganizationResult } from '@/services/organization/importOrganization'

export async function exportOrganizationData(
  organizationName: string,
): Promise<OrganizationExportPayload> {
  const executor = await getOrganizationExecutor(organizationName)
  return exportOrganizationService({ db }, executor)
}

export async function importOrganizationData(
  organizationName: string,
  body: { payload: OrganizationExportPayload; overwriteConfiguration?: boolean },
): Promise<ImportOrganizationResult> {
  const executor = await getOrganizationExecutor(organizationName)
  return importOrganizationService({ db }, executor, body)
}
