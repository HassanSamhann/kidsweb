import { ImageResponse } from 'next/og';

export const alt = 'Islamy - Islamic Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Star/crescent icon */}
        <svg width="80" height="80" viewBox="0 0 24 24" fill="#06b6d4" style={{ marginBottom: 20 }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#f8fafc', marginBottom: 8, letterSpacing: 1 }}>
          Islamy
        </div>
        <div style={{ fontSize: 20, color: '#64748b', marginBottom: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
          Islamic Platform
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.6,
            padding: '0 40px',
          }}
        >
          Quran · Hadith · Azkar · Prayer Times · 99 Names · Challenges
        </div>
        <div style={{ fontSize: 16, color: '#06b6d4', marginTop: 32, opacity: 0.8 }}>
          islamy-rust.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
