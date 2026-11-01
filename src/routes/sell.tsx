import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";
import { myListingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/sell")({
  head: () => ({ meta: [
    { title: "List Your Business | Banda Bazaar" },
    { name: "description", content: "Submit your shop, service or local business for review on Banda Bazaar." },
    { property: "og:title", content: "List Your Business — Banda Bazaar" },
    { property: "og:description", content: "Local businesses can submit a listing for admin review." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SellerPage,
});

function SellerPage() {
  const { t, user, authReady, profile, area } = useApp();
  const qc = useQueryClient();
  const { data: listings = [] } = useQuery(myListingsQuery(user?.id));
  const [form, setForm] = useState({ title: "", provider_name: "", kind: "shop", description: "", price_text: "", contact: "", location: area });
  const [saving, setSaving] = useState(false);

  if (authReady && !user) return <div className="surface p-6 text-center"><p className="text-sm font-bold">{t("Sign in to submit a listing", "लिस्टिंग भेजने के लिए साइन इन करें")}</p><Link to="/auth" className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{t("Sign in", "साइन इन")}</Link></div>;

  const submit = async () => {
    if (!user || !form.title.trim() || !form.provider_name.trim() || !form.contact.trim()) {
      toast.error(t("Business name, owner name and contact are required.", "कारोबार, मालिक का नाम और संपर्क ज़रूरी है।"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("service_listings").insert({ ...form, user_id: user.id, status: "pending" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setForm({ title: "", provider_name: profile?.full_name ?? "", kind: "shop", description: "", price_text: "", contact: profile?.phone ?? "", location: area });
    void qc.invalidateQueries({ queryKey: ["my-listings"] });
    toast.success(t("Submitted for review. Admin approval is required before it goes live.", "रिव्यू के लिए भेज दिया गया। लाइव होने से पहले एडमिन की मंज़ूरी ज़रूरी है।"));
  };

  return <div className="space-y-4">
    <div className="gradient-hero rounded-3xl p-5 text-primary-foreground"><Store className="h-7 w-7" /><h1 className="mt-3 text-xl font-black">{t("List your business", "अपना कारोबार लिस्ट करें")}</h1><p className="mt-1 text-xs opacity-90">{t("Customers will see it after our team reviews the details.", "जानकारी की जाँच के बाद ग्राहक आपकी लिस्टिंग देख पाएंगे।")}</p></div>
    <div className="surface space-y-2 p-4">
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("Business / shop name", "दुकान या कारोबार का नाम")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" />
      <input value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} placeholder={t("Owner / contact person", "मालिक या संपर्क व्यक्ति")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" />
      <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"><option value="shop">{t("Shop", "दुकान")}</option><option value="worker">{t("Service provider", "सर्विस प्रोवाइडर")}</option><option value="skill">{t("Freelancer", "फ्रीलांसर")}</option><option value="stall">{t("Food stall", "फूड स्टॉल")}</option></select>
      <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder={t("Phone number", "फोन नंबर")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" />
      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t("Address / area", "पता या एरिया")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" />
      <input value={form.price_text} onChange={(e) => setForm({ ...form, price_text: e.target.value })} placeholder={t("Starting price or menu range", "शुरुआती कीमत या मेन्यू रेंज")} className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("What do you sell or offer?", "आप क्या बेचते या सेवा देते हैं?")} className="min-h-24 w-full rounded-xl bg-muted p-3 text-sm outline-none" />
      <button type="button" disabled={saving} onClick={() => void submit()} className="press w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{saving ? t("Sending…", "भेज रहे हैं…") : t("Submit for approval", "मंज़ूरी के लिए भेजें")}</button>
    </div>
    <div className="surface p-4"><p className="text-sm font-bold">{t("Your submissions", "आपकी भेजी लिस्टिंग")}</p>{listings.length === 0 ? <p className="mt-2 text-xs text-muted-foreground">{t("No submissions yet.", "अभी कोई लिस्टिंग नहीं भेजी।")}</p> : <div className="mt-2 space-y-2">{listings.map((listing) => <div key={listing.id} className="flex items-center justify-between rounded-xl bg-muted p-3"><div><p className="text-xs font-bold">{listing.title}</p><p className="text-[11px] text-muted-foreground">{listing.kind}</p></div><span className="flex items-center gap-1 text-[10px] font-bold text-primary"><CheckCircle2 className="h-3.5 w-3.5" />{listing.status}</span></div>)}</div>}</div>
  </div>;
}