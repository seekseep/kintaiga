'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { Plus } from 'lucide-react'

export function CreateProjectButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-3 w-3" />
        追加
      </Button>
      <CreateProjectDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
