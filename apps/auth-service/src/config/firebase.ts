import * as admin from 'firebase-admin';
import { env } from './env.js';

let app: admin.app.App;

try {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
    process.exit(1);
}

export const auth = admin.auth(app);
