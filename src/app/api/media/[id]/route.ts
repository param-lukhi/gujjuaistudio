import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return new NextResponse('Media ID is required', { status: 400 });
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset || !asset.data) {
      return new NextResponse('Media not found', { status: 404 });
    }

    const mimeType = asset.mimeType || 'video/mp4';
    const totalSize = asset.size || asset.data.length;
    const rangeHeader = request.headers.get('range');

    // If HTTP Range request (video seeking / partial streaming in Chrome/Safari/iOS)
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${totalSize}` },
        });
      }

      const chunk = asset.data.subarray(start, end + 1);
      const uint8Array = new Uint8Array(chunk);

      return new Response(uint8Array, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length.toString(),
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Full file response
    const fullUint8 = new Uint8Array(asset.data);
    return new Response(fullUint8, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': totalSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error streaming media file:', error);
    return new NextResponse('Error streaming media file', { status: 500 });
  }
}
