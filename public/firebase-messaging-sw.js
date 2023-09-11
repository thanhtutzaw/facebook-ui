// // eslint-disable-next-line no-undef
// importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
// // eslint-disable-next-line no-undef
// importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');
// // import { getMessaging } from "firebase/messaging/sw";
// // import { onBackgroundMessage } from "firebase/messaging/sw";

// // const messaging = getMessaging();
// const firebaseConfig = {
//     apiKey: "AIzaSyAEXJn6eWHzxlh4BuXNtwyA82B-P7bwU4E",
//     authDomain: "facebook-37f93.firebaseapp.com",
//     projectId: "facebook-37f93",
//     storageBucket: "facebook-37f93.appspot.com",
//     messagingSenderId: "1050578101323",
//     appId: "1:1050578101323:web:f0cea355bd01e045cc99ce",
//     measurementId: "G-ME0NSYLYR3"
// };
// // eslint-disable-next-line no-undef
// firebase.initializeApp(firebaseConfig);
// // eslint-disable-next-line no-undef
// const messaging = firebase.messaging();


// // if (typeof window !== "undefined") {
// //     console.log("window exist")
// //     messaging.onMessage((payload) => {
// //         console.log(
// //             '[firebase-messaging-sw.js] Received foreground message ',
// //             payload
// //         );
// //         const notificationTitle = payload.notification.title;
// //         const notificationOptions = {
// //             body: payload.notification.body,
// //             icon: '/logo.svg',

// //         };
// //         const notificationOptions = {
// //             body: payload.notification.body,
// //             icon: '/logo.svg',

// //         };
// //         self.registration.showNotification(notificationTitle, notificationOptions);
// //     });
// // }
// // const messaging = getMessaging();

// messaging.onBackgroundMessage((payload) => {
//     console.log(
//         '[firebase-messaging-sw.js] Received background message ',
//         payload
//     );
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//         body: payload.notification.body,
//         icon: 'https://facebook-ui-zee.com/logo.svg',
//     };
//     // self.registration.showNotification(notificationTitle, notificationOptions);
// });
// // onBackgroundMessage(messaging, (payload) => {
// //     console.log('[firebase-messaging-sw.js] Received background message ', payload);
// //     // Customize notification here
// //     const notificationTitle = 'Background Message Title';
// //     const notificationOptions = {
// //         body: 'Background Message body.',
// //         icon: '/firebase-logo.png'
// //     };

// //     self.registration.showNotification(notificationTitle,
// //         notificationOptions);
// // });
self.addEventListener("notificationclick", function (event) {
    console.log('notification click event', event);
    const { click_action } = event.notification.data;
    event.notification.close();
    // event.waitUntil(

    switch (event.action) {
        case `see_post`:
            event.waitUntil(clients.openWindow(click_action));
            break;
    }
});
// self.addEventListener('notificationclick', function (event) {
//     event.notification.close();
//     console.log('Notification notificationclick triggered');
//     event.waitUntil(
//         clients.openWindow(event.notification.data)
//     );
// })
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js'); // Import the Firebase v9 compat library
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js'); // Import the Firebase v9 compat library for messaging

const firebaseConfig = {
    apiKey: "AIzaSyAEXJn6eWHzxlh4BuXNtwyA82B-P7bwU4E",
    authDomain: "facebook-37f93.firebaseapp.com",
    projectId: "facebook-37f93",
    storageBucket: "facebook-37f93.appspot.com",
    messagingSenderId: "1050578101323",
    appId: "1:1050578101323:web:f0cea355bd01e045cc99ce",
    measurementId: "G-ME0NSYLYR3"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
    console.log("FCM Background Noti ", payload)
    const { title, body, icon, webpush, badge, click_action, link, tag } = payload.data;
    const notificationOptions = {
        body: body ?? "Notifications from facebook .",
        icon: icon ?? "/logo.svg",
        badge,
        tag: tag ?? "General",
        renotify: true,
        data: {
            click_action
        },
        actions: [{ action: "see_post", title: "See Post" }],

        // webpush: {
        //     fcm_options: {
        //         link,
        //     },
        // },
    };
    self.registration.showNotification(title, notificationOptions)
})
// Add an event listener to handle incoming messages and display notifications
// self.addEventListener('push', (event) => {
//     const options = {
//         body: event.data.text(),
//         icon: '/path-to-your-icon.png', // Replace with the path to your notification icon
//     };

//     event.waitUntil(
//         self.registration.showNotification('Your Notification Title', options)
//     );
// });
