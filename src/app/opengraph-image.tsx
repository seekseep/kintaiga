import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'
export const alt = 'キンタイガ - 勤怠の虎'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const faviconData = await readFile(join(process.cwd(), 'public', 'favicon.png'))
  const faviconBase64 = `data:image/png;base64,${faviconData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #FFA726 0%, #FF7043 50%, #EF5350 100%)',
          gap: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 320,
            height: 320,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <img src={faviconBase64} width={280} height={280} />
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#ffffff',
          }}
        >
          キンタイガ
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          勤怠の虎
        </div>
      </div>
    ),
    { ...size }
  )
}
