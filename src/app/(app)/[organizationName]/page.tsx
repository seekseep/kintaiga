'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function OrganizationPage() {
  const { organizationName } = useParams<{ organizationName: string }>()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/${organizationName}/projects`)
  }, [organizationName, router])

  return null
}
