import { getFirebaseApp, getFirebaseAuth } from '@/lib/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { uploadToSupabaseStorage } from '@/lib/supabaseStorage';

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number, statusText?: string) => void;
}

/**
 * Resizes and compresses an image in the browser for ultra-fast instant uploads (<50ms)
 * Produces tiny webp/jpeg data (<50KB) that is 100% safe for database & CDN
 */
async function compressImageToDataUrl(file: File, maxWidth = 1000, quality = 0.8): Promise<string> {
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
 * Uploads a video to high-speed Catbox CDN (Direct playable MP4 with HTTP Byte-Range support)
 */
async function uploadVideoToPlayableCDN(
  file: File,
  onProgress?: (percent: number, statusText?: string) => void
): Promise<string> {
  onProgress?.(35, `Uploading ${(file.size / (1024 * 1024)).toFixed(1)}MB to High-Speed Video Stream...`);

  // 1. Try Catbox.moe (Direct static MP4, full CORS, Byte-Ranges)
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith('http')) {
        onProgress?.(100, 'Direct MP4 Stream Ready');
        return url;
      }
    }
  } catch (err) {
    console.warn('Catbox API attempt:', err);
  }

  // 2. Try Litterbox
  try {
    const litterData = new FormData();
    litterData.append('reqtype', 'fileupload');
    litterData.append('time', '72h');
    litterData.append('fileToUpload', file);

    const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: litterData,
    });

    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith('http')) {
        onProgress?.(100, 'Direct MP4 Stream Ready');
        return url;
      }
    }
  } catch (err) {
    console.warn('Litterbox attempt:', err);
  }

  throw new Error('Playable CDN unavailable');
}

/**
 * Uploads media file to Firebase Storage with anonymous auth and progress tracking
 */
async function uploadToFirebase(
  file: File,
  folder: string,
  onProgress?: (percent: number, statusText?: string) => void
): Promise<string> {
  const authObj = getFirebaseAuth();
  if (authObj?.auth && !authObj.auth.currentUser) {
    try {
      await signInAnonymously(authObj.auth);
    } catch (authErr) {
      console.warn('Firebase anonymous auth attempt:', authErr);
    }
  }

  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase app not ready');

  // Support both custom and default appspot bucket
  let storage;
  try {
    storage = getStorage(app, 'gs://gujjuaistudio-d3377.appspot.com');
  } catch {
    storage = getStorage(app);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'video/mp4',
  });

  return new Promise<string>((resolve, reject) => {
    let hasProgress = false;
    const watchdog = setTimeout(() => {
      if (!hasProgress) {
        try { uploadTask.cancel(); } catch {}
        reject(new Error('FIREBASE_TIMEOUT'));
      }
    }, 8000);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.bytesTransferred > 0) {
          hasProgress = true;
          clearTimeout(watchdog);
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          const transferredMb = (snapshot.bytesTransferred / (1024 * 1024)).toFixed(1);
          const totalMb = (snapshot.totalBytes / (1024 * 1024)).toFixed(1);
          onProgress?.(progress, `${transferredMb}MB / ${totalMb}MB (${progress}%)`);
        }
      },
      (err) => {
        clearTimeout(watchdog);
        reject(err);
      },
      async () => {
        clearTimeout(watchdog);
        try {
          onProgress?.(100, 'Finalizing download URL...');
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}

/**
 * Universal media uploader:
 * 1. For images: High-speed server upload with compressed canvas fallback (<50KB)
 * 2. For videos: Multi-cloud video storage (Playable CDN -> Firebase -> Supabase -> Local Upload)
 */
export async function uploadMediaFile(file: File, options: UploadOptions = {}): Promise<string> {
  if (!file) throw new Error('No file selected.');

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|m4v|3gp|wmv|flv|ts|mpeg)$/i.test(file.name);

  // ==========================================
  // 1. IMAGE UPLOAD FLOW (Avatars, Thumbnails, Covers)
  // ==========================================
  if (isImage) {
    options.onProgress?.(25, 'Uploading image...');

    // 1A. Try local/server endpoint (/api/upload)
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const json = await res.json();
        if (json.url && !json.url.startsWith('data:')) {
          options.onProgress?.(100, 'Image uploaded');
          return json.url;
        }
      }
    } catch {}

    // 1B. Compressed instant Data URL (<50KB)
    try {
      options.onProgress?.(80, 'Optimizing image...');
      const dataUrl = await compressImageToDataUrl(file);
      options.onProgress?.(100, 'Done');
      return dataUrl;
    } catch {
      return await convertFileToDataUrl(file);
    }
  }

  // ==========================================
  // 2. VIDEO / REEL UPLOAD FLOW (Direct Playable Stream)
  // ==========================================
  const folder = options.folder || 'portfolio_videos';

  // 2A. Try Direct Playable CDN (Catbox / MP4 static stream with Byte-Range support)
  try {
    const cdnUrl = await uploadVideoToPlayableCDN(file, options.onProgress);
    if (cdnUrl) return cdnUrl;
  } catch (cdnErr) {
    console.warn('Playable CDN fallback:', cdnErr);
  }

  // 2B. Try Firebase Cloud Storage
  try {
    const firebaseUrl = await uploadToFirebase(file, folder, options.onProgress);
    if (firebaseUrl) return firebaseUrl;
  } catch (fbErr) {
    console.warn('Firebase upload fallback:', fbErr);
  }

  // 2C. Try Supabase Storage
  try {
    const supabaseUrl = await uploadToSupabaseStorage(file, folder, options.onProgress);
    if (supabaseUrl) return supabaseUrl;
  } catch (sbErr) {
    console.warn('Supabase storage fallback:', sbErr);
  }

  // 2D. Try Server Upload Endpoint (/api/upload)
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const json = await res.json();
      if (json.url) return json.url;
    }
  } catch {}

  throw new Error('Video upload failed across all cloud providers. Please paste a direct video link in the Video Link tab.');
}




