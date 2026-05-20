import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/$organizationName/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$organizationName/projects',
      params: { organizationName: params.organizationName },
    })
  },
})
