import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import s from "../styles/Home.module.scss";
import Head from "next/head";
import { useRouter } from "next/router";
function ErrorPage() {
  const router= useRouter()
  return (
    <>
      <Head>
        <title>{`404 | Facebook Next`}</title>
        <meta name="description" content={`Facebook-Mobile-UI with Next.js`} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div className={s.pageErrorInfoContainer}>
        <p className={s.exclamation}>
          <FontAwesomeIcon icon={faExclamationCircle} />
        </p>
        <h1>404 - Couldn&apos;t find this Account</h1>
        <p className={s.message}>
          We can&apos;t find the page you are looking for
        </p>
        <button onClick={()=>{router.back();}}>Back</button>
        <Link href="/" className={s.goHome}>
          Go to Home Page
        </Link>
      </div>
    </>
  );
}

export default ErrorPage;
