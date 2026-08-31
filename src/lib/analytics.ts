import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = "G-YHBMJCQCZT";

let initialized = false;

export function initGoogleAnalytics() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackGAPageView(path: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: MEASUREMENT_ID,
  });
}

export function useGoogleAnalytics() {
  const router = useRouter();

  useEffect(() => {
    initGoogleAnalytics();
    trackGAPageView(router.state.location.pathname);

    const unsubscribe = router.subscribe("onResolved", () => {
      trackGAPageView(router.state.location.pathname);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);
}
