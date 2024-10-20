import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBrViRr1zN4skEevwQ_2MMT__T97h4yV8w",
  authDomain: "modista-290a1.firebaseapp.com",
  projectId: "modista-290a1",
  storageBucket: "modista-290a1.appspot.com",
  messagingSenderId: "344075365809",
  appId: "1:344075365809:web:28dabd9f08a5ae7c086190",
  measurementId: "G-1F3BFEKSG1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };