import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { env } from './env.js';

let app;

try {
    if (env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
        if (!getApps().length) {
            app = initializeApp({
                credential: cert(serviceAccount)
            });
        } else {
            app = getApp();
        }
        console.log('Firebase Admin initialized successfully');
    } else {
        console.warn('Firebase Admin NOT initialized: FIREBASE_SERVICE_ACCOUNT is missing in .env');
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
    process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const auth: Auth | null = app ? getAuth(app) : null;