// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCAkc6q14mWKYd_eQYTdHf1WjhVkNzf3kQ",
  authDomain: "cherokee-language-exerci-5bac5.firebaseapp.com",
  projectId: "cherokee-language-exerci-5bac5",
  storageBucket: "cherokee-language-exerci-5bac5.appspot.com",
  messagingSenderId: "913050570673",
  appId: "1:913050570673:web:a8aa84e49682b427f77790",
  measurementId: "G-CZT375VHC7",
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);
