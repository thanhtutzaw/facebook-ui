import {
  addDoc,
  deleteDoc,
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
  // const receiptData = { ...acceptedData, id: uid };

  await updateFriendStatus(uid, acceptedData);
  // console.log({ acceptedData, receiptData });
  // const acceptedRef = doc(
  //   db,
  //   `users/${receiptData.id}/friends/${acceptedData.id}`
  // );
  // const receiptRef = doc(
  //   db,
  //   `users/${acceptedData.id}/friends/${receiptData.id}`
  // );
  // try {
  //   await updateDoc(acceptedRef, acceptedData);
  //   await updateDoc(receiptRef, receiptData);
  // } catch (error) {
  //   console.log(error);
  //   throw error;
  // }
}
export async function rejectFriendRequest(uid: string, f: friends) {
  try {
    await unFriend(uid, f);
  } catch (error) {
    console.log(error);
  }
}
export async function unFriend(uid: string, f: friends) {
  await deleteDoc(doc(db, `users/${uid}/friends/${f.id}`));
  await deleteDoc(doc(db, `users/${f.id}/friends/${uid}`));
}
export async function blockFriends(uid: string, f: friends) {
  const { author, ...data } = { ...f };
  const blockedData = {
    ...data,
    status: "block",
    updatedAt: serverTimestamp(),
  } as friends;
  await updateFriendStatus(uid, blockedData);
}

async function updateFriendStatus(uid: string, senderData: friends) {
  const receiptData = { ...senderData, id: uid };
  const { id: myId } = receiptData;
  const { id: friendId } = senderData;
  const senderRef = doc(db, `users/${myId}/friends/${friendId}`);
  const receiptRef = doc(db, `users/${friendId}/friends/${myId}`);
  try {
    await updateDoc(senderRef, senderData);
    await updateDoc(receiptRef, receiptData);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
