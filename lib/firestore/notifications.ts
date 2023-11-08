import { NotiApiRequest } from "@/pages/api/sendFCM";
import { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { notiContentTypes } from "../../types/interfaces";
import { getPath } from "../firebase";
export interface AppNoti {
  uid: string;
  receiptId: string | number;
  profile: User | null;
  type: notiContentTypes;
  url: string;
  content?: string;
}
export async function sendAppNoti(data: AppNoti) {
  const { uid, type, receiptId, profile, ...rest } = data;
  const { displayName: userName, photoURL } = profile!;
  const isAdmin = receiptId.toString() === uid;
  const notifRef = doc(getPath("notifications", { uid: String(receiptId) }));
  const notiData = {
    type,
    userName,
    createdAt: serverTimestamp(),
    photoURL,
    uid,
    content: rest.content ?? "",
    ...rest,
  };
  await setDoc(notifRef, notiData);
}
export async function sendFCM<T extends NotiApiRequest["body"]>(data: T) {
  const productionURL = "https://facebook-ui-zee.vercel.app";
  const localURL = "http://localhost:3000";
  const isProduction = process.env.NODE_ENV === "production";
  const hostName = isProduction ? productionURL : localURL;
  const apiEndpoint = "/api/sendFCM";
  const url = `${hostName ?? productionURL}${apiEndpoint}`;
  console.log("Sending Notification (" + data.message + ")");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    console.log("Notification Sended successfully.");
  }

  if (!response.ok) {
    throw new Error("Notification response failed!");
  }
  // return response.json() as unknown as T;
  const responseData: T = await response.json();
  return responseData;
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
