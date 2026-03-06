// firebase.js — place ce fichier dans src/
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCloIisgICa_lq2Ih0C4RH7zTGZZFaDHl8",
  authDomain: "socratic-ag.firebaseapp.com",
  projectId: "socratic-ag",
  storageBucket: "socratic-ag.firebasestorage.app",
  messagingSenderId: "881686801091",
  appId: "1:881686801091:web:5436b886631ff951555076"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


