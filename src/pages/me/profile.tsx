import { Link } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function ProfilePage() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>マイページ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.iconUrl ?? undefined} />
              <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">{user.name}</p>
              <Badge variant="secondary">{user.role === 'admin' ? '管理者' : '一般'}</Badge>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/me/name">名前を変更</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/me/icon">アイコンを変更</Link>
            </Button>
          </div>
          <Separator />
          <Button variant="destructive" className="w-full" onClick={signOut}>
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
