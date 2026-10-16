import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Web config derived from android/app/google-services.json (project: abc-dev-apps).
// For production, override via .env (see .env.example). To get the exact web
// `appId`, add a Web app in Firebase Console > Project settings.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDpiDjWftLXodoaBRLODZH5UOu5i4bfEOo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'abc-dev-apps.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'abc-dev-apps',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'abc-dev-apps.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '629911048212',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:629911048212:web:128d1c7e32ca837eeb5701',
};

let app: FirebaseApp;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.error('[firebase] init failed — check your web config in .env', e);
  // Re-init a minimal app so imports never crash on web preview
  app = initializeApp(firebaseConfig, 'fallback');
  auth = getAuth(app);
}

export { app, auth, firebaseConfig };
