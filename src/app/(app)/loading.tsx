import Image from 'next/image'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Image
        src="/favicon.png"
        alt="読み込み中"
        width={64}
        height={64}
        className="animate-bounce"
      />
    </div>
  )
}
