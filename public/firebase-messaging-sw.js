// importScripts('../lib/NotiAction')
self.addEventListener("notificationclick", (event) => {
    console.log('notification click event', event);
    const { reply: inputText } = event;
    const { click_action, data } = event.notification.data.FCM_MSG.notification;
    console.log({ actionPayload: data.actionPayload })
    console.log({ eventAction: event.action })
    // switch (event.action) {
    //     case `comment_like`:
    //         event.waitUntil(
    //             (async () => {
    //                 try {
    //                     event.notification.close();
    //                     await fetch('api/trigger_noti_action?action=comment_like', {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json'
    //                         },
    //                         body: JSON.stringify(data.actionPayload)
    //                     })
    //                 } catch (error) {
    //                     console.error('Error:', error);
    //                 } finally {
    //                     event.notification.close();
    //                 }
    //             })()
    //         )
    //         break;
    //     case `comment_reply`:
    //         event.waitUntil(
    //             (async () => {
    //                 try {
    //                     event.notification.close();
    //                     fetch('api/trigger_noti_action?action=comment_reply', {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json'
    //                         },
    //                         body: JSON.stringify({ ...data.actionPayload, text: inputText })
    //                     })
    //                 } catch (error) {
    //                     console.error('Error:', error);
    //                 } finally {
    //                     event.notification.close();
    //                 }
    //             })()
    //         )
    //         console.log("Submited content :", inputText);
    //         break;
    //     case `accept_friend`:
    //         event.waitUntil(
    //             (async () => {
    //                 try {
    //                     event.notification.close();
    //                     await fetch('api/trigger_noti_action?action=accept_friend', {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json'
    //                         },
    //                         body: JSON.stringify(data.actionPayload)
    //                     })
    //                     console.log('Accepted user');
    //                     console.log({ body: JSON.stringify(data.actionPayload) })
    //                 } catch (error) {
    //                     console.error('Accept Action failed : ', error);
    //                 } finally {
    //                     event.notification.close();
    //                 }
    //             })()
    //         )
    //         break;
    // }
    if (event.action) {
        event.waitUntil(
            (async () => {
                try {
                    event.notification.close();
                    await fetch(`api/trigger_noti_action?action=${event.action}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ ...data.actionPayload, text: inputText})
                    })
                } catch (error) {
                    console.error('Error:', error);
                } finally {
                    event.notification.close();
                }
            })()
        )
    } else {
        event.notification.close();
        event.waitUntil(
            (openTab(click_action))(),
        );
    }
});
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js'); // Import the Firebase v9 compat library
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js'); // Import the Firebase v9 compat library for messaging
const firebaseConfig = {
    apiKey: "AIzaSyAQ5kO77FuROPbxNsn9o3XT4cvyYOdCDHE",
    authDomain: "facebook-37f93.firebaseapp.com",
    projectId: "facebook-37f93",
    storageBucket: "facebook-37f93.appspot.com",
    messagingSenderId: "1050578101323",
    appId: "1:1050578101323:web:f0cea355bd01e045cc99ce",
    measurementId: "G-ME0NSYLYR3"
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
self.addEventListener('push', (event) => {
    const data = event.data.json();
    console.log({ pushEventSelf: event })
    console.log({ EventData: data })
    // event.waitUntil(promiseChain);
});
messaging.onBackgroundMessage((payload) => {
    console.log("FCM Background Noti ", payload)
    /**
     * @property {NotificationAction[]} [actions] An array of notification actions.
     * @property {string} [badge] A string that represents the badge to be displayed on the notification.
     * @property {string} [body] The body of the notification.
     * @property {unknown} [data] Any data that you want to associate with the notification.
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
    // self.registration.showNotification(title, notificationOptions)
})
/**
 * @param {string} link
 */
async function openTab(link) {
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
        // console.log(url)
        // console.log(url.pathname, link);
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

}

