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
  const {
    title,
    recieptId,
    message,
    icon,
    tag,
    badge,
    link,
    actionPayload,
    actions,
    requireInteraction,
  } = req.body;

  const registrationTokens = await getFCMToken(String(recieptId));
  if (!registrationTokens) return;
  try {
    const messageNoti = {
      tokens: registrationTokens,
      notification: {
        title: title ?? "Facebook",
        body: message,

        // badge,
        // icon,
        // tag,
        // actionPayload: actionPayload ?? JSON.stringify([]),
        // icon,
        // badge,
        // tag: tag ?? "",
        // click_action: link ?? "/",
        // actionPayload: actionPayload ?? JSON.stringify([]),
        // actions: actions ?? JSON.stringify([]),
        // action: actions ?? JSON.stringify([]),
      },
      // data: {
      //   title: title ?? "Facebook",
      //   body: message,
      //   icon,
      //   badge,
      //   tag: tag ?? "",
      //   click_action: link ?? "/",
      //   actionPayload: actionPayload ?? JSON.stringify([]),
      //   actions: actions ?? JSON.stringify([]),
      // },
      webpush: {
        headers: {
          Urgency: "high",
          image: icon,
        },
        notification: {
          // title: title ?? "Facebook",
          // body: message,
          requireInteraction: requireInteraction ? requireInteraction : false,
          badge,
          icon,
          actions: typeof actions === "string" ? JSON.parse(actions) : [],
          data: {
            actionPayload:
              typeof actions === "string" && actionPayload
                ? JSON.parse(actionPayload)
                : {},
          },
          tag: tag ?? "",
          renotify: false,
          // actions: actions ?? JSON.stringify([]),
        },
        fcm_options: {
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
    } as MulticastMessage;
    console.log({ messageNoti });

    const response = await admin.messaging().sendEachForMulticast(messageNoti);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.log(error);
  }
  console.log({ registrationTokens });
  res.status(200).json(req.body);
}
