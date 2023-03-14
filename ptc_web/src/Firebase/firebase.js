import { initializeApp } from "firebase/app";
import { addDoc, getFirestore } from "firebase/firestore";
import 'firebase/compat/firestore'
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA8PggxkH2S35dzzjNcUoOWzt0Dur7JyPc",
    authDomain: "ptc-digitalmanager.firebaseapp.com",
    databaseURL: "https://ptc-digitalmanager-default-rtdb.firebaseio.com",
    projectId: "ptc-digitalmanager",
    storageBucket: "ptc-digitalmanager.appspot.com",
    messagingSenderId: "867301359210",
    appId: "1:867301359210:web:9df41109b22fd98d4fd413"
};

const app = initializeApp(firebaseConfig);
export const db = app;
export default app; 