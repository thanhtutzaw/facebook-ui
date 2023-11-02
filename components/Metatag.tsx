import Head from "next/head";

export default function Metatag({
  title = "Facebook Next",
  description = "Facebook-Mobile-UI with Next.js",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <link rel="icon" href="/logo.svg" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
}
