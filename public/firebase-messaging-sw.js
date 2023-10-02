self.addEventListener("notificationclick", function (event) {
    console.log('notification click event', event);
    const { reply: inputText } = event;
    const { click_action } = event.notification.data;
    // const client = self.clients
    event.notification.close();
    switch (event.action) {
        case `see_post`:
            event.notification.close();
            event.waitUntil((openTab(click_action))())
            // if (clients.openWindow) return event.waitUntil(window.open(click_action, "_self"))
            // clients.openWindow(click_action).then(function (client) {
            //     client.navigate(click_action);
            // });
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
        case `reply`:
            event.waitUntil((openTab(`/${inputText}`))())
            console.log("Submited content :", inputText);
            break;
        case `accept`:
            // event.waitUntil(clients.openWindow(`https://facebook-ui-zee.vercel.app/api/hello`))
            event.waitUntil((openTab(click_action))())
            console.log("accepted user ", event.notification);
            break;
        default:
            event.waitUntil(
                (openTab(click_action))(),
            );
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

// messaging.onMessage((payload) => {
//     const { title, body, icon } = payload.notification;
//     alert("foreground sw")
//     const notificationOptions = {
//         body: body || "Default body",
//         icon: icon || "/logo.svg",
//     };

//     self.registration.showNotification(title, notificationOptions);
// });
messaging.onBackgroundMessage((payload) => {
    // console.log({ NotiAction })
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
function openTab(url) {
    return async () => {
        const allClients = await clients.matchAll({
            includeUncontrolled: true,
        });
        let facebookClient;
        for (const client of allClients) {
            const url = new URL(client.url);
            console.log(url.pathname, url);
            if (url.pathname === url) {
                await client.focus();
                facebookClient = client;
                console.log(facebookClient);
                break;
            }
        }
        // console.log(facebookClient);
        if (!facebookClient) {
            facebookClient = await clients.openWindow(url);
        }

    };
}

