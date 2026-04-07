import { api } from '@/lib/api'
import type { OrganizationExportPayload } from '@/services/organization/exportOrganization/schema'
import type { ImportOrganizationResult } from '@/services/organization/importOrganization'

export async function exportOrganizationData(
  organizationName: string,
): Promise<OrganizationExportPayload> {
  const { data } = await api.get<OrganizationExportPayload>(
    `/organizations/${organizationName}/export`,
  )
  return data
}

export async function importOrganizationData(
  organizationName: string,
  body: { payload: OrganizationExportPayload; overwriteConfiguration?: boolean },
): Promise<ImportOrganizationResult> {
  const { data } = await api.post<ImportOrganizationResult>(
    `/organizations/${organizationName}/import`,
    body,
  )
  return data
}
