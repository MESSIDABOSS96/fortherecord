/**
 * Server-side color extraction API endpoint
 * Handles CORS-blocked images and caches results for performance
 * Uses standout color algorithm with curated 27-color palette
 */

import { NextRequest, NextResponse } from 'next/server';
import { colorCache, type ColorExtractionResult } from '@/lib/color/cache';
import { getCardColorsFromAlbumCover } from '@/lib/color/albumToCardColor';
import { hexToLab, labToHex } from '@/lib/color/colorConversion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RequestBody = {
  imageUrl: string;
};

/**
 * POST /api/colors/extract
 * Extract colors from album cover image
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl }: RequestBody = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageUrl parameter' },
        { status: 400 }
      );
    }

    // Check cache
    const cached = colorCache.get(imageUrl);
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // Extract color (with fallback)
    const result = await extractColorFromUrl(imageUrl);

    // Cache result
    colorCache.set(imageUrl, result);

    return NextResponse.json({
      ...result,
      cached: false,
    });
  } catch (error: any) {
    console.error('Color extraction API error:', error);
    return NextResponse.json(
      { error: error.message || 'Color extraction failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/colors/extract?imageUrl=...
 * Convenience GET endpoint for testing
 */
export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('imageUrl');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Missing imageUrl query parameter' },
      { status: 400 }
    );
  }

  // Reuse POST logic
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

/**
 * Extract color from image URL using standout color algorithm
 * Maps to curated 27-color palette
 */
async function extractColorFromUrl(
  imageUrl: string
): Promise<ColorExtractionResult> {
  try {
    // Use new standout color algorithm with debug info enabled
    const result = await getCardColorsFromAlbumCover(imageUrl, undefined, true);

    // Generate border color (darker shade of background)
    const bgLab = hexToLab(result.bgColor);
    const borderLab: [number, number, number] = [
      Math.max(5, bgLab[0] - 12),
      bgLab[1],
      bgLab[2],
    ];
    const borderHex = labToHex(borderLab[0], borderLab[1], borderLab[2]);

    return {
      bgColor: result.bgColor,
      textColor: result.textColor,
      borderColor: borderHex,
      family: result.family,
      paletteKey: result.paletteKey,
      method: result.method,
      debug: result.debug,
    };
  } catch (error) {
    console.error('Color extraction failed:', error);

    // The function already handles fallback internally, but if it throws,
    // we need to handle it here
    throw error;
  }
}
