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
  // Se o GTM já carregou, usa o gtag dele; senão define o nosso.
  if (!window.gtag) {
    // GA exige o objeto `arguments` bruto no dataLayer — um array normal não é processado.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: true });
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
    // O `config` inicial já envia o primeiro page_view; aqui só as trocas de rota.
    initGoogleAnalytics();


    const unsubscribe = router.subscribe("onResolved", () => {
      trackGAPageView(router.state.location.pathname);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);
}
