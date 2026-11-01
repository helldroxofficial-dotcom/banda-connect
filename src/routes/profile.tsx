import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle2, LogOut, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp, rupees } from "@/lib/app-store";
import { AREAS, FEES } from "@/lib/local-data";
import { atmRequestsQuery } from "@/lib/queries";
import { useServerFn } from "@tanstack/react-start";
import { confirmFirebaseOtp, firebaseEnabled, sendFirebaseOtp } from "@/lib/firebase-phone";
import { verifyFirebasePhone } from "@/lib/phone-verify.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile, Wallet & Mini-ATM | Banda Bazaar" },
      {
        name: "description",
        content: "Manage your Banda Bazaar profile, delivery address, language, wallet and request Mini-ATM cash at home.",
      },
      { property: "og:title", content: "My Profile — Banda Bazaar" },
      { property: "og:description", content: "Profile, wallet balance and Mini-ATM cash delivery in Banda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, user, profile, authReady, isAdmin, signOut, area, setArea, lang, setLang, refreshProfile } = useApp();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const verifyPhoneToken = useServerFn(verifyFirebasePhone);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phonePending, setPhonePending] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [amount, setAmount] = useState(500);
  const { data: atm = [] } = useQuery(atmRequestsQuery(Boolean(user)));
  const mapUrl = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.008},${coordinates.lat - 0.006},${coordinates.lng + 0.008},${coordinates.lat + 0.006}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`
    : null;

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
      setPhoneVerified(profile.phone_verified);
      setAddressVerified(profile.address_verified);
      if (profile.lat !== null && profile.lng !== null) setCoordinates({ lat: profile.lat, lng: profile.lng });
      if (profile.area) setArea(profile.area);
    }
  }, [profile, setArea]);

  if (authReady && !user) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center shadow-card">
        <p className="text-sm font-bold">{t("Sign in to manage your profile", "प्रोफ़ाइल के लिए साइन इन करें")}</p>
        <Link to="/auth" className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          {t("Sign in", "साइन इन")}
        </Link>
      </div>
    );
  }

  const phoneOk = (p: string) => /^[6-9]\d{9}$/.test(p.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, ""));

  const validate = () => {
    if (form.full_name.trim().length < 3) {
      toast.error(t("Please enter your real full name", "कृपया अपना असली पूरा नाम लिखें"));
      return false;
    }
    if (!phoneOk(form.phone)) {
      toast.error(t("Enter a valid 10-digit mobile number starting with 6-9", "6-9 से शुरू होने वाला सही 10 अंकों का मोबाइल नंबर डालें"));
      return false;
    }
    if (!phoneVerified) {
      toast.error(t("Verify this mobile number with OTP before saving.", "सेव करने से पहले इस मोबाइल नंबर को OTP से सत्यापित करें।"));
      return false;
    }
    const digits = form.phone.replace(/[^\d]/g, "").slice(-10);
    if (/^(\d)\1{9}$/.test(digits) || digits === "1234567890" || digits === "9876543210") {
      toast.error(t("This number looks fake. Please enter your real number.", "यह नंबर नकली लग रहा है। कृपया असली नंबर डालें।"));
      return false;
    }
    if (form.address.trim().length < 10) {
      toast.error(t("Address must include house no., street and landmark", "पते में मकान नं., गली और लैंडमार्क होना चाहिए"));
      return false;
    }
    if (!addressVerified || !coordinates) {
      toast.error(t("Verify your live location before saving the address.", "पता सेव करने से पहले अपनी वर्तमान लोकेशन सत्यापित करें।"));
      return false;
    }
    return true;
  };

  const normalizedPhone = () => {
    const digits = form.phone.replace(/\D/g, "");
    return digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  };

  const sendPhoneOtp = async () => {
    const phone = normalizedPhone();
    if (!phoneOk(phone)) {
      toast.error(t("Enter a valid 10-digit mobile number first.", "पहले सही 10 अंकों का मोबाइल नंबर डालें।"));
      return;
    }
    if (!firebaseEnabled) {
      toast.error(t("Phone verification is not configured yet. Add the Firebase web app settings.", "फोन सत्यापन अभी सेट नहीं है। Firebase वेब ऐप सेटिंग जोड़ें।"));
      return;
    }
    setPhoneBusy(true);
    try {
      await sendFirebaseOtp(phone, "phone-otp-recaptcha");
      setPhonePending(true);
      setPhoneVerified(false);
      toast.success(t("OTP sent to this mobile number.", "इस मोबाइल नंबर पर OTP भेजा गया है।"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Could not send the OTP.", "OTP नहीं भेजा जा सका।"));
    } finally {
      setPhoneBusy(false);
    }
  };

  const verifyPhoneOtp = async () => {
    const phone = normalizedPhone();
    if (!/^\d{6}$/.test(phoneCode)) {
      toast.error(t("Enter the 6-digit OTP.", "6 अंकों का OTP डालें।"));
      return;
    }
    setPhoneBusy(true);
    try {
      const idToken = await confirmFirebaseOtp(phoneCode);
      const result = await verifyPhoneToken({ data: { idToken } });
      if (result.phone !== phone) {
        throw new Error(t("The verified number does not match the number entered.", "सत्यापित नंबर दर्ज किए गए नंबर से मेल नहीं खाता।"));
      }
      setPhonePending(false);
      setPhoneVerified(true);
      setPhoneCode("");
      await refreshProfile();
      toast.success(t("Mobile number verified.", "मोबाइल नंबर सत्यापित हो गया।"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("OTP verification failed.", "OTP सत्यापन असफल हुआ।"));
    } finally {
      setPhoneBusy(false);
    }
  };

  const verifyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("Location verification is not supported on this device.", "इस डिवाइस पर लोकेशन सत्यापन उपलब्ध नहीं है।"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAddressVerified(true);
        setLocating(false);
        toast.success(t("Live location verified for this address.", "इस पते की वर्तमान लोकेशन सत्यापित हो गई।"));
      },
      () => {
        setLocating(false);
        toast.error(t("Allow location access to verify this address.", "पता सत्यापित करने के लिए लोकेशन की अनुमति दें।"));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const save = async () => {
    if (!user) return;
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        ...form,
        phone: normalizedPhone(),
        area,
        language: lang,
        address_verified: true,
        lat: coordinates?.lat ?? null,
        lng: coordinates?.lng ?? null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success(t("Profile saved", "प्रोफ़ाइल सेव हो गई"));
  };

  const requestCash = async () => {
    if (!user) return;
    if (!validate()) return;
    if (amount < 500 || amount > 5000) {
      toast.error(t("Amount must be between ₹500 and ₹5,000", "राशि ₹500 से ₹5,000 के बीच होनी चाहिए"));
      return;
    }
    const { error } = await supabase.from("mini_atm_requests").insert({
      user_id: user.id,
      amount,
      fee: FEES.atmFee,
      address: form.address || null,
      phone: form.phone || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["atm-requests"] });
    toast.success(t("Rider will bring cash to your door.", "राइडर आपके घर कैश लेकर आएगा।"));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <p className="text-xs opacity-80">{t("Namaste", "नमस्ते")}</p>
        <h1 className="text-xl font-black">{profile?.full_name || user?.email}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm">
          <Wallet className="h-4 w-4" /> {t("Wallet", "वॉलेट")}: {rupees(Number(profile?.wallet_balance ?? 0))}
        </p>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="text-sm font-bold">{t("Delivery details", "डिलीवरी विवरण")}</p>
        <div className="mt-3 space-y-2">
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder={t("Full name", "पूरा नाम")}
            className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <input
            value={form.phone}
            onChange={(e) => {
              setForm({ ...form, phone: e.target.value });
              setPhoneVerified(false);
              setPhonePending(false);
            }}
            placeholder={t("Phone", "फोन")}
            className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            {phoneVerified ? (
              <span className="flex items-center gap-1 text-xs font-bold text-primary"><CheckCircle2 className="h-4 w-4" /> {t("Phone verified", "फोन सत्यापित")}</span>
            ) : (
              <button type="button" onClick={() => void sendPhoneOtp()} disabled={phoneBusy} className="press rounded-xl border border-primary px-3 py-2 text-xs font-bold text-primary disabled:opacity-60">
                {phoneBusy ? t("Please wait…", "रुकिए…") : t("Send OTP", "OTP भेजें")}
              </button>
            )}
            {phonePending && (
              <>
                <input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder={t("6-digit OTP", "6 अंकों का OTP")} className="h-10 w-32 rounded-xl bg-muted px-3 text-xs outline-none" />
                <button type="button" onClick={() => void verifyPhoneOtp()} disabled={phoneBusy} className="press rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">{t("Verify", "सत्यापित करें")}</button>
              </>
            )}
          </div>
          <div id="phone-otp-recaptcha" aria-hidden="true" />
          <textarea
            value={form.address}
            onChange={(e) => {
              setForm({ ...form, address: e.target.value });
              setAddressVerified(false);
            }}
            placeholder={t("House no., street, landmark", "मकान नं., गली, लैंडमार्क")}
            className="min-h-20 w-full rounded-xl bg-muted p-3 text-sm outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={verifyLocation} disabled={locating} className="press flex items-center gap-2 rounded-xl border border-primary px-3 py-2 text-xs font-bold text-primary disabled:opacity-60">
              <MapPin className="h-4 w-4" /> {locating ? t("Checking location…", "लोकेशन जांच रहे…") : t("Verify live location", "वर्तमान लोकेशन सत्यापित करें")}
            </button>
            {addressVerified && <span className="flex items-center gap-1 text-xs font-bold text-primary"><CheckCircle2 className="h-4 w-4" /> {t("Location verified", "लोकेशन सत्यापित")}</span>}
          </div>
          {mapUrl && (
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <iframe
                title={t("Verified delivery location map", "सत्यापित डिलीवरी लोकेशन का नक्शा")}
                src={mapUrl}
                className="h-48 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a href={`https://www.openstreetmap.org/?mlat=${coordinates?.lat}&mlon=${coordinates?.lng}#map=17/${coordinates?.lat}/${coordinates?.lng}`} target="_blank" rel="noreferrer" className="block px-3 py-2 text-xs font-bold text-primary">
                {t("Open larger map", "बड़ा नक्शा खोलें")} →
              </a>
            </div>
          )}
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}, Banda
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
            <span className="text-sm">{t("Language", "भाषा")}</span>
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="press rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
            >
              {lang === "en" ? "English" : "हिंदी"}
            </button>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="press w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? t("Saving…", "सेव हो रहा…") : t("Save profile", "प्रोफ़ाइल सेव करें")}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Banknote className="h-4 w-4 text-primary" /> Mini-ATM · {t("cash at home", "घर पर कैश")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(`₹500–₹5,000 · fee ₹${FEES.atmFee} · OTP verified delivery`, `₹500–₹5,000 · फीस ₹${FEES.atmFee} · OTP से डिलीवरी`)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[500, 1000, 2000, 5000].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={`press rounded-xl border px-3 py-1.5 text-xs font-bold ${
                amount === a ? "border-primary bg-primary-soft text-accent-foreground" : "border-border"
              }`}
            >
              {rupees(a)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void requestCash()}
          className="press mt-3 w-full rounded-xl bg-amber py-3 text-sm font-bold text-amber-foreground"
        >
          {t("Request cash", "कैश मंगाएं")} · {rupees(amount)} + {rupees(FEES.atmFee)}
        </button>
        {atm.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {atm.slice(0, 3).map((r) => (
              <li key={r.id} className="flex justify-between">
                <span>{rupees(Number(r.amount))}</span>
                <span className="font-semibold uppercase">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAdmin && (
        <Link to="/admin" className="press flex items-center gap-2 rounded-2xl bg-card p-4 text-sm font-bold shadow-card">
          <ShieldCheck className="h-4 w-4 text-primary" /> {t("Admin dashboard", "एडमिन डैशबोर्ड")}
        </Link>
      )}

      <Link to="/sell" className="press flex items-center gap-2 rounded-2xl bg-card p-4 text-sm font-bold shadow-card">
        <MapPin className="h-4 w-4 text-primary" /> {t("List your business", "अपना कारोबार लिस्ट करें")}
      </Link>

      <Link to="/delivery" className="press flex items-center gap-2 rounded-2xl bg-card p-4 text-sm font-bold shadow-card">
        <ShieldCheck className="h-4 w-4 text-primary" /> {t("Delivery partner", "डिलीवरी पार्टनर")}
      </Link>

      <Link to="/help" className="press block rounded-2xl bg-card p-4 text-sm font-bold shadow-card">
        {t("Help & policies", "मदद और नीतियां")}
      </Link>

      <button
        type="button"
        onClick={async () => {
          await qc.cancelQueries();
          qc.clear();
          await signOut();
          void navigate({ to: "/auth", replace: true });
        }}
        className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-bold text-destructive"
      >
        <LogOut className="h-4 w-4" /> {t("Sign out", "साइन आउट")}
      </button>
    </div>
  );
}
