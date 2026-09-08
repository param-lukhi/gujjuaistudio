import { NextResponse } from 'next/server';
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
        console.warn('Cloudinary upload failed, attempting storage fallback:', err);
      }
    }

    // 2. If running locally, attempt local file storage in public/uploads
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
        console.warn('Local storage write failed, falling back to base64 data URI:', localErr);
      }
    }

    // 3. For any media file under 4.5MB (Images, Audio, Reels/Videos), return high-speed Base64 data URI
    if (buffer.length <= 4.5 * 1024 * 1024) {
      const mimeType = file.type || (file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ success: true, url: dataUri });
    }

    // 4. If large video on serverless without cloud storage
    return NextResponse.json(
      {
        error:
          'Video file exceeds serverless direct upload limit (4.5MB). Please use Video Link or configure Cloud storage.',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media file' },
      { status: 500 }
    );
  }
}


