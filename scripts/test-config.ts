import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const userEmail = 'seekseep+2@gmail.com'
  const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const u = list.users.find(x => x.email === userEmail)!
  await admin.auth.admin.updateUserById(u.id, { password: 'tempPass!234' })
  const anon = createClient(process.env.SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data } = await anon.auth.signInWithPassword({ email: userEmail, password: 'tempPass!234' })
  const token = data.session!.access_token
  const res = await fetch('http://localhost:3000/api/organizations/comococo/projects/97d77275-04fe-4c3d-93ad-ea9c62186020/configuration', {
    headers: { Authorization: `Bearer ${token}` },
  })
  console.log('status', res.status)
  console.log('body', await res.text())
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
