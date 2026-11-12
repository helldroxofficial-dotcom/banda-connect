import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QtyButton } from "@/components/app/qty-button";
import { useApp, rupees } from "@/lib/app-store";
import { FEES, restaurants, stalls, stallMenus, streetItems } from "@/lib/local-data";
import { img } from "@/lib/images";

type FoodTab = "quick" | "stalls" | "restaurants";

export const Route = createFileRoute("/food")({
  head: () => ({
    meta: [
      { title: "Food Club — Street Food, Stalls & Restaurants in Banda" },
      { name: "description", content: "Order Banda street-food favourites, choose a specific stall or browse local restaurant menus." },
      { property: "og:title", content: "Banda Food Club — Street Food & Restaurants" },
      { property: "og:description", content: "Quick bites, famous Banda stalls and restaurant favourites in one Food Club." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FoodClub,
});

function FoodClub() {
  const { t, lang } = useApp();
  const [tab, setTab] = useState<FoodTab>("quick");
  const [activeStall, setActiveStall] = useState<string | null>(null);
  const tabs: { id: FoodTab; label: string }[] = [
    { id: "quick", label: t("Quick Bites", "क्विक बाइट्स") },
    { id: "stalls", label: t("Famous Stalls", "मशहूर स्टॉल") },
    { id: "restaurants", label: t("Restaurants", "रेस्टोरेंट") },
  ];
  const selectedStall = stalls.find((stall) => stall.id === activeStall);

  return (
    <div className="space-y-5">
      <section className="gradient-hero relative overflow-hidden rounded-2xl p-4 text-primary-foreground shadow-[var(--shadow-lift)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-foreground/15">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-black">{t("Food Club", "फूड क्लब")}</h1>
            <p className="mt-0.5 text-xs font-medium opacity-85">{t("Street favourites and local restaurant menus", "स्ट्रीट फूड और लोकल रेस्टोरेंट मेन्यू")}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold">
          <span>{t(`Street delivery ₹${FEES.streetDelivery}`, `स्ट्रीट डिलीवरी ₹${FEES.streetDelivery}`)}</span>
          <span>{t("₹9 restaurant platform fee", "रेस्टोरेंट प्लेटफ़ॉर्म फीस ₹9")}</span>
        </div>
      </section>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5" role="tablist">
        {tabs.map((item) => (
          <Button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => {
              setTab(item.id);
              setActiveStall(null);
            }}
            className="shrink-0 rounded-full"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {tab === "quick" && (
        <section className="space-y-3">
          <p className="rounded-xl bg-amber-soft p-3 text-xs font-semibold text-amber-foreground">
            {t(`Minimum 2 plates or packs per item · ₹${FEES.streetDelivery} delivery · no packaging fee.`, `हर आइटम के कम से कम 2 प्लेट/पैक · ₹${FEES.streetDelivery} डिलीवरी · पैकेजिंग फीस नहीं।`)}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {streetItems.map((item) => (
              <article key={item.id} className="surface hover-lift flex gap-3 p-3">
                <img src={img(item.imageKey)} alt={lang === "hi" ? item.hindi : item.name} loading="lazy" className="h-24 w-24 rounded-lg object-cover" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-sm font-bold">{lang === "hi" ? item.hindi : item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{lang === "hi" ? item.unitHindi : item.unit}</p>
                  <p className="mt-1 text-xs font-extrabold">{rupees(item.price)} · {t("min 2", "कम से कम 2")}</p>
                  <div className="mt-auto pt-2"><QtyButton size="sm" item={{ id: item.id, name: item.name, hindi: item.hindi, price: item.price, mrp: null, unit: item.unit, imageKey: item.imageKey, kind: "street", minQty: item.minQty }} /></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "stalls" && (
        <section className="space-y-3">
          {selectedStall ? (
            <>
              <Button type="button" variant="ghost" onClick={() => setActiveStall(null)} className="px-1">
                <ArrowLeft className="h-4 w-4" /> {t("All stalls", "सभी स्टॉल")}
              </Button>
              <article className="overflow-hidden rounded-xl bg-card shadow-card">
                <img src={img(selectedStall.imageKey)} alt={selectedStall.name} className="h-40 w-full object-cover" />
                <div className="p-3">
                  <h2 className="font-extrabold">{lang === "hi" ? selectedStall.nameHindi : selectedStall.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{lang === "hi" ? selectedStall.locationHindi : selectedStall.location}</p>
                  <p className="mt-1 text-xs font-semibold text-primary">+{rupees(FEES.stallPickupExtra)} {t("specific-stall pickup", "खास स्टॉल पिकअप")}</p>
                </div>
              </article>
              <div className="grid gap-3 sm:grid-cols-2">
                {(stallMenus[selectedStall.id] ?? []).map((menuItem) => {
                  const item = streetItems.find((entry) => entry.id === menuItem.itemId);
                  if (!item) return null;
                  const price = menuItem.price ?? item.price;
                  return <article key={item.id} className="surface flex items-center gap-3 p-3">
                    <img src={img(item.imageKey)} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{lang === "hi" ? item.hindi : item.name}</p>
                      <p className="text-xs font-extrabold">{rupees(price)} · {t("min 2", "कम से कम 2")}</p>
                    </div>
                    <div className="w-24"><QtyButton size="sm" item={{ id: `${selectedStall.id}:${item.id}`, name: `${item.name} — ${selectedStall.vendor}`, hindi: item.hindi, price, mrp: null, unit: item.unit, imageKey: item.imageKey, kind: "street", minQty: item.minQty, stallId: selectedStall.id, stallName: selectedStall.vendor }} /></div>
                  </article>;
                })}
              </div>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stalls.map((stall) => (
                <button key={stall.id} type="button" onClick={() => setActiveStall(stall.id)} className="press surface hover-lift flex w-full gap-3 p-3 text-left">
                  <img src={img(stall.imageKey)} alt={stall.name} loading="lazy" className="h-24 w-24 rounded-lg object-cover" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-bold">{lang === "hi" ? stall.nameHindi : stall.name}</span>
                    <span className="text-xs text-muted-foreground">{lang === "hi" ? stall.vendorHindi : stall.vendor}</span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{lang === "hi" ? stall.locationHindi : stall.location}</span>
                    <span className="mt-auto pt-2 text-xs font-bold text-primary"><Star className="mr-1 inline h-3 w-3 fill-current" />{stall.rating} · {stall.eta}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "restaurants" && (
        <section className="space-y-3">
          {restaurants.map((restaurant) => (
            <article key={restaurant.id} className="overflow-hidden rounded-xl bg-card shadow-card">
              <div className="relative">
                <img src={img(restaurant.imageKey)} alt={restaurant.name} loading="lazy" className="h-36 w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-1 text-[11px] font-bold"><Star className="mr-1 inline h-3 w-3 fill-amber text-amber" />{restaurant.rating} · {restaurant.eta}</span>
              </div>
              <div className="p-3">
                <h2 className="text-base font-extrabold">{lang === "hi" ? restaurant.nameHindi : restaurant.name}</h2>
                <p className="text-xs text-muted-foreground">{lang === "hi" ? restaurant.cuisineHindi : restaurant.cuisine} · {lang === "hi" ? restaurant.locationHindi : restaurant.location}</p>
                <div className="mt-3 divide-y divide-border">
                  {restaurant.menu.map((dish) => (
                    <div key={dish.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <img src={img(dish.imageKey)} alt={dish.name} loading="lazy" className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{lang === "hi" ? dish.hindi : dish.name}</p>
                        <p className="line-clamp-1 text-[11px] text-muted-foreground">{dish.desc}</p>
                        <p className="text-xs font-extrabold">{rupees(dish.price)}</p>
                      </div>
                      <div className="w-24"><QtyButton size="sm" item={{ id: `${restaurant.id}:${dish.id}`, name: `${dish.name} — ${restaurant.name}`, hindi: dish.hindi, price: dish.price, mrp: null, unit: "1 serving", imageKey: dish.imageKey, kind: "restaurant", restaurantId: restaurant.id, restaurantName: restaurant.name }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
          <p className="rounded-xl bg-primary-soft p-3 text-xs font-semibold text-accent-foreground">{t("₹9 platform fee applies to premium restaurant orders.", "प्रीमियम रेस्टोरेंट ऑर्डर पर ₹9 प्लेटफ़ॉर्म फीस लगेगी।")}</p>
        </section>
      )}
    </div>
  );
}