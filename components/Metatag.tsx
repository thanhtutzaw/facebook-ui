import Head from "next/head";

export default function Metatag({
  title = "Facebook Next",
  description = "Facebook-Mobile-UI with Next.js",
  url = '/',
}: {
  title?: string;
  description?: string;
  url?:string;
}) {
  const domain = 'facebook-ui-zee.vercel.app'
  const fullurl = domain + url;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <meta name="theme-color" content="#0070f3" />
      <link rel="icon" href="/logo.svg" />
      <link rel="manifest" href="/manifest.json" />
      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullurl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/logo.svg" />

      {/* <!-- Twitter --> */}
      <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={domain} />
  <meta property="twitter:url" content={fullurl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content="/logo.svg" />
    </Head>
  );
}
