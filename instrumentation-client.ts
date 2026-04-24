import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  // Replay is added lazily below to keep instrumentation hook under 50ms
});

// Defer Session Replay init until the browser is idle so it doesn't block
// the instrumentation hook (which has a ~50ms budget before Next.js warns).
if (typeof window !== "undefined") {
  const initReplay = () => Sentry.addIntegration(Sentry.replayIntegration());
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(initReplay, { timeout: 3000 });
  } else {
    setTimeout(initReplay, 1000);
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
