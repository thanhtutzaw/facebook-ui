import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  User,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
} from "firebase/auth";
import { GetServerSideProps } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import nookies from "nookies";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { PageProvider } from "../context/PageContext";
import { app } from "../lib/firebase";
import { verifyIdToken } from "../lib/firebaseAdmin";
import "../styles/globals.css";
import { Props } from "../types/interfaces";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Welcome } from "../components/Welcome";
import { ImageLargeView } from "../components/Post/ImageLargeView";

config.autoAddCss = false;
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    // console.log(token.email + "in app.tsx");
    let expired = false;
    // console.log(token.uid + " in app.tsx");
    return {
      props: {
        expired,
        uid: token.uid,
      },
    };
  } catch (error) {
    console.log("SSR Error (expired in app.tsx) " + error);
    // context.res.writeHead(302, { Location: "/" });
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        expired: true,
        uid: "",
      },
    };
  }
};
export default function App({
  Component,
  pageProps,
  uid,
  expired,
}: AppProps & { uid: DecodedIdToken["uid"]; expired: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (expired) {
      router.push("/");
      console.log("expired and pushed(_app.tsx)");
    }
  }, [expired, router]);
  useEffect(() => {
    // nProgress.start();
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
  const auth = getAuth(app);
  const [authUser, setauthUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      setauthUser(user);
    });
  }, []);
  useEffect(() => {
    console.log(router.pathname);
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
        nookies.set(undefined, "token", token, {
          // maxAge: 30 * 24 * 60 * 60,
          maxAge: 55 * 60,
          path: "/",
          // httpOnly: true,
          secure: true,
          sameSite: "none",
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
  if (expired) return <Welcome expired={expired} />;
  // if (
  //   !auth?.currentUser?.uid &&
  //   router.asPath !== "/" &&
  //   router.asPath !== "/login"
  // )
  //   return (
  //     <main>
  //       <p style={{ textAlign: "center" }}>Redirecting to /login</p>
  //     </main>
  //   );
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
      <PageProvider uid={uid!} active={""} setActive={Function}>
        <main
          style={
            {
              // overflow: "hidden",
            }
          }
        >
          <>
            <Component {...pageProps} />

            {authUser?.uid && <ImageLargeView />}
          </>
        </main>
      </PageProvider>
    </>
  );
}
