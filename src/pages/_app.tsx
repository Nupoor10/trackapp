import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head"; // <-- Import the Head component

export default function App({ Component, pageProps }: AppProps) {
  return (
      <>
        <Head>
          {/* This sets the text in the browser tab */}
          <title>TrackApp</title>
          <meta name="description" content="Track your personal finances securely." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Component {...pageProps} />
      </>
  );
}