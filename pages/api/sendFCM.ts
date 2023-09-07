// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getFCMToken } from "../../lib/firebaseAdmin";
import admin from "firebase-admin";
// import { app } from "../../lib/firebase";
// import { getMessaging } from "firebase-admin/messaging";
// Initialize Firebase Admin SDK (replace with your service account credentials)
// const serviceAccount = require("./path-to-your-service-account-key.json");
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     // Add other Firebase configuration options here
//   });
// }
type Data = {
  uid: string;
  message: string;
  name?: string;
};
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
  res: NextApiResponse<Data>
) {
  const { recieptId, message } = req.body;
  // const registrationToken =
  //   "e-V9ewoFQaq47-nX6o5cnI:APA91bEAMSYbu-D8yYqQyZcZELFFXaCLSmHU-mweav8eTy0ZdMxSAkzcUL1pXo3cpleWZHtTEpMykvZVLKJeCXRXZ77QwxrXuUOgaDhjjVl14q4R-0Ko8aZSN9xuWTaYDacZRbJ_Onyk";
  // const registrationToken =
  //   "cO_IgJ_8jok31igywGDgoQ:APA91bEnEbzoo76ILgvUwNRon1joTBmpMLZdSIwW1KTxZoEQHgHHl_B5U9zhNbr5UrcUKWkpRBQtgijtSny3Incu_ZJRMqmpn8o9CCNZBPttvv4Q4w80hB3arVovgR57TvVn8FPrmAtA";
  console.log(recieptId);
  const registrationToken = await getFCMToken(recieptId);
  if (!registrationToken) return;
  const message2 = {
    data: {
      score: "850",
      time: "2:45",
    },
    token: registrationToken,
  };
  // const messaging = getMessaging();
  // messaging
  //   .send(message2)
  //   .then((response) => {
  //     // Response is a message ID string.
  //     console.log("Successfully sent message:", response);
  //   })
  //   .catch((error: any) => {
  //     console.log("Error sending message:", error);
  //   });
  const messageNoti = {
    token: registrationToken, // Replace with the user's FCM token
    notification: {
      title: "Facebook",
      body: message,
    },
  };
  try {
    const response = await admin.messaging().send(messageNoti);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.log(error);
  }
  console.log({ registrationToken });
  res.status(200).json(req.body);
}
