import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'gujju-ai-studio',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
  secure: true,
});

export async function uploadMediaToCloudinary(fileBuffer: Buffer, fileName: string): Promise<string> {
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'gujju_ai_studio',
            public_id: fileName.replace(/\.[^/.]+$/, ""),
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || '');
          }
        );
        uploadStream.end(fileBuffer);
      });
    } catch (e) {
      console.warn('Cloudinary upload fallback to mock upload:', e);
    }
  }

  // Fallback for demo mode: Convert to data URL or return sample image URL
  const base64 = fileBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

export default cloudinary;
