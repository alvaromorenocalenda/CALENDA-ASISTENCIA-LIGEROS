// app/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚙️ CONFIG DE TU PROYECTO
export const firebaseConfig = {
  apiKey: "AIzaSyAOk5H4lfh-ZZxI2tfL6uigNY2Gj4Uf3Ak",
  authDomain: "calenda-asistencia-ligeros.firebaseapp.com",
  projectId: "calenda-asistencia-ligeros",
  // Usa el bucket REAL que te salió con `gsutil ls`
  storageBucket: "calenda-asistencia-ligeros.firebasestorage.app",
  messagingSenderId: "536546079744",
  appId: "1:536546079744:web:2927497f8ec156c20c94e5",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore modo ultra‑compatible (evita websockets)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Storage normal (recuerda configurar CORS del bucket)
export const storage = getStorage(app);
