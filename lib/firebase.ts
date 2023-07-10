import { initializeApp } from "firebase/app";
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Post } from "../types/interfaces";
import { getUserData } from "./firebaseAdmin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-ME0NSYLYR3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage(app);
export { app, db, storage };

export async function postToJSON(doc: QueryDocumentSnapshot<DocumentData>) {
  const data = doc.data() as Post;
  const createdAt = data.createdAt as Timestamp;
  const updatedAt = data.updatedAt as Timestamp;
  const author = doc.ref.parent.parent!;
  // const user = (await getUserData(author.id)) as UserRecord;
  if (typeof data?.updatedAt === "string") {
    return {
      ...data,
      media: data.media ?? [],
      authorId: author.id,
      // autherName: user.displayName ?? "Unknown",
      id: doc.id,
      text: data.text,
      createdAt: createdAt?.toJSON() || 0,
    };
  } else {
    return {
      ...data,
      media: data.media ?? [],
      authorId: author.id,
      // autherName: user.displayName ?? "Unknown",
      id: doc.id,
      text: data.text,
      createdAt: createdAt?.toJSON() || 0,
      updatedAt: updatedAt?.toJSON() || 0,
    };
  }
}
