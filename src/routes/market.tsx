import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bike, MapPin, Star } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { ProductCard } from "@/components/app/product-card";
import { useApp, rupees } from "@/lib/app-store";
import { shops, stalls } from "@/lib/local-data";
import { img } from "@/lib/images";
import { QtyButton } from "@/components/app/qty-button";

type Tab = "grocery" | "bites" | "shops";

export const Route = createFileRoute("/market")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => ({
    tab: (["grocery", "bites", "shops"] as const).includes(search["tab"] as Tab)
      ? (search["tab"] as Tab)
      : "grocery",
  }),
  head: () => ({
    meta: [
      { title: "Market — Grocery, Street Food & Shops in Banda | Banda Bazaar" },
      {
        name: "description",
        content:
          "Shop daily grocery at below-MRP prices, order famous Banda street food and browse trusted local shops with fast home delivery.",
      },
      { property: "og:title", content: "Banda Market — Grocery, Street Food & Local Shops" },
      {
        property: "og:description",
        content: "Below-MRP grocery, chaat-samosa from famous stalls and nearby shops, delivered in Banda.",
      },
    ],
  }),
  component: Market,
});

function Market() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: products = [], isLoading } = useQuery(productsQuery());
  const [cat, setCat] = useState<string>("all");

  const list = cat === "all" ? products : products.filter((p) => p.category_slug === cat);

  const tabs: { id: Tab; label: string }[] = [
    { id: "grocery", label: t("Grocery", "किराना") },
    { id: "bites", label: t("Local Bites", "लोकल बाइट्स") },
    { id: "shops", label: t("Shops", "दुकानें") },
  ];

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => void navigate({ to: "/market", search: { tab: x.id } })}
            className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              tab === x.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === "grocery" && (
        <div className="animate-tab-in space-y-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <Chip active={cat === "all"} onClick={() => setCat("all")} label={t("All", "सभी")} />
            {categories.map((c) => (
              <Chip
                key={c.id}
                active={cat === c.slug}
                onClick={() => setCat(c.slug)}
                label={lang === "hi" && c.hindi ? c.hindi : c.name}
              />
            ))}
          </div>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t("Loading…", "लोड हो रहा है…")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "bites" && (
        <div className="animate-tab-in space-y-3">
          <p className="rounded-2xl bg-amber-soft p-3 text-xs font-semibold text-amber-foreground">
            🛵 {t(
              "Stall Pickup: our rider pays at the stall and brings it hot to your door.",
              "स्टॉल पिकअप: हमारा राइडर स्टॉल पर पैसे देकर गरमा-गरम आपके घर लाता है।",
            )}
          </p>
          {stalls.map((s) => (
            <div key={s.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
              <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-sm font-bold leading-tight">{s.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.vendor}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {s.location}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-0.5 text-primary">
                    <Star className="h-3 w-3 fill-current" /> {s.rating}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Bike className="h-3 w-3" /> {s.eta}
                  </span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] uppercase">
                    {s.model === "pickup" ? t("Stall pickup", "स्टॉल पिकअप") : t("Partner", "पार्टनर")}
                  </span>
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <span className="text-sm font-bold">{rupees(s.price)}</span>
                  <div className="w-28">
                    <QtyButton
                      size="sm"
                      item={{ id: s.id, name: s.name, price: s.price, mrp: null, unit: "1 plate", imageKey: s.imageKey }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "shops" && (
        <div className="animate-tab-in grid gap-3 sm:grid-cols-2">
          {shops.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
              <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="h-32 w-full object-cover" />
              <div className="p-3">
                <p className="text-sm font-bold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.tags}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {s.location}
                </p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  ⭐ {s.rating} · {s.eta} min
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`press shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        active ? "border-primary bg-primary-soft text-accent-foreground" : "border-border bg-card text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}
