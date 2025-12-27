import { NextResponse } from 'next/server';
import { getBucketFromAlbumCover } from '@/lib/color/bucketSystem';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageUrl parameter' },
        { status: 400 }
      );
    }

    // Extract bucket assignment from album cover
    const result = await getBucketFromAlbumCover(imageUrl);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Bucket extraction API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract bucket color' },
      { status: 500 }
    );
  }
}
