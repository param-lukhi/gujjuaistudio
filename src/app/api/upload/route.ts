import { NextResponse } from 'next/server';
import { uploadMediaToCloudinary } from '@/lib/cloudinary';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // If Cloudinary keys are configured, attempt Cloudinary upload
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_KEY !== '1234567890') {
      try {
        const mediaUrl = await uploadMediaToCloudinary(buffer, file.name);
        if (mediaUrl) {
          return NextResponse.json({ success: true, url: mediaUrl });
        }
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to local file storage:', err);
      }
    }

    // Local file storage in public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const cleanExt = path.extname(file.name) || (file.type.startsWith('video/') ? '.mp4' : '.jpg');
    const baseName = path.basename(file.name, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}-${baseName}${cleanExt}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);
    const localUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({ success: true, url: localUrl });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}

