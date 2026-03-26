import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { uploadMyIcon } from '@/api/me'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function EditIconPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(user?.iconUrl ?? null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      setDataUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const mutation = useMutation({
    mutationFn: () => uploadMyIcon({ icon: dataUrl! }),
    onSuccess: async () => {
      await refreshUser()
      toast.success('アイコンを変更しました')
      navigate('/me')
    },
    onError: () => toast.error('変更に失敗しました'),
  })

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>アイコンの変更</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={preview ?? undefined} />
                <AvatarFallback className="text-2xl">{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
              画像を選択
            </Button>
            <Button type="submit" className="w-full" disabled={mutation.isPending || !dataUrl}>
              {mutation.isPending ? 'アップロード中...' : 'アップロード'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
