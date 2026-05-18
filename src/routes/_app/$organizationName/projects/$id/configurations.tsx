import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$organizationName/projects/$id/configurations')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: `/${params.organizationName}/projects/${params.id}/settings/activities`,
    })
  },
})
