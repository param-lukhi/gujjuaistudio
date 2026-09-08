import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://kcxqqxekpongqlujdtsb.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads a file directly from browser to Supabase Storage (50MB Free Tier per file)
 */
export async function uploadToSupabaseStorage(
  file: File,
  folder: string = 'reels',
  onProgress?: (percent: number, statusText?: string) => void
): Promise<string> {
  if (!file) throw new Error('No file provided.');

  const client =
    supabase ||
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      : null);

  if (!client) {
    throw new Error(
      'SUPABASE_ANON_KEY_MISSING'
    );
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;
  const bucketName = 'videos';

  onProgress?.(30, `Uploading ${(file.size / 1048576).toFixed(1)}MB to Supabase...`);

  const { data, error } = await client.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'video/mp4',
    });

  if (error) {
    if (error.message.includes('Bucket not found')) {
      throw new Error(
        'Supabase Storage bucket "videos" not found. Please create a public bucket named "videos" in Supabase Dashboard > Storage.'
      );
    }
    throw new Error(error.message || 'Supabase storage upload failed.');
  }

  onProgress?.(100, 'Upload complete!');

  const { data: publicUrlData } = client.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
