import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = {
  width: 128,
  height: 128,
};

export const contentType = 'image/png';

export default async function Icon() {
  // Read the logo file
  const logoPath = join(process.cwd(), 'public', 'logo.svg');
  const logoData = await readFile(logoPath);
  const logoBase64 = logoData.toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          padding: '0',
          overflow: 'hidden',
        }}
      >
        <img
          src={`data:image/svg+xml;base64,${logoBase64}`}
          alt="Logo"
          width="200"
          height="200"
          style={{
            objectFit: 'cover',
            transform: 'scale(1.8)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
