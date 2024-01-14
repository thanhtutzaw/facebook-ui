import { auth, firestore } from "firebase-admin";
import { getCollectionPath } from "./firebase";
var admin = require("firebase-admin");
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
    const decodedToken = await auth().verifyIdToken(token);
    // await auth().revokeRefreshTokens(decodedToken.uid);
    // console.log("🎉running try in firebase admin");
    // const convertSecondsToTime = (seconds: number) => {
    //   const days = Math.floor(seconds / (3600 * 24));
    //   const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    //   const minutes = Math.floor((seconds % 3600) / 60);
    //   const remainingSeconds = seconds % 60;
    console.log({
      expireInSSR: new Date(decodedToken.exp * 1000).toLocaleString(),
    });
    //   return { days, hours, minutes, seconds: remainingSeconds };
    // };

    // new Date(decodedToken.exp * 1000);
    // console.log(convertSecondsToTime(decodedToken.exp));
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decodedToken.exp <= nowInSeconds) {
      console.log("token expired");
      throw new Error("Token has expired");
    }
    return decodedToken;
  } catch (error) {
    //  await auth.verify
    // const decodedToken = console.log({ token, decodedToken });
    //  if (decodedToken.exp <= nowInSeconds) {
    //    console.log(yes);
    //  }
    console.log("🎉 Firebase admin error", error);
    throw error;
  }
}
export async function getUserData(uid: string) {
  try {
    const admin = await import("firebase-admin");
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error(`{Error retrieving user data:(${uid})}`, error);
  }
}
export async function getFCMToken(uid: string) {
  const user = await firestore()
    .doc(`${getCollectionPath.users({ uid })}`)
    .get();
  const fcmToken = (user.data()?.fcmToken as string[]) ?? null;
  console.log({ getFCMToken: fcmToken });
  return fcmToken;
}
