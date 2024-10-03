// firebaseConfig.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'; 
import 'firebase/auth';   // If you are using Firebase Authentication
import 'firebase/firestore'; // If you are using Firestore
import 'firebase/storage'; // If you are using Firebase Storage
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrViRr1zN4skEevwQ_2MMT__T97h4yV8w",
  authDomain: "modista-290a1.firebaseapp.com",
  projectId: "modista-290a1",
  storageBucket: "modista-290a1.appspot.com",
  messagingSenderId: "344075365809",
  appId: "1:344075365809:web:28dabd9f08a5ae7c086190",
  measurementId: "G-1F3BFEKSG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);  // Get Auth instance

export { app, auth };