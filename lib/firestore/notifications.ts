import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Post, account, notiContentTypes } from "../../types/interfaces";
import { db } from "../firebase";

export async function sendAppNoti(
  uid: string,
  receiptId: string | number,
  profile: account["profile"] | null,
  type: notiContentTypes,
  url: string
) {
  const { firstName, lastName, photoURL } = profile!;
  if (receiptId === uid) return;
  // const url = ;
  const notifRef = doc(collection(db, `users/${receiptId}/notifications`));
  const userName = `${firstName} ${lastName}`;
  const data = {
    type,
    userName,
    createdAt: serverTimestamp(),
    photoURL: photoURL as string,
    url,
    uid,
  };
  await setDoc(notifRef, data);
}

export const getMessage = (type: notiContentTypes) => {
  const messages: Record<notiContentTypes, string> = {
    reaction: `reacted this post.`,
    comment: `commented on this post.`,
    share: `shared this post.`,
  };
  return { message: messages[type] || "" };
};
