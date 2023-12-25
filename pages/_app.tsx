import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

import Metatag from "@/components/Metatag";
import { useActiveTab } from "@/hooks/useActiveTab";
import useFriendRequest from "@/hooks/useFriendRequest";
import useNprogress from "@/hooks/useNprogress";
import {
  User,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
} from "firebase/auth";
import { GetServerSideProps } from "next";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import nookies from "nookies";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { ImageLargeView } from "../components/Post/ImageLargeView";
import { Welcome } from "../components/Welcome";
import { PageProvider } from "../context/PageContext";
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
  useNprogress();
  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // if (router.pathname === "/login/email") return;
        console.log(router.pathname);
        if (router.pathname === "/" || "friends" || "saved" || "chat") {
          router.push("/login");
        }
      } else {
        if (!expired) return;
        router.push("/");
        console.log("expired in app.tsx and pushed route to /");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, expired]);
  const [currentUser, setcurrentUser] = useState<
    (User & { photoURL_cropped?: string }) | null
  >(null);
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      setcurrentUser(user);
    });
  }, [auth]);
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
        // console.log();
        // if (nookies.get(undefined, "token")) return;
        nookies.set(undefined, "token", token, {
          // maxAge: 30 * 24 * 60 * 60,
          // maxAge: 60,
          maxAge: 3 * 24 * 60 * 60, //3 days
          // maxAge: 3 * 24 * 60 * 60, //3 days
          // maxAge: 55 * 60,//1 hour
          path: "/",
          // httpOnly: process.env.NODE_ENV === "production",
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
        // const profile = {
        //   ...profileData,
        //   photoURL: checkPhotoURL(profileData.photoURL),
        // };
        const croppedURL = profileData?.photoURL_cropped;
        setcurrentUser({ ...currentUser, photoURL_cropped: croppedURL });
      };
      getProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const { friendReqCount, soundRef } = useFriendRequest(
    String(currentUser?.uid)
  );
  const { active, setActive } = useActiveTab();
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
      <Metatag />
      <QueryClientProvider client={queryClient}>
        <PageProvider
          friendReqCount={friendReqCount}
          active={active}
          setActive={setActive}
          currentUser={currentUser}
          setcurrentUser={setcurrentUser}
        >
          <main style={{ scrollPadding: "65px" }}>
            <Component {...pageProps} />
            {currentUser?.uid && <ImageLargeView />}
            <audio
              style={{ visibility: "hidden", display: "none" }}
              ref={soundRef}
            />
          </main>
        </PageProvider>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </>
  );
}
