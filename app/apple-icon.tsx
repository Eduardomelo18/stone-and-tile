import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {/* Tile grid icon */}
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 32, height: 32, background: '#475569', borderRadius: 4 }} />
          <div style={{ width: 32, height: 32, background: '#64748b', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 32, height: 32, background: '#64748b', borderRadius: 4 }} />
          <div style={{ width: 32, height: 32, background: '#475569', borderRadius: 4 }} />
        </div>
        {/* Label */}
        <div style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginTop: 8, letterSpacing: -1 }}>
          S&T
        </div>
      </div>
    ),
    { ...size }
  )
}
