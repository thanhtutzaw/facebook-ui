self.addEventListener("notificationclick", function (event) {
    console.log('notification click event', event);
    const { click_action } = event.notification.data;
    switch (event.action) {
        case `see_post`:
            event.notification.close();
            event.waitUntil(clients.openWindow(click_action));
            break;
        default:
            event.notification.close();
            event.waitUntil(clients.openWindow(click_action));
            break;
    }

});
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
    };
    self.registration.showNotification(title, notificationOptions)
})
