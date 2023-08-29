import {
  addDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { friends } from "../../types/interfaces";
import { db } from "../firebase";

export async function addFriends(uid: string) {
  // status pending to friends

  const data = {
    status: "pending",
    createdAt: serverTimestamp(),
  } as friends;
}
export async function acceptFriends(uid: string, f: friends) {
  const { author, ...data } = { ...f };
  const acceptedData = {
    ...data,
    status: "friend",
    updatedAt: serverTimestamp(),
  } as friends;
  const receiptData = { ...acceptedData, id: uid };
  console.log({ acceptedData, receiptData });
  const acceptedRef = doc(
    db,
    `users/${receiptData.id}/friends/${acceptedData.id}`
  );
  const receiptRef = doc(
    db,
    `users/${acceptedData.id}/friends/${receiptData.id}`
  );
  try {
    await updateDoc(acceptedRef, acceptedData);
    await setDoc(receiptRef, receiptData);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function rejectFriends() {}
export async function blockFriends(uid: string, id: string) {
  const data = {
    status: "block",
    updatedAt: serverTimestamp(),
  } as friends;
}
