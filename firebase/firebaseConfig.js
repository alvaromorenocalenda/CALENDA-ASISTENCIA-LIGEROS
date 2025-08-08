// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOk5H4lfh-ZZxI2tfL6uigNY2Gj4Uf3Ak",
  authDomain: "calenda-asistencia-ligeros.firebaseapp.com",
  projectId: "calenda-asistencia-ligeros",
  storageBucket: "calenda-asistencia-ligeros.appspot.com",
  messagingSenderId: "536546079744",
  appId: "1:536546079744:web:2927497f8ec156c20c94e5",
  measurementId: "G-2LE953Q1JL"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
