import { NotiAction } from "@/lib/NotiAction";
import admin from "firebase-admin";
import { MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";
import type { NextApiRequest, NextApiResponse } from "next";
import { getFCMToken } from "../../lib/firebaseAdmin";
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}
export interface NotiApiRequest extends NextApiRequest {
  body: {
    image?: string;
    title?: string;
    recieptId: string | number;
    message?: string;
    messageBody?: string;
    icon?: string;
    tag?: string;
    badge?: string;
    link?: string;
    actionPayload?: string;
    collapse_key?: string;
    // actions?: Array<keyof typeof NotiAction>;
    // actions?:  { [key in keyof typeof NotiAction]: typeof NotiAction[key] }
    // actions?: {[key in keyof typeof NotiAction]: typeof NotiAction[key]}[];
    // actions?: (d:typeof NotiAction)=>string;
    // actions?: any;
    actions?: Array<(typeof NotiAction)[keyof typeof NotiAction]>;
    requireInteraction?: boolean;
  };
}
export default async function handler(
  req: NotiApiRequest,
  res: NextApiResponse
) {
  const {
    title,
    recieptId,
    messageBody,
    message,
    icon,
    tag,
    badge,
    link,
    actionPayload,
    actions,
    requireInteraction,
    collapse_key,
    image,
  } = req.body;
  try {
    const registrationTokens = await getFCMToken(String(recieptId));
    console.log({ actionPayload });
    console.log(typeof actionPayload);
    if (registrationTokens) {
      try {
        const messageNoti: MulticastMessage = {
          topic: collapse_key ?? "",
          collapse_key: collapse_key ?? "",
          tokens: registrationTokens,
          notification: {
            title: title ?? "Facebook",
            body: messageBody
              ? `${message} : ${messageBody}`
              : message ?? "New Notification Recieved!",
            ...(image ? { imageUrl: image } : {}),
          },
          webpush: {
            headers: {
              Urgency: "high",
              image: icon ?? "",
            },
            notification: {
              requireInteraction: requireInteraction ?? false,
              badge: badge ?? "./badge.svg",
              icon,
              ...(image ? { image: image } : {}),
              actions: actions ? actions : [],
              data: {
                actionPayload:
                  actions && actionPayload ? JSON.parse(actionPayload) : {},
              },
              tag: tag ?? "",
              renotify: false,
            },
            fcmOptions: {
              link,
            },
          },
          android: {
            collapseKey: collapse_key ?? "",
            ttl: 3600000,
            notification: {
              bodyLocKey: "STOCK_NOTIFICATION_BODY",
              bodyLocArgs: ["FooCorp", "11.80", "835.67", "1.43"],
            },
          },
          apns: {
            payload: {
              aps: {
                threadId: collapse_key ?? "",
              },
            },
          },
        } as MulticastMessage;

        const response = await admin
          .messaging()
          .sendEachForMulticast(messageNoti);
        console.log("Successfully sent message:", response);
        // console.log(
        //   "Error",
        //   response.responses.forEach((r) => r.error)
        // );
        console.log(
          response.responses.forEach((r) => {
            return JSON.stringify(r.error);
          })
        );
      } catch (error) {
        console.log(error);
        res.status(500).end();
        return;
      }
      res.status(200).json(req.body);
    } else {
      res.status(500).end();
      // res.status(500).json({ error: "failed to load data" });
      return;
    }
  } catch (error) {
    // res.json(error);
  }
}
