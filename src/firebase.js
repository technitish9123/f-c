import firebase from "firebase/app";
import "firebase/auth";

// Firebase web config comes from the environment (Render env vars / .env).
// These values are public identifiers, not secrets, but keeping them out of
// the code means a key rotation never needs a code change.
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  // Fail loudly in the console rather than with a cryptic auth error.
  console.error("Firebase config missing: set the REACT_APP_FIREBASE_* environment variables.");
}

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
