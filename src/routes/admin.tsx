import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp, rupees } from "@/lib/app-store";
import { adminListingsQuery, adminProductsQuery, allOrdersQuery, atmRequestsQuery, categoriesQuery } from "@/lib/queries";
import { IMAGES } from "@/lib/images";

const STATUSES = ["placed", "packed", "on_the_way", "delivered", "cancelled"];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Banda Bazaar" },
      { name: "description", content: "Manage Banda Bazaar catalogue, orders and Mini-ATM requests." },
      { property: "og:title", content: "Admin Dashboard — Banda Bazaar" },
      { property: "og:description", content: "Internal dashboard for catalogue and order operations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { t, isAdmin, user, authReady } = useApp();
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ ...adminProductsQuery(), enabled: isAdmin });
  const { data: orders = [] } = useQuery(allOrdersQuery(isAdmin));
  const { data: atm = [] } = useQuery(atmRequestsQuery(isAdmin));
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: listings = [] } = useQuery(adminListingsQuery(isAdmin));
  const [form, setForm] = useState({
    name: "",
    hindi: "",
    price: "",
    mrp: "",
    unit: "1 kg",
    category_slug: "",
    image_key: "grocery-atta",
  });

  if (authReady && (!user || !isAdmin)) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center shadow-card">
        <p className="text-sm font-bold">{t("Admins only", "सिर्फ एडमिन के लिए")}</p>
        <Link to="/" className="press mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          {t("Go home", "होम जाएं")}
        </Link>
      </div>
    );
  }

  const addProduct = async () => {
    if (!form.name || !form.price || !form.category_slug) {
      toast.error(t("Name, price and category are required", "नाम, कीमत और कैटेगरी ज़रूरी है"));
      return;
    }
    const { error } = await supabase.from("products").insert({
      name: form.name,
      hindi: form.hindi || null,
      price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : null,
      unit: form.unit,
      category_slug: form.category_slug,
      image_key: form.image_key,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm({ ...form, name: "", hindi: "", price: "", mrp: "" });
    void qc.invalidateQueries({ queryKey: ["admin-products"] });
    void qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(t("Product added", "प्रोडक्ट जोड़ा गया"));
  };

  const toggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from("products").update({ active: !active }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      void qc.invalidateQueries({ queryKey: ["admin-products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    }
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      void qc.invalidateQueries({ queryKey: ["all-orders"] });
      toast.success(t("Order updated", "ऑर्डर अपडेट हुआ"));
    }
  };

  const setAtmStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("mini_atm_requests").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else void qc.invalidateQueries({ queryKey: ["atm-requests"] });
  };

  const setListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("service_listings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["admin-listings"] });
    void qc.invalidateQueries({ queryKey: ["listings"] });
    toast.success(t("Listing status updated", "लिस्टिंग का स्टेटस अपडेट हुआ"));
  };

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black">{t("Admin dashboard", "एडमिन डैशबोर्ड")}</h1>

      <div className="grid grid-cols-3 gap-2">
        <Stat label={t("Orders", "ऑर्डर")} value={String(orders.length)} />
        <Stat label={t("Revenue", "आमदनी")} value={rupees(revenue)} />
        <Stat label={t("Products", "प्रोडक्ट")} value={String(products.length)} />
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="text-sm font-bold">{t("Add product", "प्रोडक्ट जोड़ें")}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="h-10 rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <input
            value={form.hindi}
            onChange={(e) => setForm({ ...form, hindi: e.target.value })}
            placeholder="हिंदी नाम"
            className="h-10 rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            inputMode="numeric"
            className="h-10 rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <input
            value={form.mrp}
            onChange={(e) => setForm({ ...form, mrp: e.target.value })}
            placeholder="MRP"
            inputMode="numeric"
            className="h-10 rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <input
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="Unit"
            className="h-10 rounded-xl bg-muted px-3 text-sm outline-none"
          />
          <select
            value={form.category_slug}
            onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
            className="h-10 rounded-xl bg-muted px-3 text-sm outline-none"
          >
            <option value="">{t("Category", "कैटेगरी")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={form.image_key}
            onChange={(e) => setForm({ ...form, image_key: e.target.value })}
            className="col-span-2 h-10 rounded-xl bg-muted px-3 text-sm outline-none"
          >
            {Object.keys(IMAGES).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void addProduct()}
          className="press mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
        >
          {t("Add product", "प्रोडक्ट जोड़ें")}
        </button>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="mb-2 text-sm font-bold">{t("Seller & delivery applications", "सेलर और डिलीवरी आवेदन")}</p>
        {listings.length === 0 && <p className="text-xs text-muted-foreground">{t("No applications yet.", "अभी कोई आवेदन नहीं है।")}</p>}
        <div className="space-y-2">
          {listings.map((listing) => (
            <div key={listing.id} className="rounded-xl bg-muted p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{listing.title}</p>
                  <p className="text-[11px] text-muted-foreground">{listing.provider_name ?? "—"} · {listing.kind} · {listing.location ?? "Banda"}</p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{listing.status}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => void setListingStatus(listing.id, "approved")} className="press rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground">{t("Approve", "मंज़ूर")}</button>
                <button type="button" onClick={() => void setListingStatus(listing.id, "rejected")} className="press rounded-lg border border-border px-3 py-1.5 text-[10px] font-bold">{t("Reject", "अस्वीकार")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="mb-2 text-sm font-bold">{t("Catalogue", "कैटलॉग")}</p>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 border-b border-border py-1.5 last:border-0">
              <span className="min-w-0 flex-1 truncate text-xs">
                {p.name} · {rupees(Number(p.price))}
              </span>
              <button
                type="button"
                onClick={() => void toggle(p.id, p.active)}
                className={`press rounded-lg px-2 py-1 text-[10px] font-bold ${
                  p.active ? "bg-primary-soft text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {p.active ? t("Live", "लाइव") : t("Hidden", "छुपा")}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="mb-2 text-sm font-bold">{t("Recent orders", "हाल के ऑर्डर")}</p>
        {orders.length === 0 && <p className="text-xs text-muted-foreground">{t("No orders yet.", "अभी कोई ऑर्डर नहीं।")}</p>}
        {orders.map((o) => (
          <div key={o.id} className="border-b border-border py-2 last:border-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="font-bold">{rupees(Number(o.total))}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {o.area ?? "Banda"} · {new Date(o.created_at).toLocaleString("en-IN")}
            </p>
            <select
              value={o.status}
              onChange={(e) => void setStatus(o.id, e.target.value)}
              className="mt-1 h-8 rounded-lg bg-muted px-2 text-xs outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <p className="mb-2 text-sm font-bold">{t("Mini-ATM requests", "मिनी-एटीएम रिक्वेस्ट")}</p>
        {atm.length === 0 && <p className="text-xs text-muted-foreground">{t("No requests.", "कोई रिक्वेस्ट नहीं।")}</p>}
        {atm.map((r) => (
          <div key={r.id} className="flex items-center justify-between border-b border-border py-2 text-xs last:border-0">
            <span>
              {rupees(Number(r.amount))} · {r.phone ?? "—"}
            </span>
            <select
              value={r.status}
              onChange={(e) => void setAtmStatus(r.id, e.target.value)}
              className="h-8 rounded-lg bg-muted px-2 text-xs outline-none"
            >
              {["pending", "approved", "delivered", "cancelled"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-base font-black">{value}</p>
    </div>
  );
}
