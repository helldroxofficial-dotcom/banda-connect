import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Bike, Megaphone, PackageCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp, rupees } from "@/lib/app-store";
import { myOrdersQuery, atmRequestsQuery, myDemandPostsQuery } from "@/lib/queries";
import { img } from "@/lib/images";

const STEPS = ["placed", "packed", "on_the_way", "delivered"];

export const Route = createFileRoute("/orders")({
  validateSearch: (search: Record<string, unknown>): { order?: string } =>
    typeof search["order"] === "string" ? { order: search["order"] } : {},
  head: () => ({
    meta: [
      { title: "My Orders & Live Tracking | Banda Bazaar" },
      {
        name: "description",
        content: "Track your Banda Bazaar orders live, see rider updates, bill breakup and report any issue within 7 days.",
      },
      { property: "og:title", content: "My Orders — Banda Bazaar" },
      { property: "og:description", content: "Live order tracking and 7-day warranty support for every Banda Bazaar order." },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { t, user, authReady } = useApp();
  const { order: highlight } = Route.useSearch();
  const { data: orders = [], isLoading, refetch } = useQuery(myOrdersQuery(user?.id));
  const { data: atm = [] } = useQuery(atmRequestsQuery(Boolean(user)));
  const { data: needs = [] } = useQuery(myDemandPostsQuery(user?.id));

  if (authReady && !user) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center shadow-card">
        <p className="text-sm font-bold">{t("Sign in to see your orders", "अपने ऑर्डर देखने के लिए साइन इन करें")}</p>
        <Link to="/auth" className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          {t("Sign in", "साइन इन")}
        </Link>
      </div>
    );
  }

  const rate = async (id: string, rating: number) => {
    const { error } = await supabase.from("orders").update({ rating }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(t("Thanks for rating!", "रेटिंग के लिए धन्यवाद!"));
      void refetch();
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-black">{t("My orders", "मेरे ऑर्डर")}</h1>

      {atm.length > 0 && (
        <div className="animate-rise rounded-2xl bg-card p-4 shadow-card">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Banknote className="h-4 w-4 text-primary" /> Mini-ATM · {t("cash requests", "कैश रिक्वेस्ट")}
          </p>
          <div className="mt-2 space-y-2">
            {atm.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-xs">
                <div>
                  <p className="font-bold">{rupees(Number(r.amount))} + {rupees(Number(r.fee))} {t("fee", "फीस")}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {needs.length > 0 && (
        <div className="animate-rise rounded-2xl bg-card p-4 shadow-card">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Megaphone className="h-4 w-4 text-primary" /> {t("My posted needs", "मेरी पोस्ट की गई ज़रूरतें")}
          </p>
          <div className="mt-2 space-y-2">
            {needs.map((n) => (
              <div key={n.id} className="rounded-xl bg-muted px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-bold">{n.title}</p>
                  <span className="shrink-0 rounded-md bg-amber-soft px-1.5 py-0.5 text-[10px] font-bold text-amber-foreground">
                    {n.category}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {n.location ?? "Banda"} {n.budget ? `· ${n.budget}` : ""} ·{" "}
                  {new Date(n.created_at).toLocaleDateString("en-IN")} · {n.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">{t("Loading…", "लोड हो रहा है…")}</p>}
      {!isLoading && orders.length === 0 && (
        <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          {t("No orders yet. Your first order is 15 minutes away!", "अभी कोई ऑर्डर नहीं। पहला ऑर्डर सिर्फ 15 मिनट दूर है!")}
        </div>
      )}
      {orders.map((o) => {
        const items = (o.items as { name: string; qty: number; image_key?: string }[]) ?? [];
        const step = Math.max(0, STEPS.indexOf(o.status));
        return (
          <div
            key={o.id}
            className={`rounded-2xl bg-card p-4 shadow-card ${highlight === o.id ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                #{o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleString("en-IN")}
              </p>
              <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                {o.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <span
                    className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
                  />
                  {i === step && <Bike className="animate-rider h-4 w-4 shrink-0 text-primary" />}
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {o.status === "delivered"
                ? t("Delivered", "डिलीवर हो गया")
                : `${t("Rider", "राइडर")} ${o.rider_name ?? "Sonu"} · ${t("arriving soon", "जल्दी पहुंच रहा है")}`}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {items.slice(0, 5).map((i, idx) => (
                <span key={idx} className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px]">
                  <img src={img(i.image_key)} alt="" className="h-5 w-5 rounded object-cover" />
                  {i.name} ×{i.qty}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-sm">
              <span className="text-muted-foreground">
                {t("Paid via", "भुगतान")} {o.payment_method.toUpperCase()}
              </span>
              <span className="font-bold">{rupees(Number(o.total))}</span>
            </div>
            {Number(o.savings) > 0 && (
              <p className="mt-1 text-xs font-semibold text-primary">
                {t("You saved", "आपने बचाए")} {rupees(Number(o.savings))}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`Rate ${n}`} onClick={() => void rate(o.id, n)}>
                    <Star
                      className={`h-4 w-4 ${(o.rating ?? 0) >= n ? "fill-amber text-amber" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => toast.success(t("Issue reported — team will call you.", "समस्या दर्ज — टीम कॉल करेगी।"))}
                className="press flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold"
              >
                <PackageCheck className="h-3.5 w-3.5" />
                {t("Report issue (7-day)", "समस्या बताएं (7 दिन)")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
