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
  demandCategories,
  FEES,
} from "@/lib/local-data";
import { img } from "@/lib/images";
import { demandPostsQuery } from "@/lib/queries";

type Tab = "workers" | "skills" | "health" | "rooms" | "tutors" | "demand";
const TABS: Tab[] = ["workers", "skills", "health", "rooms", "tutors", "demand"];

const workerCopy: Record<string, { name: { en: string; hi: string }; location: { en: string; hi: string }; experience: { en: string; hi: string }; quote: { en: string; hi: string } }> = {
  sp1: { name: { en: "Ramesh Kumar", hi: "रमेश कुमार" }, location: { en: "Alha Ghat, Banda", hi: "अल्हा घाट, बांदा" }, experience: { en: "8 yrs exp", hi: "8 साल का अनुभव" }, quote: { en: "Tap leak fixed in 20 minutes, with a fixed rate.", hi: "नल का रिसाव 20 मिनट में ठीक किया, रेट भी फिक्स था।" } },
  sp2: { name: { en: "Sonu Vishwakarma", hi: "सोनू विश्वकर्मा" }, location: { en: "Civil Lines, Banda", hi: "सिविल लाइंस, बांदा" }, experience: { en: "12 yrs exp", hi: "12 साल का अनुभव" }, quote: { en: "Checked the whole home's wiring without extra charges.", hi: "पूरे घर की वायरिंग चेक की, कोई अतिरिक्त चार्ज नहीं लिया।" } },
  sp3: { name: { en: "Imran Bike Point", hi: "इमरान बाइक पॉइंट" }, location: { en: "Station Road, Banda", hi: "स्टेशन रोड, बांदा" }, experience: { en: "6 yrs exp", hi: "6 साल का अनुभव" }, quote: { en: "Started the bike at home so there was no need to search for a mechanic.", hi: "घर आकर बाइक स्टार्ट कर दी, मैकेनिक ढूंढने की जरूरत नहीं पड़ी।" } },
  sp4: { name: { en: "Deshraj Carpenter", hi: "देशराज बढ़ई" }, location: { en: "Mataundh Road, Banda", hi: "मटौंध रोड, बांदा" }, experience: { en: "10 yrs exp", hi: "10 साल का अनुभव" }, quote: { en: "Fitted the cupboard door perfectly and worked neatly.", hi: "अलमारी का दरवाजा सही फिट किया और सफाई से काम किया।" } },
};

const skillCopy: Record<string, { name: { en: string; hi: string }; service: { en: string; hi: string }; location: { en: string; hi: string } }> = {
  sk1: { name: { en: "Aarav Studio", hi: "आरव स्टूडियो" }, service: { en: "Product & pre-wedding photography", hi: "प्रोडक्ट और प्री-वेडिंग फोटोग्राफी" }, location: { en: "Station Road, Banda", hi: "स्टेशन रोड, बांदा" } },
  sk2: { name: { en: "Banda Web Solutions", hi: "बांदा वेब सॉल्यूशंस" }, service: { en: "Website & app development for shops", hi: "दुकानों के लिए वेबसाइट और ऐप डेवलपमेंट" }, location: { en: "Civil Lines, Banda", hi: "सिविल लाइंस, बांदा" } },
  sk3: { name: { en: "Ansari Laptop Care", hi: "अंसारी लैपटॉप केयर" }, service: { en: "Laptop & mobile repair, data recovery", hi: "लैपटॉप और मोबाइल रिपेयर, डेटा रिकवरी" }, location: { en: "Chowk Bazaar, Banda", hi: "चौक बाजार, बांदा" } },
};

const doctorCopy: Record<string, { name: { en: string; hi: string }; speciality: { en: string; hi: string }; clinic: { en: string; hi: string } }> = {
  d1: { name: { en: "Dr. S. K. Tiwari", hi: "डॉ. एस. के. तिवारी" }, speciality: { en: "General Physician (MBBS, MD)", hi: "जनरल फिजिशियन (MBBS, MD)" }, clinic: { en: "Tiwari Clinic, Station Road", hi: "तिवारी क्लिनिक, स्टेशन रोड" } },
  d2: { name: { en: "Dr. Anjali Verma", hi: "डॉ. अंजली वर्मा" }, speciality: { en: "Child Specialist (Pediatrician)", hi: "बाल रोग विशेषज्ञ" }, clinic: { en: "Verma Child Care, Civil Lines", hi: "वर्मा चाइल्ड केयर, सिविल लाइंस" } },
};

const labCopy: Record<string, { en: string; hi: string }> = {
  l1: { en: "Complete Blood Count (CBC)", hi: "कम्प्लीट ब्लड काउंट (CBC)" },
  l2: { en: "Full Body Checkup (60 params)", hi: "फुल बॉडी चेकअप (60 जांच)" },
  l3: { en: "Diabetes Profile (HbA1c)", hi: "डायबिटीज प्रोफाइल (HbA1c)" },
  l4: { en: "Thyroid Profile (T3 T4 TSH)", hi: "थायरॉइड प्रोफाइल (T3 T4 TSH)" },
};

const listingCopy: Record<string, { meta: { en: string; hi: string }; location: { en: string; hi: string }; by: { en: string; hi: string } }> = {
  r1: { meta: { en: "1 BHK • Furnished • Bachelors allowed", hi: "1 BHK • फर्निश्ड • बैचलर स्वीकार्य" }, location: { en: "Near Degree College, Banda", hi: "डिग्री कॉलेज के पास, बांदा" }, by: { en: "Owner: Mahesh Gupta", hi: "मालिक: महेश गुप्ता" } },
  r2: { meta: { en: "2 BHK • Semi-furnished • Family only", hi: "2 BHK • सेमी-फर्निश्ड • केवल परिवार" }, location: { en: "Civil Lines, Banda", hi: "सिविल लाइंस, बांदा" }, by: { en: "Owner: Sunita Devi", hi: "मालिक: सुनीता देवी" } },
  r3: { meta: { en: "Student • Budget under ₹2,500", hi: "छात्र • ₹2,500 से कम बजट" }, location: { en: "Near Degree College", hi: "डिग्री कॉलेज के पास" }, by: { en: "Student: Rahul", hi: "छात्र: राहुल" } },
  t1: { meta: { en: "Class 6-10 • CBSE / UP Board", hi: "कक्षा 6-10 • CBSE / UP बोर्ड" }, location: { en: "Station Road, Banda", hi: "स्टेशन रोड, बांदा" }, by: { en: "Tutor: Amit Sir", hi: "ट्यूटर: अमित सर" } },
  t2: { meta: { en: "Reasoning • Quant • English", hi: "रीजनिंग • क्वांट • इंग्लिश" }, location: { en: "Civil Lines, Banda", hi: "सिविल लाइंस, बांदा" }, by: { en: "Tutor: Priya Ma'am", hi: "ट्यूटर: प्रिया मैम" } },
  t3: { meta: { en: "Evening slot • Home visit", hi: "शाम का समय • घर पर पढ़ाई" }, location: { en: "Babu Pura, Banda", hi: "बाबू पुरा, बांदा" }, by: { en: "Student: Neha", hi: "छात्रा: नेहा" } },
};

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Services,
});

function Services() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang } = useApp();
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
          <DemandStrip category="workers" />
          <p className="rounded-2xl bg-primary-soft p-3 text-xs font-semibold text-accent-foreground">
            🛠 {t(
              `Visit charge ₹${FEES.visitCharge} — this covers coming to your home only. Any time spent, opening parts or actual work is billed separately according to the service, whether or not the repair is completed.`,
              `विज़िट चार्ज ₹${FEES.visitCharge} — यह केवल आपके घर आने का है। लगाया गया समय, पार्ट्स खोलना या किया गया काम सर्विस के अनुसार अलग से लगेगा, काम पूरा हो या न हो।`,
            )}
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <Chip active={trade === "all"} onClick={() => setTrade("all")} label={t("All", "सभी")} />
            {tradeCategories.map((c) => (
              <Chip key={c.id} active={trade === c.id} onClick={() => setTrade(c.id)} label={lang === "hi" ? c.hindi : c.label} />
            ))}
          </div>
          {workerList.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card p-3 shadow-card">
              <div className="flex gap-3">
                <img src={img(p.imageKey)} alt={p.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{workerCopy[p.id]?.name[lang] ?? p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {workerCopy[p.id]?.location[lang] ?? p.location} · {workerCopy[p.id]?.experience[lang] ?? p.experience} · {p.distanceKm} km
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-semibold">
                    <span className="flex items-center gap-0.5 text-primary">
                      <Star className="h-3 w-3 fill-current" /> {p.rating}
                    </span>
                    <span className="text-muted-foreground">{p.jobs}+ {t("jobs", "काम")}</span>
                  </p>
                </div>
              </div>
              <p className="mt-2 rounded-xl bg-muted p-2 text-xs italic text-muted-foreground">“{workerCopy[p.id]?.quote[lang] ?? p.reelQuote}”</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toast.success(t("Booking request sent!", "बुकिंग रिक्वेस्ट भेज दी गई!"))}
                  className="press rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
                >
                  <CalendarCheck className="mr-1 inline h-3.5 w-3.5" />
                  {t(`Book visit · ₹${FEES.visitCharge}`, `विज़िट बुक करें · ₹${FEES.visitCharge}`)}
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
        <div className="animate-tab-in space-y-3">
          <DemandStrip category="skills" />
          <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
              <img src={img(s.imageKey)} alt={s.name} loading="lazy" className="h-32 w-full object-cover" />
              <div className="p-3">
                <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                  {s.tag}
                </span>
                  <p className="mt-1 text-sm font-bold">{skillCopy[s.id]?.name[lang] ?? s.name}</p>
                <p className="text-xs text-muted-foreground">{skillCopy[s.id]?.service[lang] ?? s.service}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {skillCopy[s.id]?.location[lang] ?? s.location} · {s.distanceKm} km
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
        </div>
      )}

      {tab === "health" && (
        <div className="animate-tab-in space-y-3">
          <DemandStrip category="health" />
          {doctors.map((d) => (
            <div key={d.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
              <img src={img(d.imageKey)} alt={d.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{doctorCopy[d.id]?.name[lang] ?? d.name}</p>
                <p className="text-xs text-muted-foreground">{doctorCopy[d.id]?.speciality[lang] ?? d.speciality}</p>
                <p className="truncate text-xs text-muted-foreground">{doctorCopy[d.id]?.clinic[lang] ?? d.clinic}</p>
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
                    <p className="text-xs font-semibold">{labCopy[l.id]?.[lang] ?? l.name}</p>
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

      {tab === "rooms" && (
        <div className="space-y-3">
          <DemandStrip category="rooms" />
          <ListingGrid items={rentListings} />
        </div>
      )}
      {tab === "tutors" && (
        <div className="space-y-3">
          <DemandStrip category="tutors" />
          <ListingGrid items={tutorListings} />
        </div>
      )}
      {tab === "demand" && <DemandBoard />}
    </div>
  );
}

function ListingGrid({ items }: { items: typeof rentListings }) {
  const { t, lang } = useApp();
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
          <p className="mt-1 text-xs text-muted-foreground">{listingCopy[l.id]?.meta[lang] ?? l.meta}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {listingCopy[l.id]?.location[lang] ?? l.location} · {l.distanceKm} km
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
          <p className="mt-1 text-[11px] text-muted-foreground">{listingCopy[l.id]?.by[lang] ?? l.by} · ⭐ {l.rating}</p>
        </div>
      ))}
    </div>
  );
}

function DemandBoard() {
  const { t, user, area } = useApp();
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery(demandPostsQuery());
  const [form, setForm] = useState({ title: "", category: "workers", budget: "", details: "", contact: "" });
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
    setForm({ title: "", category: "workers", budget: "", details: "", contact: "" });
    void qc.invalidateQueries({ queryKey: ["my-demand-posts"] });
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
              <option value="workers">{t("Worker / Mistri", "मिस्त्री")}</option>
              <option value="skills">{t("Skill / Freelancer", "स्किल")}</option>
              <option value="health">{t("Health / Doctor", "स्वास्थ्य")}</option>
              <option value="rooms">{t("Room / Rent", "कमरा")}</option>
              <option value="tutors">{t("Tutor", "ट्यूटर")}</option>
              <option value="product">{t("Product / Saman", "सामान")}</option>
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

function DemandStrip({ category }: { category: string }) {
  const { t } = useApp();
  const navigate = useNavigate();
  const { data: posts = [] } = useQuery(demandPostsQuery());
  const list = posts.filter((p) => p.category === category).slice(0, 5);
  const demandCategory = demandCategories.find((c) => c.id === category);
  const label = demandCategory ? (t(demandCategory.label, demandCategory.hindi)) : category;
  if (list.length === 0) return null;

  return (
    <div className="animate-rise rounded-2xl border border-amber bg-amber-soft p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wide text-amber-foreground">
          🔔 {t(`Live needs in ${label}`, `${label} में लाइव ज़रूरतें`)} ({list.length})
        </p>
        <button
          type="button"
          onClick={() => void navigate({ to: "/services", search: { tab: "demand" } })}
          className="press text-[11px] font-bold text-amber-foreground underline"
        >
          {t("Post yours", "अपनी पोस्ट करें")}
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {list.map((p) => (
          <div key={p.id} className="rounded-xl bg-card p-2 shadow-card">
            <p className="text-xs font-bold">{p.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {p.location ?? "Banda"} {p.budget ? `· ${p.budget}` : ""} ·{" "}
              {new Date(p.created_at).toLocaleDateString("en-IN")}
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
