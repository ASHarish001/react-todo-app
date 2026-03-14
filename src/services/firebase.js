// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
// };

// const app = initializeApp(firebaseConfig);

// export const db = getFirestore(app);
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzYuzlJGVKRsosoizbC6jLF7evQuQCcME",
  authDomain: "react-todo-app-362e0.firebaseapp.com",
  projectId: "react-todo-app-362e0",
  storageBucket: "react-todo-app-362e0.firebasestorage.app",
  messagingSenderId: "130007295023",
  appId: "1:130007295023:web:f34902347bca79106d12da"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);