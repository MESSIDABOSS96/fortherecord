import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';
export const alt = 'Record Card';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

function cleanSongTitle(title: string): string {
  return title
    .replace(/\s*\(feat\.[^)]*\)/gi, '')
    .replace(/\s*\(ft\.[^)]*\)/gi, '')
    .replace(/\s*feat\.[^-]*/gi, '')
    .replace(/\s*ft\.[^-]*/gi, '')
    .replace(/\s*\(with[^)]*\)/gi, '')
    .replace(/\s*\[.*?\]/g, '')
    .replace(/\s*-\s*\d{4}\s*remaster.*/gi, '')
    .replace(/\s*\(\d{4}\s*remaster.*\)/gi, '')
    .trim();
}

async function getRecord(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://fortherecord.fm';
    const response = await fetch(`${baseUrl}/api/records/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f3f0', fontSize: 32 }}>
          Missing record ID
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const record = await getRecord(id);

  if (!record) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f3f0', fontSize: 32 }}>
          Record not found
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const backgroundColor = record.background_color || '#f5f3f0';
  const songTitle = cleanSongTitle(record.song_title || '');
  const artist = record.artist || '';
  const lyrics = record.lyric_excerpt || '';
  const forName = record.for_name || '';
  const reflectionText = record.reflection_text || '';
  const formattedDate = formatDate(record.created_at);

  // Truncate text
  const displayLyrics = lyrics.length > 150 ? lyrics.substring(0, 150) + '...' : lyrics;
  const displayReflection = reflectionText.length > 200 ? reflectionText.substring(0, 200) + '...' : reflectionText;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: backgroundColor,
          padding: '48px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header: Song title + Artist */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 32 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            {songTitle}
          </div>
          <div style={{ fontSize: 24, color: '#666666' }}>
            {artist}
          </div>
        </div>

        {/* Lyrics */}
        <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.4, color: '#1a1a1a', marginBottom: 32 }}>
          {displayLyrics}
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)', marginBottom: 24 }} />

        {/* For name */}
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 16, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
          For {forName}
        </div>

        {/* Reflection */}
        <div style={{ fontSize: 20, lineHeight: 1.5, color: '#1a1a1a', textAlign: 'center', display: 'flex', justifyContent: 'center', flex: 1 }}>
          {displayReflection}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
          <div style={{ fontSize: 16, color: 'rgba(26, 26, 26, 0.7)' }}>
            Posted on {formattedDate}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginTop: 6 }}>
            fortherecord.fm
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
