import {
  addDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { friends } from "../../types/interfaces";
import { db } from "../firebase";

export async function addFriends(uid: string, f: friends) {
  // status pending to friends
  const { author, ...data } = { ...f };

  const senderData = {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
    senderId: uid,
  } as friends & { senderId: string };
  const receiptData = {
    ...senderData,
    id: uid,
  } as friends & { senderId: string };
  console.log({ senderData, receiptData });
  const senderRef = doc(db, `users/${receiptData.id}/friends/${senderData.id}`);
  const receiptRef = doc(
    db,
    `users/${senderData.id}/friends/${receiptData.id}`
  );
  try {
    await setDoc(senderRef, senderData);
    await setDoc(receiptRef, receiptData);
  } catch (error) {
    console.log(error);
    throw error;
  }
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
    await updateDoc(receiptRef, receiptData);
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
