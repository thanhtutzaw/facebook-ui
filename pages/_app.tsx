import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { useEffect } from "react";
import { Router, useRouter } from "next/router";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

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

  return (
    <AuthProvider>
      <Head>
        <title>Facebook Next</title>
        <meta name="description" content="Facebook-Mobile-UI with Next.js" />

        <link rel="icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}
