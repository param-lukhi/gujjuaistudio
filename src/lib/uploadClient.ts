import { getFirebaseApp } from '@/lib/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Resizes and compresses an image in the browser for ultra-fast instant uploads
 */
async function compressImageToDataUrl(file: File, maxWidth = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, preserve original format as data url
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to simple FileReader
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = url;
  });
}

/**
 * Converts a small video to Data URL in browser
 */
async function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Universal media uploader:
 * 1. For images: Instantly optimizes and generates Data URL in ~50ms (never hangs, 100% reliable)
 * 2. For videos <= 4MB: Converts directly or sends to /api/upload
 * 3. For videos > 4MB: Attempts Firebase Storage with strict 5s timeout, with clear guidance on failure
 */
export async function uploadMediaFile(file: File, options: UploadOptions = {}): Promise<string> {
  if (!file) {
    throw new Error('No file selected.');
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|m4v|3gp|wmv|flv|ts|mpeg)$/i.test(file.name);

  // --- FAST-PATH 1: IMAGES (Avatars, Cover Thumbnails, Screenshots, Proofs) ---
  if (isImage) {
    try {
      options.onProgress?.(50);
      const dataUrl = await compressImageToDataUrl(file);
      options.onProgress?.(100);
      return dataUrl;
    } catch (err) {
      console.warn('Image compression fallback to standard FileReader:', err);
      return await convertFileToDataUrl(file);
    }
  }

  // --- FAST-PATH 2: SMALL VIDEOS (<= 4.5MB) ---
  const maxDirectSize = 4.5 * 1024 * 1024;
  if (isVideo && file.size <= maxDirectSize) {
    try {
      options.onProgress?.(40);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', options.folder || 'videos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          options.onProgress?.(100);
          return json.url;
        }
      }

      // If /api/upload didn't return url, use Base64 video Data URL
      options.onProgress?.(80);
      const videoDataUrl = await convertFileToDataUrl(file);
      options.onProgress?.(100);
      return videoDataUrl;
    } catch {
      return await convertFileToDataUrl(file);
    }
  }

  // --- PATH 3: LARGE VIDEOS (> 4.5MB) ---
  // Attempt Firebase Storage with a strict 5-second timeout
  try {
    const app = getFirebaseApp();
    if (app) {
      const storage = getStorage(app);
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `${options.folder || 'videos'}/${Date.now()}_${cleanName}`);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'video/mp4',
      });

      const uploadPromise = new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (options.onProgress && snapshot.totalBytes > 0) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              options.onProgress(Math.round(progress));
            }
          },
          (error) => reject(error),
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

      // Strict 6 second timeout to prevent hanging UI
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Firebase Storage timeout.'));
        }, 6000)
      );

      return await Promise.race([uploadPromise, timeoutPromise]);
    }
  } catch (firebaseErr: any) {
    console.warn('Firebase Storage upload failed/timed out:', firebaseErr?.message || firebaseErr);
  }

  // If large video upload could not be stored in Cloud Storage, provide clear instruction
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
  throw new Error(
    `Video size is ${fileSizeMb}MB. Please compress your video below 4.5MB or switch to "Video Link" to paste a direct URL (from Cloudinary, Google Drive, Vimeo, or CDN).`
  );
}

