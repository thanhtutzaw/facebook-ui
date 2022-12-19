import { getAuth } from "firebase/auth";
import { app } from "./firebase";

var admin = require("firebase-admin");

var serviceAccount = require("../secret.json");

export function verifyIdToken(token) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    // const decodedToken = await admin.auth().verifyIdToken(token)
    // return decodedToken
    return admin.auth().verifyIdToken(token).catch(err => { throw err; })
    // return admin.auth().verifyIdToken(token).catch(err => { throw err; })
    // return admin.auth().verifyIdToken(token).catch(err => { throw err; })
}