import { app, db, getCollectionPath } from "@/lib/firebase";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";

function useFCMNotification({
  token,
  fcmToken,
}: {
  token: DecodedIdToken | null;
  fcmToken: string[];
}) {
  const [notiPermission, setnotiPermission] = useState(false);

  useEffect(() => {
    const isReady = async () => {
      await navigator.serviceWorker.ready;
    };
    isReady();
    if (!notiPermission) return;
    let badgeCount = 0;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(app);

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground push notification received:", payload);
        const { title = "fdfd", body, image, icon } = payload.notification!;
        const options = {
          body,
          icon,
          image,
        };
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, options);
        });
        new Notification(title, options);
        if (navigator && "setAppBadge" in navigator) {
          (navigator as any).setAppBadge(++badgeCount);
          console.log("nav:Badge:updated:useEffect");
          console.log("Foreground: The setAppBadge is supported, use it.");
        } else {
          console.log(
            `Foreground: The setAppBadge is not supported, don't use it`
          );
        }
        // this line only work in Desktop but actions are not allowed

        return () => {
          if (unsubscribe) unsubscribe();
        };
      });
    }
  }, [notiPermission]);
  useEffect(() => {
    if (!token) return;
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setnotiPermission?.(true);
          console.log("Notification permission granted.");
        } else {
          setnotiPermission?.(false);
          console.log("Notification permission denied.");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };
    requestNotificationPermission();
  }, [setnotiPermission, token]);
  useEffect(() => {
    if (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      const messaging = getMessaging(app);

      const getFCMToken = async () => {
        try {
          const registrationToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_MessageKey,
          });
          // console.log(process.env.NEXT_PUBLIC_MessageKey);
          if (token && token.uid) {
            console.log("FCM token:", registrationToken);

            // await updateDoc(userDoc, { fcmToken: arrayUnion(token) });

            const isTokenStored = fcmToken?.includes(registrationToken);
            if (!isTokenStored) {
              const userDoc = doc(
                db,
                getCollectionPath.users({ uid: token.uid })
              );

              await updateDoc(userDoc, { fcmToken: arrayUnion(token) });

              console.log("stored token to db");
            }
          }
        } catch (error) {
          console.error("Error getting FCM token:", error);
        }
      };
      getFCMToken();
    } else {
      console.log("FCM not supported");
    }
  }, [fcmToken, token]);
}

export default useFCMNotification;
