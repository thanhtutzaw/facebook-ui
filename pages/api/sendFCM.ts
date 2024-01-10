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
    timestamp?: number;
    image?: string;
    title?: string;
    recieptId: string | number;
    message?: string;
    messageBody?: string;
    icon?: string;
    tag?: string;
    badge?: string;
    link?: string;
    actionPayload?: unknown;
    collapse_key?: string;
    // actions?: Array<keyof typeof NotiAction>;
    // actions?:  { [key in keyof typeof NotiAction]: typeof NotiAction[key] }
    // actions?: {[key in keyof typeof NotiAction]: typeof NotiAction[key]}[];
    // actions?: (d:typeof NotiAction)=>string;
    actions?: Array<(typeof NotiAction)[keyof typeof NotiAction]>;
    requireInteraction?: boolean;
  };
  // extends NotificationPayload
}
export default async function handleFCM(
  req: NotiApiRequest,
  res: NextApiResponse
) {
  const {
    timestamp,
    title = "Facebook",
    recieptId,
    messageBody,
    message,
    icon = "/logo.svg",
    tag,
    badge,
    link,
    actionPayload,
    actions,
    requireInteraction = false,
    collapse_key,
    image,
  } = req.body;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  try {
    const registrationTokens = await getFCMToken(String(recieptId));
    const body = messageBody
      ? `${message} : ${messageBody}`
      : message ?? "New Notification Recieved!";
    const notiBadge = badge ?? "./badge.svg";
    if (registrationTokens) {
      const messageNoti: MulticastMessage = {
        // topic: collapse_key ?? "",
        // collapse_key: collapse_key ?? "",

        tokens: registrationTokens,
        notification: {
          title,
          body,
          ...(image !== "" ? { imageUrl: image } : {}),
        },
        webpush: {
          headers: {
            Urgency: "high",
            image: icon ?? "",
          },
          notification: {
            title,
            timestamp,
            body,
            ...(image !== "" ? { image: image } : {}),
            icon,
            requireInteraction,
            badge: notiBadge,
            tag: tag ?? "",
            renotify: false,
            actions: actions ? actions : [],
            data: {
              actionPayload: actions && actionPayload ? actionPayload : {},
            },
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
      };
      try {
        const response = await admin
          .messaging()
          .sendEachForMulticast(messageNoti);
        console.log("Successfully sent FCM :");
        res.status(200).json({
          success: true,
          body: req.body ? req.body : null,
          fcmResponse: response,
        });
      } catch (error) {
        console.error(error);
        res.status(500).end();
        return;
      }
    } else {
      // res.status(500).end();
      res.status(500).json({ tokenError: "FCM tokens Empty!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send FCM Notifications :" + error });
    // res.json(error);
  }
}
