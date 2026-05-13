import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseExternoConfig = {
  apiKey: import.meta.env.VITE_EXTERNAL_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_EXTERNAL_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_EXTERNAL_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_EXTERNAL_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_EXTERNAL_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_EXTERNAL_FIREBASE_APP_ID,
};

const EXTERNAL_APP_NAME = 'firebaseExterno';

const getFirebaseExternoApp = () => {
  try {
    if (getApps().some((app) => app.name === EXTERNAL_APP_NAME)) {
      return getApp(EXTERNAL_APP_NAME);
    }
  } catch (error) {
    console.warn('Firebase externo ya existe:', error);
  }

  return initializeApp(firebaseExternoConfig, EXTERNAL_APP_NAME);
};

export const appExterno = getFirebaseExternoApp();
export const dbExterno = getFirestore(appExterno);
export const authExterno = getAuth(appExterno);
export const storageExterno = getStorage(appExterno);
