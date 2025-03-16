import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDtV7zWY2sn24QeVKWdySkdacsXe7WNuu0",
  authDomain: "brolang-92f70.firebaseapp.com",
  projectId: "brolang-92f70",
  storageBucket: "brolang-92f70.firebasestorage.app",
  messagingSenderId: "1001880054120",
  appId: "1:1001880054120:web:585062f3bd3c109b4d4edd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);