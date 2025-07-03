import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBp7S2DrTtxSdfKEzApogop9TWY0ofVMcU",
  authDomain: "gfgapp-3a19e.firebaseapp.com",
  projectId: "gfgapp-3a19e",
  storageBucket: "gfgapp-3a19e.appspot.com",
  messagingSenderId: "355851007199",
  appId: "1:355851007199:web:0b791d818d0ea8e016256a",
  measurementId: "G-5B22X14T8V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };