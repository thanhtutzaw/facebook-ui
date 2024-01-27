// import 
self.addEventListener("notificationclick", (event) => {
    console.log('notification click event', event);
    const { reply: inputText } = event;
    const { click_action, data } = event.notification.data.FCM_MSG.notification;
    console.log({ action: event.action, payload: data.actionPayload })
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
                        body: JSON.stringify({ ...data.actionPayload, text: inputText })
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
let badgeCount = 0;
messaging.onBackgroundMessage((payload) => {
    console.log("FCM Background Noti ", payload)
    // self.registration.showNotification(title, notificationOptions)
    if ("setAppBadge" in navigator) {
        navigator.setAppBadge(++badgeCount);
        console.log('Background: The setAppBadge is supported, use it.')
    } else {
        console.log(`Background: The setAppBadge is not supported, don't use it`)
    }
})
/**
 * @param {string} link
 */
async function openTab(link) {
    const allClients = await clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    });
    let facebookClient;
    for (const client of allClients) {
        console.log({ client, allClients })
        const url = new URL(client.url);
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

