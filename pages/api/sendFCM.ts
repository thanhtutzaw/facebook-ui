import admin from "firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";
import { getFCMToken } from "../../lib/firebaseAdmin";
import { MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";
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
    title?: string;
    recieptId: string | number;
    message?: string;
    icon?: string;
    tag?: string;
    badge?: string;
    link?: string;
    actionPayload?: string;
    actions?: string;
    requireInteraction?: boolean;
  };
}

export default async function handler(
  req: NotiApiRequest,
  res: NextApiResponse
) {
  const { body } = req;
  const {
    title = "Facebook",
    recieptId,
    message = "New Notifications from Facebook.",
    icon = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    tag = "",
    badge = "/badge.svg",
    link = "/",
    actionPayload,
    actions,
    requireInteraction = false,
  } = body;
  const registrationTokens = await getFCMToken(String(recieptId));
  if (!registrationTokens) return;
  try {
    const messageNoti: MulticastMessage = {
      tokens: registrationTokens,
      notification: {
        title,
        body: message,
      },
      // data: {
      //   actionPayload: actionPayload ?? JSON.stringify([]),
      //   actions: actions ?? JSON.stringify([]),
      // },
      webpush: {
        headers: {
          Urgency: "high",
          image: icon,
        },
        notification: {
          title,
          body: message,
          requireInteraction,
          badge,
          icon,
          actions: typeof actions === "string" ? JSON.parse(actions) : [],
          data: {
            actionPayload:
              typeof actions === "string" && actionPayload
                ? JSON.parse(actionPayload)
                : {},
          },
          tag,
          renotify: false,
          // actions: actions ?? JSON.stringify([]),
        },
        fcmOptions: {
          link,
        },
      },
      android: {
        ttl: 3600000,
        notification: {
          bodyLocKey: "STOCK_NOTIFICATION_BODY",
          bodyLocArgs: ["FooCorp", "11.80", "835.67", "1.43"],
        },
      },
    };
    console.log({ messageNoti });

    const response = await admin.messaging().sendEachForMulticast(messageNoti);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.log(error);
  }
  console.log({ registrationTokens });
  res.status(200).json(req.body);
}
