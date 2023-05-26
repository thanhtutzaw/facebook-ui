import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: "G-ME0NSYLYR3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore()
export { app, db };

export function postToJSON(doc) {
    const data = doc.data();
    if (data?.updatedAt === "Invalid Date") {
        return {
            ...data,
            authorId: doc.ref.parent.parent?.id,
            id: doc.id,
            // Gotcha! firestore timestamp NOT serializable to JSON. 
            //Must convert to milliseconds
            createdAt: data?.createdAt?.toJSON() || 0,
        };

    } else {
        return {
            ...data,
            authorId: doc.ref.parent.parent?.id,
            id: doc.id,
            // Gotcha! firestore timestamp NOT serializable to JSON. 
            //Must convert to milliseconds
            createdAt: data?.createdAt?.toJSON() || 0,
            updatedAt: data?.updatedAt?.toJSON() || 0,
        };
    }
}