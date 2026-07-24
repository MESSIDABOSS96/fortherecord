import { NextResponse } from 'next/server';
import { getRecordById, SUBMISSIONS_CLOSED_MESSAGE } from '@/lib/records';

// GET /api/records/[id] - Fetch a single record from the static archive
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = getRecordById(id);

  if (!record) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }

  return NextResponse.json(record, {
    headers: {
      'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate',
    },
  });
}

// The archive is read-only — edits and deletions are no longer accepted.
export async function PUT() {
  return NextResponse.json(
    { error: SUBMISSIONS_CLOSED_MESSAGE },
    { status: 410 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: SUBMISSIONS_CLOSED_MESSAGE },
    { status: 410 }
  );
}
