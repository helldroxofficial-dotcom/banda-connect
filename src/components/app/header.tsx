import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronDown, MapPin, Search, ShoppingCart, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-store";
import { AREAS, pros, shops, skills, stalls } from "@/lib/local-data";
import { productsQuery } from "@/lib/queries";
import { img } from "@/lib/images";
import { QtyButton } from "@/components/app/qty-button";
import { useCartCount } from "@/components/app/cart";

type Hit = { id: string; title: string; sub: string; image: string; to: string };

export function AppHeader() {
  const { area, setArea, lang, setLang, t, setCartOpen } = useApp();
  const totals = { count: useCartCount() };
  const [areaOpen, setAreaOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data: products = [] } = useQuery(productsQuery());

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const out: Hit[] = [];
    for (const p of products) {
      if (`${p.name} ${p.hindi ?? ""}`.toLowerCase().includes(term))
        out.push({
          id: p.id,
          title: p.name,
          sub: `Grocery • ₹${p.price}`,
          image: img(p.image_key),
          to: "/market",
        });
    }
    for (const s of stalls)
      if (`${s.name} ${s.vendor}`.toLowerCase().includes(term))
        out.push({
          id: s.id,
          title: s.name,
          sub: `Local Bites • ${s.vendor}`,
          image: img(s.imageKey),
          to: "/market",
        });
    for (const s of shops)
      if (`${s.name} ${s.tags}`.toLowerCase().includes(term))
        out.push({
          id: s.id,
          title: s.name,
          sub: `Shop • ${s.location}`,
          image: img(s.imageKey),
          to: "/market",
        });
    for (const p of pros)
      if (`${p.name} ${p.trade}`.toLowerCase().includes(term))
        out.push({
          id: p.id,
          title: p.name,
          sub: `Service • ${p.trade}`,
          image: img(p.imageKey),
          to: "/services",
        });
    for (const s of skills)
      if (`${s.name} ${s.service}`.toLowerCase().includes(term))
        out.push({
          id: s.id,
          title: s.name,
          sub: `Skill • ${s.tag}`,
          image: img(s.imageKey),
          to: "/services",
        });
    return out.slice(0, 8);
  }, [q, products]);

  const productById = (id: string) => products.find((p) => p.id === id);

  return (
    <header className="gradient-hero sticky top-0 z-50 text-primary-foreground shadow-[0_8px_24px_-16px_oklch(0.2_0.02_250/0.5)]">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 pt-3">
        <button
          type="button"
          onClick={() => setAreaOpen(true)}
          className="press grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-left"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
            <MapPin className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] opacity-75">
              {t("Delivery in 15 min", "डिलीवरी 15 मिनट")}
            </span>
            <span className="flex items-center gap-1 text-[15px] font-extrabold tracking-tight">
              <span className="truncate">{area}, Banda</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="press shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[11px] font-extrabold tracking-wide"
        >
          {lang === "en" ? "ENG" : "हिंदी"}
        </button>
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setBellOpen(true)}
          className="press relative shrink-0 rounded-full bg-primary-foreground/15 p-2"
        >
          <Bell className="h-4 w-4" />
          <span className="animate-pulse-ring absolute right-1 top-1 h-2 w-2 rounded-full bg-amber" />
        </button>
        <button
          type="button"
          aria-label="Cart"
          onClick={() => setCartOpen(true)}
          className="press relative shrink-0 rounded-full bg-primary-foreground/15 p-2"
        >
          <ShoppingCart className="h-4 w-4" />
          {totals.count > 0 && (
            <span
              key={totals.count}
              className="animate-badge-pop absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber px-1 text-[10px] font-bold text-amber-foreground"
            >
              {totals.count}
            </span>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-3 pt-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(
              'Search "atta", "samosa", "electrician"',
              'खोजें "आटा", "समोसा", "इलेक्ट्रीशियन"',
            )}
            className="h-12 w-full rounded-2xl bg-card pl-10 pr-9 text-sm font-medium text-foreground shadow-[var(--shadow-card)] outline-none ring-0 placeholder:text-muted-foreground focus:ring-2 focus:ring-amber/60"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {hits.length > 0 && (
          <div className="animate-fade-in mt-2 overflow-hidden rounded-xl bg-card text-foreground shadow-card">
            {hits.map((h) => {
              const p = productById(h.id);
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-3 border-b border-border p-2 last:border-0"
                >
                  <img
                    src={h.image}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      void navigate({ to: h.to });
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold">{h.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.sub}</p>
                  </button>
                  {p && (
                    <div className="w-20 shrink-0">
                      <QtyButton
                        size="sm"
                        item={{
                          id: p.id,
                          name: p.name,
                          hindi: p.hindi,
                          price: Number(p.price),
                          mrp: p.mrp ? Number(p.mrp) : null,
                          unit: p.unit,
                          imageKey: p.image_key,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={areaOpen} onOpenChange={setAreaOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Choose your area", "अपना एरिया चुनें")}</DialogTitle>
            <DialogDescription>
              {t("We deliver across Banda city", "हम पूरे बांदा शहर में डिलीवर करते हैं")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {AREAS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setArea(a);
                  setAreaOpen(false);
                }}
                className={`press flex items-center justify-between rounded-xl border p-3 text-left text-sm ${
                  a === area
                    ? "border-primary bg-primary-soft font-bold text-accent-foreground"
                    : "border-border"
                }`}
              >
                <span>{a}, Banda</span>
                <MapPin className="h-4 w-4 opacity-60" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bellOpen} onOpenChange={setBellOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Notifications", "सूचनाएं")}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 text-sm">
            <li className="rounded-xl bg-primary-soft p-3 text-accent-foreground">
              🎉{" "}
              {t(
                "Free delivery on orders above ₹149 today.",
                "आज ₹149 से ऊपर के ऑर्डर पर फ्री डिलीवरी।",
              )}
            </li>
            <li className="rounded-xl bg-muted p-3">
              🛵{" "}
              {t(
                "New: Live Stall Pickup from Kalu Kuan chaat corner.",
                "नया: कालू कुआँ चाट कॉर्नर से लाइव स्टॉल पिकअप।",
              )}
            </li>
            <li className="rounded-xl bg-muted p-3">
              💵{" "}
              {t("Mini-ATM cash at home now up to ₹5,000.", "मिनी-एटीएम घर पर कैश अब ₹5,000 तक।")}
            </li>
          </ul>
        </DialogContent>
      </Dialog>
    </header>
  );
}
