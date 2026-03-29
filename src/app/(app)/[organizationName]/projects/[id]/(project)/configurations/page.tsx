'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ConfigurationsRedirect() {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/${organizationName}/projects/${id}/settings/activities`)
  }, [router, organizationName, id])

  return null
}
