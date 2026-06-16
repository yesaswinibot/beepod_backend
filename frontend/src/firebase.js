import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCm2Sqf2p6jHrm0kdlGA9jgxw1C3o1VFZs",
  authDomain: "beepod.in"
  projectId: "beepod-9d22f",
  storageBucket: "beepod-9d22f.firebasestorage.app",
  messagingSenderId: "337373620354",
  appId: "1:337373620354:web:633619d7b6e10ed0f8ac9b"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
