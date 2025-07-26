// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbpyqcDvuKBut9EVWK1OdR_CwuJCL_SBE",
  authDomain: "mytrackdesk-a9cc9.firebaseapp.com",
  projectId: "mytrackdesk-a9cc9",
  storageBucket: "mytrackdesk-a9cc9.firebasestorage.app",
  messagingSenderId: "514174805512",
  appId: "1:514174805512:web:15a36d78f19015d126d3bd",
  measurementId: "G-Z963N1TQT5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export { updateProfile };
