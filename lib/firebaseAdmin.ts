import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { app } from "../lib/firebase";
import { auth } from "firebase-admin";
import { getAuth } from "firebase/auth";
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
    console.log("🎉running try in firebase admin");
    const convertSecondsToTime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return { days, hours, minutes, seconds: remainingSeconds };
    };
    console.log(convertSecondsToTime(decodedToken.exp));
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decodedToken.exp <= nowInSeconds) {
      throw new Error("Token has expired");
    }
    console.log("🎉 Token is valid");
    return decodedToken;
  } catch (err) {
    console.log("🎉 Firebase admin error", err);
    throw err;
  }
}
export async function getUserData(uid: string) {
  // if (!uid) return;
  try {
    const admin = await import("firebase-admin");
    const userRecord = await admin.auth().getUser(uid);
    // const displayName = userRecord.displayName!;
    // const photoURL = userRecord.photoURL!;
    return userRecord;

    // return uid;
    // if (userRecord) {
    //     return userRecord;
    // } else {
    //     return allUsers;
    // }
    // return allUsers
    // console.log("Display Name: " + displayName);
    // console.log("Photo URL: " + photoURL);
    // console.log(userRecord)
  } catch (error) {
    console.error("Error retrieving user data:", error);
    // return allUsers;
  }
}
