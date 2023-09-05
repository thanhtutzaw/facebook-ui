// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');
// importScripts('../lib/firebase');
// import firebaseConfig from '../lib/firebase'
// const firebaseConfig = require('../lib/firebase');

// const firebaseConfig = {
//     apiKey: 'your_keys',
//     authDomain: 'your_keys',
//     projectId: 'your_keys',
//     storageBucket: 'your_keys',
//     messagingSenderId: 'your_keys',
//     appId: 'your_keys',
//     measurementId: 'your_keys',
// };
// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//     measurementId: "G-ME0NSYLYR3",
// };
const firebaseConfig = {
    apiKey: "AIzaSyAEXJn6eWHzxlh4BuXNtwyA82B-P7bwU4E",
    authDomain: "facebook-37f93.firebaseapp.com",
    projectId: "facebook-37f93",
    storageBucket: "facebook-37f93.appspot.com",
    messagingSenderId: "1050578101323",
    appId: "1:1050578101323:web:f0cea355bd01e045cc99ce",
    measurementId: "G-ME0NSYLYR3"
};
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//     console.log(
//         '[firebase-messaging-sw.js] Received background message ',
//         payload
//     );
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//         body: payload.notification.body,
//         icon: '/logo.svg',
//     };
//     self.registration.showNotification(notificationTitle, notificationOptions);
// });