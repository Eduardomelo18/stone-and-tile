import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, letterSpacing: -0.5 }}>
          ST
        </div>
      </div>
    ),
    { ...size }
  )
}
