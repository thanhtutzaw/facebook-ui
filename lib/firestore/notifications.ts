import { User } from "firebase/auth";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { notiContentTypes } from "../../types/interfaces";
import { db } from "../firebase";

export async function sendAppNoti(
  uid: string,
  receiptId: string | number,
  profile: User | null,
  // profile: account["profile"] | null = null,
  type: notiContentTypes,
  url: string,
  content?: string
) {
  const { displayName, photoURL } = profile!;
  // const { firstName, lastName, photoURL } = profile!;
  const isAdmin = receiptId.toString() === uid;
  // if (isAdmin) return;
  const notifRef = doc(collection(db, `users/${receiptId}/notifications`));
  // const userName = `${firstName} ${lastName}`;
  const data = {
    type,
    userName: displayName,
    createdAt: serverTimestamp(),
    // photoURL: (photoURL as string) ?? null,
    photoURL,
    url,
    uid,
    content: content ? content : "",
  };
  await setDoc(notifRef, data);
}

export const getMessage = (type: notiContentTypes) => {
  const messages: Record<notiContentTypes, string> = {
    post_reaction: `reacted your post.`,
    comment: `commented on your post.`,
    share: `shared your post.`,
  };
  return { message: messages[type] || "" };
};

export async function getCurrentPushSubscription() {
  const sw = await getReadyServiceWorker();
  return sw.pushManager.getSubscription();
}
async function getReadyServiceWorker() {
  return await navigator.serviceWorker.ready;
}
