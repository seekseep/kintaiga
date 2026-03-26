import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '@/lib/api'
import type { User } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

export function UserListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<User[]>('/users').then(setUsers).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ユーザー</h1>
        <Button asChild>
          <Link to="/users/new"><Plus className="mr-2 h-4 w-4" />新規ユーザー</Link>
        </Button>
      </div>
      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ユーザー</TableHead>
              <TableHead>ロール</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="cursor-pointer" onClick={() => {}}>
                <TableCell>
                  <Link to={`/users/${u.id}`} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.iconUrl ?? undefined} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {u.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                    {u.role === 'admin' ? '管理者' : '一般'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
