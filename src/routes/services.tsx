import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp, rupees } from "@/lib/app-store";
import {
  doctors,
  labTests,
  pros,
  rentListings,
  skills,
  tradeCategories,
  tutorListings,
  FEES,
} from "@/lib/local-data";
import { img } from "@/lib/images";
import { demandPostsQuery } from "@/lib/queries";

type Tab = "workers" | "skills" | "health" | "rooms" | "tutors" | "demand";
const TABS: Tab[] = ["workers", "skills", "health", "rooms", "tutors", "demand"];

export const Route = createFileRoute("/services")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => ({
    tab: TABS.includes(search["tab"] as Tab) ? (search["tab"] as Tab) : "workers",
  }),
  head: () => ({
    meta: [
      { title: "Services — Plumbers, Doctors, Rooms & Tutors in Banda | Banda Bazaar" },
      {
        name: "description",
        content:
          "Book verified plumbers, electricians, bike mechanics and carpenters, consult Banda doctors, find rooms on rent and home tutors — all in one place.",
      },
      { property: "og:title", content: "Banda Services — Verified Workers, Doctors, Rooms, Tutors" },
      {
        property: "og:description",
        content: "Fixed-rate local services with ratings, home visits and a demand board for anything else.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useApp();
  const [trade, setTrade] = useState<string>("all");

  const labels: Record<Tab, string> = {
    workers: t("Workers", "मिस्त्री"),
    skills: t("Skills", "स्किल"),
    health: t("Health", "स्वास्थ्य"),
    rooms: t("Rooms", "कमरे"),
    tutors: t("Tutors", "ट्यूशन"),
    demand: t("Post need", "ज़रूरत पोस्ट"),
  };

  const workerList = trade === "all" ? pros : pros.filter((p) => p.trade === trade);

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {TABS.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => void navigate({ to: "/services", search: { tab: x } })}
            className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              tab === x ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card"
            }`}
          >
            {labels[x]}
          </button>
        ))}
      </div>

      {tab === "workers" && (
        <div className="animate-tab-in space-y-3">
          <p className="rounded-2xl bg-primary-soft p-3 text-xs font-semibold text-accent-foreground">
            🛠 {t(
              `Inspection visit ₹${FEES.inspection} — adjusted in the final bill. Rates are fixed, no bargaining.`,
              `इंस्पेक्शन विज़िट ₹${FEES.inspection} — फाइनल बिल में एडजस्ट। रेट फिक्स हैं, मोल-भाव नहीं।`,
            )}
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <Chip active={trade === "all"} onClick={() => setTrade("all")} label={t("All", "सभी")} />
            {tradeCategories.map((c) => (
              <Chip key={c.id} active={trade === c.id} onClick={() => setTrade(c.id)} label={c.label} />
            ))}
          </div>
          {workerList.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card p-3 shadow-card">
              <div className="flex gap-3">
                <img src={img(p.imageKey)} alt={p.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.location} · {p.experience} · {p.distanceKm} km
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-semibold">
                    <span className="flex items-center gap-0.5 text-primary">
                      <Star className="h-3 w-3 fill-current" /> {p.rating}
                    </span>
                    <span className="text-muted-foreground">{p.jobs}+ {t("jobs", "काम")}</span>
                  </p>
                </div>
              </div>
              <p className="mt-2 rounded-xl bg-muted p-2 text-xs italic text-muted-foreground">“{p.reelQuote}”</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toast.success(t("Booking request sent!", "बुकिंग रिक्वेस्ट भेज दी गई!"))}
                  className="press rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
                >
                  <CalendarCheck className="mr-1 inline h-3.5 w-3.5" />
                  {t("Book visit", "विज़िट बुक करें")}
                </button>
                <button
                  type="button"
                  onClick={() => toast(t("Call connects after booking", "बुकिंग के बाद कॉल जुड़ेगी"))}
                  className="press rounded-xl border border-border py-2 text-xs font-bold"
                >
                  <Phone className="mr-1 inline h-3.5 w-3.5" />
                  {t("Contact", "संपर्क")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "skills" && (
        <div className="animate-tab-in grid gap-3 sm:grid-cols-2">
          {skills.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
              <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="h-32 w-full object-cover" />
              <div className="p-3">
                <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                  {s.tag}
                </span>
                <p className="mt-1 text-sm font-bold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.service}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {s.location} · {s.distanceKm} km
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{t("From", "शुरू")} {rupees(s.startingAt)}</span>
                  <button
                    type="button"
                    onClick={() => toast.success(t("Request sent!", "रिक्वेस्ट भेज दी!"))}
                    className="press rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    {t("Hire", "हायर करें")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "health" && (
        <div className="animate-tab-in space-y-3">
          {doctors.map((d) => (
            <div key={d.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
              <img src={img(d.imageKey)} alt={d.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.speciality}</p>
                <p className="truncate text-xs text-muted-foreground">{d.clinic}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    ⭐ {d.rating} · {rupees(d.fee)}
                    {d.homeVisit ? ` · ${t("Home visit", "होम विज़िट")}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.success(t("Appointment requested!", "अपॉइंटमेंट रिक्वेस्ट भेजी!"))}
                    className="press rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    {t("Book", "बुक")}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <p className="text-sm font-bold">{t("Lab tests at home", "घर पर लैब टेस्ट")}</p>
            <div className="mt-2 space-y-2">
              {labTests.map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-xs font-semibold">{l.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="line-through">{rupees(l.mrp)}</span>{" "}
                      <span className="font-bold text-primary">{rupees(l.price)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success(t("Sample pickup booked!", "सैंपल पिकअप बुक!"))}
                    className="press rounded-lg border border-primary px-3 py-1 text-xs font-bold text-primary"
                  >
                    {t("Book", "बुक")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "rooms" && <ListingGrid items={rentListings} />}
      {tab === "tutors" && <ListingGrid items={tutorListings} />}
      {tab === "demand" && <DemandBoard />}
    </div>
  );
}

function ListingGrid({ items }: { items: typeof rentListings }) {
  const { t } = useApp();
  return (
    <div className="animate-tab-in grid gap-3 sm:grid-cols-2">
      {items.map((l) => (
        <div key={l.id} className="rounded-2xl bg-card p-3 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{l.title}</p>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                l.type === "demand" ? "bg-amber-soft text-amber-foreground" : "bg-primary-soft text-accent-foreground"
              }`}
            >
              {l.type === "demand" ? t("Wanted", "चाहिए") : t("Available", "उपलब्ध")}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{l.meta}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {l.location} · {l.distanceKm} km
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-primary">{l.price}</span>
            <button
              type="button"
              onClick={() => toast.success(t("Contact request sent!", "संपर्क रिक्वेस्ट भेजी!"))}
              className="press rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              {t("Contact", "संपर्क")}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{l.by} · ⭐ {l.rating}</p>
        </div>
      ))}
    </div>
  );
}

function DemandBoard() {
  const { t, user, area } = useApp();
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery(demandPostsQuery());
  const [form, setForm] = useState({ title: "", category: "service", budget: "", details: "", contact: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error(t("Please write what you need", "कृपया लिखें आपको क्या चाहिए"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("demand_posts").insert({
      title: form.title,
      category: form.category,
      budget: form.budget || null,
      details: form.details || null,
      contact: form.contact || null,
      location: area,
      user_id: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm({ title: "", category: "service", budget: "", details: "", contact: "" });
    void qc.invalidateQueries({ queryKey: ["demand-posts"] });
    toast.success(t("Posted! Local sellers will contact you.", "पोस्ट हो गया! लोकल विक्रेता संपर्क करेंगे।"));
  };

  return (
    <div className="animate-tab-in space-y-4">
      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="text-sm font-bold">{t("Post your need", "अपनी ज़रूरत पोस्ट करें")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("Reverse marketplace — shops and workers come to you.", "रिवर्स मार्केटप्लेस — दुकानदार और मिस्त्री खुद आएंगे।")}
        </p>
        <div className="mt-3 space-y-2">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t("e.g. Need a cooler repair today", "जैसे: आज कूलर रिपेयर चाहिए")}
            className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-11 rounded-xl bg-muted px-3 text-sm outline-none"
            >
              <option value="service">{t("Service", "सर्विस")}</option>
              <option value="product">{t("Product", "सामान")}</option>
              <option value="room">{t("Room", "कमरा")}</option>
              <option value="tutor">{t("Tutor", "ट्यूटर")}</option>
            </select>
            <input
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder={t("Budget ₹", "बजट ₹")}
              className="h-11 rounded-xl bg-muted px-3 text-sm outline-none"
            />
          </div>
          <input
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder={t("Phone (optional)", "फोन (वैकल्पिक)")}
            className="h-11 w-full rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <textarea
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            placeholder={t("Details…", "विवरण…")}
            className="min-h-20 w-full rounded-xl bg-muted p-3 text-sm outline-none"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="press w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? t("Posting…", "पोस्ट हो रहा…") : t("Post need", "पोस्ट करें")}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold">{t("Live demand board", "लाइव डिमांड बोर्ड")}</p>
        {posts.length === 0 && (
          <p className="rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-card">
            {t("No open needs right now.", "अभी कोई ज़रूरत पोस्ट नहीं है।")}
          </p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl bg-card p-3 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-bold">{p.title}</p>
              <span className="shrink-0 rounded-md bg-amber-soft px-1.5 py-0.5 text-[10px] font-bold text-amber-foreground">
                {p.category}
              </span>
            </div>
            {p.details && <p className="mt-1 text-xs text-muted-foreground">{p.details}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground">
              {p.location ?? "Banda"} {p.budget ? `· ${p.budget}` : ""} · {new Date(p.created_at).toLocaleDateString("en-IN")}
            </p>
          </div>
        ))}
      </div>
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
