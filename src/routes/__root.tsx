/// <reference types="vite/client" />
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { Providers } from '@/components/providers'
import { Button } from '@/components/ui/button'
import globalsCss from '@/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'キンタイガ' },
      { name: 'description', content: '勤怠の虎 - キンタイガ' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.png' },
      { rel: 'stylesheet', href: globalsCss },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>
          <Outlet />
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">ページが見つかりません</p>
      <Button asChild variant="outline">
        <Link to="/">ホームに戻る</Link>
      </Button>
    </div>
  )
}
