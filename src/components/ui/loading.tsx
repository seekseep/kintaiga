import Image from 'next/image'

type LoadingProps = {
  label?: string
}

export function Loading({ label }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
      <Image
        src="/favicon.png"
        alt="読み込み中"
        width={64}
        height={64}
        className="animate-bounce"
      />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  )
}
