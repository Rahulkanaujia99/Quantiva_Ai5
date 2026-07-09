import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

// Your web app's Firebase configuration requested by the user
const firebaseConfig = {
  apiKey: "AIzaSyD461y8TQFit-ao6Z2mtIJGPIdgybi3_Wg",
  authDomain: "quantiva-ai.firebaseapp.com",
  projectId: "quantiva-ai",
  storageBucket: "quantiva-ai.firebasestorage.app",
  messagingSenderId: "519512601774",
  appId: "1:519512601774:web:f3125ff2cb67b4fc5d693f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Setup Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Set custom parameters if necessary
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Setup GitHub Auth Provider
export const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({
  prompt: 'select_account'
});

// Re-export standard Auth functions for clean imports throughout the app
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider
};

export type { User };
