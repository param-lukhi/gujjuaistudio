import { NextRequest, NextResponse } from 'next/server';
import { GET as contactGET, POST as contactPOST } from '@/app/api/contact/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return contactGET(request);
}

export async function POST(request: NextRequest) {
  return contactPOST(request);
}
