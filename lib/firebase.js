import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
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
const db = getFirestore();
const storage = getStorage(app);

export { app, db, storage };
function generateHtmlContent(data) {
    // Generate the HTML content based on the fetched data
    let htmlContent = '';

    // data.forEach(item => {
    //     htmlContent += `${item}`;
    // });
    for (let i = 0; i < data.length; i++) {
        htmlContent += `${data[i]}`;
    }

    // return data;
    return htmlContent;
}
export function postToJSON(doc) {
    const data = doc.data();
    // const date = data?.createdAt?.toJSON() || 0;
    if (data?.updatedAt === "Invalid Date") {
        return {
            ...data,
            authorId: doc.ref.parent.parent?.id,
            id: doc.id,
            text: data.text,
            // text: generateHtmlContent(data.text),
            // Gotcha! firestore timestamp NOT serializable to JSON. 
            //Must convert to milliseconds
            // createdAt: data?.createdAt?.toJSON() || 0,
            createdAt: data?.createdAt?.toJSON() || 0,
        };

    } else {
        return {
            ...data,
            authorId: doc.ref.parent.parent?.id,
            id: doc.id,
            text: data.text,
            // text: generateHtmlContent(data.text),
            // Gotcha! firestore timestamp NOT serializable to JSON. 
            //Must convert to milliseconds
            createdAt: data?.createdAt?.toJSON() || 0,
            // createdAt: new Timestamp(date?.seconds, date?.nanoseconds).toDate().toLocaleDateString(),
            updatedAt: data?.updatedAt?.toJSON() || 0,
        };
    }
}