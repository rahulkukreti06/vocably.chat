import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBK3zYOdS_b8tmEn1-YK1d5ftk4avV7Lmo",
  authDomain: "vocably-chat.firebaseapp.com",
  projectId: "vocably-chat",
  storageBucket: "vocably-chat.firebasestorage.app",
  messagingSenderId: "957120403860",
  appId: "1:957120403860:web:8eb097959ad20497f25781",
  measurementId: "G-C159KPC2Y8"
};

// Initialize (or reuse) the Firebase app in any environment
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name);

// Analytics must only run in the browser and only if supported.
// Export a helper to fetch analytics lazily on the client.
let _analytics: any = null;
export async function getAnalyticsClient() {
  if (typeof window === 'undefined') return null;
  try {
    const { isSupported, getAnalytics } = await import("firebase/analytics");
    const supported = await isSupported();
    if (!supported) return null;
    if (!_analytics) {
      _analytics = getAnalytics(app);
    }
    return _analytics;
  } catch {
    return null;
  }
}
