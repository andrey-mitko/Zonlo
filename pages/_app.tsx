import "../styles/globals.scss";
import "font-awesome/css/font-awesome.min.css";
import "remixicon/fonts/remixicon.css";
import mixpanel from "mixpanel-browser";
import * as ga from "../lib/ga";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    mixpanel.init("630bebbae03abc45e3d01976b56f71f4", {
      debug: process.env.NODE_ENV !== "production",
    });
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: any) => {
      ga.pageview(url);
    };
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp;
