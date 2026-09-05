import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const clean = (val: string | undefined, fallback: string) => {
  if (!val || val === 'undefined' || val.trim() === '') return fallback;
  return val.replace(/^["']|["']$/g, '').trim();
};

const firebaseConfig = {
  apiKey: clean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'AIzaSyDXG1GY4sorC245fUkAGIcHzrs8BsqGEmk'
  ),
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

export function getFirebaseAuth(): { app: FirebaseApp; auth: Auth } | null {
  if (typeof window === 'undefined') return null;

  try {
    if (!app) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    if (!auth && app) {
      auth = getAuth(app);
    }
    return app && auth ? { app, auth } : null;
  } catch (error) {
    console.error('Firebase Auth initialization error:', error);
    return null;
  }
}
