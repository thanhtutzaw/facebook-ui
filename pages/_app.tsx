import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  User,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
} from "firebase/auth";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import nookies from "nookies";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { ImageLargeView } from "../components/Post/ImageLargeView";
import { Welcome } from "../components/Welcome";
import { PageProvider } from "../context/PageContext";
import { useActive } from "../hooks/useActiveTab";
import { app } from "../lib/firebase";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getMessaging, onMessage } from "firebase/messaging";
import { GetServerSideProps } from "next";
import { verifyIdToken } from "../lib/firebaseAdmin";
import "../styles/globals.css";
import { Props } from "../types/interfaces";
config.autoAddCss = false;
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    console.log(token.uid + "In app.tsx");

    let expired = false;
    return {
      props: {
        expired,
      },
    };
  } catch (error) {
    console.log("SSR Error (expired in app.tsx) " + error);
    // context.res.writeHead(302, { Location: "/" });
    // context.res.end();
    return {
      props: {
        expired: true,
      },
    };
  }
};
export default function App({
  Component,
  pageProps,
  expired,
}: AppProps & { uid: DecodedIdToken["uid"]; expired: boolean }) {
  const router = useRouter();
  // useEffect(() => {
  //   if (expired) {
  //     router.push("/");
  //     console.log("expired and pushed(_app.tsx)");
  //   }
  // }, [expired, router]);
  useEffect(() => {
    const handleRouteStart = () => nProgress?.start();
    const handleRouteDone = () => nProgress?.done();
    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);
    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.events]);

  // const requestNotificationPermission = async () => {
  //   try {
  //     const permission = await Notification.requestPermission();
  //     if (permission === "granted") {
  //       // console.log(await navigator.serviceWorker.controller);
  //       // alert("Notification permission granted.");
  //       console.log("Notification permission granted.");
  //       return true;
  //     } else {
  //       // alert("Notification permission denied.");
  //       console.log("Notification permission denied.");
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Error requesting notification permission:", error);
  //     return false;
  //   }
  // };
  if (typeof window !== "undefined") {
    navigator.serviceWorker.ready
      .then((reg) => {
        console.log("sw ready");
        alert("Sw ready");
        reg.showNotification("foreground title");
      })
      .catch((error) => {
        console.log(error);
        alert("sw not ready !");
      });
  }
  const [notiPermission, setnotiPermission] = useState(false);
  useEffect(() => {
    if (!notiPermission) return;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(app);
      console.log("getting foreground");
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground push notification received:", payload);
        alert(JSON.stringify(payload));
        // Handle the received push notification while the app is in the foreground
        const {
          title,
          body,
          icon,
          webpush,
          badge,
          click_action,
          link,
          tag,
          actions,
        } = payload.data as any;

        const notificationTitle = title ?? "Facebook";
        const notificationOptions = {
          body: body ?? "Notifications from facebook .",
          icon: icon ?? "/logo.svg",
          badge,
          tag: tag ?? "",
          data: {
            click_action,
          },
          // actions: [{ action: "see_post", title: "See Post" }],
          // actons: [...actions],
          actions: JSON.parse(actions),
          renotify: tag !== "",
        };
        console.log("serviceWorker" in navigator); // true
        console.log(navigator.serviceWorker);
        //         controller:null
        // oncontrollerchange:null
        // onmessage:null
        // onmessageerror:null
        // ready:Promise {<pending>}

        navigator.serviceWorker.ready // this code didn't run
          .then((reg) => {
            console.log("sw ready", reg);
            alert("Sw ready");
            reg.showNotification(notificationTitle, notificationOptions);
          })
          .catch((error) => {
            console.log(error);
            alert("sw not ready !");
          });
        // if (
        //   "serviceWorker" in navigator &&
        //   navigator.serviceWorker.controller
        // ) {
        //   navigator.serviceWorker.controller.postMessage({
        //     type: "showNotification",
        //     title: notificationTitle,
        //     options: notificationOptions,
        //   });
        // } else {
        //   alert("noti can't show");
        // }
        // new ServiceWorkerRegistration().showNotification(
        //   notificationTitle,
        //   notificationOptions
        // );
        // new Notification(notificationTitle, notificationOptions); // this line only work in Desktop
        return () => {
          if (unsubscribe) unsubscribe();
        };
      });
    }
  }, [notiPermission]);
  const auth = getAuth(app);
  const [authUser, setauthUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      setauthUser(user);
    });
  }, []);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (router.pathname === "/login/email") return;
        router.push("/login");
      } else {
        if (!expired) return;
        router.push("/");
        // console.log("expired , user exist and pushed");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [currentUser, setcurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        nookies.destroy(undefined, "token");
        setcurrentUser(null);
        return;
      }
      try {
        const token = await user.getIdToken();
        nookies.set(undefined, "token", token, {
          // maxAge: 30 * 24 * 60 * 60,
          maxAge: 55 * 60,
          path: "/",
          // httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        // console.log(user);
        setcurrentUser(user);
      } catch (error) {
        console.log("Error refreshing ID token:", error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  const { active, setActive } = useActive();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
          },
        },
      })
  );
  const [isPage, setisPage] = useState(currentUser?.uid);
  if (expired) return <Welcome expired={expired} />;
  return (
    <>
      <Head>
        <title>Facebook Next</title>
        <meta name="description" content="Facebook-Mobile-UI with Next.js" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <PageProvider
          setnotiPermission={setnotiPermission}
          currentUser={currentUser}
          isPage={currentUser?.uid}
          setisPage={setisPage}
          active={active}
          setActive={setActive}
        >
          <main>
            {/* <main style={{ scrollPadding: "5rem", scrollMargin: "5rem" }}> */}
            <Component {...pageProps} />
            {authUser?.uid && <ImageLargeView />}
          </main>
        </PageProvider>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </>
  );
}
