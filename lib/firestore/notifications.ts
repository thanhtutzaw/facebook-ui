import { NotiApiRequest } from "@/pages/api/sendFCM";
import { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { apiEndPoint } from "../apiEndPoint";
import { getPath } from "../firebase";
export type NotiMessageTypes = keyof typeof messages;
type AppNoti = {
  messageBody?: string;
  uid: string;
  receiptId: string | number;
  profile:
    | (User & { photoURL_cropped?: string | undefined })
    | null
    | undefined;
  type: NotiMessageTypes;
  url: string;
  content?: string;
};
export async function sendAppNoti(data: AppNoti) {
  const { uid, receiptId, profile, ...rest } = data;
  const { displayName: userName, photoURL } = profile!;
  // const isAdmin = receiptId.toString() === uid;
  const notifRef = doc(getPath("notifications", { uid: String(receiptId) }));
  const notiData = {
    userName,
    createdAt: serverTimestamp(),
    photoURL,
    content: rest.content ?? "",
    ...rest,
  };
  await setDoc(notifRef, notiData);
}
export async function sendFCM<T>(data: NotiApiRequest["body"]) {
  const productionURL = "https://facebook-ui-zee.vercel.app";
  const localURL = "http://localhost:3000";
  const isProduction = process.env.NODE_ENV === "production";
  const hostName = isProduction ? productionURL : localURL;
  const endPoint = apiEndPoint.sendFCM;
  const sendFCM_API = `${hostName ?? productionURL}/${endPoint}` as const;
  console.log("Sending Notification (" + data.message + ")");
  console.log({ Sending_Notification: data });
  try {
    const response = await fetch(sendFCM_API, {
      method: "POST",
      headers: {
        // "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log({ responseOk: response.ok });
    console.log("Notification Sended successfully.");
    const responseData: unknown = await response.json();
    if (!response.ok) {
      throw new Error("SendFCM Response Failed !");
    }
    return responseData as T;
  } catch (error) {
    console.error("Notification response failed!" + error);
    throw new Error("Notification response failed!");
  }
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
//   const sw =  getReadyServiceWorker();
//   return sw.pushManager.getSubscription();
// }
// async function getReadyServiceWorker() {
//   return  navigator.serviceWorker.ready;
// }
