import { NotiAction } from "@/lib/NotiAction";
import { checkParam } from "@/lib/utils";
import admin from "firebase-admin";
import {
  BatchResponse,
  MulticastMessage,
} from "firebase-admin/lib/messaging/messaging-api";
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
export type NotiApiRequest = NextApiRequest & {
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
};
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
  const notAllowMethodError = "Method Not Allowed";
  const NotiMessageBody = messageBody
    ? `${message} : ${messageBody}`
    : message ?? "New Notification Recieved!";
  const notiBadge = badge ?? "./badge.svg";
  // let token = req.cookies.token || req.headers.token || req.query.token;
  const requireParam = {
    recieptId,
    // timestamp,
    // messageBody,
    // message,
    // tag,
    // badge,
    // link,
    // actionPayload,
    // actions,
    // collapse_key,
    // image,
  };
  const requireParamLists = Object.keys({
    ...requireParam,
  });
  const { error: paramErrorMessage, paramError } = checkParam({
    requiredParamLists: requireParamLists,
    req,
    res,
  });
  if (req.method === "POST") {
    let response: BatchResponse | null = null;
    let registrationTokens: string[];
    try {
      registrationTokens = await getFCMToken(String(recieptId));
      if (registrationTokens) {
        if (!paramError) {
          const messageNoti: MulticastMessage = {
            // topic: collapse_key ?? "",
            // collapse_key: collapse_key ?? "",
            tokens: registrationTokens,
            notification: {
              title,
              body: NotiMessageBody,
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
                body: NotiMessageBody,
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
            response = await admin
              .messaging()
              .sendEachForMulticast(messageNoti);
            console.log(
              `Successfully sent FCM - Success: ${response.successCount} , Fail: ${response.failureCount}`
            );
          } catch (error) {
            res.status(500).json({
              success: false,
              error: `FCM ${error}`,
              message: `Failed to sent FCM - Success: ${
                response ? response.successCount : 0
              } , Fail: ${response ? response.failureCount : 0}`,
            });
          }
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: `registrationTokens ${error}`, success: false });
    }
    // catch (error) {
    //   res.status(500).json({
    //     error: "Failed to send FCM Notifications :" + error,
    //     success: false,
    //   });
    // }
    res.status(200).json({
      success: true,
      data: NotiMessageBody,
      title,
      body: req.body ? req.body : null,
      fcmResponse: response,
      ...{ error: paramError ? paramErrorMessage : null },
    });
  } else if (req.method === "GET") {
    res.status(200).json({
      success: true,
      title,
      data: NotiMessageBody,
      body: req.body ? req.body : null,
      ...{ error: paramError ? paramErrorMessage : null },
    });
  } else {
    res.status(405).json({
      success: false,
      error: {
        notAllowMethodError,
        paramError: paramError ? paramErrorMessage : null,
      },
    });
  }
}
