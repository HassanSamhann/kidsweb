import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
          borderRadius: 48,
          fontFamily: '"Noto Kufi Arabic", Arial, sans-serif',
          fontWeight: 900,
          fontSize: 110,
          color: 'white',
        }}
      >
        إ
      </div>
    ),
    { width: 192, height: 192 },
  );
}
