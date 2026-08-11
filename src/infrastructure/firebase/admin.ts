import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Single shared Admin SDK bootstrap — every server-side Firebase adapter
// (Firestore repositories, the Storage adapter) initializes off this one
// app instance instead of calling initializeApp() itself. Guarded against
// re-init on Next.js dev-mode hot reload.
const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel/most hosts store multiline env vars with literal "\n" —
      // real newlines are required for the PEM key to parse.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

export const db = getFirestore(app);
export const bucket = getStorage(app).bucket();
