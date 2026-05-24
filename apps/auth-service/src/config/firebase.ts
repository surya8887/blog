import * as admin from 'firebase-admin';
import { env } from './env.js';

let app: admin.app.App | undefined;

try {
    if (env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully');
    } else {
        console.warn('Firebase Admin NOT initialized: FIREBASE_SERVICE_ACCOUNT is missing in .env');
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
    process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const auth = app ? admin.auth(app) : null;