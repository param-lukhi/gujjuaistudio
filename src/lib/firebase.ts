import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const clean = (val: string | undefined, fallback: string) => {
  if (!val || val === 'undefined' || val.trim() === '') return fallback;
  return val.replace(/^["']|["']$/g, '').trim();
};

const getValidApiKey = (envVal: string | undefined) => {
  const cleaned = clean(envVal, 'AIzaSyDXG1GY4sorC245fUkAGiCHjrs8BsqGEmk');
  // Guard against old stale typo in Vercel environment variable
  if (cleaned.includes('AGIcHz') || cleaned.length < 30) {
    return 'AIzaSyDXG1GY4sorC245fUkAGiCHjrs8BsqGEmk';
  }
  return cleaned;
};

const firebaseConfig = {
  apiKey: getValidApiKey(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: clean(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'gujjuaistudio-d3377.firebaseapp.com'
  ),
  projectId: clean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'gujjuaistudio-d3377'
  ),
  storageBucket: clean(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'gujjuaistudio-d3377.firebasestorage.app'
  ),
  messagingSenderId: clean(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    '543101177465'
  ),
  appId: clean(
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    '1:543101177465:web:c1fbb1abe6ec73fcd68ea8'
  ),
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!app) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    return app;
  } catch (error) {
    console.error('Firebase App initialization error:', error);
    return null;
  }
}

export function getFirebaseAuth(): { app: FirebaseApp; auth: Auth } | null {
  if (typeof window === 'undefined') return null;

  try {
    const initializedApp = getFirebaseApp();
    if (!initializedApp) return null;
    if (!auth) {
      auth = getAuth(initializedApp);
    }
    return { app: initializedApp, auth };
  } catch (error) {
    console.error('Firebase Auth initialization error:', error);
    return null;
  }
}

