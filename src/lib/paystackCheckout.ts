"use client";

import axios from "@/config/axios";

// Paystack's popup checkout, with the hosted-page redirect as the fallback.
// The transaction is always initialized on our server first (the amount is
// worked out from the database and can't be changed in the browser); the
// popup just resumes it by access code. Same approach as myklesia.

const SCRIPT_URL = "https://js.paystack.co/v2/inline.js";
const SCRIPT_TIMEOUT_MS = 8000;

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

let scriptPromise: Promise<boolean> | null = null;

function loadPaystackScript(): Promise<boolean> {
  if (window.PaystackPop) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    const timer = setTimeout(() => resolve(false), SCRIPT_TIMEOUT_MS);
    script.onload = () => {
      clearTimeout(timer);
      resolve(!!window.PaystackPop);
    };
    script.onerror = () => {
      clearTimeout(timer);
      scriptPromise = null; // let a later attempt retry
      resolve(false);
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Facebook, Instagram, TikTok… open links in their own built-in browser,
// where the popup's iframe and mobile-money approval are least reliable.
export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|FB_IAB|Instagram|TikTok|musical_ly|Bytedance|Snapchat|Line\//i.test(
    navigator.userAgent,
  );
}

// Start loading early (when the checkout page opens) so the popup appears
// instantly on submit.
export function preloadPaystack() {
  if (typeof window !== "undefined" && !isInAppBrowser()) loadPaystackScript();
}

// Keeps the screen dimmed between the click and Paystack's own overlay.
const BACKDROP_ID = "paystack-checkout-backdrop";

function showBackdrop() {
  if (document.getElementById(BACKDROP_ID)) return;
  const el = document.createElement("div");
  el.id = BACKDROP_ID;
  el.style.cssText =
    "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;";
  el.innerHTML =
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" aria-label="Opening secure checkout" role="img">' +
    '<path d="M21 12a9 9 0 1 1-6.22-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>';
  document.body.appendChild(el);
}

function hideBackdrop() {
  document.getElementById(BACKDROP_ID)?.remove();
}

export async function openPaystackCheckout({
  accessCode,
  authorizationUrl,
  onSuccess,
  onCancel,
}: {
  accessCode?: string;
  authorizationUrl: string;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
}) {
  // The backdrop stays up through a redirect — the page is leaving anyway.
  const redirect = () => {
    window.location.href = authorizationUrl;
  };

  showBackdrop();

  if (!accessCode || isInAppBrowser() || !(await loadPaystackScript())) {
    redirect();
    return;
  }

  try {
    const popup = new window.PaystackPop();
    popup.resumeTransaction(accessCode, {
      onLoad: hideBackdrop,
      onSuccess: (tx: { reference: string }) => {
        hideBackdrop();
        onSuccess(tx.reference);
      },
      onCancel: () => {
        hideBackdrop();
        onCancel?.();
      },
      // The checkout form itself didn't load — the hosted page still can.
      onError: redirect,
    });
  } catch {
    redirect();
  }
}

// Confirms a payment with our server. The webhook and this call can race,
// in which case one of them briefly sees the other's "processing" record —
// wait that out rather than reporting a failure.
export async function confirmPayment(reference: string, { attempts = 8, delayMs = 1500 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const { data } = await axios.get(`/api/payments/verify/${encodeURIComponent(reference)}`);
    if (data?.status !== "PROCESSING") return data;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return { status: "PROCESSING" };
}
