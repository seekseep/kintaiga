import { getWebRequest } from '@tanstack/react-start/server'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'

export async function getServerSupabase() {
  const request = getWebRequest()
  const cookieHeader = request?.headers.get('Cookie') ?? ''
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookieHeader).map(({ name, value }) => ({
            name,
            value: value ?? '',
          }))
        },
        setAll() {
          // Server Action 内ではレスポンスの set-cookie はできない (TanStack Start middleware で扱う)
        },
      },
    },
  )
}
