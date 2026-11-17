import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/analytics-store';

export async function GET(req: NextRequest) {
  const secretKey = process.env.ADMIN_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: 'Admin dashboard unavailable: ADMIN_SECRET_KEY is not configured on the server.' },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get('x-admin-key');
  const queryKey = req.nextUrl.searchParams.get('key');
  const providedKey = authHeader || queryKey;

  if (!providedKey || providedKey !== secretKey) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid admin secret key' },
      { status: 401 }
    );
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    console.error('[Admin Stats Route Error]:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
