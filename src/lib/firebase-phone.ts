// Browser-only Firebase Phone Auth helpers (loaded lazily).
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

const cfg = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] as string | undefined,
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string | undefined,
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string | undefined,
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] as string | undefined,
};

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);

let verifier: RecaptchaVerifier | null = null;
let confirmation: ConfirmationResult | null = null;

async function getAuthMod() {
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId) {
    throw new Error("Firebase Phone Auth is not configured. Add its Firebase web app settings first.");
  }
  const [{ initializeApp, getApps }, authMod] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
  const app = getApps()[0] ?? initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    ...(cfg.appId ? { appId: cfg.appId } : {}),
  });
  return { auth: authMod.getAuth(app), authMod };
}

export async function sendFirebaseOtp(phone10: string, containerId: string) {
  const { auth, authMod } = await getAuthMod();
  if (!verifier) verifier = new authMod.RecaptchaVerifier(auth, containerId, { size: "invisible" });
  confirmation = await authMod.signInWithPhoneNumber(auth, `+91${phone10}`, verifier);
}

/** Confirms the code and returns a Firebase ID token proving phone ownership. */
export async function confirmFirebaseOtp(code: string) {
  if (!confirmation) throw new Error("Send the OTP first.");
  const cred = await confirmation.confirm(code);
  const token = await cred.user.getIdToken();
  const { auth } = await getAuthMod();
  await auth.signOut();
  return token;
}
