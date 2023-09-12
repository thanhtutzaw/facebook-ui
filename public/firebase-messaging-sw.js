self.addEventListener("notificationclick", function (event) {
    console.log('notification click event', event);
    const { click_action } = event.notification.data;
    console.log(event.action)
    switch (event.action) {
        case `see_post`:
            event.notification.close();
            event.waitUntil(clients.openWindow(`https://facebook-ui-zee.vercel.app/${click_action}`))
            // if (clients.openWindow) return event.waitUntil(window.open(click_action, "_self"))
            // client.navigate(click_action);
            // clients.openWindow(click_action).then(function (client) {
            //     client.navigate(click_action);
            // });

            // event.waitUntil(clients.openWindow(click_action));
            // clients
            //     .matchAll({
            //         type: "window",
            //     })
            //     .then((clientList) => {
            //         for (const client of clientList) {
            //             if (client.url === "/" && "focus" in client) return client.focus();
            //         }
            //         if (clients.openWindow) return event.waitUntil(clients.openWindow(click_action));
            //     })
            break;
        default:
            event.notification.close();
            // event.waitUntil(clients.openWindow(click_action));
            window.open(click_action, "_self");
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

messaging.onMessage((payload) => {
    const { title, body, icon } = payload.notification;
    alert("foreground sw")
    const notificationOptions = {
        body: body || "Default body",
        icon: icon || "/logo.svg",
    };

    self.registration.showNotification(title, notificationOptions);
});
messaging.onBackgroundMessage((payload) => {
    console.log("FCM Background Noti ", payload)
    const { title, body, icon, webpush, badge, click_action, link, tag, actions } = payload.data;
    const notificationOptions = {
        body: body ?? "Notifications from facebook .",
        icon: icon ?? "/logo.svg",
        badge,
        tag: tag ?? "",
        renotify: tag !== '',
        data: {
            click_action
        },
        actions: JSON.parse(actions)
        // actions: [{ action: "see_post", title: "See Post" }, { action: "Input", title: "Input", type: 'input',placeHolder:'Type Something' }],
    };
    console.log(notificationOptions)
    self.registration.showNotification(title, notificationOptions)
})
