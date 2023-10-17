import { User } from "firebase/auth";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { notiContentTypes } from "../../types/interfaces";
import { db } from "../firebase";

export async function sendAppNoti(
  uid: string,
  receiptId: string | number,
  profile: User | null,
  type: notiContentTypes,
  url: string,
  content?: string
) {
  const { displayName, photoURL } = profile!;
  const isAdmin = receiptId.toString() === uid;
  const notifRef = doc(collection(db, `users/${receiptId}/notifications`));
  const data = {
    type,
    userName: displayName,
    createdAt: serverTimestamp(),
    photoURL,
    url,
    uid,
    content: content ? content : "",
  };
  await setDoc(notifRef, data);
}

export const getMessage = (type: notiContentTypes) => {
  const messages: Record<notiContentTypes, string> = {
    post_reaction: `reacted to your post.`,
    comment: `commented on your post.`,
    share: `shared your post.`,
    acceptedFriend: `accepted your friend request.`,
  };
  return { message: messages[type] || "" };
};

// export async function getCurrentPushSubscription() {
//   const sw = await getReadyServiceWorker();
//   return sw.pushManager.getSubscription();
// }
// async function getReadyServiceWorker() {
//   return await navigator.serviceWorker.ready;
// }
