import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, CheckCircle2, MapPin, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp, rupees } from "@/lib/app-store";

type Job = {
  id: string;
  order_id: string;
  rider_id: string | null;
  status: string;
  area: string | null;
  address: string | null;
  payout: number;
};

const NEXT_STATUS: Record<string, string> = {
  accepted: "picked_up",
  picked_up: "delivered",
};

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [
    { title: "Delivery Partner Application | Banda Bazaar" },
    { name: "description", content: "Apply to deliver grocery, food and Mini-ATM requests across Banda." },
    { property: "og:title", content: "Delivery Partner Application — Banda Bazaar" },
    { property: "og:description", content: "Apply to join the local delivery network in Banda." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const { t, user, authReady, profile, area, isRider } = useApp();
  const [form, setForm] = useState({ name: profile?.full_name ?? "", vehicle: "bike", area });
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsBusy, setJobsBusy] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!user || !isRider) return;
    const { data, error } = await supabase
      .from("delivery_jobs")
      .select("id, order_id, rider_id, status, area, address, payout")
      .order("created_at", { ascending: false });
    if (!error) setJobs((data as Job[]) ?? []);
  }, [user, isRider]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const claimJob = async (job: Job) => {
    if (!user) return;
    setJobsBusy(true);
    const { error } = await supabase
      .from("delivery_jobs")
      .update({ rider_id: user.id, status: "accepted" })
      .eq("id", job.id)
      .is("rider_id", null)
      .eq("status", "available");
    setJobsBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("Job accepted", "काम स्वीकार किया"));
    void loadJobs();
  };

  const advanceJob = async (job: Job) => {
    const next = NEXT_STATUS[job.status];
    if (!next) return;
    setJobsBusy(true);
    const { error } = await supabase
      .from("delivery_jobs")
      .update({ status: next })
      .eq("id", job.id)
      .eq("rider_id", user?.id ?? "");
    setJobsBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(next === "delivered" ? t("Marked delivered", "डिलीवर हो गया") : t("Picked up", "पिक अप हो गया"));
    void loadJobs();
  };

  if (authReady && !user) return <div className="surface p-6 text-center"><p className="text-sm font-bold">{t("Sign in to apply as a delivery partner", "डिलीवरी पार्टनर बनने के लिए साइन इन करें")}</p><Link to="/auth" className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{t("Sign in", "साइन इन")}</Link></div>;

  const submit = async () => {
    const phone = profile?.phone?.replace(/\D/g, "");
    if (!user || !form.name.trim()) { toast.error(t("Your full name is required.", "पूरा नाम ज़रूरी है।")); return; }
    if (!profile?.phone_verified || !phone || !/^[6-9]\d{9}$/.test(phone)) {
      toast.error(t("Verify a valid mobile number in your profile before applying.", "आवेदन से पहले प्रोफ़ाइल में सही मोबाइल नंबर सत्यापित करें।"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("service_listings").insert({ user_id: user.id, kind: "rider_application", title: "Delivery partner application", provider_name: form.name, contact: phone, location: form.area, description: `${form.vehicle} delivery partner application`, status: "pending" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success(t("Application sent for review.", "आवेदन समीक्षा के लिए भेज दिया गया।"));
  };

  return <div className="space-y-4">
    <div className="gradient-hero rounded-3xl p-5 text-primary-foreground"><Bike className="h-7 w-7" /><h1 className="mt-3 text-xl font-black">{t("Become a delivery partner", "डिलीवरी पार्टनर बनें")}</h1><p className="mt-1 text-xs opacity-90">{t("Admin approval and document verification are required before taking jobs.", "काम शुरू करने से पहले एडमिन की मंज़ूरी और दस्तावेज़ सत्यापन ज़रूरी है।")}</p></div>
    {sent ? <div className="surface flex items-center gap-3 p-5"><CheckCircle2 className="h-6 w-6 text-primary" /><p className="text-sm font-bold">{t("Application received. The operations team will contact you.", "आवेदन मिल गया। ऑपरेशंस टीम आपसे संपर्क करेगी।")}</p></div> : <div className="surface space-y-2 p-4"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("Full name", "पूरा नाम")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" /><div className="rounded-xl bg-muted px-3 py-3 text-sm"><p className="font-semibold">{profile?.phone_verified ? profile.phone : t("Mobile number not verified", "मोबाइल नंबर सत्यापित नहीं है")}</p><p className="mt-1 text-xs text-muted-foreground">{profile?.phone_verified ? t("Verified profile number", "प्रोफ़ाइल का सत्यापित नंबर") : t("Verify your number in Profile before applying.", "आवेदन से पहले प्रोफ़ाइल में नंबर सत्यापित करें।")}</p>{!profile?.phone_verified && <Link to="/profile" className="mt-2 inline-flex text-xs font-bold text-primary">{t("Open profile", "प्रोफ़ाइल खोलें")}</Link>}</div><select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"><option value="bike">{t("Motorbike", "मोटरसाइकिल")}</option><option value="cycle">{t("Cycle", "साइकिल")}</option><option value="auto">{t("Auto", "ऑटो")}</option></select><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder={t("Service area", "सेवा क्षेत्र")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" /><button type="button" disabled={saving || !profile?.phone_verified} onClick={() => void submit()} className="press w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{saving ? t("Sending…", "भेज रहे हैं…") : t("Apply now", "अभी आवेदन करें")}</button></div>}
  </div>;
}