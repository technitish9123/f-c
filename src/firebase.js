import firebase from "firebase/app";
import "firebase/auth";


// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAdaK3MSwAVFa4WV46kG5bWM62kV7WKj5Q",
  authDomain: "auth-e09a4.firebaseapp.com",
  projectId: "auth-e09a4",
  storageBucket: "auth-e09a4.appspot.com",
  messagingSenderId: "71647596585",
  appId: "1:71647596585:web:4d1b3abfa9cde35d364c38"
  
};
  // Initialize Firebase

    firebase.initializeApp(firebaseConfig);

  

  // exporting firebase
  export const auth = firebase.auth();
  export const googleAuthProvider = new firebase.auth.GoogleAuthProvider(); 
