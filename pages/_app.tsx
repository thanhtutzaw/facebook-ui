import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import "../styles/globals.css";

import { getAuth, onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import nookies from "nookies";
import { app } from "../lib/firebase";

config.autoAddCss = false;
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteStart = () => {
      nProgress.start();
    };
    const handleRouteDone = () => {
      nProgress.done();
    };
    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);
    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.events]);
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        nookies.destroy(undefined, "token");
        // setuser(null);
        return;
      }
      try {
        const token = await user.getIdToken();
        // setuser(user);
        // Store the token in a cookie
        nookies.set(undefined, "token", token, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: true,
        });
      } catch (error) {
        console.log("Error refreshing ID token:", error);
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const auth = getAuth(app);
  // useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, (user) => {
  //     if (!user) {
  //       router.push("/login");
  //     } else {
  //       router.push("/");
  //     }
  //   });

  //   return () => unsub();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [auth]); // Add auth as a dependency to useEffect
  return (
    <>
      <Head>
        <title>Facebook Next</title>
        <meta name="description" content="Facebook-Mobile-UI with Next.js" />

        <link rel="icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}
