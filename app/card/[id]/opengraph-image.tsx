import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'For the Record';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

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
            backgroundColor: '#f5f3f0',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          <div style={{ display: 'flex', marginBottom: 24 }}>For the Record</div>
          <div style={{ display: 'flex', fontSize: 32, color: '#666' }}>Card ID: {id || 'unknown'}</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    // Return plain text 500 error - NOT an empty image/png
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`OG Image Error: ${message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
