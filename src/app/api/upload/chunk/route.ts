import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadId = formData.get('uploadId') as string;
    const chunkIndexStr = formData.get('chunkIndex') as string;
    const totalChunksStr = formData.get('totalChunks') as string;
    const fileName = (formData.get('fileName') as string) || 'uploaded_video.mp4';
    const mimeType = (formData.get('mimeType') as string) || 'video/mp4';
    const chunkFile = formData.get('chunk') as File | Blob | null;

    if (!uploadId || chunkIndexStr === null || totalChunksStr === null || !chunkFile) {
      return NextResponse.json(
        { error: 'Missing required chunk upload parameters' },
        { status: 400 }
      );
    }

    const chunkIndex = parseInt(chunkIndexStr, 10);
    const totalChunks = parseInt(totalChunksStr, 10);
    const chunkBuffer = Buffer.from(await chunkFile.arrayBuffer());

    // 1. Save this chunk to database
    await prisma.mediaChunk.create({
      data: {
        uploadId,
        chunkIndex,
        totalChunks,
        data: chunkBuffer,
      },
    });

    // 2. Check how many chunks we've received for this uploadId
    const receivedCount = await prisma.mediaChunk.count({
      where: { uploadId },
    });

    // 3. If all chunks are received, assemble the final media asset
    if (receivedCount >= totalChunks) {
      const allChunks = await prisma.mediaChunk.findMany({
        where: { uploadId },
        orderBy: { chunkIndex: 'asc' },
      });

      // Verify we have all chunks from 0 to totalChunks - 1
      if (allChunks.length === totalChunks) {
        const fullBuffer = Buffer.concat(allChunks.map((c) => c.data));

        const asset = await prisma.mediaAsset.create({
          data: {
            name: fileName,
            mimeType,
            data: fullBuffer,
            size: fullBuffer.length,
          },
        });

        // Clean up temporary chunks asynchronously
        try {
          await prisma.mediaChunk.deleteMany({
            where: { uploadId },
          });

          // Also clean up any orphan chunks older than 1 hour
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          await prisma.mediaChunk.deleteMany({
            where: { createdAt: { lt: oneHourAgo } },
          });
        } catch (cleanupErr) {
          console.warn('Chunk cleanup notice:', cleanupErr);
        }

        return NextResponse.json({
          success: true,
          complete: true,
          url: `/api/media/${asset.id}`,
          size: fullBuffer.length,
        });
      }
    }

    // Still waiting for remaining chunks
    return NextResponse.json({
      success: true,
      complete: false,
      received: receivedCount,
      total: totalChunks,
    });
  } catch (error: any) {
    console.error('Error handling chunk upload:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media chunk' },
      { status: 500 }
    );
  }
}
