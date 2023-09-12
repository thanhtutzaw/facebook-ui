// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import admin from "firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";
import { getFCMToken } from "../../lib/firebaseAdmin";
// type Data = {
//   uid: string;
//   message: string;
//   name?: string;
// };
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { recieptId, message, icon, webpush, tag, badge, link, actions } =
    req.body;
  const registrationTokens = await getFCMToken(recieptId);
  if (!registrationTokens) return;
  try {
    const messageNoti = {
      tokens: registrationTokens,
      data: {
        title: "Facebook",
        body: message,
        icon,
        badge,
        tag,
        // bodyLocArgs: ['FooCorp', '11.80', '835.67', '1.43'],
        click_action: link ?? "/",
        actions,
      },
      webpush: {
        headers: {
          image: icon,
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
    const response = await admin.messaging().sendEachForMulticast(messageNoti);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.log(error);
  }
  console.log({ registrationTokens });
  res.status(200).json(req.body);
}
