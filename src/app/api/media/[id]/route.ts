import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CachedAsset {
  data: Buffer;
  mimeType: string;
  size: number;
  etag: string;
  lastAccessed: number;
}

// Global in-memory cache for media assets to eliminate repeated database roundtrips
const globalCache = (global as any).__mediaAssetCache || new Map<string, CachedAsset>();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__mediaAssetCache = globalCache;
}

const MAX_CACHED_BYTES = 120 * 1024 * 1024; // 120MB memory limit

function getCachedOrEvict(id: string): CachedAsset | null {
  const item = globalCache.get(id);
  if (item) {
    item.lastAccessed = Date.now();
    return item;
  }
  return null;
}

function storeInCache(id: string, asset: Omit<CachedAsset, 'lastAccessed'>) {
  // Compute total memory used
  let totalBytes = 0;
  globalCache.forEach((val: CachedAsset) => {
    totalBytes += val.size;
  });

  // Evict oldest items if exceeding memory threshold
  if (totalBytes + asset.size > MAX_CACHED_BYTES) {
    const entries = Array.from(globalCache.entries()) as [string, CachedAsset][];
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    for (const [oldId, oldVal] of entries) {
      globalCache.delete(oldId);
      totalBytes -= oldVal.size;
      if (totalBytes + asset.size <= MAX_CACHED_BYTES) break;
    }
  }

  globalCache.set(id, {
    ...asset,
    lastAccessed: Date.now(),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return new NextResponse('Media ID is required', { status: 400 });
    }

    let cached = getCachedOrEvict(id);

    if (!cached) {
      const asset = await prisma.mediaAsset.findUnique({
        where: { id },
      });

      if (!asset || !asset.data) {
        return new NextResponse('Media not found', { status: 404 });
      }

      const mimeType = asset.mimeType || 'video/mp4';
      const size = asset.size || asset.data.length;
      const etag = `"${id}-${size}"`;

      cached = {
        data: asset.data,
        mimeType,
        size,
        etag,
        lastAccessed: Date.now(),
      };

      // Only cache assets up to 40MB in RAM
      if (size <= 40 * 1024 * 1024) {
        storeInCache(id, cached);
      }
    }

    const { data: assetBuffer, mimeType, size: totalSize, etag } = cached;

    // Check client ETag cache
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    const rangeHeader = request.headers.get('range');

    // Handle HTTP Range request (video seeking / partial streaming in Chrome/Safari/iOS)
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      
      // If browser requested open end (e.g. "bytes=0-"), stream in fast generous chunks (e.g. 2MB)
      // or the remainder of the file so buffering is silky smooth and instant
      let end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 2 * 1024 * 1024 - 1, totalSize - 1);
      if (end >= totalSize) {
        end = totalSize - 1;
      }

      if (start >= totalSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${totalSize}`,
            'Accept-Ranges': 'bytes',
          },
        });
      }

      const chunk = assetBuffer.subarray(start, end + 1);
      const uint8Array = new Uint8Array(chunk);

      return new Response(uint8Array, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length.toString(),
          'Content-Type': mimeType,
          'ETag': etag,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Full file response
    const fullUint8 = new Uint8Array(assetBuffer);
    return new Response(fullUint8, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': totalSize.toString(),
        'Accept-Ranges': 'bytes',
        'ETag': etag,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error streaming media file:', error);
    return new NextResponse('Error streaming media file', { status: 500 });
  }
}

