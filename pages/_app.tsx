import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import friendReqSound from "../public/NotiSounds/chord.mp3";

import useFriendRequest from "@/hooks/useFriendRequest";
import {
  User,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
} from "firebase/auth";
import { getMessaging, onMessage } from "firebase/messaging";
import { GetServerSideProps } from "next";
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
import { app, getProfileByUID } from "../lib/firebase";
import { verifyIdToken } from "../lib/firebaseAdmin";
import "../styles/globals.css";
import { AppProps as Props } from "../types/interfaces";
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
  // if (typeof window !== "undefined") {
  //   navigator.serviceWorker.ready
  //     .then((reg) => {
  //       alert("Sw ready");
  //       reg.showNotification("foreground title");
  //     })
  //     .catch((error) => {
  //       alert("sw not ready !");
  //     });
  // }
  const [notiPermission, setnotiPermission] = useState(false);
  
  const auth = getAuth(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (router.pathname === "/login/email") return;
        router.push("/login");
      } else {
        if (!expired) return;
        router.push("/");
      }
    });
    return () => unsub();
  }, [auth, expired, router]);
  const [currentUser, setcurrentUser] = useState<
    (User & { photoURL_cropped?: string }) | null
  >(null);
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      setcurrentUser(user);
    });
  }, []);
  // const [currentProfile, setcurrentProfile] = useState<
  //   account["profile"] | null
  // >(null);
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
        setcurrentUser(user);
      } catch (error) {
        console.log("Error refreshing ID token:", error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (currentUser?.uid) {
      const getProfile = async () => {
        const profileData = await getProfileByUID(String(currentUser?.uid));
        const profile = {
          ...profileData,
          photoURL: profileData.photoURL
            ? profileData.photoURL
            : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
        };
        const croppedURL = profile.photoURL_cropped;
        setcurrentUser({ ...currentUser, photoURL_cropped: croppedURL });
      };
      getProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const { friendReqCount, soundRef } = useFriendRequest(
    String(currentUser?.uid)
  );
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
          friendReqCount={friendReqCount}
          active={active}
          setActive={setActive}
          currentUser={currentUser}
          setcurrentUser={setcurrentUser}
          notiPermission={notiPermission}
          setnotiPermission={setnotiPermission}
        >
          <main>
            <Component {...pageProps} />
            {currentUser?.uid && <ImageLargeView />}
            <audio
              style={{ visibility: "hidden", display: "none" }}
              ref={soundRef}
              src={friendReqSound}
            />
          </main>
        </PageProvider>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </>
  );
}
