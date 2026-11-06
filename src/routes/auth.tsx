import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Banda Bazaar" },
      {
        name: "description",
        content: "Sign in or create your Banda Bazaar account to order groceries, food and book local services in Banda.",
      },
      { property: "og:title", content: "Sign in — Banda Bazaar" },
      { property: "og:description", content: "Your account for groceries, street food and trusted services in Banda." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { t, user, authReady } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (authReady && user) void navigate({ to: "/profile" });
  }, [authReady, user, navigate]);

  const submit = async () => {
    if (mode === "signup") {
      const phone = form.phone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(phone)) {
        toast.error(t("Enter a valid 10-digit mobile number starting with 6-9.", "6-9 से शुरू होने वाला सही 10 अंकों का मोबाइल नंबर डालें।"));
        return;
      }
      if (form.name.trim().length < 3) {
        toast.error(t("Enter your real full name.", "अपना असली पूरा नाम लिखें।"));
        return;
      }
    }
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: form.name.trim(), phone: form.phone.replace(/\D/g, "") },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setSent(true);
        toast.success(t("Check your email to confirm your account.", "अकाउंट कन्फर्म करने के लिए ईमेल देखें।"));
        return;
      }
      toast.success(t("Welcome to Banda Bazaar!", "बांदा बाज़ार में स्वागत है!"));
      void navigate({ to: "/" });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("Signed in", "साइन इन हो गया"));
    void navigate({ to: "/" });
  };

  const google = async () => {
    setGoogleBusy(true);
    try {
      // Google refuses to render inside iframes (e.g. the v0 preview), so open it in a new tab there.
      const inIframe = window.self !== window.top;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            prompt: "select_account",
          },
          skipBrowserRedirect: inIframe,
        },
      });
      if (error) {
        toast.error(error.message ?? t("Google sign-in is unavailable right now.", "Google sign-in अभी उपलब्ध नहीं है।"));
        return;
      }
      if (inIframe && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Google sign-in failed.", "Google sign-in असफल रहा।"));
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <h1 className="text-xl font-black">{t("Welcome to Banda Bazaar", "बांदा बाज़ार में स्वागत है")}</h1>
        <p className="mt-1 text-xs opacity-90">
          {t("One account for grocery, food and every local service.", "किराना, खाना और हर लोकल सर्विस के लिए एक अकाउंट।")}
        </p>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 grid grid-cols-2 gap-2">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`press rounded-xl py-2 text-sm font-bold ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {m === "signin" ? t("Sign in", "साइन इन") : t("Sign up", "नया अकाउंट")}
            </button>
          ))}
        </div>

        {sent ? (
          <p className="rounded-xl bg-primary-soft p-3 text-sm text-accent-foreground">
            {t("Confirmation email sent. Click the link, then sign in.", "कन्फर्मेशन ईमेल भेजा गया। लिंक पर क्लिक करके साइन इन करें।")}
          </p>
        ) : (
          <div className="space-y-2">
            {mode === "signup" && (
              <>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("Full name", "पूरा नाम")}
                  className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={t("Phone number", "मोबाइल नंबर")}
                  className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
                />
              </>
            )}
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("Email", "ईमेल")}
              className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("Password", "पासवर्ड")}
              className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {busy
                ? t("Please wait…", "रुकिए…")
                : mode === "signin"
                  ? t("Sign in", "साइन इन")
                  : t("Create account", "अकाउंट बनाएं")}
            </button>
          </div>
        )}

        <div className="my-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> {t("or", "या")} <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          disabled={googleBusy}
          onClick={() => void google()}
          className="press w-full rounded-xl border border-border py-3 text-sm font-bold disabled:opacity-60"
        >
          {googleBusy ? t("Opening Google…", "Google खुल रहा है…") : t("Continue with Google", "Google से जारी रखें")}
        </button>
      </div>
    </div>
  );
}
