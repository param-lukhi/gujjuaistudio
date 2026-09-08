import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadMediaToCloudinary } from '@/lib/cloudinary';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || (file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');

    // 1. If Cloudinary keys are configured, attempt Cloudinary upload
    if (
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_API_KEY !== '1234567890' &&
      process.env.CLOUDINARY_API_SECRET !== 'secret'
    ) {
      try {
        const mediaUrl = await uploadMediaToCloudinary(buffer, file.name);
        if (mediaUrl) {
          return NextResponse.json({ success: true, url: mediaUrl });
        }
      } catch (err) {
        console.warn('Cloudinary upload failed, attempting database asset fallback:', err);
      }
    }

    // 2. If running locally, save file to public/uploads
    const isVercel = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL_ENV;
    if (!isVercel) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        const cleanExt = path.extname(file.name) || (file.type.startsWith('video/') ? '.mp4' : '.jpg');
        const baseName = path.basename(file.name, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueFileName = `${Date.now()}-${baseName}${cleanExt}`;
        const filePath = path.join(uploadsDir, uniqueFileName);

        await fs.writeFile(filePath, buffer);
        const localUrl = `/uploads/${uniqueFileName}`;
        return NextResponse.json({ success: true, url: localUrl });
      } catch (localErr) {
        console.warn('Local storage write failed, falling back to database storage:', localErr);
      }
    }

    // 3. Primary Production Storage: Store directly in PostgreSQL MediaAsset table
    try {
      const asset = await prisma.mediaAsset.create({
        data: {
          name: file.name || 'uploaded_media',
          mimeType,
          data: buffer,
          size: buffer.length,
        },
      });

      const mediaUrl = `/api/media/${asset.id}`;
      return NextResponse.json({ success: true, url: mediaUrl });
    } catch (dbErr: any) {
      console.warn('MediaAsset database creation failed, trying fallback CDN:', dbErr);
    }

    // 4. Fallback for images (under 1MB Base64)
    if (file.type.startsWith('image/') && buffer.length <= 1 * 1024 * 1024) {
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ success: true, url: dataUri });
    }

    return NextResponse.json(
      { error: 'Media upload failed. Please try again or paste a direct video link.' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media file' },
      { status: 500 }
    );
  }
}


