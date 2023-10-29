import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Link from "next/link";
import s from "../styles/Home.module.scss";
function ErrorPage() {
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
      <div
        className={`px-4 text-center grid mt-[65px] ${s.pageErrorInfoContainer}`}
      >
        <p className={`text-[rgb(169,169,169)] text-[2rem] my-2`}>
          <FontAwesomeIcon icon={faExclamationCircle} />
        </p>
        <h1 className="mb-0 font-medium [font-size:_clamp(25px,9vw,40px)]">
          404 - Couldn&apos;t find this Account
        </h1>
        <p className={`[font-size:_clamp(16px,1vw,20px)]`}>
          We can&apos;t find the page you are looking for
        </p>
        <Link
          href="/"
          className={`
          focus-visible:outline-primary
    hover:underline
          border-0 bg-transparent text-base  text-center p-2 rounded-2xl text-primary`}
        >
          Go to Home Page
        </Link>
      </div>
    </>
  );
}

export default ErrorPage;
