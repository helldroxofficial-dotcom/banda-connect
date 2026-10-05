import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Verifies a Firebase ID token server-side, then marks the caller's phone verified.
export const verifyFirebasePhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ idToken: z.string().min(20).max(4096) }).parse(d))
  .handler(async ({ data, context }) => {
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    const projectId = process.env["FIREBASE_PROJECT_ID"] || import.meta.env["VITE_FIREBASE_PROJECT_ID"];
    if (!projectId) throw new Error("Phone verification is not configured.");
    const jwks = createRemoteJWKSet(
      new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
    );
    const { payload } = await jwtVerify(data.idToken, jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    const full = String(payload["phone_number"] ?? "");
    const m = /^\+91([6-9]\d{9})$/.exec(full);
    if (!m) throw new Error("Verified number must be an Indian mobile number.");
    const phone = m[1];
    const { error } = await context.supabase
      .from("profiles")
      .update({ phone, phone_verified: true })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { phone };
  });
