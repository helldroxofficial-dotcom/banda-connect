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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, area, lang } = useApp();
  const { data: products = [] } = useQuery(productsQuery());
  const picks = products.slice(0, 8);

  const actions = [
    { to: "/market", search: { tab: "grocery" }, icon: ShoppingBasket, label: t("Grocery", "किराना"), sub: "15 min" },
    { to: "/food", search: {}, icon: UtensilsCrossed, label: t("Food Club", "फूड क्लब"), sub: t("Street food & restaurants", "स्ट्रीट फूड और रेस्टोरेंट") },
    { to: "/market", search: { tab: "shops" }, icon: Store, label: t("Shops", "दुकानें"), sub: t("Nearby", "पास की") },
    { to: "/services", search: { tab: "workers" }, icon: Wrench, label: t("Workers", "मिस्त्री"), sub: t("Verified", "वेरिफाइड") },
    { to: "/services", search: { tab: "health" }, icon: HeartPulse, label: t("Health", "स्वास्थ्य"), sub: t("Doctors", "डॉक्टर") },
    { to: "/services", search: { tab: "rooms" }, icon: HomeIcon, label: t("Rooms", "कमरे"), sub: t("Rent", "किराया") },
    { to: "/services", search: { tab: "tutors" }, icon: BookOpen, label: t("Tutors", "ट्यूशन"), sub: t("Home tuition", "होम ट्यूशन") },
    { to: "/profile", search: {}, icon: Banknote, label: "Mini-ATM", sub: t("Cash at home", "घर पर कैश") },
  ] as const;

  return (
    <div className="space-y-7">
      <section className="gradient-hero animate-rise relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-lift)]">
        <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary-foreground/10" />
        <span className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-amber/20" />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-80">
          {t("Banda ka apna app", "बांदा का अपना ऐप")}
        </p>
        <h1 className="mt-2 text-[28px] font-extrabold leading-[1.1]">
          {t("Everything in Banda,", "बांदा में सब कुछ,")}
          <br />
          <span className="text-amber">{t("delivered in minutes", "मिनटों में आपके घर")}</span>
        </h1>
        <p className="mt-2 text-[13px] font-medium opacity-90">
          {t("Now serving", "अभी सेवा में")} {area}, Banda · {t("MRP se kam, hamesha", "MRP से कम, हमेशा")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
          <Chip icon={Timer} text={t("15-min express", "15 मिनट एक्सप्रेस")} />
          <Chip icon={ShieldCheck} text={t("7-day warranty", "7 दिन वारंटी")} />
          <Chip icon={BadgeCheck} text={t("No overcharging", "कोई ओवरचार्ज नहीं")} />
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">{t("What do you need?", "आपको क्या चाहिए?")}</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {actions.map(({ to, search, icon: Icon, label, sub }, i) => (
            <Link
              key={label}
              to={to}
              search={search}
              className={`press hover-lift flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center shadow-card ${
                i % 4 === 3 ? "tile-grad-amber" : "tile-grad"
              }`}
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-card text-primary shadow-soft">
                <Icon className="h-[22px] w-[22px]" strokeWidth={2.1} />
              </span>
              <span className="text-[11px] font-extrabold leading-tight tracking-tight">{label}</span>
              <span className="text-[9.5px] font-medium text-muted-foreground">{sub}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="tile-grad-amber flex items-center gap-3 rounded-2xl p-4 shadow-card">
        <span className="grid h-11 w-11 shrink-0 animate-float place-items-center rounded-2xl bg-amber text-amber-foreground shadow-soft">
          <Bot className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold tracking-tight">{t("Ask Banda Mitra AI", "बांदा मित्र AI से पूछें")}</p>
          <p className="mt-0.5 text-[11.5px] font-medium text-muted-foreground">
            {t(
              "\"Ghar par mistri chahiye\", \"raat ko doodh milega?\" — bas poochh lijiye.",
              "\"घर पर मिस्त्री चाहिए\", \"रात को दूध मिलेगा?\" — बस पूछ लीजिए।",
            )}
          </p>
        </div>
      </section>


      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="section-title">{t("Top picks today", "आज के टॉप पिक")}</h2>
          <Link to="/market" search={{ tab: "grocery" }} className="text-xs font-extrabold text-primary">
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
        <div className="mb-3 flex items-end justify-between">
          <h2 className="section-title">{t("Famous Banda street food", "बांदा का मशहूर स्ट्रीट फूड")}</h2>
          <Link to="/food" className="text-xs font-extrabold text-primary">
            {t("See all", "सभी देखें")} →
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {stalls.map((s) => (
            <Link
              key={s.id}
              to="/food"
              className="surface hover-lift press w-44 shrink-0 overflow-hidden p-0"
            >
              <div className="relative overflow-hidden">
                <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="img-zoom h-28 w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-extrabold text-primary backdrop-blur">
                  ⭐ {s.rating}
                </span>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-1 text-[13px] font-extrabold leading-tight tracking-tight">
                  {lang === "hi" ? s.nameHindi : s.name}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  {lang === "hi" ? s.locationHindi : s.location}
                </p>
                <p className="mt-1 text-xs font-extrabold text-primary">₹{s.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="section-title">{t("Trusted workers near you", "आपके पास भरोसेमंद मिस्त्री")}</h2>
          <Link to="/services" search={{ tab: "workers" }} className="text-xs font-extrabold text-primary">
            {t("See all", "सभी देखें")} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pros.slice(0, 2).map((p) => (
            <div key={p.id} className="surface hover-lift flex items-center gap-3 p-3">
              <div className="overflow-hidden rounded-xl">
                <img src={img(p.imageKey)} alt={p.name} loading="lazy" className="img-zoom h-14 w-14 object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold tracking-tight">{p.name}</p>
                <p className="truncate text-[11.5px] font-medium text-muted-foreground">
                  {p.location} · {p.experience}
                </p>
                <p className="text-[11.5px] font-bold text-primary">
                  ⭐ {p.rating} · {p.jobs}+ {t("jobs done", "काम पूरे")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface p-4">
        <p className="text-[15px] font-extrabold tracking-tight">
          {t("Not finding what you need?", "जो चाहिए वो नहीं मिल रहा?")}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {t(
            "Post your demand — local shops and workers will reach out to you.",
            "अपनी ज़रूरत पोस्ट करें — लोकल दुकानदार और मिस्त्री खुद संपर्क करेंगे।",
          )}
        </p>
        <Link
          to="/services"
          search={{ tab: "demand" }}
          className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-float)]"
        >
          {t("Post your need", "अपनी ज़रूरत पोस्ट करें")}
        </Link>
      </section>

      <Link
        to="/help"
        className="block rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-center text-xs font-semibold text-muted-foreground"
      >
        {t("Delivery fees, warranty & Mini-ATM — read FAQs", "डिलीवरी फीस, वारंटी और मिनी-एटीएम — FAQ पढ़ें")} →
      </Link>
    </div>
  );
}

function Chip({ icon: Icon, text }: { icon: typeof Timer; text: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 backdrop-blur">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

