import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getProjects } from '@/api/projects'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

export function ProjectListPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">プロジェクト</h1>
        <Button asChild>
          <Link to="/projects/new"><Plus className="mr-2 h-4 w-4" />新規プロジェクト</Link>
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>説明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link to={`/projects/${p.id}`} className="hover:underline">{p.name}</Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.description ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
