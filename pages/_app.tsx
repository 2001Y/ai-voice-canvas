import "regenerator-runtime/runtime";
import type { AppProps } from "next/app";
import "../app/globals.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
