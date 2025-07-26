// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVKZ2cMO6ypxIXYkMsD9vTZmNDSyn1CMg",
  authDomain: "weavd-2dad7.firebaseapp.com",
  projectId: "weavd-2dad7",
  storageBucket: "weavd-2dad7.firebasestorage.app" , // <-- FIXED HERE
  messagingSenderId: "347210750568",
  appId: "1:347210750568:web:feafd4de4acd6c10d279dd",
  measurementId: "G-6HBF7PNT14"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log("Firebase storage bucket:", firebaseConfig.storageBucket);
export const auth = getAuth(app);
export const db = getFirestore(app);   
export const storage = getStorage(app);