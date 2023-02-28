import "../styles/globals.css";
import styles from "../styles/Home.module.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { AuthProvider } from "../context/auth";
// import Layout from "../Components/Layout";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Facebook Next</title>
        <meta name="description" content="Facebook-Mobile-UI with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <Layout> */}
      <main className={styles.main}>
        <Component {...pageProps} />
        {/* </Layout> */}
      </main>
    </AuthProvider>
  );
}
