var admin = require("firebase-admin");

// var serviceAccount = require("../secret.json");

export async function verifyIdToken(token) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
    }
    try {
        let decodedToken = await admin.auth().verifyIdToken(token)
        console.log("🎉running try in firebase admin")


        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (decodedToken.exp <= nowInSeconds) {
            throw new Error('Token has expired');
        }

        console.log("🎉 Token is valid");
        return decodedToken;
    } catch (err) {
        console.log("🎉 Firebase admin error", err);
        throw err;
    }












    // return await admin.auth().verifyIdToken(token).catch(err => { throw err; })

    // const decodedToken = await admin.auth().verifyIdToken(token)
    // return decodedToken
    // return admin.auth().verifyIdToken(token).catch(err => { throw err; })
    // return admin.auth().verifyIdToken(token).catch(err => { throw err; })
}