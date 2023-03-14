import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore();

export { auth, db };