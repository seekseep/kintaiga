'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProject, updateProject, deleteProject } from '@/api/projects'
import { getAssignments, createAssignment, deleteAssignment } from '@/api/assignments'
import { getUsers } from '@/api/users'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    select: (data) => {
      if (!editing && name === '' && description === '') {
        setName(data.name)
        setDescription(data.description ?? '')
      }
      return data
    },
  })

  const { data: allUsers = [], isLoading: loadingAllUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['projects', id, 'assignments'],
    queryFn: () => getAssignments({ projectId: id }),
  })

  const assignedUserIds = new Set(assignments.map(a => a.userId))
  const assignedUsers = allUsers.filter(u => assignedUserIds.has(u.id))
  const unassignedUsers = allUsers.filter(u => !assignedUserIds.has(u.id))

  const assignMutation = useMutation({
    mutationFn: (userId: string) => createAssignment({ projectId: id, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id, 'assignments'] })
      setSelectedUserId('')
      toast.success('ユーザーをアサインしました')
    },
    onError: () => toast.error('アサインに失敗しました'),
  })

  const unassignMutation = useMutation({
    mutationFn: (assignmentId: string) => deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id, 'assignments'] })
      toast.success('アサインを解除しました')
    },
    onError: () => toast.error('アサイン解除に失敗しました'),
  })

  const saveMutation = useMutation({
    mutationFn: () => updateProject(id, { name, description: description || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      setEditing(false)
      toast.success('更新しました')
    },
    onError: () => toast.error('更新に失敗しました'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      toast.success('削除しました')
      router.push('/projects')
    },
  })

  const loading = loadingProject || loadingAllUsers || loadingAssignments

  if (loading) return <Skeleton className="h-64" />
  if (!project) return <p className="text-center text-muted-foreground">プロジェクトが見つかりません</p>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.name}</CardTitle>
            <div className="flex gap-2">
              {!editing && <Button variant="outline" onClick={() => setEditing(true)}>編集</Button>}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">削除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>プロジェクトとアサインメントが削除されます。</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate()}>削除</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }} className="space-y-4">
            <div className="space-y-2">
              <Label>名前</Label>
              <Input value={name} onChange={e => setName(e.target.value)} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!editing} />
            </div>
            {editing && (
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>{saveMutation.isPending ? '保存中...' : '保存'}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>キャンセル</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="mb-4 text-xl font-semibold">アサイン済みユーザー</h2>
        {unassignedUsers.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="ユーザーを選択" />
              </SelectTrigger>
              <SelectContent>
                {unassignedUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => assignMutation.mutate(selectedUserId)}
              disabled={!selectedUserId || assignMutation.isPending}
            >
              追加
            </Button>
          </div>
        )}
        {assignedUsers.length === 0 ? (
          <p className="text-muted-foreground">ユーザーがアサインされていません</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedUsers.map(u => {
                const assignment = assignments.find(a => a.userId === u.id)
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/projects/${id}/user/${u.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.iconUrl ?? undefined} />
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {u.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignment && unassignMutation.mutate(assignment.id)}
                        disabled={unassignMutation.isPending}
                      >
                        解除
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
