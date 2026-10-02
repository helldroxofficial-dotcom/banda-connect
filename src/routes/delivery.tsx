import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [
    { title: "Delivery Partner | Banda Bazaar" },
    { name: "description", content: "Apply to deliver grocery, food and Mini-ATM requests across Banda." },
    { property: "og:title", content: "Delivery Partner — Banda Bazaar" },
    { property: "og:description", content: "Join the local delivery network for Banda Bazaar." },
  ] }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const { t, user, authReady, profile, area } = useApp();
  const [form, setForm] = useState({ name: profile?.full_name ?? "", phone: profile?.phone ?? "", vehicle: "bike", area });
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  if (authReady && !user) return <div className="surface p-6 text-center"><p className="text-sm font-bold">{t("Sign in to apply as a delivery partner", "डिलीवरी पार्टनर बनने के लिए साइन इन करें")}</p><Link to="/auth" className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{t("Sign in", "साइन इन")}</Link></div>;

  const submit = async () => {
    if (!user || !form.name.trim() || !form.phone.trim()) { toast.error(t("Name and phone are required.", "नाम और फोन ज़रूरी है।")); return; }
    setSaving(true);
    const { error } = await supabase.from("service_listings").insert({ user_id: user.id, kind: "rider_application", title: "Delivery partner application", provider_name: form.name, contact: form.phone, location: form.area, description: `${form.vehicle} delivery partner application`, status: "pending" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success(t("Application sent for review.", "आवेदन समीक्षा के लिए भेज दिया गया।"));
  };

  return <div className="space-y-4">
    <div className="gradient-hero rounded-3xl p-5 text-primary-foreground"><Bike className="h-7 w-7" /><h1 className="mt-3 text-xl font-black">{t("Become a delivery partner", "डिलीवरी पार्टनर बनें")}</h1><p className="mt-1 text-xs opacity-90">{t("Admin approval and document verification are required before taking jobs.", "काम शुरू करने से पहले एडमिन की मंज़ूरी और दस्तावेज़ सत्यापन ज़रूरी है।")}</p></div>
    {sent ? <div className="surface flex items-center gap-3 p-5"><CheckCircle2 className="h-6 w-6 text-primary" /><p className="text-sm font-bold">{t("Application received. The operations team will contact you.", "आवेदन मिल गया। ऑपरेशंस टीम आपसे संपर्क करेगी।")}</p></div> : <div className="surface space-y-2 p-4"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("Full name", "पूरा नाम")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("Phone number", "फोन नंबर")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" /><select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"><option value="bike">{t("Motorbike", "मोटरसाइकिल")}</option><option value="cycle">{t("Cycle", "साइकिल")}</option><option value="auto">{t("Auto", "ऑटो")}</option></select><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder={t("Service area", "सेवा क्षेत्र")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" /><button type="button" disabled={saving} onClick={() => void submit()} className="press w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{saving ? t("Sending…", "भेज रहे हैं…") : t("Apply now", "अभी आवेदन करें")}</button></div>}
  </div>;
}