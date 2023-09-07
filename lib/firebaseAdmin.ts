import { firestore } from "firebase-admin";
var admin = require("firebase-admin");
// var serviceAccount = require("../secret.json");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}
export async function verifyIdToken(token: string) {
  try {
    let decodedToken = await admin.auth().verifyIdToken(token);
    // console.log("🎉running try in firebase admin");
    const convertSecondsToTime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return { days, hours, minutes, seconds: remainingSeconds };
    };
    // console.log(convertSecondsToTime(decodedToken.exp));
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decodedToken.exp <= nowInSeconds) {
      throw new Error("Token has expired");
    }
    // console.log("🎉 Token is valid");
    return decodedToken;
  } catch (err) {
    console.log("🎉 Firebase admin error", err);
    throw err;
  }
}
export async function getUserData(uid: string) {
  try {
    const admin = await import("firebase-admin");
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error("Error retrieving user data:", error);
  }
}
export async function getFCMToken(uid: string) {
  // Get the user's FCM token (replace with your user lookup logic)
  // const user = await admin.auth().getUser(uid);
  const user = await firestore().doc(`users/${uid}`).get();
  // const fcmToken = user.tokens?.fcmToken;
  const fcmToken = (user.data()?.fcmToken as string[]) ?? null;
  // const quotedArray = fcmToken.map((element) => `"${element}"`);

  // const array = quotedArray.join(",");
  return fcmToken;
  // getMess
  // console.log({ withFCM: fcmToken });
}
// export async function sendPushNoti(params: type) {
//   const notification = {
//     token: fcmToken,
//     notification: {
//       body: message,
//     },
//   };
// }
