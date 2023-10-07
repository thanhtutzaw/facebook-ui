self.addEventListener("notificationclick", function (event) {
    console.log('notification click event', event);
    const { reply: inputText } = event;
    // const { click_action, actionPayload } = event.notification.data.FCM_MSG
    const { click_action, data } = event.notification.data.FCM_MSG.notification;
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
            event.waitUntil(
                fetch('api/trigger_noti_action?action=accept', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data.actionPayload)
                })
                    .then(response => {
                        if (response.ok) {
                            console.log('Accepted user');
                        } else {
                            console.error('Accept Action failed');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    })
            )
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
// let data
// messaging.onMessage((payload) => {
//     console.log(`${payload} from sw.js`)
//     data=payload
//     const { title, body, icon } = payload.notification;
//     alert("foreground sw.js")
//     const notificationOptions = {
//         body: body,
//         icon: icon,
//     };

//     // self.registration.showNotification(title, notificationOptions);
//     const promiseChain = self.registration.showNotification(title, notificationOptions).then(({ data }) => {
//         console.log(data)
//         console.log('push success onmessage');
//     }).catch(() => {
//         console.log('push fail');
//     });
//     event.waitUntil(promiseChain);
// });
// self.addEventListener('push', function (event) {
//     // const data = event.data.json();
//     // console.log(data)
//     console.log({ self })
//     const promiseChain = self.registration.showNotification(data.title, data.option).then((data) => {
//         console.log('push success');
//         console.log(data)
//     }).catch(() => {
//         console.log('push fail');
//     });
//     event.waitUntil(promiseChain);
// });
messaging.onBackgroundMessage((payload) => {
    console.log("FCM Background Noti ", payload)
    // const { title, body, icon, webpush, badge, click_action, link, tag, actions, actionPayload } = payload.data;
    const { title, body, icon, webpush, badge, click_action, link, tag, actions, actionPayload } = payload.notification;
    /**
     * @property {NotificationAction[]} [actions] An array of notification actions.
     * @property {string} [badge] A string that represents the badge to be displayed on the notification.
     * @property {string} [body] The body of the notification.
     * @property {any} [data] Any data that you want to associate with the notification.
     * @property {NotificationDirection} [dir] The direction of the notification text.
     * @property {string} [icon] The icon to be displayed for the notification.
     * @property {string} [image] The image to be displayed for the notification.
     * @property {string} [lang] The language of the notification text.
     * @property {boolean} [renotify] A boolean that indicates whether the notification should be redisplayed if the user has dismissed it.
     * @property {boolean} [requireInteraction] A boolean that indicates whether the user must interact with the notification before it is dismissed.
     * @property {boolean | null} [silent] A boolean that indicates whether the notification should be silent.
     * @property {string} [tag] A string that can be used to identify the notification.
     * @property {EpochTimeStamp} [timestamp] The timestamp of the notification.
     * @property {VibratePattern} [vibrate] A vibration pattern for the notification.
     */
    const notificationOptions = {
        body: body ?? "Notifications from facebook .",
        icon: icon ?? "/logo.svg",
        badge,
        tag: tag ?? "",
        renotify: tag !== '',
        // data: {
        //     click_action,
        //     actionPayload: JSON.parse(actionPayload)
        // },
        // actions: JSON.parse(actions)

    };
    self.registration.showNotification(title, notificationOptions)
})
/**
 * @param {string} link
 */
function openTab(link) {
    return async () => {
        console.log(self)
        const allClients = await clients.matchAll({
            includeUncontrolled: true,
            type: 'window'
        });
        console.log(clients)
        let facebookClient;
        for (const client of allClients) {
            console.log({ client, allClients })
            const url = new URL(client.url);
            console.log(url)
            console.log(url.pathname, link);
            if (url.pathname === link) {
                await client.focus();
                facebookClient = client;
                console.log(facebookClient);
                break;
            } else {
                // await client.openWindow(link);
                // await clients.openWindow(link)
            }
        }
        // console.log(facebookClient);
        if (!facebookClient) {
            facebookClient = await clients.openWindow(link);
            // window.open(url, '_blank');
        }

    };
}

