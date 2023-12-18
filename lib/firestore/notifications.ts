import { NotiApiRequest } from "@/pages/api/sendFCM";
import { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getPath } from "../firebase";
export type NotiMessageTypes = keyof typeof messages;
export interface AppNoti {
  messageBody?: string;
  uid: string;
  receiptId: string | number;
  profile:
    | (Partial<User> & {
        photoURL_cropped?: string | undefined;
      })
    | null;
  type: NotiMessageTypes;
  url: string;
  content?: string;
}
export async function sendAppNoti(data: AppNoti) {
  // const { uid, type, receiptId, profile, messageBody, ...rest } = data;
  const { uid, receiptId, profile, ...rest } = data;
  const { displayName: userName, photoURL } = profile!;
  const isAdmin = receiptId.toString() === uid;
  const notifRef = doc(getPath("notifications", { uid: String(receiptId) }));
  console.log({ InboxNotiData: data });
  const notiData = {
    userName,
    createdAt: serverTimestamp(),
    photoURL,
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
  console.log({ url });
  console.log("Sending Notification (" + data.message + ")");
  console.log({ data });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Access-Control-Allow-Origin": "*",
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
export const messages = {
  comment_reaction: `loved to your comment.`,
  post_reaction: `reacted to your post.`,
  replied_to_comment: `replied to your comment`,
  commented_on_post: `commented on your post`,
  comment: `commented on your post.`,
  share: `shared your post.`,
  acceptedFriend: `accepted your friend request.`,
};
export const getMessage = (type: NotiMessageTypes) => {
  return messages[type] || "sended a new notification.";
};
// export async function getCurrentPushSubscription() {
//   const sw = await getReadyServiceWorker();
//   return sw.pushManager.getSubscription();
// }
// async function getReadyServiceWorker() {
//   return await navigator.serviceWorker.ready;
// }
