import { getFirebaseApp } from '@/lib/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Universal media uploader that handles both videos and images seamlessly:
 * 1. Attempts direct Client-to-Firebase Storage upload (No 4.5MB Vercel serverless limit, supports 100MB+ reels & videos)
 * 2. Fallbacks to /api/upload endpoint with safe response parsing
 * 3. Fallbacks to Base64 data URL for images if remote servers are unreachable
 */
export async function uploadMediaFile(file: File, options: UploadOptions = {}): Promise<string> {
  if (!file) {
    throw new Error('No file selected for upload.');
  }

  const folder = options.folder || (file.type.startsWith('video/') ? 'videos' : 'images');
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}_${cleanName}`;

  // 1. PRIMARY STRATEGY: Direct Client-to-Firebase Storage (Bypasses Vercel 4.5MB limit completely)
  try {
    const app = getFirebaseApp();
    if (app) {
      const storage = getStorage(app);
      const storageRef = ref(storage, `${folder}/${uniqueName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || (file.type.startsWith('video/') ? 'video/mp4' : 'image/jpeg'),
      });

      return await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (options.onProgress && snapshot.totalBytes > 0) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              options.onProgress(Math.round(progress));
            }
          },
          (error) => {
            console.warn('Firebase Storage upload error, falling back to server upload:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });
    }
  } catch (firebaseErr: any) {
    console.warn('Direct Firebase upload skipped or failed:', firebaseErr?.message || firebaseErr);
  }

  // 2. SECONDARY STRATEGY: /api/upload endpoint with robust error handling
  const maxServerSize = 4.5 * 1024 * 1024; // 4.5MB Vercel limit
  if (file.size > maxServerSize) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds server upload limit (4.5MB). Please compress the video or enter a direct Video URL link.`
    );
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.status === 413) {
      throw new Error('File is too large for the server. Please compress the file or use a direct URL.');
    }

    const rawText = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(rawText);
    } catch {
      throw new Error(`Server returned non-JSON response (${res.status}): ${rawText.slice(0, 120)}`);
    }

    if (!res.ok || !json.url) {
      throw new Error(json.error || 'Failed to upload media to server.');
    }

    return json.url;
  } catch (apiErr: any) {
    // 3. TERTIARY FALLBACK: Base64 for images under 3MB
    if (file.type.startsWith('image/') && file.size <= 3 * 1024 * 1024) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read image as Base64 data URL.'));
          }
        };
        reader.onerror = () => reject(new Error('Image reader error.'));
        reader.readAsDataURL(file);
      });
    }

    throw apiErr;
  }
}
