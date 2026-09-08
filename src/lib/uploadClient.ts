import { getFirebaseApp } from '@/lib/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number, statusText?: string) => void;
}

/**
 * Resizes and compresses an image in the browser for ultra-fast instant uploads (<50ms)
 */
async function compressImageToDataUrl(file: File, maxWidth = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
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
 * Converts a small file directly to Data URL in browser
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
 * 1. For images: Instant in-browser canvas optimizer (< 50ms, 100% reliable)
 * 2. For videos (up to 500MB): Direct Client-to-Firebase Cloud Storage with live progress & transfer stats
 * 3. Safe fallback for small files
 */
export async function uploadMediaFile(file: File, options: UploadOptions = {}): Promise<string> {
  if (!file) {
    throw new Error('No file selected.');
  }

  const maxAllowedSize = 500 * 1024 * 1024; // 500 MB max limit
  if (file.size > maxAllowedSize) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit (500MB). Please select a file under 500MB.`
    );
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|m4v|3gp|wmv|flv|ts|mpeg)$/i.test(file.name);

  // --- FAST-PATH 1: IMAGES (Avatars, Cover Thumbnails, Screenshots, Proofs) ---
  if (isImage) {
    try {
      options.onProgress?.(50, 'Optimizing image...');
      const dataUrl = await compressImageToDataUrl(file);
      options.onProgress?.(100, 'Done');
      return dataUrl;
    } catch (err) {
      console.warn('Image compression fallback to standard FileReader:', err);
      return await convertFileToDataUrl(file);
    }
  }

  // --- PATH 2: DIRECT CLIENT-TO-FIREBASE CLOUD STORAGE (UP TO 500 MB) ---
  if (isVideo || file.size > 4.5 * 1024 * 1024) {
    try {
      const app = getFirebaseApp();
      if (!app) {
        throw new Error('Firebase client app is not initialized.');
      }

      const storage = getStorage(app);
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `${options.folder || 'videos'}/${Date.now()}_${cleanName}`);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'video/mp4',
      });

      return await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              const transferredMb = (snapshot.bytesTransferred / (1024 * 1024)).toFixed(1);
              const totalMb = (snapshot.totalBytes / (1024 * 1024)).toFixed(1);
              const status = `${transferredMb}MB / ${totalMb}MB (${progress}%)`;
              options.onProgress?.(progress, status);
            }
          },
          (error: any) => {
            console.error('Firebase Storage upload error:', error);
            if (error.code === 'storage/unauthorized') {
              reject(
                new Error(
                  'Firebase Storage permission denied. Please enable public write access in Firebase Console > Storage > Rules (set: allow read, write: if true;) or use Video Link.'
                )
              );
            } else if (error.code === 'storage/canceled') {
              reject(new Error('Upload was canceled.'));
            } else {
              reject(new Error(error.message || 'Firebase storage upload failed.'));
            }
          },
          async () => {
            try {
              options.onProgress?.(100, 'Finalizing download URL...');
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (urlErr: any) {
              reject(urlErr);
            }
          }
        );
      });
    } catch (firebaseErr: any) {
      console.warn('Direct Firebase Storage upload error:', firebaseErr);
      
      // If small enough, try server endpoint fallback
      if (file.size <= 4.5 * 1024 * 1024) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (res.ok) {
            const json = await res.json();
            if (json.url) return json.url;
          }
        } catch {}
      }

      throw firebaseErr;
    }
  }

  // --- PATH 3: SMALL LOCAL STREAM FALLBACK ---
  return await convertFileToDataUrl(file);
}


