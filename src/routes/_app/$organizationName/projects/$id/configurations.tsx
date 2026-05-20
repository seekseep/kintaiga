import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$organizationName/projects/$id/configurations')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$organizationName/projects/$id/settings/activities',
      params: { organizationName: params.organizationName, id: params.id },
    })
  },
})
