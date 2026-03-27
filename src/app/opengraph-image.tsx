import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '🐯 キンタイガ - 勤怠の虎'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          backgroundColor: '#ffffff',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 200 }}>🐯</div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#333333',
          }}
        >
          キンタイガ
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#888888',
          }}
        >
          勤怠の虎
        </div>
      </div>
    ),
    { ...size }
  )
}
