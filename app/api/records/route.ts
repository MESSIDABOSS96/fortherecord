import { NextResponse } from 'next/server';
import { getAllRecords, SUBMISSIONS_CLOSED_MESSAGE } from '@/lib/records';

// Static archive — safe to cache aggressively, the data ships with the build.
export const dynamic = 'force-static';

// GET /api/records - Fetch all records from the static archive
export async function GET() {
  return NextResponse.json(getAllRecords(), {
    headers: {
      'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate',
    },
  });
}

// POST /api/records - Submissions are closed
export async function POST() {
  return NextResponse.json(
    { error: SUBMISSIONS_CLOSED_MESSAGE },
    { status: 410 }
  );
}
