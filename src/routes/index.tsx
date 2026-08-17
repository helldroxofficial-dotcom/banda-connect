import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Banknote,
  BookOpen,
  Bot,
  HeartPulse,
  Home as HomeIcon,
  ShieldCheck,
  ShoppingBasket,
  Store,
  Timer,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { productsQuery } from "@/lib/queries";
import { ProductCard } from "@/components/app/product-card";
import { useApp } from "@/lib/app-store";
import { pros, stalls } from "@/lib/local-data";
import { img } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banda Bazaar — Groceries, Food & Trusted Workers in Banda" },
      {
        name: "description",
        content:
          "Order groceries in 15 minutes, get famous Banda street food, book verified plumbers, electricians, doctors, rooms and tutors — one app for all of Banda.",
      },
      { property: "og:title", content: "Banda Bazaar — Hyper-Local Super App for Banda" },
      {
        property: "og:description",
        content: "Groceries, street food, trusted workers, doctors, rooms and tutors across Banda, UP.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, area } = useApp();
  const { data: products = [] } = useQuery(productsQuery());
  const picks = products.slice(0, 8);

  const actions = [
    { to: "/market", search: { tab: "grocery" }, icon: ShoppingBasket, label: t("Grocery", "किराना"), sub: "15 min" },
    { to: "/market", search: { tab: "bites" }, icon: UtensilsCrossed, label: t("Local Bites", "लोकल बाइट्स"), sub: t("Street food", "चाट-समोसा") },
    { to: "/market", search: { tab: "shops" }, icon: Store, label: t("Shops", "दुकानें"), sub: t("Nearby", "पास की") },
    { to: "/services", search: { tab: "workers" }, icon: Wrench, label: t("Workers", "मिस्त्री"), sub: t("Verified", "वेरिफाइड") },
    { to: "/services", search: { tab: "health" }, icon: HeartPulse, label: t("Health", "स्वास्थ्य"), sub: t("Doctors", "डॉक्टर") },
    { to: "/services", search: { tab: "rooms" }, icon: HomeIcon, label: t("Rooms", "कमरे"), sub: t("Rent", "किराया") },
    { to: "/services", search: { tab: "tutors" }, icon: BookOpen, label: t("Tutors", "ट्यूशन"), sub: t("Home tuition", "होम ट्यूशन") },
    { to: "/profile", search: {}, icon: Banknote, label: "Mini-ATM", sub: t("Cash at home", "घर पर कैश") },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
          {t("Banda ka apna app", "बांदा का अपना ऐप")}
        </p>
        <h1 className="mt-1 text-2xl font-black leading-tight">
          {t("Everything in Banda,", "बांदा में सब कुछ,")}
          <br />
          {t("delivered in minutes", "मिनटों में आपके घर")}
        </h1>
        <p className="mt-2 text-sm opacity-90">
          {t("Now serving", "अभी सेवा में")} {area}, Banda · {t("MRP se kam, hamesha", "MRP से कम, हमेशा")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
          <Chip icon={Timer} text={t("15-min express", "15 मिनट एक्सप्रेस")} />
          <Chip icon={ShieldCheck} text={t("7-day warranty", "7 दिन वारंटी")} />
          <Chip icon={BadgeCheck} text={t("No overcharging", "कोई ओवरचार्ज नहीं")} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {t("What do you need?", "आपको क्या चाहिए?")}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {actions.map(({ to, search, icon: Icon, label, sub }) => (
            <Link
              key={label}
              to={to}
              search={search}
              className="press flex flex-col items-center gap-1 rounded-2xl bg-card p-3 text-center shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold leading-tight">{label}</span>
              <span className="text-[10px] text-muted-foreground">{sub}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-amber-soft p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-amber-foreground">
          <Bot className="h-4 w-4" /> {t("Ask Banda Mitra AI", "बांदा मित्र AI से पूछें")}
        </p>
        <p className="mt-1 text-xs text-amber-foreground/80">
          {t(
            "\"Ghar par mistri chahiye\", \"raat ko doodh milega?\" — bas poochh lijiye.",
            "\"घर पर मिस्त्री चाहिए\", \"रात को दूध मिलेगा?\" — बस पूछ लीजिए।",
          )}
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t("Top picks today", "आज के टॉप पिक")}
          </h2>
          <Link to="/market" search={{ tab: "grocery" }} className="text-xs font-bold text-primary">
            {t("See all", "सभी देखें")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {picks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t("Famous Banda street food", "बांदा का मशहूर स्ट्रीट फूड")}
          </h2>
          <Link to="/market" search={{ tab: "bites" }} className="text-xs font-bold text-primary">
            {t("See all", "सभी देखें")} →
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {stalls.map((s) => (
            <div key={s.id} className="w-44 shrink-0 rounded-2xl bg-card p-2 shadow-card">
              <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="h-24 w-full rounded-xl object-cover" />
              <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-tight">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">{s.location}</p>
              <p className="mt-1 text-xs font-bold text-primary">₹{s.price} · ⭐ {s.rating}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t("Trusted workers near you", "आपके पास भरोसेमंद मिस्त्री")}
          </h2>
          <Link to="/services" search={{ tab: "workers" }} className="text-xs font-bold text-primary">
            {t("See all", "सभी देखें")} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pros.slice(0, 2).map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <img src={img(p.imageKey)} alt={p.name} loading="lazy" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.location} · {p.experience}
                </p>
                <p className="text-xs font-semibold text-primary">
                  ⭐ {p.rating} · {p.jobs}+ {t("jobs done", "काम पूरे")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <p className="text-sm font-bold">{t("Not finding what you need?", "जो चाहिए वो नहीं मिल रहा?")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "Post your demand — local shops and workers will reach out to you.",
            "अपनी ज़रूरत पोस्ट करें — लोकल दुकानदार और मिस्त्री खुद संपर्क करेंगे।",
          )}
        </p>
        <Link
          to="/services"
          search={{ tab: "demand" }}
          className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          {t("Post your need", "अपनी ज़रूरत पोस्ट करें")}
        </Link>
      </section>

      <Link to="/help" className="block rounded-2xl bg-muted p-4 text-center text-xs font-semibold text-muted-foreground">
        {t("Delivery fees, warranty & Mini-ATM — read FAQs", "डिलीवरी फीस, वारंटी और मिनी-एटीएम — FAQ पढ़ें")} →
      </Link>
    </div>
  );
}

function Chip({ icon: Icon, text }: { icon: typeof Timer; text: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}
