import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bike, MapPin, Star } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { ProductCard } from "@/components/app/product-card";
import { useApp, rupees } from "@/lib/app-store";
import { FEES, shopMenus, shops, stalls, stallMenus, streetItems } from "@/lib/local-data";
import { img } from "@/lib/images";
import { QtyButton } from "@/components/app/qty-button";

type Tab = "grocery" | "bites" | "shops";

export const Route = createFileRoute("/market")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab; stall?: string; shop?: string } => ({
    tab: (["grocery", "bites", "shops"] as const).includes(search["tab"] as Tab)
      ? (search["tab"] as Tab)
      : "grocery",
    ...(typeof search["stall"] === "string" ? { stall: search["stall"] as string } : {}),
    ...(typeof search["shop"] === "string" ? { shop: search["shop"] as string } : {}),
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
  const { tab, stall: stallParam, shop: shopParam } = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: products = [], isLoading, isError, refetch } = useQuery(productsQuery());
  const [cat, setCat] = useState<string>("all");
  const [bitesState, setBites] = useState<"items" | "stalls">("items");
  const bites = stallParam ? "stalls" : bitesState;
  const stallId = stallParam ?? null;
  const setStallId = (id: string | null) =>
    void navigate({ to: "/market", search: id ? { tab: "bites", stall: id } : { tab: "bites" } });
  const setShopId = (id: string | null) =>
    void navigate({ to: "/market", search: id ? { tab: "shops", shop: id } : { tab: "shops" } });

  const list = cat === "all" ? products : products.filter((p) => p.category_slug === cat);

  const tabs: { id: Tab; label: string }[] = [
    { id: "grocery", label: t("Grocery", "किराना") },
    { id: "bites", label: t("Local Bites", "लोकल बाइट्स") },
    { id: "shops", label: t("Shops", "दुकानें") },
  ];

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => void navigate({ to: "/market", search: { tab: x.id } })}
            className={`press shrink-0 rounded-full px-4 py-2 text-[13px] font-extrabold tracking-tight transition-all ${
              tab === x.id
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-float)]"
                : "bg-card text-muted-foreground shadow-card"
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
          ) : isError ? (
            <div className="surface flex flex-col items-center gap-3 p-6 text-center">
              <p className="text-sm font-bold">{t("Grocery is taking longer than usual.", "किराना लोड होने में सामान्य से ज़्यादा समय लग रहा है।")}</p>
              <button type="button" onClick={() => void refetch()} className="press rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                {t("Try again", "फिर कोशिश करें")}
              </button>
            </div>
          ) : list.length === 0 ? (
            <div className="surface p-6 text-center text-sm text-muted-foreground">
              {t("No grocery items in this category yet.", "इस कैटेगरी में अभी किराना उपलब्ध नहीं है।")}
            </div>
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
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-card p-1 shadow-card">
            {([
              { id: "items", label: t("Quick Bites", "क्विक बाइट्स"), sub: t("Rider picks from any stall", "राइडर रास्ते की किसी भी स्टॉल से लाएगा") },
              { id: "stalls", label: t("Famous Stalls", "मशहूर स्टॉल"), sub: t("Choose one exact stall", "एक खास स्टॉल चुनें") },
            ] as const).map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => {
                  setBites(x.id);
                  if (stallParam) setStallId(null);
                }}
                className={`press rounded-xl px-3 py-2 text-left transition-colors ${
                  bites === x.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="block text-sm font-bold">{x.label}</span>
                <span className="block text-[10px] leading-tight opacity-80">{x.sub}</span>
              </button>
            ))}
          </div>

          <p className="rounded-2xl bg-amber-soft p-3 text-xs font-semibold text-amber-foreground">
            🛵 {t(
              `Minimum 2 plates per item · flat ₹${FEES.streetDelivery} delivery · no packaging fee. Specific stall = +₹${FEES.stallPickupExtra}.`,
              `हर आइटम की कम से कम 2 प्लेट · फ्लैट ₹${FEES.streetDelivery} डिलीवरी · पैकेजिंग फीस नहीं। खास स्टॉल = +₹${FEES.stallPickupExtra}।`,
            )}
          </p>

          {bites === "items" && (
            <div className="animate-tab-in grid gap-3 sm:grid-cols-2">
              {streetItems.map((it) => (
                <div key={it.id} className="hover-lift flex gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <div className="overflow-hidden rounded-xl">
                    <img src={img(it.imageKey)} alt={it.name} loading="lazy" className="img-zoom h-24 w-24 object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-sm font-bold leading-tight">{lang === "hi" ? it.hindi : it.name}</p>
                    <p className="text-[11px] text-muted-foreground">{lang === "hi" ? it.unitHindi : it.unit}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{it.desc}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <span className="text-sm font-bold">
                        {rupees(it.price)}
                        <span className="ml-1 text-[10px] font-semibold text-muted-foreground">
                          · {t("min", "कम से कम")} {it.minQty}
                        </span>
                      </span>
                      <div className="w-28">
                        <QtyButton
                          size="sm"
                          item={{
                            id: it.id,
                            name: it.name,
                            price: it.price,
                            mrp: null,
                            unit: it.unit,
                            imageKey: it.imageKey,
                            kind: "street",
                            minQty: it.minQty,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {bites === "stalls" && !stallId && (
            <div className="animate-tab-in space-y-3">
              {stalls.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStallId(s.id)}
                  className="press hover-lift flex w-full gap-3 rounded-2xl bg-card p-3 text-left shadow-card"
                >
                  <div className="overflow-hidden rounded-xl">
                    <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="img-zoom h-24 w-24 object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-sm font-bold leading-tight">{lang === "hi" ? s.nameHindi : s.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{lang === "hi" ? s.vendorHindi : s.vendor}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {lang === "hi" ? s.locationHindi : s.location}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs font-semibold">
                      <span className="flex items-center gap-0.5 text-primary">
                        <Star className="h-3 w-3 fill-current" /> {s.rating}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Bike className="h-3 w-3" /> {s.eta}
                      </span>
                    </p>
                    <span className="mt-auto pt-2 text-xs font-bold text-primary">
                      {t("View menu", "मेन्यू देखें")} →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {bites === "stalls" && stallId && (() => {
            const stall = stalls.find((x) => x.id === stallId);
            if (!stall) return null;
            const menu = stallMenus[stall.id] ?? [];
            return (
              <div className="animate-tab-in space-y-3">
                <button
                  type="button"
                  onClick={() => setStallId(null)}
                  className="press flex items-center gap-1 text-sm font-bold text-primary"
                >
                  <ArrowLeft className="h-4 w-4" /> {t("All stalls", "सभी स्टॉल")}
                </button>
                <div className="overflow-hidden rounded-2xl bg-card shadow-card">
                  <img src={img(stall.imageKey)} alt={stall.name} className="h-36 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-base font-black">{lang === "hi" ? stall.nameHindi : stall.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "hi" ? stall.vendorHindi : stall.vendor} · {lang === "hi" ? stall.locationHindi : stall.location}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-primary">⭐ {stall.rating} · {stall.eta}</p>
                    <p className="mt-2 rounded-xl bg-amber-soft p-2 text-[11px] font-semibold text-amber-foreground">
                      +{rupees(FEES.stallPickupExtra)} {t(
                        "extra because the rider goes to this exact stall.",
                        "अतिरिक्त, क्योंकि राइडर इसी स्टॉल पर जाएगा।",
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {menu.map((m) => {
                    const it = streetItems.find((x) => x.id === m.itemId);
                    if (!it) return null;
                    const price = m.price ?? it.price;
                    return (
                      <div key={m.itemId} className="hover-lift flex gap-3 rounded-2xl bg-card p-3 shadow-card">
                        <div className="overflow-hidden rounded-xl">
                          <img src={img(it.imageKey)} alt={it.name} loading="lazy" className="img-zoom h-20 w-20 object-cover" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="text-sm font-bold leading-tight">{lang === "hi" ? it.hindi : it.name}</p>
                          <p className="text-[11px] text-muted-foreground">{lang === "hi" ? it.unitHindi : it.unit}</p>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                            <span className="text-sm font-bold">{rupees(price)}</span>
                            <div className="w-28">
                              <QtyButton
                                size="sm"
                                item={{
                                  id: `${stall.id}:${it.id}`,
                                  name: `${it.name} — ${stall.vendor}`,
                                  price,
                                  mrp: null,
                                  unit: it.unit,
                                  imageKey: it.imageKey,
                                  kind: "street",
                                  minQty: it.minQty,
                                  stallId: stall.id,
                                  stallName: stall.vendor,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab === "shops" && !shopParam && (
        <div className="animate-tab-in grid gap-3 sm:grid-cols-2">
          {shops.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setShopId(s.id)}
              className="press hover-lift overflow-hidden rounded-2xl bg-card text-left shadow-card"
            >
              <div className="overflow-hidden">
                <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="img-zoom h-32 w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-bold">{lang === "hi" ? s.nameHindi : s.name}</p>
                <p className="text-xs text-muted-foreground">{lang === "hi" ? s.tagsHindi : s.tags}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {lang === "hi" ? s.locationHindi : s.location}
                </p>
                <p className="mt-1 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>
                    ⭐ {s.rating} · {s.eta} {t("min", "मिनट")}
                  </span>
                  <span>{t("View shop", "दुकान देखें")} →</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === "shops" && shopParam && (() => {
        const shop = shops.find((x) => x.id === shopParam);
        if (!shop) return null;
        const menu = shopMenus[shop.id] ?? [];
        return (
          <div className="animate-tab-in space-y-3">
            <button
              type="button"
              onClick={() => setShopId(null)}
              className="press flex items-center gap-1 text-sm font-bold text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> {t("All shops", "सभी दुकानें")}
            </button>
            <div className="overflow-hidden rounded-2xl bg-card shadow-card">
              <img src={img(shop.imageKey)} alt={shop.name} className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="text-base font-extrabold">{lang === "hi" ? shop.nameHindi : shop.name}</p>
                <p className="text-xs text-muted-foreground">{lang === "hi" ? shop.tagsHindi : shop.tags}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {lang === "hi" ? shop.locationHindi : shop.location}
                  <span className="ml-2 flex items-center gap-1">
                    <Bike className="h-3 w-3" /> {shop.eta} {t("min", "मिनट")}
                  </span>
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {menu.map((m) => (
                <div key={m.id} className="hover-lift flex gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <div className="overflow-hidden rounded-xl">
                    <img src={img(m.imageKey)} alt={m.name} loading="lazy" className="img-zoom h-20 w-20 object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-sm font-bold leading-tight">{lang === "hi" ? m.hindi : m.name}</p>
                    <p className="text-[11px] text-muted-foreground">{lang === "hi" ? m.unitHindi : m.unit}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <span className="text-sm font-bold">
                        {rupees(m.price)}
                        {m.mrp ? (
                          <span className="ml-1 text-[10px] font-medium text-muted-foreground line-through">
                            {rupees(m.mrp)}
                          </span>
                        ) : null}
                      </span>
                      <div className="w-28">
                        <QtyButton
                          size="sm"
                          item={{
                            id: m.id,
                            name: m.name,
                            price: m.price,
                            mrp: m.mrp ?? null,
                            unit: m.unit,
                            imageKey: m.imageKey,
                            kind: "grocery",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
